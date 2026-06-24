const dns = require('dns');
const https = require('https');
const url = require('url');

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function normalizeBody(req) {
  let body = req.body;

  // Some Windows shell/curl setups may send JSON as a string.
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      throw badRequest('Invalid JSON body');
    }
  }

  if (!body || typeof body !== 'object') {
    throw badRequest('Invalid JSON body');
  }

  return body;
}

function parseUrlAndValidate(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') {
    throw badRequest('URL is required');
  }

  const trimmed = urlStr.trim();
  if (trimmed.length > 2048) {
    throw badRequest('URL is too long');
  }

  let u;
  try {
    u = new URL(trimmed);
  } catch {
    throw badRequest('Invalid URL');
  }

  if (!['http:', 'https:'].includes(u.protocol)) {
    throw badRequest('Only http/https URLs are allowed');
  }

  // Basic SSRF-ish protections:
  // - block localhost and private ranges (best-effort)
  // - NOTE: fully correct SSRF protection requires DNS/IP resolution + allowlists.

  const hostname = u.hostname;
  const lowered = hostname.toLowerCase();

  const blockedHosts = [
    'localhost',
    '127.0.0.1',
    '::1',
    '0.0.0.0',
  ];
  if (blockedHosts.includes(lowered)) {
    throw badRequest('URL is not allowed');
  }

  // If hostname is an IP literal, block common private ranges.
  const ipV4 = lowered.match(/^\d{1,3}(\.\d{1,3}){3}$/);
  if (ipV4) {
    const parts = lowered.split('.').map((x) => Number(x));
    const [a, b] = parts;

    const isPrivate =
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a === 169; // placeholder, more granular below

    const isLinkLocal = lowered.startsWith('169.254.');

    if (isPrivate || isLinkLocal) {
      throw badRequest('URL is not allowed');
    }
  }

  return u.toString();
}

function truncateText(text, maxLen = 5000) {
  if (typeof text !== 'string') return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen);
}

// URL Obfuscation Detection
function detectUrlObfuscation(urlStr) {
  const flags = [];
  const lowered = urlStr.toLowerCase();

  // Check for IP address instead of domain
  if (/^\d{1,3}(\.\d{1,3}){3}/.test(urlStr)) {
    flags.push('IP_ADDRESS_INSTEAD_OF_DOMAIN');
  }

  // Check for encoded characters
  if (/%[0-9a-f]{2}/i.test(urlStr)) {
    flags.push('URL_ENCODING_DETECTED');
  }

  // Check for suspicious TLDs
  const suspiciousTLDs = ['.xyz', '.top', '.zip', '.mov', '.tk', '.ml', '.ga', '.cf'];
  if (suspiciousTLDs.some(tld => lowered.endsWith(tld))) {
    flags.push('SUSPICIOUS_TLD');
  }

  // Check for homograph attacks (similar looking characters)
  const homographPatterns = /[а-яё]/i; // Cyrillic
  if (homographPatterns.test(urlStr)) {
    flags.push('HOMOGRAPH_ATTACK_DETECTED');
  }

  // Check for excessive subdomains
  const subdomainCount = urlStr.split('.').length - 2;
  if (subdomainCount > 4) {
    flags.push('EXCESSIVE_SUBDOMAINS');
  }

  // Check for long domain names
  const domain = urlStr.split('/')[2] || '';
  if (domain.length > 50) {
    flags.push('LONG_DOMAIN_NAME');
  }

  // Check for suspicious patterns in URL
  const suspiciousPatterns = [
    /login/i,
    /signin/i,
    /verify/i,
    /account/i,
    /secure/i,
    /update/i,
    /bank/i,
    /wallet/i,
    /crypto/i,
  ];
  if (suspiciousPatterns.some(pattern => pattern.test(urlStr))) {
    flags.push('SUSPICIOUS_KEYWORDS_IN_URL');
  }

  return {
    hasObfuscation: flags.length > 0,
    flags,
    riskScore: flags.length * 10
  };
}

// SSL Certificate Validation
async function checkSSLCertificate(hostname) {
  return new Promise((resolve) => {
    try {
      const options = {
        hostname,
        port: 443,
        method: 'GET',
        path: '/',
        rejectUnauthorized: false,
      };

      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate();
        
        if (!cert || Object.keys(cert).length === 0) {
          resolve({
            valid: false,
            reason: 'No certificate found',
            issuer: null,
            validUntil: null,
            daysUntilExpiry: null
          });
          return;
        }

        const now = new Date();
        const validUntil = new Date(cert.valid_to);
        const daysUntilExpiry = Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24));

        resolve({
          valid: daysUntilExpiry > 0,
          issuer: cert.issuer,
          validUntil: cert.valid_to,
          daysUntilExpiry,
          riskScore: daysUntilExpiry < 30 ? 20 : daysUntilExpiry < 90 ? 10 : 0
        });
      });

      req.on('error', () => {
        resolve({
          valid: false,
          reason: 'SSL connection failed',
          issuer: null,
          validUntil: null,
          daysUntilExpiry: null,
          riskScore: 30
        });
      });

      req.setTimeout(5000, () => {
        req.destroy();
        resolve({
          valid: false,
          reason: 'SSL check timeout',
          issuer: null,
          validUntil: null,
          daysUntilExpiry: null,
          riskScore: 15
        });
      });

      req.end();
    } catch (error) {
      resolve({
        valid: false,
        reason: error.message,
        issuer: null,
        validUntil: null,
        daysUntilExpiry: null,
        riskScore: 25
      });
    }
  });
}

// Domain Structure Analysis
async function analyzeDomainStructure(hostname) {
  return new Promise((resolve) => {
    const analysis = {
      hostname,
      subdomains: [],
      rootDomain: null,
      tld: null,
      dnsRecords: null,
      riskScore: 0
    };

    try {
      const parts = hostname.split('.');
      
      if (parts.length >= 2) {
        analysis.tld = parts[parts.length - 1];
        analysis.rootDomain = parts[parts.length - 2] + '.' + analysis.tld;
        
        if (parts.length > 2) {
          analysis.subdomains = parts.slice(0, parts.length - 2);
        }
      }

      // Check DNS records
      dns.resolve(hostname, 'ANY', (err, records) => {
        if (err) {
          analysis.dnsRecords = { error: err.message };
          analysis.riskScore = 15;
        } else {
          analysis.dnsRecords = {
            recordCount: records.length,
            types: [...new Set(records.map(r => r.type))]
          };
          
          // Check for suspicious DNS patterns
          if (records.length > 10) {
            analysis.riskScore += 10;
          }
        }

        resolve(analysis);
      });
    } catch (error) {
      analysis.riskScore = 20;
      resolve(analysis);
    }
  });
}

// Redirect Chain Analysis
async function analyzeRedirectChain(urlStr, maxRedirects = 5) {
  const chain = [];
  let currentUrl = urlStr;
  let redirectCount = 0;
  let riskScore = 0;

  try {
    while (redirectCount < maxRedirects) {
      const parsed = new URL(currentUrl);
      
      chain.push({
        url: currentUrl,
        hostname: parsed.hostname,
        path: parsed.pathname
      });

      // Simulate redirect check (in production, use actual HTTP request)
      // For now, we'll just analyze the URL structure
      if (redirectCount > 0) {
        riskScore += 5; // Each redirect adds risk
      }

      redirectCount++;
      
      // Break after first iteration for safety (in production, implement actual redirect following)
      break;
    }

    return {
      chain,
      redirectCount,
      hasExcessiveRedirects: redirectCount > 3,
      riskScore
    };
  } catch (error) {
    return {
      chain: [],
      redirectCount: 0,
      hasExcessiveRedirects: false,
      error: error.message,
      riskScore: 20
    };
  }
}

// Comprehensive URL Security Analysis
async function analyzeUrlSecurity(urlStr) {
  try {
    const parsedUrl = new URL(urlStr);
    const hostname = parsedUrl.hostname;

    // Run all security checks in parallel
    const [obfuscation, ssl, domainStructure, redirectChain] = await Promise.all([
      Promise.resolve(detectUrlObfuscation(urlStr)),
      checkSSLCertificate(hostname),
      analyzeDomainStructure(hostname),
      analyzeRedirectChain(urlStr)
    ]);

    const totalRiskScore = 
      obfuscation.riskScore +
      ssl.riskScore +
      domainStructure.riskScore +
      redirectChain.riskScore;

    return {
      url: urlStr,
      timestamp: new Date().toISOString(),
      obfuscation,
      ssl,
      domainStructure,
      redirectChain,
      totalRiskScore,
      riskLevel: totalRiskScore > 50 ? 'HIGH' : totalRiskScore > 25 ? 'MEDIUM' : 'LOW'
    };
  } catch (error) {
    return {
      url: urlStr,
      error: error.message,
      totalRiskScore: 50,
      riskLevel: 'HIGH'
    };
  }
}

module.exports = {
  normalizeBody,
  parseUrlAndValidate,
  truncateText,
  badRequest,
  detectUrlObfuscation,
  checkSSLCertificate,
  analyzeDomainStructure,
  analyzeRedirectChain,
  analyzeUrlSecurity,
};

