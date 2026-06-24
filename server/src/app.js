const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');

const { env } = require('./config/env');

const authRoutes = require('./routes/auth.routes');
const scanRoutes = require('./routes/scan.routes');
const adminRoutes = require('./routes/admin.routes');
const keywordRoutes = require('./routes/keyword.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

// 1. Helmet - Security headers
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

// 2. CORS - Cross-Origin Resource Sharing
const corsOptions = {
  origin: env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// 3. Rate Limiting - Prevent DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// 4. Body size limit - Prevent large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. XSS Protection - Clean user input
app.use(xss());

// 6. HPP - HTTP Parameter Pollution protection
app.use(hpp());

// 7. Request logging
app.use(morgan('combined'));

// 8. Remove sensitive information from error responses
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
});

// 9. Security middleware for API routes
app.use((req, res, next) => {
  // Validate content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) {
    return res.status(400).json({ message: 'Content-Type must be application/json' });
  }
  next();
});

// 10. Prevent clickjacking
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// 11. Input validation middleware (will be used in routes)
const validateInput = (req, res, next) => {
  const { url, email, content } = req.body;
  
  // Basic input sanitization
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

app.use(validateInput);

// 12. Security check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    security: {
      rateLimit: 'enabled',
      cors: 'enabled',
      helmet: 'enabled',
      xssProtection: 'enabled'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/keywords', keywordRoutes);
app.use('/api/reports', reportRoutes);

// Global error handler
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error(err);
  
  // Don't leak error details in production
  const isDevelopment = env.NODE_ENV === 'development';
  
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
});

module.exports = { app };
