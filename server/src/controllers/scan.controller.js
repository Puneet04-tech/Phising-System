const ScanHistory = require('../models/ScanHistory');
const { scoreUrlByRules, scoreTextByRules } = require('../services/riskScoring');
const { forwardUrlToExternalApis } = require('./externalApi.controller');

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function getUserId(req) {
  // req.user will be populated by requireAuth middleware
  return req.user?.id;
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

async function scanUrl(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId) throw Object.assign(new Error('Unauthorized'), { statusCode: 401 });

    const body = normalizeBody(req);
    const { url } = body;

    if (!url || typeof url !== 'string') throw badRequest('URL is required');

    // External API calls (best-effort)
    const externalSignals = await forwardUrlToExternalApis(url).catch((e) => ({
      virustotal: { error: e?.message || String(e) },
      googleSafeBrowsing: { error: e?.message || String(e) },
    }));

    // Rule-based aggregation
    const scored = scoreUrlByRules(url, externalSignals);

    const history = await ScanHistory.create({
      userId,
      scanType: 'url',
      content: url,
      result: {
        riskPercentage: scored.riskPercentage,
        threatStatus: scored.threatStatus,
        recommendation: scored.recommendation,
      },
      flaggedKeywords: scored.flaggedKeywords,
    });

    res.status(201).json({
      message: 'URL scan completed',
      result: history.result,
      flaggedKeywords: history.flaggedKeywords,
    });
  } catch (err) {
    next(err);
  }
}

async function scanEmail(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId) throw Object.assign(new Error('Unauthorized'), { statusCode: 401 });

    const body = normalizeBody(req);
    const { content } = body;

    if (!content || typeof content !== 'string') throw badRequest('Email content is required');

    // For email scanning, we don’t necessarily have a single URL to forward.
    // We can still parse URLs from content later; for now keep it best-effort.
    const externalSignals = await (async () => {
      const urlMatch = content.match(/https?:\/\/[^\s]+/i);
      if (!urlMatch) return { googleSafeBrowsing: { matches: [] } };

      const url = urlMatch[0];
      const forwarded = await forwardUrlToExternalApis(url).catch(() => null);
      return forwarded || { googleSafeBrowsing: { matches: [] } };
    })();

    const scored = scoreTextByRules(content, 'email', externalSignals);

    const history = await ScanHistory.create({
      userId,
      scanType: 'email',
      content,
      result: {
        riskPercentage: scored.riskPercentage,
        threatStatus: scored.threatStatus,
        recommendation: scored.recommendation,
      },
      flaggedKeywords: scored.flaggedKeywords,
    });

    res.status(201).json({
      message: 'Email scan completed',
      result: history.result,
      flaggedKeywords: history.flaggedKeywords,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  scanUrl,
  scanEmail,
};
