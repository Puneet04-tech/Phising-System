
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

```

```