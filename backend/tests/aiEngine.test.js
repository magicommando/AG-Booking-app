const aiEngine = require('../ai/aiEngine');

describe('aiEngine.analyzeFirearmIssue', () => {
  it('uses the user issue details to produce a more relevant diagnosis summary', async () => {
    const result = await aiEngine.analyzeFirearmIssue(
      'The slide keeps double feeding every few rounds, the extractor feels rough, and the round gets stuck on the way out.'
    );

    expect(result.summary.toLowerCase()).toContain('double feed');
    expect(result.summary.toLowerCase()).toContain('extractor');
    expect(result.diagnostics.join(' ').toLowerCase()).toContain('extractor');
    expect(result.recommendations.join(' ').toLowerCase()).toContain('extractor');
  });
});
