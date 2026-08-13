import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState, useAppDispatch } from "../../state/AppState";
import { analyzeFirearm, scanInventory, uploadPhoto, deleteMedia, autoFillWorkOrder as autoFillWorkOrderService } from "../../services/aiService";
import { fetchInventoryItems } from "../../services/inventoryService";
import FirearmCard from "../Firearms/FirearmCard";
import AnalyzerAvatar from "../../Pages/analyzer/AnalyzerAvatar";
import AnalyzerResults from "../../Pages/analyzer/AnalyzerResults";
import api, { resolveAssetUrl } from "../../services/api";
import "./AIAnalyzer.css";

const AVATAR_TAGLINE = "ZUNI ARMS SYSTEM // AI ANALYSIS ONLINE";

export default function AIAnalyzer() {
  const navigate = useNavigate();
  const { token, role, aiResult, photoUrl, videoUrl, bookingFirearm, workOrderDraft } = useAppState();
  const dispatch = useAppDispatch();
  const [dialog, setDialog] = useState("Initializing diagnostics...");
  const [inputText, setInputText] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firearms, setFirearms] = useState([]);
  const [loadingFirearms, setLoadingFirearms] = useState(true);
  const [inventoryScanResults, setInventoryScanResults] = useState([]);
  const [scannedItemCount, setScannedItemCount] = useState(0);

  const resolvedPhotoUrl = photoUrl ? resolveAssetUrl(photoUrl) : null;
  const resolvedVideoUrl = videoUrl ? resolveAssetUrl(videoUrl) : null;
  const analysisSource = aiResult?._source || "heuristic";
  const sourceBadge = analysisSource === "openai" ? "Vision AI active" : analysisSource === "openai-video" ? "Video AI active" : "Heuristic fallback";

  useEffect(() => {
    setDialog("Ready for tactical diagnostics.");
  }, []);

  useEffect(() => {
    if (!token) {
      setFirearms([]);
      setLoadingFirearms(false);
      return;
    }

    async function loadFirearms() {
      setLoadingFirearms(true);
      try {
        const res = await api.get("/firearms", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFirearms(res.data || []);
      } catch (err) {
        console.error("Error loading firearms for analyzer:", err);
      } finally {
        setLoadingFirearms(false);
      }
    }

    loadFirearms();
  }, [token]);

  function selectFirearm(firearm) {
    dispatch({ type: "SET_BOOKING_FIREARM", payload: firearm });
    setDialog(`Selected firearm: ${(firearm.make || firearm.manufacturer || "Unknown")} ${firearm.model || ""}`.trim());
  }

  async function runDiagnostic() {
    if (!token) {
      setDialog("Please log in to run diagnostics.");
      return;
    }

    const trimmedInput = inputText.trim();
    if (!trimmedInput && !photoUrl && !videoUrl) {
      setDialog("Describe the issue or upload a photo or video before running diagnostics.");
      return;
    }

    setLoading(true);
    setDialog("Running diagnostic analysis...");

    try {
      const normalizedInput = trimmedInput.length >= 5
        ? trimmedInput
        : "Photo-based diagnostic request";

      const payload = {
        inputText: normalizedInput
      };

      if (bookingFirearm?._id) {
        payload.firearmId = bookingFirearm._id;
      }

      if (photoUrl) {
        payload.photoUrl = photoUrl;
      }

      if (videoUrl) {
        payload.videoUrl = videoUrl;
      }

      if (photoUrl || videoUrl) {
        payload.mediaUrl = photoUrl || videoUrl;
      }

      const res = await analyzeFirearm(token, payload);
      const nextResult = res?.diagnostics || res || {};

      dispatch({ type: "SET_AI_RESULT", payload: nextResult });
      setDialog(nextResult?.summary || nextResult?.diagnostics?.[0] || "Analysis complete.");
    } catch (err) {
      console.error(err);
      const apiMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.join(", ") : null);

      setDialog(apiMessage ? `AI analysis failed: ${apiMessage}` : "AI analysis failed. See console for details.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoUpload() {
    if (!token) {
      setDialog("Please log in to upload media.");
      return;
    }

    if (!selectedPhoto) {
      setDialog("Choose a photo before uploading.");
      return;
    }

    setUploadingPhoto(true);
    setDialog("Uploading photo for AI diagnostics...");

    try {
      const formData = new FormData();
      formData.append("media", selectedPhoto);

      const res = await uploadPhoto(token, formData);
      dispatch({ type: "SET_PHOTO_URL", payload: res.photoUrl || res.mediaUrl });
      setDialog(res.mediaType === 'video' ? "Video uploaded successfully." : "Photo uploaded successfully.");
    } catch (err) {
      console.error(err);
      setDialog("Photo upload failed.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleVideoUpload() {
    if (!token) {
      setDialog("Please log in to upload media.");
      return;
    }

    if (!selectedVideo) {
      setDialog("Choose a video before uploading.");
      return;
    }

    setUploadingVideo(true);
    setDialog("Uploading video for AI diagnostics...");

    try {
      const formData = new FormData();
      formData.append("media", selectedVideo);

      const res = await uploadPhoto(token, formData);
      dispatch({ type: "SET_VIDEO_URL", payload: res.videoUrl || res.mediaUrl });
      setDialog("Video uploaded successfully.");
    } catch (err) {
      console.error(err);
      setDialog("Video upload failed.");
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleRemoveMedia(type) {
    const mediaUrl = type === 'photo' ? photoUrl : videoUrl;
    if (!mediaUrl || !token) {
      return;
    }

    try {
      await deleteMedia(token, mediaUrl);
      if (type === 'photo') {
        dispatch({ type: 'SET_PHOTO_URL', payload: null });
      } else {
        dispatch({ type: 'SET_VIDEO_URL', payload: null });
      }

      setDialog(type === 'photo' ? 'Photo removed.' : 'Video removed.');
    } catch (err) {
      console.error(err);
      setDialog(type === 'photo' ? 'Photo removal failed.' : 'Video removal failed.');
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
      const items = await fetchInventoryItems(token);

      if (!Array.isArray(items) || items.length === 0) {
        setInventoryScanResults([]);
        setScannedItemCount(0);
        setDialog("No inventory items found to scan.");
        return;
      }

      const res = await scanInventory(token, { items });
      const results = Array.isArray(res.results) ? res.results : [];

      setInventoryScanResults(results);
      setScannedItemCount(items.length);
      dispatch({ type: "SET_INVENTORY_ITEMS", payload: items });
      setDialog("Inventory scan complete.");
    } catch (err) {
      console.error(err);
      setDialog("Inventory scan failed.");
    } finally {
      setLoading(false);
    }
  }

  async function runWorkOrderAutoFill() {
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
      const aiPayload = {
        ...(aiResult || {}),
        firearmId: bookingFirearm?._id,
        clientId: bookingFirearm?.userId?._id || bookingFirearm?.userId,
        clientName: bookingFirearm?.userId
          ? [bookingFirearm.userId.firstName, bookingFirearm.userId.lastName].filter(Boolean).join(" ")
            || bookingFirearm.userId.fullName
            || bookingFirearm.userId.name
            || bookingFirearm.userId.email
          : undefined
      };

      const res = await autoFillWorkOrderService(token, { aiData: aiPayload });
      const draft = res?.draft;

      if (!draft) {
        setDialog("AI returned no work order draft.");
        return null;
      }

      dispatch({ type: "SET_WORKORDER_DRAFT", payload: draft });
      setDialog("Work order draft created.");
      return draft;
    } catch (err) {
      console.error(err);
      const apiMessage = err.response?.data?.message || err.response?.data?.error;
      setDialog(apiMessage ? `Work order auto-fill failed: ${apiMessage}` : "Work order auto-fill failed.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  function goCreateWorkOrderFromDraft() {
    if (workOrderDraft) {
      navigate("/admin/workorders", { state: { createFromDraft: true, autoCreateFromDraft: true } });
      return;
    }

    if (!aiResult) {
      setDialog("Run AI diagnostic first so a draft can be generated.");
      return;
    }

    runWorkOrderAutoFill().then((draft) => {
      if (draft) {
        navigate("/admin/workorders", { state: { createFromDraft: true, autoCreateFromDraft: true } });
      }
    });
  }

  return (
    <div className="ai-container">
      <h2>AI Analyzer</h2>
      <AnalyzerAvatar statusText={AVATAR_TAGLINE} />
      <div className="ai-status-row">
        <p className="ai-status">{dialog}</p>
        <span className={`ai-source-badge ai-source-${analysisSource}`}>{sourceBadge}</span>
      </div>

      <div className="ai-card">
        <h3>Upload Media</h3>
        <div className="ai-inline-actions">
          <input
            type="file"
            accept="image/*"
            className="ai-file-input"
            onChange={(e) => setSelectedPhoto(e.target.files?.[0] || null)}
          />
          <button className="ai-btn" onClick={handlePhotoUpload} disabled={uploadingPhoto}>
            {uploadingPhoto ? "Uploading..." : "Upload Photo"}
          </button>
        </div>
        <div className="ai-inline-actions ai-media-video-row">
          <input
            type="file"
            accept="video/*"
            className="ai-file-input"
            onChange={(e) => setSelectedVideo(e.target.files?.[0] || null)}
          />
          <button className="ai-btn" onClick={handleVideoUpload} disabled={uploadingVideo}>
            {uploadingVideo ? "Uploading..." : "Upload Video"}
          </button>
        </div>
      </div>

      <div className="ai-card">
        <h3>Select Firearm</h3>
        {bookingFirearm ? (
          <p>
            Active: {bookingFirearm.make || bookingFirearm.manufacturer} {bookingFirearm.model}
          </p>
        ) : (
          <p>No firearm selected.</p>
        )}

        {loadingFirearms ? (
          <p>Loading firearms...</p>
        ) : firearms.length === 0 ? (
          <p>No firearms available to select.</p>
        ) : (
          <div className="ai-firearm-grid">
            {firearms.map((f) => {
              const isActive = String(f._id) === String(bookingFirearm?._id);
              return (
                <FirearmCard
                  key={f._id}
                  firearm={f}
                  showClientInfo={role === "gunsmith"}
                  onSelect={selectFirearm}
                  selected={isActive}
                  buttonLabel={isActive ? "Selected" : "Select"}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="ai-card">
        <h3>Media Evidence</h3>
        {resolvedPhotoUrl ? (
          <div>
            <p>Photo uploaded.</p>
            <img src={resolvedPhotoUrl} alt="Firearm" className="ai-photo" />
            <button className="ai-btn ai-btn-secondary" type="button" onClick={() => handleRemoveMedia('photo')}>
              Remove Photo
            </button>
          </div>
        ) : null}

        {resolvedVideoUrl ? (
          <div>
            <p>Video uploaded.</p>
            <video src={resolvedVideoUrl} controls className="ai-video" />
            <button className="ai-btn ai-btn-secondary" type="button" onClick={() => handleRemoveMedia('video')}>
              Remove Video
            </button>
          </div>
        ) : null}

        {!resolvedPhotoUrl && !resolvedVideoUrl ? (
          <p>No photo or video uploaded.</p>
        ) : null}
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
        <AnalyzerResults data={aiResult} />
      </div>

      {role === "gunsmith" && (
        <>
          <div className="ai-card">
            <h3>AI Inventory Scan</h3>
            <button className="ai-btn" onClick={runInventoryScan} disabled={loading}>
              Run Inventory Scan
            </button>

            {inventoryScanResults.length > 0 ? (
              <div className="ai-inventory-results">
                <p>Scanned items: {scannedItemCount}</p>
                {inventoryScanResults.map((row, idx) => {
                  const item = row.item || {};
                  const ai = row.ai || {};
                  const itemName = item.name || item.productName || "Inventory Item";

                  return (
                    <div key={`${item._id || itemName}-${idx}`} className="ai-inventory-row">
                      <p><strong>{itemName}</strong> ({item.quantity ?? 0} in stock)</p>
                      <p>
                        {ai.alert
                          ? `Alert: ${ai.recommendation || "Low stock detected"}`
                          : "Status: Stock level healthy"}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="ai-card">
            <h3>AI WorkOrder Auto‑Assist</h3>
            <button className="ai-btn" onClick={runWorkOrderAutoFill} disabled={loading}>
              Auto‑Fill WorkOrder
            </button>
            <button
              className="ai-btn ai-btn-secondary"
              onClick={goCreateWorkOrderFromDraft}
              disabled={loading || !workOrderDraft}
              type="button"
            >
              Create Work Order From Draft
            </button>

            {workOrderDraft ? (
              <div className="ai-workorder-draft">
                <p><strong>Status:</strong> {workOrderDraft.progress || "not started"}</p>
                <p><strong>Estimated Labor:</strong> {workOrderDraft.estimatedTime ?? workOrderDraft.invoice?.laborTime ?? 0} hours</p>
                <p><strong>Parts Needed:</strong> {Array.isArray(workOrderDraft.partsNeeded) && workOrderDraft.partsNeeded.length > 0 ? workOrderDraft.partsNeeded.join(", ") : "None"}</p>
                {workOrderDraft.notes ? (
                  <pre className="ai-workorder-notes">{workOrderDraft.notes}</pre>
                ) : null}
              </div>
            ) : (
              <p className="ai-muted">Run Auto-Fill after diagnostics to generate a work order draft.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
