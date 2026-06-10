function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function computeStatus(riskPercentage) {
  if (riskPercentage >= 70) return 'Malicious';
  if (riskPercentage >= 35) return 'Suspicious';
  return 'Safe';
}

function recommendationFor(status) {
  if (status === 'Malicious') return 'Avoid Visiting. Do not provide credentials.';
  if (status === 'Suspicious') return 'Be cautious. Verify the sender/domain before proceeding.';
  return 'Likely Safe. Still verify links before entering sensitive info.';
}

function scoreUrlByRules(url, externalSignals) {
  const flaggedKeywords = [];
  const lower = (url || '').toLowerCase();

  // Basic heuristics (beginner-friendly)
  const rules = [
    { keyword: 'login', points: 15 },
    { keyword: 'verify', points: 10 },
    { keyword: 'account', points: 10 },
    { keyword: 'security', points: 10 },
    { keyword: 'update', points: 8 },
    { keyword: 'password', points: 20 },
    { keyword: 'otp', points: 20 },
    { keyword: 'bank', points: 25 },
    { keyword: 'free', points: 12 },
    { keyword: 'suspend', points: 25 },
    { keyword: 'urgent', points: 20 },
    { keyword: 'immediately', points: 20 },
  ];

  let points = 0;

  for (const r of rules) {
    if (lower.includes(r.keyword)) {
      flaggedKeywords.push(r.keyword);
      points += r.points;
    }
  }

  // HTTPS preference
  if (lower.startsWith('http://')) points += 15;
  if (lower.startsWith('https://')) points += 0;

  // Suspicious domain shape
  // e.g. too many hyphens or long random query
  const hyphens = (lower.match(/-/g) || []).length;
  if (hyphens >= 3) points += 8;

  if (lower.includes('?')) points += 10; // querystring often used in redirects/phishing

  // External signals normalization (best-effort)
  // VirusTotal / Google Safe Browsing results differ; we use generic patterns.
  if (externalSignals) {
    // If VT verdict includes Malicious/Suspicious words
    const vtVerdict = (externalSignals.virustotal?.verdict || '').toString().toLowerCase();
    if (vtVerdict.includes('malicious')) points += 45;
    else if (vtVerdict.includes('suspicious')) points += 25;

    // If we have any error from providers, keep points as-is (don’t punish)
  }

  const riskPercentage = clamp(points, 0, 100);
  const threatStatus = computeStatus(riskPercentage);
  const recommendation = recommendationFor(threatStatus);

  // Deduplicate keywords
  const uniqueKeywords = [...new Set(flaggedKeywords)];

  return {
    riskPercentage,
    threatStatus,
    recommendation,
    flaggedKeywords: uniqueKeywords,
  };
}

function scoreTextByRules(text, scanType, externalSignals) {
  const flaggedKeywords = [];
  const lower = (text || '').toLowerCase();

  const rulesByScanType = scanType === 'email'
    ? [
        { keyword: 'urgent', points: 25 },
        { keyword: 'immediately', points: 25 },
        { keyword: 'verify', points: 20 },
        { keyword: 'suspended', points: 30 },
        { keyword: 'account', points: 15 },
        { keyword: 'password', points: 25 },
        { keyword: 'otp', points: 30 },
        { keyword: 'bank', points: 25 },
        { keyword: 'click here', points: 15 },
        { keyword: 'login', points: 15 },
        { keyword: 'congratulations', points: 15 },
        { keyword: 'reward', points: 15 },
      ]
    : [
        { keyword: 'urgent', points: 20 },
        { keyword: 'verify', points: 15 },
        { keyword: 'login', points: 15 },
        { keyword: 'password', points: 25 },
      ];

  let points = 0;
  for (const r of rulesByScanType) {
    if (lower.includes(r.keyword)) {
      flaggedKeywords.push(r.keyword);
      points += r.points;
    }
  }

  // If there’s an obvious link, raise a bit
  const hasUrl = /(https?:\/\/|www\.)/i.test(text || '');
  if (hasUrl) points += 15;

  // External signals: best-effort
  if (externalSignals?.googleSafeBrowsing?.matches?.length) {
    points += 40;
  }

  const riskPercentage = clamp(points, 0, 100);
  const threatStatus = computeStatus(riskPercentage);
  const recommendation = recommendationFor(threatStatus);

  return {
    riskPercentage,
    threatStatus,
    recommendation,
    flaggedKeywords: [...new Set(flaggedKeywords)],
  };
}

module.exports = {
  scoreUrlByRules,
  scoreTextByRules,
};
