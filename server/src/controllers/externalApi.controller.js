const axios = require('axios');
const { env } = require('../config/env');

/**
 * Enhanced external API integration for phishing detection
 * - Google Safe Browsing API v4 with comprehensive threat detection
 * - VirusTotal API v3 with detailed analysis and reputation scoring
 * - Improved error handling and fallback mechanisms
 */

async function scanWithVirusTotalUrl(url) {
  /**
   * Enhanced VirusTotal integration with:
   * - Direct URL analysis endpoint (faster than file scan)
   * - Comprehensive reputation scoring
   * - Multiple detection engines analysis
   * - Domain reputation checks
   */
  const vtHeaders = {
    'x-apikey': env.VIRUSTOTAL_API_KEY,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  // First, try to get existing URL analysis (faster)
  try {
    const urlId = btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const existingAnalysis = await axios.get(
      `https://www.virustotal.com/api/v3/urls/${urlId}`,
      { headers: vtHeaders }
    );

    const attributes = existingAnalysis.data?.data?.attributes;
    const lastAnalysisStats = attributes?.last_analysis_stats || {};
    const lastAnalysisResults = attributes?.last_analysis_results || {};
    
    // Calculate comprehensive score based on multiple engines
    const maliciousCount = lastAnalysisStats.malicious || 0;
    const suspiciousCount = lastAnalysisStats.suspicious || 0;
    const harmlessCount = lastAnalysisStats.harmless || 0;
    const undetectedCount = lastAnalysisStats.undetected || 0;
    const totalEngines = maliciousCount + suspiciousCount + harmlessCount + undetectedCount;

    // Calculate reputation score
    let reputationScore = 0;
    if (totalEngines > 0) {
      reputationScore = ((maliciousCount * 100) + (suspiciousCount * 50)) / totalEngines;
    }

    // Extract specific threat information
    const threats = [];
    Object.entries(lastAnalysisResults).forEach(([engine, result]) => {
      if (result.category === 'malicious' || result.category === 'suspicious') {
        threats.push({
          engine,
          category: result.category,
          result: result.result,
        });
      }
    });

    return {
      provider: 'virustotal',
      raw: existingAnalysis.data,
      analysisId: existingAnalysis.data?.data?.id,
      stats: lastAnalysisStats,
      reputationScore: Math.round(reputationScore),
      verdict: determineVtVerdict(lastAnalysisStats),
      threats: threats.slice(0, 10), // Top 10 threats
      totalEngines,
      maliciousCount,
      suspiciousCount,
      harmlessCount,
    };
  } catch (error) {
    // If URL not found, submit for analysis
    if (error.response?.status === 404) {
      console.log('[VirusTotal] URL not found in database, submitting for analysis...');
      const body = new URLSearchParams({ url }).toString();
      const submitResp = await axios.post('https://www.virustotal.com/api/v3/urls', body, {
        headers: vtHeaders,
      });

      const analysisId = submitResp?.data?.data?.id;
      if (!analysisId) {
        throw new Error('VirusTotal: missing analysis id');
      }

      // Wait for analysis to complete (with timeout)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const analysisResp = await axios.get(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        { headers: vtHeaders }
      );

      const attributes = analysisResp.data?.data?.attributes;
      const stats = attributes?.stats || {};

      return {
        provider: 'virustotal',
        raw: analysisResp.data,
        analysisId,
        stats,
        verdict: determineVtVerdict(stats),
        isNewAnalysis: true,
      };
    }
    throw error;
  }
}

function determineVtVerdict(stats) {
  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const total = (stats.malicious || 0) + (stats.suspicious || 0) + (stats.harmless || 0) + (stats.undetected || 0);

  if (total === 0) return 'unknown';
  
  const maliciousRatio = malicious / total;
  const suspiciousRatio = suspicious / total;
  const threatRatio = maliciousRatio + (suspiciousRatio * 0.5);

  if (threatRatio >= 0.5) return 'malicious';
  if (threatRatio >= 0.2) return 'suspicious';
  if (threatRatio >= 0.1) return 'potentially-malicious';
  return 'harmless';
}

async function scanWithGoogleSafeBrowsingUrl(url) {
  /**
   * Enhanced Google Safe Browsing API v4 integration with:
   * - Multiple threat types (MALWARE, SOCIAL_ENGINEERING, UNWANTED_SOFTWARE)
   * - Platform-specific detection
   * - Comprehensive threat entry types
   * - Detailed threat information extraction
   */

  if (!env.GOOGLE_SAFE_BROWSING_KEY) {
    return {
      provider: 'google-safe-browsing',
      raw: null,
      message: 'Google Safe Browsing API key not configured',
    };
  }

  const endpoint = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';
  const apiUrl = `${endpoint}?key=${env.GOOGLE_SAFE_BROWSING_KEY}`;

  try {
    const resp = await axios.post(
      apiUrl,
      {
        client: {
          clientId: 'phishing-detector',
          clientVersion: '1.0.0',
        },
        threatInfo: {
          threatTypes: [
            'THREAT_TYPE_UNSPECIFIED',
            'MALWARE_THREAT',
            'SOCIAL_ENGINEERING',
            'UNWANTED_SOFTWARE',
            'POTENTIALLY_HARMFUL_APPLICATION',
          ],
          platformTypes: [
            'ANY_PLATFORM',
            'WINDOWS',
            'LINUX',
            'ANDROID',
            'IOS',
            'CHROME',
          ],
          threatEntryTypes: ['URL', 'EXECUTABLE'],
          threatEntries: [{ url }],
        },
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const matches = resp.data?.matches || [];
    
    // Extract detailed threat information
    const threatDetails = matches.map(match => ({
      threatType: match.threatType,
      platformType: match.platformType,
      threatEntryType: match.threatEntryType,
      threat: match.threat,
    }));

    return {
      provider: 'google-safe-browsing',
      raw: resp.data,
      matches,
      threatDetails,
      hasThreats: matches.length > 0,
      threatCount: matches.length,
      threatTypes: [...new Set(matches.map(m => m.threatType))],
    };
  } catch (error) {
    if (error.response?.status === 400) {
      // Invalid request - likely API key issue
      console.error('[Google Safe Browsing] Invalid request - check API key');
      return {
        provider: 'google-safe-browsing',
        error: 'Invalid API key or request format',
        matches: [],
      };
    }
    throw error;
  }
}

async function forwardUrlToExternalApis(url) {
  /**
   * Enhanced parallel API calling strategy:
   * - Call both APIs in parallel for faster results
   * - Use results from both for comprehensive scoring
   * - Improved fallback and error handling
   * - Detailed logging for debugging
   */
  
  console.log('[External API] Starting parallel API checks...');
  
  const [gsbResult, vtResult] = await Promise.allSettled([
    scanWithGoogleSafeBrowsingUrl(url).catch(err => {
      console.log('[External API] Google Safe Browsing failed:', err.message);
      return { error: err.message };
    }),
    scanWithVirusTotalUrl(url).catch(err => {
      console.log('[External API] VirusTotal failed:', err.message);
      return { error: err.message };
    }),
  ]);

  const gsbData = gsbResult.status === 'fulfilled' ? gsbResult.value : { error: gsbResult.reason?.message };
  const vtData = vtResult.status === 'fulfilled' ? vtResult.value : { error: vtResult.reason?.message };

  // Determine primary source based on success and data quality
  let primarySource = 'none';
  if (!gsbData.error && !vtData.error) {
    // Both succeeded - use VirusTotal as primary (more comprehensive)
    primarySource = 'virustotal';
  } else if (!gsbData.error) {
    primarySource = 'google-safe-browsing';
  } else if (!vtData.error) {
    primarySource = 'virustotal';
  }

  console.log('[External API] Primary source:', primarySource);
  console.log('[External API] GSB threats:', gsbData.threatCount || 0);
  console.log('[External API] VT reputation:', vtData.reputationScore || 'N/A');

  return {
    googleSafeBrowsing: gsbData,
    virustotal: vtData,
    primarySource,
    bothSucceeded: !gsbData.error && !vtData.error,
    anySucceeded: !gsbData.error || !vtData.error,
  };
}

module.exports = {
  forwardUrlToExternalApis,
};
