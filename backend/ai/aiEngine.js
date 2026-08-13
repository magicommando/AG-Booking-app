// ai/aiEngine.js

const axios = require('axios');

function buildHeuristicDiagnosis(inputText = '', photoUrl) {
  const text = String(inputText || '').toLowerCase();
  const diagnostics = [];
  const recommendations = [];
  const warnings = [];
  const parts = [];
  let laborTime = 1.0;
  let barrelWear = 'Unknown';
  let roundCountEstimate = null;
  let recommendedService = 'General inspection and cleaning';

  const addFinding = ({
    diagnosis,
    recommendation,
    part,
    warning,
    wear,
    service,
    hours = 1.0,
    rounds
  }) => {
    if (diagnosis) diagnostics.push(diagnosis);
    if (recommendation) recommendations.push(recommendation);
    if (part) parts.push(part);
    if (warning) warnings.push(warning);
    if (wear) barrelWear = wear;
    if (service) recommendedService = service;
    if (Number.isFinite(hours)) laborTime = Math.max(laborTime, Number(hours));
    if (Number.isFinite(rounds) && (roundCountEstimate === null || rounds > roundCountEstimate)) {
      roundCountEstimate = rounds;
    }
  };

  if (text.includes('jam') || text.includes('stovepipe')) {
    addFinding({
      diagnosis: 'Possible failure to eject or feed.',
      recommendation: 'Inspect extractor, clean chamber, and check magazine alignment.',
      part: 'Extractor spring',
      warning: 'Feeding and ejection issues can rapidly worsen under live fire.',
      wear: 'Medium',
      service: 'Extractor service and chamber clean',
      hours: 1.5,
      rounds: 1200
    });
  }

  if (text.includes('misfire') || text.includes('light strike')) {
    addFinding({
      diagnosis: 'Possible firing pin or primer ignition issue.',
      recommendation: 'Inspect the firing pin channel, clean the bolt, and verify ammunition quality.',
      part: 'Firing pin',
      warning: 'Ignition issues can cause unsafe cycling and unreliable performance.',
      wear: 'High',
      service: 'Firing pin inspection and bolt clean',
      hours: 2.0,
      rounds: 1800
    });
  }

  if (text.includes('rust') || text.includes('corrosion')) {
    addFinding({
      diagnosis: 'Surface corrosion detected.',
      recommendation: 'Perform rust removal and apply a protective coating to the affected surfaces.',
      warning: 'Corrosion may accelerate wear if left untreated.',
      wear: 'Medium',
      service: 'Corrosion mitigation and protective oil treatment',
      hours: 1.25,
      rounds: 900
    });
  }

  if (text.includes('accuracy') || text.includes('grouping') || text.includes('drift')) {
    addFinding({
      diagnosis: 'Accuracy drift or group inconsistency may be present.',
      recommendation: 'Check barrel crown, muzzle condition, and scope mount stability.',
      part: 'Barrel crown',
      wear: 'Low',
      service: 'Barrel accuracy check and mount inspection',
      hours: 1.5,
      rounds: 1500
    });
  }

  if (text.includes('chamber') && (text.includes('fouling') || text.includes('carbon'))) {
    addFinding({
      diagnosis: 'Chamber fouling is likely affecting function.',
      recommendation: 'Deep clean the chamber and verify headspace is still within acceptable limits.',
      part: 'Chamber',
      wear: 'Low',
      service: 'Chamber cleaning and function check',
      hours: 1.25,
      rounds: 1400
    });
  }

  if (diagnostics.length === 0) {
    diagnostics.push('No specific issue detected from the provided description.');
    recommendations.push('Perform a general inspection, visual clean, and function check.');
    warnings.push('No obvious fault pattern was isolated from the input. A hands-on inspection is still recommended.');
    recommendedService = 'General inspection and cleaning';
  }

  return {
    summary: diagnostics[0],
    diagnostics,
    recommendations,
    warnings,
    parts,
    laborTime,
    barrelWear,
    roundCountEstimate,
    recommendedService,
    photoUrl
  };
}

function extractJsonFromResponse(content) {
  if (!content || typeof content !== 'string') return null;

  try {
    const trimmed = content.trim();
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = trimmed.slice(firstBrace, lastBrace + 1);
      return JSON.parse(jsonCandidate);
    }

    return JSON.parse(trimmed);
  } catch (err) {
    return null;
  }
}

function normalizeOpenAiResult(rawResult) {
  if (!rawResult || typeof rawResult !== 'object') return null;

  const diagnostics = Array.isArray(rawResult.diagnostics)
    ? rawResult.diagnostics.filter((entry) => typeof entry === 'string' && entry.trim())
    : [];

  const recommendations = Array.isArray(rawResult.recommendations)
    ? rawResult.recommendations.filter((entry) => typeof entry === 'string' && entry.trim())
    : [];

  const warnings = Array.isArray(rawResult.warnings)
    ? rawResult.warnings.filter((entry) => typeof entry === 'string' && entry.trim())
    : [];

  const summary = typeof rawResult.summary === 'string' && rawResult.summary.trim()
    ? rawResult.summary.trim()
    : diagnostics[0] || 'AI firearm analysis complete.';

  return {
    summary,
    diagnostics: diagnostics.length > 0 ? diagnostics : ['AI firearm analysis complete.'],
    recommendations: recommendations.length > 0 ? recommendations : ['Perform a detailed inspection and verify the firearm is safe before live use.'],
    warnings: warnings.length > 0 ? warnings : [],
    parts: Array.isArray(rawResult.parts) ? rawResult.parts.filter((entry) => typeof entry === 'string' && entry.trim()) : [],
    laborTime: Number.isFinite(Number(rawResult.laborTime)) ? Number(rawResult.laborTime) : 1,
    barrelWear: rawResult.barrelWear || 'Unknown',
    roundCountEstimate: Number.isFinite(Number(rawResult.roundCountEstimate)) ? Number(rawResult.roundCountEstimate) : null,
    recommendedService: rawResult.recommendedService || 'General inspection and cleaning',
    photoUrl: rawResult.photoUrl || undefined
  };
}

module.exports = {
  async analyzeFirearmIssue(inputText = '', photoUrl) {
    const text = String(inputText || '').trim();
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            temperature: 0.3,
            messages: [
              {
                role: 'system',
                content: 'You are a gunsmithing diagnostic assistant. Return valid JSON with keys: summary, diagnostics, recommendations, warnings, parts, laborTime, barrelWear, roundCountEstimate, recommendedService. Keep entries concise and firearm-safe.'
              },
              {
                role: 'user',
                content: `Analyze this firearm issue and provide a safe, practical diagnosis. Issue description: ${text || 'No issue description provided, but a photo may be available.'}`
              }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 20000
          }
        );

        const content = response?.data?.choices?.[0]?.message?.content;
        const parsed = extractJsonFromResponse(content);
        const normalized = normalizeOpenAiResult(parsed || {});

        if (normalized) {
          return {
            ...normalized,
            photoUrl
          };
        }
      } catch (err) {
        console.warn('OpenAI diagnosis unavailable, falling back to local firearm heuristics:', err.message);
      }
    }

    return buildHeuristicDiagnosis(text, photoUrl);
  },

  analyzeInventoryItem(item) {
    let alert = false;
    let recommendation = null;

    if (item.quantity <= 2) {
      alert = true;
      recommendation = `Reorder ${item.productName}. Only ${item.quantity} left.`;
    }

    return {
      alert,
      recommendation
    };
  }
};
