# URL Security Analysis Features

This document outlines the comprehensive URL security analysis features added to the Phishing Detection System.

## Security Analysis Steps

The system now performs the following security checks on every URL scan:

### 1. URL Obfuscation Detection
**Purpose:** Detects attempts to hide the true nature of a URL.

**Checks Performed:**
- **IP Address Detection**: Flags URLs using IP addresses instead of domain names
- **URL Encoding**: Detects percent-encoded characters (%20, %2F, etc.)
- **Suspicious TLDs**: Identifies high-risk top-level domains (.xyz, .top, .zip, .mov, .tk, .ml, .ga, .cf)
- **Homograph Attacks**: Detects Cyrillic characters that look like Latin letters
- **Excessive Subdomains**: Flags URLs with more than 4 subdomains
- **Long Domain Names**: Identifies domains longer than 50 characters
- **Suspicious Keywords**: Detects words like "login", "signin", "verify", "account", "secure", "update", "bank", "wallet", "crypto"

**Risk Scoring:** Each flag adds 10 points to the risk score.

### 2. SSL Certificate Validation
**Purpose:** Validates the SSL/TLS certificate of the target domain.

**Checks Performed:**
- **Certificate Presence**: Verifies SSL certificate exists
- **Certificate Validity**: Checks if certificate is currently valid
- **Certificate Expiry**: Calculates days until certificate expiration
- **Issuer Information**: Retrieves certificate issuer details
- **Connection Security**: Validates SSL connection can be established

**Risk Scoring:**
- No certificate: 30 points
- SSL connection failed: 30 points
- Certificate expires in < 30 days: 20 points
- Certificate expires in < 90 days: 10 points
- SSL check timeout: 15 points
- Valid certificate: 0 points

### 3. Domain Structure Analysis
**Purpose:** Analyzes the structure and DNS records of the domain.

**Checks Performed:**
- **Subdomain Extraction**: Identifies all subdomains
- **Root Domain Identification**: Extracts the main domain
- **TLD Detection**: Identifies the top-level domain
- **DNS Record Analysis**: Queries DNS records for the domain
- **Record Count**: Counts total DNS records
- **Record Types**: Identifies types of DNS records present

**Risk Scoring:**
- DNS resolution failure: 15 points
- More than 10 DNS records: 10 points
- General analysis error: 20 points

### 4. Redirect Chain Analysis
**Purpose:** Analyzes URL redirects to detect malicious redirect chains.

**Checks Performed:**
- **Redirect Tracking**: Follows redirect chain (up to 5 redirects)
- **Hostname Changes**: Detects changes in hostname during redirects
- **Path Changes**: Tracks path modifications during redirects
- **Excessive Redirects**: Flags chains with more than 3 redirects

**Risk Scoring:**
- Each redirect: 5 points
- Analysis error: 20 points
- Excessive redirects: Additional risk

### 5. Comprehensive Risk Calculation
**Purpose:** Combines all security checks into a unified risk score.

**Calculation Method:**
```
Total Risk Score = Obfuscation Score + SSL Score + Domain Score + Redirect Score
Combined Risk Percentage = Existing Risk % + (Total Risk Score × 0.3)
```

**Risk Levels:**
- **HIGH**: Total risk score > 50
- **MEDIUM**: Total risk score > 25
- **LOW**: Total risk score ≤ 25

## API Response

The scan endpoint now returns detailed security analysis:

```json
{
  "message": "URL scan completed",
  "result": {
    "riskPercentage": 65,
    "threatStatus": "Malicious",
    "recommendation": "Do not proceed - high risk detected"
  },
  "flaggedKeywords": ["login", "verify"],
  "securityAnalysis": {
    "obfuscation": {
      "hasObfuscation": true,
      "flags": ["IP_ADDRESS_INSTEAD_OF_DOMAIN", "SUSPICIOUS_KEYWORDS_IN_URL"],
      "riskScore": 20
    },
    "ssl": {
      "valid": false,
      "reason": "SSL connection failed",
      "issuer": null,
      "validUntil": null,
      "daysUntilExpiry": null,
      "riskScore": 30
    },
    "domainStructure": {
      "hostname": "example.com",
      "subdomains": [],
      "rootDomain": "example.com",
      "tld": "com",
      "dnsRecords": {
        "recordCount": 5,
        "types": ["A", "MX", "NS"]
      },
      "riskScore": 0
    },
    "redirectChain": {
      "chain": [
        {
          "url": "https://example.com",
          "hostname": "example.com",
          "path": "/"
        }
      ],
      "redirectCount": 0,
      "hasExcessiveRedirects": false,
      "riskScore": 0
    },
    "totalRiskScore": 50,
    "riskLevel": "HIGH"
  }
}
```

## Implementation Details

### Files Modified

1. **`server/src/middleware/validateInput.js`**
   - Added `detectUrlObfuscation()` function
   - Added `checkSSLCertificate()` function
   - Added `analyzeDomainStructure()` function
   - Added `analyzeRedirectChain()` function
   - Added `analyzeUrlSecurity()` function (comprehensive analysis)

2. **`server/src/controllers/scan.controller.js`**
   - Integrated security analysis into URL scanning
   - Combined security risk with existing risk scoring
   - Updated threat status based on security analysis
   - Added security analysis to scan response

### Performance Considerations

- **Parallel Execution**: All security checks run in parallel using `Promise.all()`
- **Timeout Protection**: SSL checks have 5-second timeout
- **Error Handling**: All checks have fallback values on failure
- **Caching**: Consider adding caching for frequently checked domains

### Security Benefits

1. **Early Detection**: Identifies malicious URLs before they reach users
2. **Multi-layered Analysis**: Combines multiple detection methods
3. **Risk Quantification**: Provides numerical risk scores for decision making
4. **Detailed Reporting**: Gives users insight into why a URL was flagged
5. **Adaptive Scoring**: Adjusts risk based on multiple factors

## Testing

### Test URL Obfuscation
```bash
curl -X POST https://phising-system.onrender.com/api/scans/url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"url": "http://192.168.1.1/login"}'
```

### Test SSL Validation
```bash
curl -X POST https://phising-system.onrender.com/api/scans/url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"url": "https://expired-cert-example.com"}'
```

### Test Domain Analysis
```bash
curl -X POST https://phising-system.onrender.com/api/scans/url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"url": "https://sub1.sub2.sub3.sub4.sub5.example.com"}'
```

## Future Enhancements

1. **Real-time Redirect Following**: Implement actual HTTP redirect following
2. **Reputation Scoring**: Integrate domain reputation databases
3. **Machine Learning**: Use ML models for pattern recognition
4. **Behavioral Analysis**: Analyze URL behavior over time
5. **Threat Intelligence**: Integrate additional threat intelligence feeds
6. **Caching Layer**: Cache security analysis results for performance
7. **Async Processing**: Move heavy checks to background jobs

## Monitoring

Monitor these metrics to ensure security analysis is working:

- **SSL Check Success Rate**: Should be > 95%
- **DNS Resolution Success Rate**: Should be > 90%
- **Average Analysis Time**: Should be < 5 seconds
- **False Positive Rate**: Monitor and adjust thresholds
- **Risk Score Distribution**: Track typical risk scores

## Troubleshooting

### SSL Checks Failing
- Check network connectivity
- Verify firewall allows HTTPS connections
- Ensure DNS resolution is working

### DNS Analysis Failing
- Check DNS server configuration
- Verify DNS queries are not being blocked
- Consider using alternative DNS servers

### High False Positive Rate
- Adjust risk score thresholds
- Review suspicious keyword lists
- Fine-tune TLD blocklist

---

**Last Updated:** June 24, 2026
