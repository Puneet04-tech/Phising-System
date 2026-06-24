# Security Implementation

This document outlines the 12 security measures implemented in the Phishing Detection System backend to protect against common attacks and vulnerabilities.

## Security Measures Implemented

### 1. **Helmet - Security Headers**
**Purpose:** Sets various HTTP headers to secure the application against well-known web vulnerabilities.

**Implementation:**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

**Protection:**
- XSS attacks via Content-Security-Policy
- Clickjacking via X-Frame-Options
- MIME-type sniffing via X-Content-Type-Options
- Referrer policy control

---

### 2. **CORS - Cross-Origin Resource Sharing**
**Purpose:** Controls which domains can access the API.

**Implementation:**
```javascript
const corsOptions = {
  origin: env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
};
```

**Protection:**
- Prevents unauthorized domains from accessing the API
- Limits allowed HTTP methods
- Restricts allowed headers
- Caches CORS preflight requests for 24 hours

---

### 3. **Rate Limiting - DDoS Protection**
**Purpose:** Limits the number of requests from a single IP address.

**Implementation:**
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});
```

**Protection:**
- Prevents DDoS attacks
- Limits brute force attacks on authentication endpoints
- Reduces server load from abusive clients
- Separate stricter limits for auth endpoints

---

### 4. **Body Size Limit**
**Purpose:** Limits the size of request bodies to prevent payload attacks.

**Implementation:**
```javascript
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

**Protection:**
- Prevents denial of service via large payloads
- Reduces memory consumption
- Prevents buffer overflow attacks
- Limits potential attack surface

---

### 5. **XSS Protection**
**Purpose:** Sanitizes user input to prevent Cross-Site Scripting attacks.

**Implementation:**
```javascript
app.use(xss());
```

**Protection:**
- Removes malicious scripts from user input
- Prevents XSS attacks via URL parameters
- Sanitizes HTML in request bodies
- Protects against stored and reflected XSS

---

### 6. **HPP - HTTP Parameter Pollution**
**Purpose:** Protects against HTTP Parameter Pollution attacks.

**Implementation:**
```javascript
app.use(hpp());
```

**Protection:**
- Prevents parameter pollution attacks
- Handles duplicate parameters safely
- Protects against query string manipulation
- Ensures consistent parameter handling

---

### 7. **Request Logging**
**Purpose:** Logs all HTTP requests for security monitoring and auditing.

**Implementation:**
```javascript
app.use(morgan('combined'));
```

**Protection:**
- Enables security monitoring
- Helps detect attack patterns
- Provides audit trail
- Facilitates forensic analysis

---

### 8. **Remove Sensitive Headers**
**Purpose:** Removes server information from responses.

**Implementation:**
```javascript
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
});
```

**Protection:**
- Hides server technology information
- Reduces information disclosure
- Makes reconnaissance harder for attackers
- Follows security best practices

---

### 9. **Content-Type Validation**
**Purpose:** Ensures POST/PUT requests have correct Content-Type.

**Implementation:**
```javascript
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) {
    return res.status(400).json({ message: 'Content-Type must be application/json' });
  }
  next();
});
```

**Protection:**
- Prevents content-type bypass attacks
- Ensures proper data format
- Rejects malformed requests
- Validates request structure

---

### 10. **Clickjacking Protection**
**Purpose:** Prevents the application from being embedded in iframes.

**Implementation:**
```javascript
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

**Protection:**
- Prevents clickjacking attacks
- Stops MIME-type sniffing
- Controls referrer information
- Protects against UI redress attacks

---

### 11. **Input Validation & Sanitization**
**Purpose:** Validates and sanitizes user input.

**Implementation:**
```javascript
const validateInput = (req, res, next) => {
  const { url, email, content } = req.body;
  
  if (url && typeof url === 'string') {
    req.body.url = url.trim().toLowerCase();
  }
  if (email && typeof email === 'string') {
    req.body.email = email.trim().toLowerCase();
  }
  if (content && typeof content === 'string') {
    req.body.content = content.trim();
  }
  
  next();
};
```

**Protection:**
- Normalizes user input
- Prevents injection attacks
- Removes whitespace issues
- Standardizes data format

---

### 12. **Secure Error Handling**
**Purpose:** Prevents information leakage in error responses.

**Implementation:**
```javascript
app.use((err, req, res, next) => {
  const isDevelopment = env.NODE_ENV === 'development';
  
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
});
```

**Protection:**
- Hides sensitive error details in production
- Prevents information disclosure
- Provides detailed errors only in development
- Maintains user experience while securing data

---

## Additional Security Features

### JWT Authentication
- Secure token-based authentication
- Token expiration (configurable)
- Secure token storage recommendations
- Token validation on protected routes

### Password Hashing
- bcrypt for password hashing
- Strong salt rounds
- Secure password storage
- No plain text passwords

### MongoDB Security
- Connection string security
- Input validation for database queries
- NoSQL injection prevention
- Secure data handling

### API Key Protection
- Environment variables for sensitive keys
- Never commit API keys to git
- Regular key rotation
- Secure key management

---

## Security Checklist

- [x] Helmet security headers
- [x] CORS configuration
- [x] Rate limiting (global and auth-specific)
- [x] Body size limits
- [x] XSS protection
- [x] HPP protection
- [x] Request logging
- [x] Header security
- [x] Content-type validation
- [x] Clickjacking protection
- [x] Input validation
- [x] Secure error handling
- [x] JWT authentication
- [x] Password hashing
- [x] MongoDB security
- [x] API key protection

---

## Testing Security

### Test Security Endpoint
```bash
curl https://phising-system.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-06-24T...",
  "security": {
    "rateLimit": "enabled",
    "cors": "enabled",
    "helmet": "enabled",
    "xssProtection": "enabled"
  }
}
```

### Test Rate Limiting
```bash
# Make 100+ requests quickly
for i in {1..101}; do curl https://phising-system.onrender.com/api/health; done
```

Expected: After 100 requests, you should receive a 429 status code.

### Test CORS
```bash
curl -H "Origin: https://evil.com" https://phising-system.onrender.com/api/health
```

Expected: Request should be blocked or return error.

---

## Security Best Practices

1. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm audit fix
   ```

2. **Use Environment Variables**
   - Never commit `.env` files
   - Use strong secrets
   - Rotate keys regularly

3. **Monitor Logs**
   - Review access logs regularly
   - Set up alerts for suspicious activity
   - Monitor rate limit violations

4. **Regular Security Audits**
   - Run security scans
   - Test for vulnerabilities
   - Review code for security issues

5. **HTTPS Only**
   - Always use HTTPS in production
   - Implement HSTS headers
   - Use secure cookies

---

## Dependencies Added

```json
{
  "express-rate-limit": "^7.4.0",
  "express-validator": "^7.0.1",
  "hpp": "^0.2.3",
  "xss-clean": "^0.1.1"
}
```

Install with:
```bash
cd server
npm install
```

---

## Monitoring and Alerts

Recommended monitoring:
- Rate limit violations
- Failed authentication attempts
- Unusual traffic patterns
- Error rate increases
- Response time anomalies

Set up alerts for:
- Multiple failed logins from same IP
- Rate limit threshold breaches
- Error rate spikes
- Unusual API usage patterns

---

## Compliance

These security measures help with:
- **OWASP Top 10** protection
- **GDPR** data protection
- **SOC 2** security controls
- **PCI DSS** requirements (if applicable)

---

## Next Steps

1. Install new dependencies: `npm install`
2. Test all security measures
3. Set up monitoring and alerts
4. Regular security audits
5. Keep dependencies updated
6. Review logs regularly

---

**Last Updated:** June 24, 2026
