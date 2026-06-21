const Keyword = require('../models/Keyword');

/**
 * Advanced keyword matching service
 * Supports multiple match types: contains, exact, regex, word
 * Uses database keywords for dynamic scoring
 */

async function loadActiveKeywords(category = null) {
  try {
    const query = { isActive: true };
    if (category && ['url', 'email', 'general'].includes(category)) {
      query.category = category;
    }
    
    const keywords = await Keyword.find(query).select('keyword category points pattern matchType severity context');
    return keywords;
  } catch (error) {
    console.error('[Keyword Matcher] Error loading keywords:', error.message);
    return [];
  }
}

function matchKeyword(text, keywordObj) {
  const { keyword, pattern, matchType } = keywordObj;
  const lowerText = (text || '').toLowerCase();
  const lowerKeyword = keyword.toLowerCase();

  switch (matchType) {
    case 'exact':
      return lowerText === lowerKeyword;
    
    case 'word':
      const wordRegex = new RegExp(`\\b${lowerKeyword}\\b`, 'i');
      return wordRegex.test(lowerText);
    
    case 'regex':
      try {
        if (pattern) {
          const regex = new RegExp(pattern, 'i');
          return regex.test(text);
        }
        // Fallback to contains if pattern is not provided
        return lowerText.includes(lowerKeyword);
      } catch (error) {
        console.error(`[Keyword Matcher] Invalid regex for keyword "${keyword}":`, error.message);
        return lowerText.includes(lowerKeyword);
      }
    
    case 'contains':
    default:
      return lowerText.includes(lowerKeyword);
  }
}

function scoreByKeywords(text, category = null) {
  return new Promise(async (resolve) => {
    try {
      const keywords = await loadActiveKeywords(category);
      const flaggedKeywords = [];
      const keywordCategories = new Set();
      const severityCounts = { low: 0, medium: 0, high: 0, critical: 0 };
      let totalPoints = 0;

      for (const keywordObj of keywords) {
        if (matchKeyword(text, keywordObj)) {
          flaggedKeywords.push({
            keyword: keywordObj.keyword,
            category: keywordObj.category,
            points: keywordObj.points,
            severity: keywordObj.severity,
            context: keywordObj.context
          });
          
          totalPoints += keywordObj.points;
          keywordCategories.add(keywordObj.category);
          severityCounts[keywordObj.severity]++;
        }
      }

      // Apply severity multiplier
      let severityMultiplier = 1;
      if (severityCounts.critical > 0) severityMultiplier = 1.5;
      else if (severityCounts.high > 0) severityMultiplier = 1.3;
      else if (severityCounts.medium > 0) severityMultiplier = 1.1;

      const adjustedPoints = Math.min(totalPoints * severityMultiplier, 100);

      // Category-based bonus
      let categoryBonus = 0;
      if (keywordCategories.size >= 4) categoryBonus = 20;
      else if (keywordCategories.size >= 3) categoryBonus = 15;
      else if (keywordCategories.size >= 2) categoryBonus = 10;

      const finalPoints = Math.min(adjustedPoints + categoryBonus, 100);

      resolve({
        points: finalPoints,
        flaggedKeywords,
        keywordCategories: Array.from(keywordCategories),
        severityCounts,
        totalMatches: flaggedKeywords.length,
        severityMultiplier
      });
    } catch (error) {
      console.error('[Keyword Matcher] Error scoring by keywords:', error.message);
      resolve({
        points: 0,
        flaggedKeywords: [],
        keywordCategories: [],
        severityCounts: { low: 0, medium: 0, high: 0, critical: 0 },
        totalMatches: 0,
        severityMultiplier: 1
      });
    }
  });
}

// Fallback hardcoded keywords for when database is unavailable
const FALLBACK_KEYWORDS = {
  url: [
    { keyword: 'password', points: 30, category: 'credential', severity: 'high' },
    { keyword: 'otp', points: 30, category: 'credential', severity: 'high' },
    { keyword: 'bank', points: 28, category: 'financial', severity: 'high' },
    { keyword: 'suspend', points: 28, category: 'urgency', severity: 'high' },
    { keyword: 'urgent', points: 25, category: 'urgency', severity: 'medium' },
    { keyword: 'verify', points: 25, category: 'verification', severity: 'medium' },
    { keyword: 'login', points: 25, category: 'credential', severity: 'medium' },
    { keyword: 'account', points: 25, category: 'account', severity: 'medium' },
    { keyword: 'security', points: 25, category: 'verification', severity: 'medium' },
    { keyword: 'update', points: 25, category: 'verification', severity: 'medium' },
    { keyword: 'free', points: 20, category: 'incentive', severity: 'low' },
    { keyword: 'reward', points: 20, category: 'incentive', severity: 'low' },
    { keyword: 'click', points: 18, category: 'action', severity: 'low' },
    { keyword: 'download', points: 18, category: 'action', severity: 'low' },
  ],
  email: [
    { keyword: 'urgent', points: 30, category: 'urgency', severity: 'high' },
    { keyword: 'immediately', points: 30, category: 'urgency', severity: 'high' },
    { keyword: 'suspended', points: 30, category: 'account', severity: 'high' },
    { keyword: 'password', points: 30, category: 'credential', severity: 'high' },
    { keyword: 'otp', points: 30, category: 'credential', severity: 'high' },
    { keyword: 'verify', points: 28, category: 'verification', severity: 'high' },
    { keyword: 'account', points: 25, category: 'account', severity: 'medium' },
    { keyword: 'login', points: 25, category: 'credential', severity: 'medium' },
    { keyword: 'bank', points: 28, category: 'financial', severity: 'high' },
    { keyword: 'click here', points: 20, category: 'action', severity: 'low' },
    { keyword: 'congratulations', points: 20, category: 'incentive', severity: 'low' },
    { keyword: 'reward', points: 20, category: 'incentive', severity: 'low' },
  ],
  general: [
    { keyword: 'urgent', points: 25, category: 'urgency', severity: 'medium' },
    { keyword: 'verify', points: 20, category: 'verification', severity: 'medium' },
    { keyword: 'login', points: 20, category: 'credential', severity: 'medium' },
    { keyword: 'password', points: 25, category: 'credential', severity: 'high' },
  ]
};

function scoreWithFallback(text, category = null) {
  return new Promise(async (resolve) => {
    try {
      // Try database keywords first
      const dbResult = await scoreByKeywords(text, category);
      
      // If no keywords found in database, use fallback
      if (dbResult.totalMatches === 0) {
        const fallbackKeywords = category ? FALLBACK_KEYWORDS[category] || FALLBACK_KEYWORDS.general : FALLBACK_KEYWORDS.general;
        const flaggedKeywords = [];
        const keywordCategories = new Set();
        const severityCounts = { low: 0, medium: 0, high: 0, critical: 0 };
        let totalPoints = 0;

        for (const keywordObj of fallbackKeywords) {
          if (text.toLowerCase().includes(keywordObj.keyword.toLowerCase())) {
            flaggedKeywords.push({
              keyword: keywordObj.keyword,
              category: keywordObj.category,
              points: keywordObj.points,
              severity: keywordObj.severity,
              context: null
            });
            
            totalPoints += keywordObj.points;
            keywordCategories.add(keywordObj.category);
            severityCounts[keywordObj.severity]++;
          }
        }

        resolve({
          points: Math.min(totalPoints, 100),
          flaggedKeywords,
          keywordCategories: Array.from(keywordCategories),
          severityCounts,
          totalMatches: flaggedKeywords.length,
          severityMultiplier: 1,
          usedFallback: true
        });
      } else {
        resolve({
          ...dbResult,
          usedFallback: false
        });
      }
    } catch (error) {
      console.error('[Keyword Matcher] Error in fallback scoring:', error.message);
      resolve({
        points: 0,
        flaggedKeywords: [],
        keywordCategories: [],
        severityCounts: { low: 0, medium: 0, high: 0, critical: 0 },
        totalMatches: 0,
        severityMultiplier: 1,
        usedFallback: true
      });
    }
  });
}

module.exports = {
  loadActiveKeywords,
  matchKeyword,
  scoreByKeywords,
  scoreWithFallback,
  FALLBACK_KEYWORDS
};
