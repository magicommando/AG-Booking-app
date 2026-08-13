export default function AnalyzerResults({ data }) {
  if (!data) {
    return <p>No diagnostic results yet.</p>;
  }

  const asArray = (value) => {
    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim());
    }

    if (typeof value === "string" && value.trim()) {
      return [value.trim()];
    }

    return [];
  };

  const diagnostics = asArray(data.diagnostics).length > 0 ? asArray(data.diagnostics) : asArray(data.issues);
  const recommendations = asArray(data.recommendations).length > 0 ? asArray(data.recommendations) : asArray(data.actions);
  const warnings = asArray(data.warnings).length > 0 ? asArray(data.warnings) : asArray(data.alerts);
  const summary = typeof data.summary === "string" && data.summary.trim()
    ? data.summary.trim()
    : diagnostics[0] || "Diagnostic summary unavailable.";

  return (
    <div className="analyzer-results">
      <h3>Diagnostic Report</h3>

      {summary && <p><strong>Summary:</strong> {summary}</p>}

      <div className="analyzer-grid">
        <p><strong>Barrel Wear:</strong> {data.barrelWear ?? "N/A"}</p>
        <p><strong>Round Count Estimate:</strong> {data.roundCountEstimate ?? "N/A"}</p>
        <p><strong>Recommended Service:</strong> {data.recommendedService ?? "N/A"}</p>
      </div>

      {diagnostics.length > 0 && (
        <div className="analyzer-warnings">
          <h4>Diagnostics</h4>
          <ul>
            {diagnostics.map((item, index) => (
              <li key={`diag-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="analyzer-warnings">
          <h4>Recommendations</h4>
          <ul>
            {recommendations.map((item, index) => (
              <li key={`rec-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="analyzer-warnings">
          <h4>Warnings</h4>
          <ul>
            {warnings.map((warning, index) => (
              <li key={`warn-${index}`}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <details className="analyzer-json-wrap">
        <summary>View Raw AI Payload</summary>
        <pre className="analyzer-json">{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
  );
}