import { useState } from "react";
import { useAppState, useAppDispatch } from "../../state/AppState";
import axios from "axios";
import "./AIAnalyzer.css";

export default function AIAnalyzer() {
  const { token, aiResult, photoUrl, bookingFirearm, inventoryItems } = useAppState();
  const dispatch = useAppDispatch();

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  async function runDiagnostic() {
    setLoading(true);

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
    } catch (err) {
      console.error("AI Diagnostic Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function runInventoryScan() {
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/inventory",
        { items: inventoryItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch({ type: "SET_INVENTORY_ITEMS", payload: res.data.items });
    } catch (err) {
      console.error("AI Inventory Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function autoFillWorkOrder() {
    if (!aiResult) return alert("Run AI Diagnostic first");

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/workorder",
        {
          aiData: aiResult.parsed,
          firearmId: bookingFirearm?._id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch({ type: "SET_WORKORDER_DRAFT", payload: res.data.workOrder });
      alert("WorkOrder auto-filled!");
    } catch (err) {
      console.error("WorkOrder AI Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-container">
      <h2>AI Analyzer</h2>

      {/* Firearm Info */}
      <div className="ai-card">
        <h3>Firearm</h3>
        {bookingFirearm ? (
          <p>{bookingFirearm.make} {bookingFirearm.model}</p>
        ) : (
          <p>No firearm selected.</p>
        )}
      </div>

      {/* Photo */}
      <div className="ai-card">
        <h3>Photo</h3>
        {photoUrl ? (
          <img src={photoUrl} alt="Firearm" className="ai-photo" />
        ) : (
          <p>No photo uploaded.</p>
        )}
      </div>

      {/* Diagnostic Input */}
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

      {/* AI Results */}
      <div className="ai-card">
        <h3>AI Diagnostic Results</h3>
        {aiResult ? (
          <pre>{JSON.stringify(aiResult, null, 2)}</pre>
        ) : (
          <p>No diagnostic results yet.</p>
        )}
      </div>

      {/* Inventory Scan */}
      <div className="ai-card">
        <h3>AI Inventory Scan</h3>
        <button className="ai-btn" onClick={runInventoryScan} disabled={loading}>
          Run Inventory Scan
        </button>
      </div>

      {/* WorkOrder Auto-Assist */}
      <div className="ai-card">
        <h3>AI WorkOrder Auto‑Assist</h3>
        <button className="ai-btn" onClick={autoFillWorkOrder} disabled={loading}>
          Auto‑Fill WorkOrder
        </button>
      </div>
    </div>
  );
}
