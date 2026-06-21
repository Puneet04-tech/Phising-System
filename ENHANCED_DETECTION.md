## 🔬 Enhanced Detection Algorithm

The platform features a sophisticated multi-layered detection system that combines external security APIs with advanced keyword analysis and structural pattern recognition.

### **External API Integration**

#### **Google Safe Browsing API v4**
- **Multiple Threat Types**: Detects MALWARE, SOCIAL_ENGINEERING, UNWANTED_SOFTWARE, and POTENTIALLY_HARMFUL_APPLICATION threats
- **Platform-Specific Detection**: Comprehensive coverage across Windows, Linux, Android, iOS, and Chrome platforms
- **Comprehensive Threat Entry Types**: Analyzes both URLs and executable files
- **Detailed Threat Information**: Extracts specific threat types, platforms, and threat details for accurate risk assessment
- **Enhanced Error Handling**: Robust API key validation and error response handling

#### **VirusTotal API v3**
- **Direct URL Analysis**: Utilizes existing URL database for faster results instead of always submitting new scans
- **Comprehensive Reputation Scoring**: Calculates reputation scores based on analysis from 70+ security engines
- **Engine-Level Analysis**: Tracks malicious, suspicious, and harmless detection counts from multiple antivirus vendors
- **Threat Extraction**: Identifies specific threats and detection results from each security engine
- **Smart Verdict System**: Determines malicious/suspicious/potentially-malicious/harmless status based on engine consensus
- **Fallback Mechanism**: Automatically submits new analysis if URL is not found in the database

### **Advanced Keyword Detection System**

#### **Database-Driven Keywords**
- **Dynamic Keyword Loading**: Loads active keywords from MongoDB for flexible threat detection
- **Fallback Mechanism**: Uses comprehensive hardcoded keywords when database is unavailable
- **Category-Based Classification**: Keywords organized by categories (credential, financial, urgency, verification, incentive, action, suspicious, service, information)
- **Severity Levels**: Each keyword assigned severity (critical, high, medium, low) for weighted scoring
- **Context-Aware Detection**: Additional context fields for nuanced keyword analysis

#### **Pattern Matching Capabilities**
- **Multiple Match Types**: Supports contains, exact, regex, and word-boundary matching
- **Regex Pattern Support**: Advanced regex patterns for complex threat detection
- **Severity Multipliers**: Applies critical (1.5x), high (1.3x), medium (1.1x) multipliers for accurate risk assessment
- **Category-Based Bonuses**: Additional risk points when multiple keyword categories are detected

### **URL Structure Analysis**

#### **Technical Pattern Detection**
- **Suspicious TLD Detection**: Identifies risky top-level domains (.xyz, .top, .zip, .mov, .tk, .ml, .ga, .cf, .gq)
- **IP Address Detection**: Flags URLs with direct IP addresses instead of domain names
- **Domain Length Analysis**: Detects unusually long domain names often used in phishing
- **Query String Analysis**: Analyzes number and complexity of URL parameters
- **Subdomain Analysis**: Identifies excessive subdomain usage indicative of spoofing
- **Character Pattern Analysis**: Detects consecutive numbers and random character strings
- **Hyphen Analysis**: Flags excessive hyphen usage in domain names

### **Email/Text Content Analysis**

#### **Context Pattern Matching**
- **Email-Specific Patterns**: Detects urgency indicators, credential requests, and threat patterns
- **Multiple URL Detection**: Analyzes multiple URLs embedded in email content
- **Email Spoofing Detection**: Identifies excessive email addresses typical of spoofing attempts
- **Text Length Analysis**: Flags suspiciously short or long content
- **Regex Pattern Matching**: Uses advanced regex patterns for common phishing phrases

### **Parallel API Processing**

#### **Optimized Performance**
- **Simultaneous API Calls**: Google Safe Browsing and VirusTotal called in parallel for faster results
- **Smart Source Selection**: Automatically selects primary source based on data quality and reliability
- **Confidence Scoring**: Applies bonus points when both APIs succeed for higher confidence
- **Comprehensive Logging**: Detailed logging for debugging, monitoring, and analysis

### **API Configuration**

To enable the enhanced detection features, configure the following API keys in your `server/.env` file:

```env
# Google Safe Browsing API Key
GOOGLE_SAFE_BROWSING_KEY=your_google_safe_browsing_api_key_here

# VirusTotal API Key  
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
```

**Obtaining API Keys:**

- **Google Safe Browsing**: Create a project in Google Cloud Console, enable the Safe Browsing API, and create API credentials
- **VirusTotal**: Sign up at virustotal.com and obtain your API key from the API settings section

---
