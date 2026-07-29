export default function AnalyzerResults({ data }) {
  return (
    <div className="analyzer-results">
      <h3>Diagnostic Report</h3>

      <p><strong>Barrel Wear:</strong> {data.barrelWear}</p>
      <p><strong>Round Count Estimate:</strong> {data.roundCountEstimate}</p>
      <p><strong>Recommended Service:</strong> {data.recommendedService}</p>

      {data.warnings?.length > 0 && (
        <div className="analyzer-warnings">
          <h4>Warnings</h4>
          <ul>
            {data.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
