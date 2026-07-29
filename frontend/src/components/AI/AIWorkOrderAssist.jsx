import { useState } from "react";
import { useAppState, useAppDispatch } from "../../state/AppState";
import { autoFillWorkOrder } from "../../services/aiService";

export default function AIWorkOrderAssist() {
  const { token, aiResult } = useAppState();
  const dispatch = useAppDispatch();

  const [workOrder, setWorkOrder] = useState(null);

  async function handleSubmit() {
    if (!aiResult) return alert("Run AI Diagnostic first!");

    const res = await autoFillWorkOrder(token, {
      appointmentId: "test",
      aiData: { parsed: aiResult.parsed }
    });

    dispatch({ type: "SET_WORKORDER_DRAFT", payload: res.workOrder });
    setWorkOrder(res.workOrder);
  }

  return (
    <div>
      <h2>AI WorkOrder Auto‑Assist</h2>

      <button onClick={handleSubmit}>Auto‑Fill WorkOrder</button>

      {workOrder && (
        <div>
          <h3>Generated WorkOrder</h3>
          <pre>{JSON.stringify(workOrder, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
