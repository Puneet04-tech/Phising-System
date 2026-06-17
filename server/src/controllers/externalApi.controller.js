const axios = require('axios');
const { env } = require('../config/env');

/**
 * Forward a URL scan request to:
 * - VirusTotal v3 (URL file scan)
 * - Google Safe Browsing (URL check)
 *
 * Note: This controller is designed to be called from scan.controller.js
 * so it returns normalized results (no persistence here).
 */

async function scanWithVirusTotalUrl(url) {
  // VirusTotal v3 has different endpoints depending on resource type.
  // For beginner-friendly integration, we’ll use:
  // POST /urls (submit URL)  then GET /analyses/{analysis_id}
  //
  // If your API key / account supports direct analysis retrieval, we can adapt later.
  const vtHeaders = {
    'x-apikey': env.VIRUSTOTAL_API_KEY,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const body = new URLSearchParams({ url }).toString();

  const submitResp = await axios.post('https://www.virustotal.com/api/v3/urls', body, {
    headers: vtHeaders,
  });

  const analysisId = submitResp?.data?.data?.id;
  if (!analysisId) {
    throw new Error('VirusTotal: missing analysis id');
  }

  const analysisResp = await axios.get(
    `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
    { headers: vtHeaders }
  );

  return {
    provider: 'virustotal',
    raw: analysisResp.data,
    analysisId,
    // Example normalized fields. You can refine based on VT response structure.
    stats: analysisResp.data?.data?.attributes?.stats || null,
    verdict: analysisResp.data?.data?.attributes?.status || null,
  };
}

async function scanWithGoogleSafeBrowsingUrl(url) {
  /**
   * Google Safe Browsing API v4 typically requires:
   * - POST to your configured endpoint
   * - API key via ?key= or header (depends on the exact Google API product)
   *
   * Since Google’s Safe Browsing products differ (client-side vs API wrapper),
   * we’ll implement a generic structure you can adjust once you confirm the exact API endpoint.
   */

  if (!env.GOOGLE_SAFE_BROWSING_KEY) {
    return {
      provider: 'google-safe-browsing',
      raw: null,
      message: 'Google Safe Browsing API key not configured',
    };
  }

  // Common endpoint for Safe Browsing API for threat lists / url checks:
  // Developers often use a POST endpoint with JSON body.
  // Replace this endpoint with your exact v4 endpoint from Google docs.
  const endpoint = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

  const apiUrl = `${endpoint}?key=${env.GOOGLE_SAFE_BROWSING_KEY}`;

  const resp = await axios.post(
    apiUrl,
    {
      client: { clientId: 'phishing-detector', clientVersion: '1.0' },
      threatInfo: {
        threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING'],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: [{ url }],
      },
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  return {
    provider: 'google-safe-browsing',
    raw: resp.data,
    matches: resp.data?.matches || [],
  };
}

async function forwardUrlToExternalApis(url) {
  /**
   * Sequential fallback strategy:
   * 1. Try Google Safe Browsing first (faster, free tier available)
   * 2. If GSB fails, try VirusTotal
   * 3. If both fail, return null to indicate keyword-only mode
   */
  let gsbResult = null;
  let vtResult = null;

  // Try Google Safe Browsing first
  try {
    console.log('[External API] Trying Google Safe Browsing...');
    gsbResult = await scanWithGoogleSafeBrowsingUrl(url);
    console.log('[External API] Google Safe Browsing succeeded');
  } catch (error) {
    console.log('[External API] Google Safe Browsing failed:', error.message);
    gsbResult = { error: error.message };
  }

  // If GSB failed, try VirusTotal as fallback
  if (gsbResult?.error) {
    try {
      console.log('[External API] Falling back to VirusTotal...');
      vtResult = await scanWithVirusTotalUrl(url);
      console.log('[External API] VirusTotal succeeded');
    } catch (error) {
      console.log('[External API] VirusTotal failed:', error.message);
      vtResult = { error: error.message };
    }
  }

  // If both failed, return null to trigger keyword-only mode
  if (gsbResult?.error && vtResult?.error) {
    console.log('[External API] Both APIs failed, using keyword-only detection');
    return null;
  }

  return {
    googleSafeBrowsing: gsbResult?.error ? { error: gsbResult.error } : gsbResult,
    virustotal: vtResult?.error ? { error: vtResult.error } : vtResult,
    primarySource: gsbResult?.error ? 'virustotal' : 'google-safe-browsing',
  };
}

module.exports = {
  forwardUrlToExternalApis,
};
