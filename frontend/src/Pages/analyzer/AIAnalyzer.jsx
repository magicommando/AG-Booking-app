import { useState } from "react";
import axios from "axios";
import { useAppState } from "../../state/AppState";
import AnalyzerAvatar from "./AnalyzerAvatar";
import AnalyzerResults from "./AnalyzerResults";
import { useSearchParams } from "react-router-dom";
import "./analyzer.css";

export default function AIAnalyzer() {
  const { token } = useAppState();
  const [params] = useSearchParams();
  const firearmId = params.get("firearm");
  const serviceId = params.get("service");
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState("Awaiting diagnostic request...");
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (firearmId && serviceId) {
      runAnalysis(firearmId, serviceId);
    }
  }, [firearmId, serviceId]);

  async function runAnalysis(firearmId, serviceId) {
    setLoading(true);
    setDialog("Running post-war diagnostic routines...");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/analyzer/run",
        { firearmId, serviceId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDialog("Analysis complete. Displaying results...");
      setResults(res.data.analysis);
    } catch (err) {
      setDialog("Error: Analyzer encountered a fault.");
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <div className="analyzer-container">
      <AnalyzerAvatar text={dialog} />

      <div className="analyzer-actions">
        <button
          onClick={() => runAnalysis("FIREARM_ID", "SERVICE_ID")}
          disabled={loading}
        >
          Run Analyzer
        </button>
      </div>

      {results && <AnalyzerResults data={results} />}
    </div>
  );
}
