const { scoreWithFallback } = require('./keywordMatcher');

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function computeStatus(riskPercentage) {
  if (riskPercentage >= 70) return 'Malicious';
  if (riskPercentage >= 40) return 'Suspicious';
  return 'Safe';
}

function recommendationFor(status) {
  if (status === 'Malicious') return 'Avoid Visiting. Do not provide credentials. This URL has been flagged as dangerous by multiple security engines.';
  if (status === 'Suspicious') return 'Be cautious. Verify the sender/domain before proceeding. This URL shows suspicious patterns.';
  return 'Likely Safe. Still verify links before entering sensitive info. No immediate threats detected.';
}

async function scoreUrlByRules(url, externalSignals) {
  const lower = (url || '').toLowerCase();

  // Use advanced keyword matcher
  const keywordResult = await scoreWithFallback(url, 'url');
  const flaggedKeywords = keywordResult.flaggedKeywords.map(k => k.keyword);
  const keywordCategories = keywordResult.keywordCategories;
  let points = keywordResult.points;

  // HTTPS preference (enhanced)
  if (lower.startsWith('http://')) points += 20; // Increased penalty
  if (lower.startsWith('https://')) points += 0;

  // Enhanced URL structure analysis
  const hyphens = (lower.match(/-/g) || []).length;
  if (hyphens >= 5) points += 15;
  else if (hyphens >= 3) points += 10;
  else if (hyphens >= 2) points += 5;

  // Suspicious TLD patterns
  const suspiciousTlds = ['.xyz', '.top', '.zip', '.mov', '.tk', '.ml', '.ga', '.cf', '.gq'];
  if (suspiciousTlds.some(tld => lower.includes(tld))) points += 15;

  // IP address in URL (suspicious)
  if (/(\d{1,3}\.){3}\d{1,3}/.test(lower)) points += 25;

  // Long domain names (suspicious)
  const domain = lower.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  if (domain.length > 50) points += 15;
  else if (domain.length > 35) points += 10;

  // Query string analysis
  if (lower.includes('?')) {
    const params = lower.split('?')[1].split('&').length;
    if (params > 5) points += 15;
    else if (params > 3) points += 10;
    else points += 5;
  }

  // Subdomain analysis
  const subdomainCount = domain.split('.').length - 2;
  if (subdomainCount > 3) points += 15;
  else if (subdomainCount > 2) points += 10;
  else if (subdomainCount > 1) points += 5;

  // Character pattern analysis
  const consecutiveNumbers = (lower.match(/\d{4,}/g) || []).length;
  if (consecutiveNumbers > 0) points += 10;

  const randomChars = (lower.match(/[a-z]{10,}/g) || []).length;
  if (randomChars > 0) points += 10;

  // Category-based bonus (multiple categories = higher risk)
  if (keywordCategories.length >= 3) points += 15;
  else if (keywordCategories.length >= 2) points += 10;

  // Severity-based bonus
  if (keywordResult.severityCounts.critical > 0) points += 20;
  else if (keywordResult.severityCounts.high > 0) points += 15;
  else if (keywordResult.severityCounts.medium > 0) points += 10;

  // Enhanced external signals integration
  if (externalSignals) {
    // VirusTotal enhanced scoring
    if (externalSignals.virustotal && !externalSignals.virustotal.error) {
      const vtData = externalSignals.virustotal;
      
      // Use reputation score if available
      if (vtData.reputationScore !== undefined) {
        points += Math.min(vtData.reputationScore, 50); // Cap at 50 points
      }
      
      // Verdict-based scoring
      const verdict = (vtData.verdict || '').toLowerCase();
      if (verdict === 'malicious') points += 50;
      else if (verdict === 'suspicious') points += 35;
      else if (verdict === 'potentially-malicious') points += 20;
      
      // Engine count consideration
      if (vtData.maliciousCount > 0) {
        points += Math.min(vtData.maliciousCount * 5, 30); // Up to 30 points for malicious engines
      }
      
      if (vtData.suspiciousCount > 0) {
        points += Math.min(vtData.suspiciousCount * 3, 15); // Up to 15 points for suspicious engines
      }
      
      // New analysis penalty (less trusted)
      if (vtData.isNewAnalysis) points += 10;
    }

    // Google Safe Browsing enhanced scoring
    if (externalSignals.googleSafeBrowsing && !externalSignals.googleSafeBrowsing.error) {
      const gsbData = externalSignals.googleSafeBrowsing;
      
      if (gsbData.hasThreats) {
        points += 45;
        
        // Additional points for multiple threat types
        if (gsbData.threatTypes && gsbData.threatTypes.length > 1) {
          points += 10;
        }
        
        // Additional points for high-risk threat types
        if (gsbData.threatTypes && gsbData.threatTypes.some(t => 
          t.includes('SOCIAL_ENGINEERING') || t.includes('MALWARE')
        )) {
          points += 15;
        }
      }
    }

    // Bonus for both APIs succeeding (higher confidence)
    if (externalSignals.bothSucceeded) {
      points += 5; // Small confidence bonus
    }
  } else {
    // Keyword-only mode: increase sensitivity
    console.log('[Risk Scoring] Using keyword-only mode (no external API data)');
    points += 10; // Higher penalty for lack of external verification
  }

  const riskPercentage = clamp(points, 0, 100);
  const threatStatus = computeStatus(riskPercentage);
  const recommendation = recommendationFor(threatStatus);

  // Deduplicate keywords
  const uniqueKeywords = [...new Set(flaggedKeywords)];

  return {
    riskPercentage,
    threatStatus,
    recommendation,
    flaggedKeywords: uniqueKeywords,
    keywordCategories,
    severityCounts: keywordResult.severityCounts,
    externalApiUsed: externalSignals?.anySucceeded || false,
    primarySource: externalSignals?.primarySource || 'keyword-only',
    usedFallbackKeywords: keywordResult.usedFallback,
  };
}

async function scoreTextByRules(text, scanType, externalSignals) {
  // Use advanced keyword matcher
  const category = scanType === 'email' ? 'email' : 'general';
  const keywordResult = await scoreWithFallback(text, category);
  const flaggedKeywords = keywordResult.flaggedKeywords.map(k => k.keyword);
  const keywordCategories = keywordResult.keywordCategories;
  let points = keywordResult.points;

  // Enhanced text analysis
  const hasUrl = /(https?:\/\/|www\.)/i.test(text || '');
  if (hasUrl) {
    points += 20;
    
    // Extract and analyze URLs in text
    const urlMatches = text.match(/https?:\/\/[^\s]+/gi) || [];
    if (urlMatches.length > 1) points += 15; // Multiple URLs
    if (urlMatches.length > 3) points += 10; // Many URLs
  }

  // Email-specific patterns
  if (scanType === 'email') {
    // Check for email spoofing patterns
    const emailMatches = text.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
    if (emailMatches.length > 3) points += 10;
    
    // Check for urgency indicators
    const urgencyPatterns = /act now|don't wait|time limited|expires soon|last chance/i;
    if (urgencyPatterns.test(text)) points += 15;
    
    // Check for credential requests
    const credentialPatterns = /enter your|provide your|confirm your|verify your/i;
    if (credentialPatterns.test(text)) points += 20;
    
    // Check for threats
    const threatPatterns = /will be suspended|will be closed|account will be|service will be/i;
    if (threatPatterns.test(text)) points += 25;
  }

  // Text length analysis (very short or very long can be suspicious)
  const textLength = text.length;
  if (textLength < 50) points += 10; // Too short
  if (textLength > 5000) points += 5; // Very long

  // Category-based bonus
  if (keywordCategories.length >= 3) points += 15;
  else if (keywordCategories.length >= 2) points += 10;

  // Severity-based bonus
  if (keywordResult.severityCounts.critical > 0) points += 20;
  else if (keywordResult.severityCounts.high > 0) points += 15;
  else if (keywordResult.severityCounts.medium > 0) points += 10;

  // Enhanced external signals integration
  if (externalSignals) {
    // Google Safe Browsing for URLs in text
    if (externalSignals.googleSafeBrowsing && !externalSignals.googleSafeBrowsing.error) {
      const gsbData = externalSignals.googleSafeBrowsing;
      if (gsbData.hasThreats) {
        points += 40;
        if (gsbData.threatCount > 1) points += 10;
      }
    }
  } else {
    // Keyword-only mode for text
    console.log('[Risk Scoring] Using keyword-only mode for text scan (no external API data)');
    points += 10;
  }

  const riskPercentage = clamp(points, 0, 100);
  const threatStatus = computeStatus(riskPercentage);
  const recommendation = recommendationFor(threatStatus);

  return {
    riskPercentage,
    threatStatus,
    recommendation,
    flaggedKeywords: [...new Set(flaggedKeywords)],
    keywordCategories,
    severityCounts: keywordResult.severityCounts,
    externalApiUsed: externalSignals?.googleSafeBrowsing?.hasThreats || false,
    usedFallbackKeywords: keywordResult.usedFallback,
  };
}

module.exports = {
  scoreUrlByRules,
  scoreTextByRules,
};

