import { useEffect, useState } from "react";
import { useAppState, useAppDispatch } from "../../state/AppState";
import axios from "axios";
import "./AIAnalyzer.css";

export default function AIAnalyzer() {
  const { token, aiResult, photoUrl, bookingFirearm, inventoryItems } = useAppState();
  const dispatch = useAppDispatch();
  const [dialog, setDialog] = useState("Initializing diagnostics...");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lines = [
      "Analyzing ballistic patterns...",
      "Cross-referencing repair logs...",
      "Scanning weapon integrity...",
      "Diagnostics complete. Ready for next task."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setDialog(lines[i]);
      i = (i + 1) % lines.length;
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  async function runDiagnostic() {
    if (!token) {
      setDialog("Please log in to run diagnostics.");
      return;
    }

    setLoading(true);
    setDialog("Running diagnostic analysis...");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/diagnostic",
        {
          firearmId: bookingFirearm?._id,
          inputText,
          photoUrl
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch({ type: "SET_AI_RESULT", payload: res.data });
      setDialog("Analysis complete.");
    } catch (err) {
      console.error(err);
      setDialog("AI analysis failed. See console for details.");
    } finally {
      setLoading(false);
    }
  }

  async function runInventoryScan() {
    if (!token) {
      setDialog("Please log in to scan inventory.");
      return;
    }

    setLoading(true);
    setDialog("Running inventory scan...");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/inventory-scan",
        { items: inventoryItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch({ type: "SET_INVENTORY_ITEMS", payload: res.data });
      setDialog("Inventory scan complete.");
    } catch (err) {
      console.error(err);
      setDialog("Inventory scan failed.");
    } finally {
      setLoading(false);
    }
  }

  async function autoFillWorkOrder() {
    if (!token) {
      setDialog("Please log in to auto-fill work orders.");
      return;
    }

    if (!aiResult) {
      setDialog("Run an AI diagnostic first.");
      return;
    }

    setLoading(true);
    setDialog("Auto-filling work order...");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/work-order",
        { aiData: aiResult },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch({ type: "SET_WORKORDER_DRAFT", payload: res.data });
      setDialog("Work order draft created.");
    } catch (err) {
      console.error(err);
      setDialog("Work order auto-fill failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-container">
      <h2>AI Analyzer</h2>
      <p className="ai-status">{dialog}</p>

      <div className="ai-card">
        <h3>Firearm</h3>
        {bookingFirearm ? (
          <p>{bookingFirearm.make} {bookingFirearm.model}</p>
        ) : (
          <p>No firearm selected.</p>
        )}
      </div>

      <div className="ai-card">
        <h3>Photo</h3>
        {photoUrl ? (
          <img src={photoUrl} alt="Firearm" className="ai-photo" />
        ) : (
          <p>No photo uploaded.</p>
        )}
      </div>

      <div className="ai-card">
        <h3>Describe the Issue</h3>
        <textarea
          className="ai-input"
          placeholder="Describe the firearm issue..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button className="ai-btn" onClick={runDiagnostic} disabled={loading}>
          Run AI Diagnostic
        </button>
      </div>

      <div className="ai-card">
        <h3>AI Diagnostic Results</h3>
        {aiResult ? (
          <pre>{JSON.stringify(aiResult, null, 2)}</pre>
        ) : (
          <p>No diagnostic results yet.</p>
        )}
      </div>

      <div className="ai-card">
        <h3>AI Inventory Scan</h3>
        <button className="ai-btn" onClick={runInventoryScan} disabled={loading}>
          Run Inventory Scan
        </button>
      </div>

      <div className="ai-card">
        <h3>AI WorkOrder Auto‑Assist</h3>
        <button className="ai-btn" onClick={autoFillWorkOrder} disabled={loading}>
          Auto‑Fill WorkOrder
        </button>
      </div>
    </div>
  );
}
