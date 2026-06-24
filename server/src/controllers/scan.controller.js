const ScanHistory = require('../models/ScanHistory');
const { scoreUrlByRules, scoreTextByRules } = require('../services/riskScoring');
const { forwardUrlToExternalApis } = require('./externalApi.controller');

const {
  normalizeBody,
  parseUrlAndValidate,
  truncateText,
  badRequest,
  analyzeUrlSecurity,
} = require('../middleware/validateInput');

function getUserId(req) {
  // req.user will be populated by requireAuth middleware
  return req.user?.id;
}

async function scanUrl(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId) throw Object.assign(new Error('Unauthorized'), { statusCode: 401 });

    const body = normalizeBody(req);
    const { url } = body;

    const safeUrl = parseUrlAndValidate(url);

    // Run comprehensive URL security analysis
    const securityAnalysis = await analyzeUrlSecurity(safeUrl);

    // External API calls (best-effort)
    const externalSignals = await forwardUrlToExternalApis(safeUrl).catch((e) => ({
      virustotal: { error: e?.message || String(e) },
      googleSafeBrowsing: { error: e?.message || String(e) },
    }));

    // Rule-based aggregation (now async)
    const scored = await scoreUrlByRules(safeUrl, externalSignals);

    // Combine security analysis risk score with existing risk score
    const combinedRiskScore = Math.min(
      scored.riskPercentage + (securityAnalysis.totalRiskScore * 0.3),
      100
    );

    // Update threat status based on combined risk
    let finalThreatStatus = scored.threatStatus;
    if (securityAnalysis.riskLevel === 'HIGH' && scored.riskPercentage < 50) {
      finalThreatStatus = 'Suspicious';
    } else if (securityAnalysis.riskLevel === 'HIGH' && scored.riskPercentage >= 50) {
      finalThreatStatus = 'Malicious';
    }

    const history = await ScanHistory.create({
      userId,
      scanType: 'url',
      content: safeUrl,
      result: {
        riskPercentage: combinedRiskScore,
        threatStatus: finalThreatStatus,
        recommendation: scored.recommendation,
      },
      flaggedKeywords: scored.flaggedKeywords,
      securityAnalysis,
    });

    res.status(201).json({
      message: 'URL scan completed',
      result: history.result,
      flaggedKeywords: history.flaggedKeywords,
      keywordCategories: scored.keywordCategories,
      severityCounts: scored.severityCounts,
      externalApiUsed: scored.externalApiUsed,
      primarySource: scored.primarySource,
      usedFallbackKeywords: scored.usedFallbackKeywords,
      securityAnalysis: {
        obfuscation: securityAnalysis.obfuscation,
        ssl: securityAnalysis.ssl,
        domainStructure: securityAnalysis.domainStructure,
        redirectChain: securityAnalysis.redirectChain,
        totalRiskScore: securityAnalysis.totalRiskScore,
        riskLevel: securityAnalysis.riskLevel,
      },
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

    if (!content || typeof content !== 'string') {
      throw badRequest('Email content is required');
    }

    const safeContent = truncateText(content, 5000);

    // Extract all URLs from email content
    const urlMatches = safeContent.match(/https?:\/\/[^\s]+/gi) || [];
    const uniqueUrls = [...new Set(urlMatches)]; // Remove duplicates

    // Run security analysis on all found URLs
    const urlSecurityAnalyses = await Promise.all(
      uniqueUrls.map(async (urlStr) => {
        try {
          const safeUrl = parseUrlAndValidate(urlStr);
          const securityAnalysis = await analyzeUrlSecurity(safeUrl);
          return {
            url: safeUrl,
            securityAnalysis,
          };
        } catch (error) {
          return {
            url: urlStr,
            securityAnalysis: {
              error: error.message,
              totalRiskScore: 50,
              riskLevel: 'HIGH'
            }
          };
        }
      })
    );

    // Calculate combined security risk from all URLs
    const totalSecurityRisk = urlSecurityAnalyses.reduce((sum, urlAnalysis) => {
      return sum + (urlAnalysis.securityAnalysis.totalRiskScore || 0);
    }, 0);

    const averageSecurityRisk = uniqueUrls.length > 0 ? totalSecurityRisk / uniqueUrls.length : 0;
    const maxSecurityRisk = uniqueUrls.length > 0 
      ? Math.max(...urlSecurityAnalyses.map(u => u.securityAnalysis.totalRiskScore || 0))
      : 0;

    // For email scanning, forward the first found URL to external APIs
    const externalSignals = await (async () => {
      if (uniqueUrls.length === 0) return { googleSafeBrowsing: { matches: [] } };

      const safeUrl = parseUrlAndValidate(uniqueUrls[0]);
      const forwarded = await forwardUrlToExternalApis(safeUrl).catch(() => null);
      return forwarded || { googleSafeBrowsing: { matches: [] } };
    })();

    // Rule-based aggregation (now async)
    const scored = await scoreTextByRules(safeContent, 'email', externalSignals);

    // Combine security analysis risk with existing risk score
    const combinedRiskScore = Math.min(
      scored.riskPercentage + (maxSecurityRisk * 0.3),
      100
    );

    // Update threat status based on combined risk
    let finalThreatStatus = scored.threatStatus;
    if (maxSecurityRisk > 50 && scored.riskPercentage < 50) {
      finalThreatStatus = 'Suspicious';
    } else if (maxSecurityRisk > 50 && scored.riskPercentage >= 50) {
      finalThreatStatus = 'Malicious';
    }

    const history = await ScanHistory.create({
      userId,
      scanType: 'email',
      content: safeContent,
      result: {
        riskPercentage: combinedRiskScore,
        threatStatus: finalThreatStatus,
        recommendation: scored.recommendation,
      },
      flaggedKeywords: scored.flaggedKeywords,
      urlSecurityAnalyses,
    });

    res.status(201).json({
      message: 'Email scan completed',
      result: history.result,
      flaggedKeywords: history.flaggedKeywords,
      keywordCategories: scored.keywordCategories,
      severityCounts: scored.severityCounts,
      externalApiUsed: scored.externalApiUsed,
      usedFallbackKeywords: scored.usedFallbackKeywords,
      urlsFound: uniqueUrls.length,
      urlSecurityAnalyses: urlSecurityAnalyses.map(analysis => ({
        url: analysis.url,
        obfuscation: analysis.securityAnalysis.obfuscation,
        ssl: analysis.securityAnalysis.ssl,
        domainStructure: analysis.securityAnalysis.domainStructure,
        redirectChain: analysis.securityAnalysis.redirectChain,
        totalRiskScore: analysis.securityAnalysis.totalRiskScore,
        riskLevel: analysis.securityAnalysis.riskLevel,
      })),
      maxSecurityRisk,
      averageSecurityRisk,
    });
  } catch (err) {
    next(err);
  }
}

async function getMyHistory(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId) throw Object.assign(new Error('Unauthorized'), { statusCode: 401 });

    const { scanType } = req.query || {};

    const query = { userId };

    if (scanType && (scanType === 'url' || scanType === 'email')) {
      query.scanType = scanType;
    }

    const history = await ScanHistory.find(query)
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      message: 'Scan history fetched',
      scans: history,
    });
  } catch (err) {
    next(err);
  }
}

async function getMyStats(req, res, next) {
  try {
    const userId = getUserId(req);
    if (!userId) throw Object.assign(new Error('Unauthorized'), { statusCode: 401 });

    const all = await ScanHistory.find({ userId }).select('result.threatStatus');

    const totalScans = all.length;
    const safeCount = all.filter((s) => s?.result?.threatStatus === 'Safe').length;
    const suspiciousCount = all.filter((s) => s?.result?.threatStatus === 'Suspicious').length;
    const maliciousCount = all.filter((s) => s?.result?.threatStatus === 'Malicious').length;

    res.json({
      totalScans,
      safeCount,
      suspiciousCount,
      maliciousCount,
      safeRatio: totalScans ? (safeCount / totalScans) * 100 : 0,
      suspiciousRatio: totalScans ? (suspiciousCount / totalScans) * 100 : 0,
      maliciousRatio: totalScans ? (maliciousCount / totalScans) * 100 : 0,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  scanUrl,
  scanEmail,
  getMyHistory,
  getMyStats,
};
