const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { env } = require('./config/env');

const authRoutes = require('./routes/auth.routes');
const scanRoutes = require('./routes/scan.routes');
const adminRoutes = require('./routes/admin.routes');
const keywordRoutes = require('./routes/keyword.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

app.use(helmet());

// Configure CORS with specific origin
const corsOptions = {
  origin: env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/keywords', keywordRoutes);
app.use('/api/reports', reportRoutes);

app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  });
});

module.exports = { app };
