
# AI Phishing Detection Platform 🛡️

A web-based cybersecurity application designed to identify whether a URL, email, or text message is safe or a potential phishing attempt. Built natively on a modern JavaScript/TypeScript full-stack ecosystem with a rule-based algorithm and aggregate security APIs.

This project is developed as an internship assignment by a engineering duo, specifically optimized using a **MongoDB, Next.js, and Node.js** stack for rapid, cohesive, and scalable full-stack development.

---

## 👥 The Team & Work Division
To ensure both members get full-stack exposure and an equal workload, tasks are split by core feature domains rather than separating frontend and backend strictly.

### **Developer A: Core Platform & Security Integrations**
* **Database Design:** Establish MongoDB Atlas clusters and design schemas (Users, ScanHistory) using Mongoose.
* **Authentication:** Code Backend Auth API routes (Signup/Login) and build Frontend protected route middlewares.
* **External API Integrations:** Build the backend controllers to securely forward links to VirusTotal and Google Safe Browsing.
* **URL Scanner Page:** Build the frontend user interface where links are submitted, parsing API responses into visual safety badges.

### **Developer B: Text Analytics, Dashboard & Administration**
* **Email Analyzer Engine:** Develop the backend rule-based algorithms, regex matching arrays, and the risk scoring system.
* **Email Analyzer Frontend:** Build the interface for text submission blocks and display threat breakdown matrices dynamically.
* **User/Admin Dashboard:** Implement history data tables, metric cards (Total Scans, Safe vs. Malicious ratio), and analytics charts.
* **Admin Controls Layout:** Build protected routes for administrators to manage live threat data and global platform metrics.

---


## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), Tailwind CSS, Shadcn UI, Lucide React, Recharts
* **Backend:** Node.js, Express.js
* **Database:** MongoDB + Mongoose ODM
* **Authentication:** JSON Web Tokens (JWT) + bcryptjs
* **Security APIs:** VirusTotal API v3, Google Safe Browsing API v4

---
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

To enable the enhanced detection features, configure the following API keys in your server/.env file:

`env
# Google Safe Browsing API Key
GOOGLE_SAFE_BROWSING_KEY=your_google_safe_browsing_api_key_here

# VirusTotal API Key
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
`

**Obtaining API Keys:**

- **Google Safe Browsing**: Create a project in Google Cloud Console, enable the Safe Browsing API, and create API credentials
- **VirusTotal**: Sign up at virustotal.com and obtain your API key from the API settings section

---

## 📋 Comprehensive Platform Features

### 👤 User Level Features
* **Secure Authentication:** User registration and sign-in handling powered by encrypted JWT payloads.
* **URL Scanner:** Form submission that reviews link inputs for HTTPS usage, structural anomalies, malicious patterns, and matches them against external blacklists.
* **Email Content Analyzer:** A text box submission module evaluating text bodies for urgency metrics, credential requests, and phishing scam keywords.
* **Risk Detection System:** A hybrid analysis engine blending raw keyword metrics, regex rules, and safety index metrics into clear threat classifications and threat percentages.
* **Scan History Log:** A personalized table displaying user-specific query outcomes stored safely inside the database.
* **Dashboard Analytics:** Visual summary grids showing interactive metrics like total links processed, unsafe counts, and diagnostic trends.
* **Threat Reports:** The generation and presentation of formalized risk breakdowns detailing specific attack vectors found during scans.

### 👑 Admin Level Features
* **User Management:** Oversee profiles, look up active accounts, and manage platform permissions.
* **View Detection Logs:** System-wide activity audits tracking every request made to the platform engine in real-time.
* **Monitor Reports:** Systematically track, update, and review user security report submissions across the platform.
* **Manage Suspicious Keywords:** Direct UI controls allowing admins to add, delete, or update high-risk vocabulary terms directly in MongoDB.
* **View System Analytics:** Providing high-level metric views regarding total global threats neutralized and server traffic statistics.
* **Admin Dashboard:** Dedicated admin interface with overview analytics, user management, and keyword controls.

---

## 🏗️ System Architecture Workflow


```

User Input (URL/Text)
│
▼
┌──────────────┐
│ Next.js UI   │
└───────┬──────┘
│ (JWT Authenticated Request)
▼
┌──────────────┐
│ Express API  │
└───────┬──────┘
├───────────────────────────────┐
▼                               ▼
┌──────────────┐                ┌──────────────┐
│ Rule Engine  │                │ Security APIs│
│ (Regex Check)│                │ (VirusTotal) │
└───────┬──────┘                │ (Google SB)  │
│                               └──────┬───────┘
└───────────────┬──────────────────────┘
▼
┌──────────────────────┐
│ Risk Aggregation &   │
│ MongoDB Serialization│
└───────────┬──────────┘
▼
┌──────────────────────┐
│ UI Dashboard Render  │
└──────────────────────┘

```

---

## 📊 Mongoose Schemas

### User Schema
```javascript
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

```

### Scan History Schema

```javascript
const ScanHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scanType: { type: String, enum: ['url', 'email'], required: true },
  content: { type: String, required: true },
  result: {
    riskPercentage: { type: Number, required: true },
    threatStatus: { type: String, required: true }, // e.g., 'Safe', 'Suspicious', 'Malicious'
    recommendation: { type: String, required: true }
  },
  flaggedKeywords: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

```

---

## ⚙️ Installation & Local Setup

### Prerequisites

* Node.js (v18+)
* MongoDB Atlas Account or Local MongoDB Community Server instance

### 1. Repository Setup

```bash
git clone [https://github.com/your-username/phishing-detection-platform.git](https://github.com/your-username/phishing-detection-platform.git)
cd phishing-detection-platform

```

### 2. Backend Environment Setup

Navigate to your backend workspace and install dependencies:

```bash
cd server
npm install

```

Create a `.env` file in the root of your `server/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signing_secret_key
VIRUSTOTAL_API_KEY=your_virustotal_v3_api_key
GOOGLE_SAFE_BROWSING_KEY=your_google_developer_api_key

```

Launch the API backend dev environment:

```bash
npm run dev

```

### 3. Frontend Environment Setup

Open a new terminal window, navigate to the frontend directory, and run installation:

```bash
cd client
npm install

```

Create a `.env.local` file in the root of your `client/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

```

Launch the Next.js local development server:

```bash
npm run dev

```

### 4. Creating an Admin User

After setting up the application, you'll need to create an admin user to access the admin dashboard:

1. **Sign up** a new user account through the frontend at `http://localhost:3000/signup`
2. **Promote the user to admin** by running the following command in the server directory:

```bash
npm run create-admin <user-email>
```

Example:
```bash
npm run create-admin admin@example.com
```

This will update the user's role to 'admin', granting access to the admin dashboard at `/admin`.

### 4. Creating an Admin User

After setting up the application, you'll need to create an admin user to access the admin dashboard:

1. **Sign up** a new user account through the frontend at `http://localhost:3000/signup`
2. **Promote the user to admin** by running the following command in the server directory:

```bash
npm run create-admin <user-email>
```

Example:
```bash
npm run create-admin admin@example.com
```

This will update the user's role to 'admin', granting access to the admin dashboard at `/admin`.

```bash
npm run dev

```

---

## 🚀 Deployment

The application is designed for easy deployment to production using **Render** (backend) and **Vercel** (frontend).

### Quick Deploy

**Backend (Render):**
- The `render.yaml` file is pre-configured at repository root for Render deployment
- Connect your GitHub repository to Render
- Add environment variables (see `server/env.example`)
- Render will auto-deploy using the config
- Build command: `cd server && npm install`
- Start command: `cd server && node src/server.js`

**Frontend (Vercel):**
- The `client/vercel.json` file is pre-configured for Vercel deployment
- Connect your GitHub repository to Vercel
- Set `NEXT_PUBLIC_API_URL` to your Render backend URL
- Vercel will auto-deploy using the config

### Detailed Deployment Guide

For complete step-by-step instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)** which includes:
- MongoDB Atlas setup
- API key configuration (VirusTotal, Google Safe Browsing)
- Environment variable setup
- Troubleshooting common issues
- Security best practices

### Environment Variables

**Backend (Render):**
```env
PORT=10000
NODE_ENV=production
CORS_ORIGIN=https://phisingsystem.vercel.app
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
VIRUSTOTAL_API_KEY=your-vt-key
GOOGLE_SAFE_BROWSING_API_KEY=your-google-key
GOOGLE_SAFE_BROWSING_CLIENT_ID=your-client-id
```

**Frontend (Vercel):**
```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api
```

### Cost

All services can be deployed for **free**:
- MongoDB Atlas: Free tier
- Render: Free tier
- Vercel: Hobby tier

---

## 🔒 Security

The backend implements 12 comprehensive security measures to protect against common attacks:

1. **Helmet** - Security headers (CSP, X-Frame-Options, etc.)
2. **CORS** - Cross-Origin Resource Sharing with specific origin
3. **Rate Limiting** - DDoS protection (100 req/15min, 5 auth attempts/15min)
4. **Body Size Limit** - Prevents large payload attacks (10kb limit)
5. **XSS Protection** - Sanitizes user input against XSS attacks
6. **HPP** - HTTP Parameter Pollution protection
7. **Request Logging** - Security monitoring and auditing
8. **Header Security** - Removes sensitive server information
9. **Content-Type Validation** - Ensures proper request format
10. **Clickjacking Protection** - Prevents iframe embedding
11. **Input Validation** - Sanitizes and validates all user input
12. **Secure Error Handling** - Prevents information leakage

For detailed security documentation, see **[SECURITY.md](./SECURITY.md)**.

---
