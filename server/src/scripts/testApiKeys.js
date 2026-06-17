/**
 * Test script to verify VirusTotal and Google Safe Browsing API keys
 * Usage: node src/scripts/testApiKeys.js
 * 
 * This script will test both API endpoints with a sample URL to verify:
 * 1. API keys are valid
 * 2. Endpoints are accessible
 * 3. Responses are properly formatted
 */

require('dotenv').config();
const axios = require('axios');

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;
const GOOGLE_SAFE_BROWSING_KEY = process.env.GOOGLE_SAFE_BROWSING_KEY;

// Test URL (a known safe URL for testing)
const TEST_URL = 'http://example.com';

async function testVirusTotal() {
  console.log('\n=== Testing VirusTotal API ===');
  
  if (!VIRUSTOTAL_API_KEY) {
    console.log('❌ VIRUSTOTAL_API_KEY not found in .env file');
    return false;
  }

  try {
    console.log(`Testing with API key: ${VIRUSTOTAL_API_KEY.substring(0, 8)}...`);
    console.log(`Test URL: ${TEST_URL}`);

    // Step 1: Submit URL for analysis
    console.log('\n1. Submitting URL to VirusTotal...');
    const vtHeaders = {
      'x-apikey': VIRUSTOTAL_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const body = new URLSearchParams({ url: TEST_URL }).toString();

    const submitResp = await axios.post('https://www.virustotal.com/api/v3/urls', body, {
      headers: vtHeaders,
    });

    console.log('✅ URL submitted successfully');
    console.log(`Response status: ${submitResp.status}`);

    const analysisId = submitResp?.data?.data?.id;
    if (!analysisId) {
      console.log('❌ No analysis ID in response');
      console.log('Response:', JSON.stringify(submitResp.data, null, 2));
      return false;
    }

    console.log(`Analysis ID: ${analysisId}`);

    // Step 2: Wait a moment and get analysis results
    console.log('\n2. Fetching analysis results...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

    const analysisResp = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      { headers: vtHeaders }
    );

    console.log('✅ Analysis results fetched successfully');
    console.log(`Analysis status: ${analysisResp.data?.data?.attributes?.status}`);
    
    const stats = analysisResp.data?.data?.attributes?.stats;
    if (stats) {
      console.log('\nScan Statistics:');
      console.log(`  - Harmless: ${stats.harmless}`);
      console.log(`  - Malicious: ${stats.malicious}`);
      console.log(`  - Suspicious: ${stats.suspicious}`);
      console.log(`  - Timeout: ${stats.timeout}`);
      console.log(`  - Undetected: ${stats.undetected}`);
    }

    console.log('\n✅ VirusTotal API is working correctly');
    return true;

  } catch (error) {
    console.log('❌ VirusTotal API test failed');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
    return false;
  }
}

async function testGoogleSafeBrowsing() {
  console.log('\n=== Testing Google Safe Browsing API ===');
  
  if (!GOOGLE_SAFE_BROWSING_KEY) {
    console.log('❌ GOOGLE_SAFE_BROWSING_KEY not found in .env file');
    return false;
  }

  try {
    console.log(`Testing with API key: ${GOOGLE_SAFE_BROWSING_KEY.substring(0, 8)}...`);
    console.log(`Test URL: ${TEST_URL}`);

    const endpoint = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';
    const apiUrl = `${endpoint}?key=${GOOGLE_SAFE_BROWSING_KEY}`;

    const resp = await axios.post(
      apiUrl,
      {
        client: { clientId: 'phishing-detector', clientVersion: '1.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: TEST_URL }],
        },
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('✅ Google Safe Browsing API call successful');
    console.log(`Response status: ${resp.status}`);

    if (resp.data.matches && resp.data.matches.length > 0) {
      console.log(`\n⚠️  Threats found: ${resp.data.matches.length}`);
      resp.data.matches.forEach((match, index) => {
        console.log(`  ${index + 1}. ${match.threatType} - ${match.platformType}`);
      });
    } else {
      console.log('\n✅ No threats detected (URL is safe)');
    }

    console.log('\n✅ Google Safe Browsing API is working correctly');
    return true;

  } catch (error) {
    console.log('❌ Google Safe Browsing API test failed');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('API Key Testing Script');
  console.log('========================================');

  const vtResult = await testVirusTotal();
  const gsbResult = await testGoogleSafeBrowsing();

  console.log('\n========================================');
  console.log('Test Results Summary');
  console.log('========================================');
  console.log(`VirusTotal: ${vtResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Google Safe Browsing: ${gsbResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log('========================================\n');

  if (vtResult && gsbResult) {
    console.log('✅ All API endpoints are working correctly!');
    console.log('You can now use the phishing detection platform with external API integration.');
  } else {
    console.log('❌ Some API endpoints failed. Please check your API keys and try again.');
    console.log('\nTips:');
    console.log('- Make sure your API keys are valid and active');
    console.log('- Check that you have sufficient API quota/credits');
    console.log('- Verify your API keys have the required permissions');
    console.log('- For VirusTotal: Get a free API key from https://www.virustotal.com/');
    console.log('- For Google Safe Browsing: Get an API key from https://console.cloud.google.com/');
  }

  process.exit(vtResult && gsbResult ? 0 : 1);
}

main();
