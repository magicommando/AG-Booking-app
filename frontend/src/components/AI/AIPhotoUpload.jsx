import { useState } from "react";
import { useAppState, useAppDispatch } from "../../state/AppState";
import { uploadPhoto } from "../../api/ai";

export default function AIPhotoUpload() {
  const { token, photoUrl } = useAppState();
  const dispatch = useAppDispatch();

  const [file, setFile] = useState(null);

  async function handleUpload() {
    const res = await uploadPhoto(token, file);

    dispatch({ type: "SET_PHOTO_URL", payload: res.photoUrl });
  }

  return (
    <div>
      <h2>Upload Photo for AI</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button onClick={handleUpload}>Upload</button>

      {photoUrl && (
        <div>
          <h3>Uploaded Photo URL</h3>
          <p>{photoUrl}</p>
        </div>
      )}
    </div>
  );
}
