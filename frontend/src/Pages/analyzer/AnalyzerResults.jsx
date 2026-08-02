export default function AnalyzerResults({ data }) {
  if (!data) {
    return <p>No diagnostic results yet.</p>;
  }

  const warnings = Array.isArray(data.warnings) ? data.warnings : [];

  return (
    <div className="analyzer-results">
      <h3>Diagnostic Report</h3>

      <div className="analyzer-grid">
        <p><strong>Barrel Wear:</strong> {data.barrelWear ?? "N/A"}</p>
        <p><strong>Round Count Estimate:</strong> {data.roundCountEstimate ?? "N/A"}</p>
        <p><strong>Recommended Service:</strong> {data.recommendedService ?? "N/A"}</p>
      </div>

      {warnings.length > 0 && (
        <div className="analyzer-warnings">
          <h4>Warnings</h4>
          <ul>
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
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