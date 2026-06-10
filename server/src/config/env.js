const dotenv = require('dotenv');

dotenv.config();

function requireEnv(name) {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

const env = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  MONGODB_URI: requireEnv('MONGODB_URI'),
  JWT_SECRET: requireEnv('JWT_SECRET'),

  // External APIs keys (will be used later by scan controllers)
  VIRUSTOTAL_API_KEY: process.env.VIRUSTOTAL_API_KEY || '',
  GOOGLE_SAFE_BROWSING_KEY: process.env.GOOGLE_SAFE_BROWSING_KEY || '',
};

module.exports = { env };
