import { useState } from "react";
import { useAppState, useAppDispatch } from "../../state/AppState";
import { analyzeFirearm } from "../../services/aiService";

export default function AIDiagnostic() {
  const { token, aiResult, photoUrl } = useAppState();
  const dispatch = useAppDispatch();

  const [text, setText] = useState("");

  async function handleSubmit() {
    const res = await analyzeFirearm(token, {
      firearmId: "test",
      inputText: text,
      photoUrl
    });

    dispatch({ type: "SET_AI_RESULT", payload: res.diagnostics });
  }

  return (
    <div>
      <h2>AI Firearm Diagnostics</h2>

      <textarea
        placeholder="Describe the firearm issue..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={handleSubmit}>Run AI Diagnostic</button>

      {aiResult && (
        <div>
          <h3>AI Results</h3>
          <pre>{JSON.stringify(aiResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
