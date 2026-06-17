# API Fallback Mechanism Documentation

## Overview
The phishing detection platform now implements a robust sequential fallback mechanism for external API calls. This ensures the system remains functional even when external APIs are unavailable or API keys are not configured.

## Fallback Strategy

### Priority Order
1. **Google Safe Browsing API** (Primary)
2. **VirusTotal API** (Secondary)
3. **Keyword-based filtering** (Tertiary/Last Resort)

### How It Works

#### 1. Google Safe Browsing API (First Attempt)
- The system first attempts to call Google Safe Browsing API v4
- Endpoint: `https://safebrowsing.googleapis.com/v4/threatMatches:find`
- If successful, results are used for threat detection
- If failed (timeout, invalid key, quota exceeded), system falls back to VirusTotal

#### 2. VirusTotal API (Fallback)
- If Google Safe Browsing fails, the system attempts VirusTotal API v3
- Endpoint: `https://www.virustotal.com/api/v3/urls` (submit) → `/api/v3/analyses/{id}` (retrieve)
- If successful, results are used for threat detection
- If failed, system falls back to keyword-only mode

#### 3. Keyword-based Filtering (Last Resort)
- If both external APIs fail, the system relies entirely on rule-based keyword detection
- Risk scoring is adjusted with a +5 point penalty for lack of external verification
- Console logs indicate when keyword-only mode is active
- System remains fully functional with reduced accuracy

## Implementation Details

### External API Controller (`externalApi.controller.js`)
```javascript
async function forwardUrlToExternalApis(url) {
  // Try Google Safe Browsing first
  try {
    gsbResult = await scanWithGoogleSafeBrowsingUrl(url);
  } catch (error) {
    gsbResult = { error: error.message };
  }

  // If GSB failed, try VirusTotal
  if (gsbResult?.error) {
    try {
      vtResult = await scanWithVirusTotalUrl(url);
    } catch (error) {
      vtResult = { error: error.message };
    }
  }

  // If both failed, return null for keyword-only mode
  if (gsbResult?.error && vtResult?.error) {
    return null;
  }

  return {
    googleSafeBrowsing: gsbResult,
    virustotal: vtResult,
    primarySource: gsbResult?.error ? 'virustotal' : 'google-safe-browsing',
  };
}
```

### Risk Scoring Service (`riskScoring.js`)

#### URL Scoring
```javascript
if (externalSignals) {
  // Use VirusTotal verdict
  const vtVerdict = (externalSignals.virustotal?.verdict || '').toString().toLowerCase();
  if (vtVerdict.includes('malicious')) points += 45;
  else if (vtVerdict.includes('suspicious')) points += 25;

  // Use Google Safe Browsing matches
  if (externalSignals.googleSafeBrowsing?.matches?.length > 0) {
    points += 40;
  }
} else {
  // Keyword-only mode
  console.log('[Risk Scoring] Using keyword-only mode (no external API data)');
  points += 5; // Small penalty for lack of external verification
}
```

#### Text/Email Scoring
```javascript
if (externalSignals) {
  if (externalSignals.googleSafeBrowsing?.matches?.length) {
    points += 40;
  }
} else {
  // Keyword-only mode
  console.log('[Risk Scoring] Using keyword-only mode for text scan (no external API data)');
  points += 5;
}
```

## Console Logging

The system provides detailed console logs for debugging:

```
[External API] Trying Google Safe Browsing...
[External API] Google Safe Browsing succeeded
```

Or if fallback occurs:
```
[External API] Trying Google Safe Browsing...
[External API] Google Safe Browsing failed: [error message]
[External API] Falling back to VirusTotal...
[External API] VirusTotal succeeded
```

Or if both fail:
```
[External API] Trying Google Safe Browsing...
[External API] Google Safe Browsing failed: [error message]
[External API] Falling back to VirusTotal...
[External API] VirusTotal failed: [error message]
[External API] Both APIs failed, using keyword-only detection
[Risk Scoring] Using keyword-only mode (no external API data)
```

## Testing API Keys

Use the provided test script to verify your API keys before deployment:

```bash
cd server
npm run test-api-keys
```

This will:
- Test both API endpoints with a sample URL
- Display detailed results and error messages
- Indicate which APIs are working correctly

## Benefits

1. **Resilience**: System remains functional even when external APIs are down
2. **Cost-effective**: Can operate with only one API key configured
3. **Graceful degradation**: Keyword-only mode provides basic protection when APIs fail
4. **Debugging**: Clear console logs help identify API issues
5. **Flexibility**: Easy to add more external APIs to the fallback chain

## Configuration

No additional configuration is required. The fallback mechanism is automatically enabled.

To use only keyword-based filtering (no external APIs):
- Leave API keys empty in `.env` file
- System will automatically use keyword-only mode

To use only one external API:
- Configure only the API key you want to use
- System will attempt that API first, then fall back to keyword-only mode

To use both external APIs:
- Configure both API keys
- System will use Google Safe Browsing first, then VirusTotal as backup
