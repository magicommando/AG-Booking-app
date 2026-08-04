import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppState } from "../../state/AppState";
import api from "../../services/api";
import "./FirearmDetails.css";

export default function FirearmDetails({ firearm }) {
  const { id } = useParams();
  const { token, role } = useAppState();
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const activeToken = token || storedToken;
  const [loadedFirearm, setLoadedFirearm] = useState(null);
  const [loading, setLoading] = useState(!firearm);

  useEffect(() => {
    if (firearm || !id || !activeToken) {
      setLoading(false);
      return;
    }

    async function loadFirearm() {
      try {
        const res = await api.get(`/firearms/${id}`, {
          headers: { Authorization: `Bearer ${activeToken}` }
        });
        setLoadedFirearm(res.data);
      } catch (err) {
        console.error("Error loading firearm details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFirearm();
  }, [firearm, id, activeToken]);

  const activeFirearm = useMemo(() => firearm || loadedFirearm, [firearm, loadedFirearm]);

  if (loading) {
    return (
      <div className="firearm-details-page">
        <div className="firearm-details-empty">
          <p>Loading firearm details...</p>
        </div>
      </div>
    );
  }

  if (!activeFirearm) {
    return (
      <div className="firearm-details-page">
        <div className="firearm-details-empty">
          <p>No firearm selected.</p>
        </div>
      </div>
    );
  }

  const make = activeFirearm.make || activeFirearm.manufacturer || "Unknown";
  const model = activeFirearm.model || "Model";
  const serial = activeFirearm.serial || activeFirearm.serialNumber || "-";
  const normalizedPhotos = [
    ...(Array.isArray(activeFirearm.photos) ? activeFirearm.photos : []),
    activeFirearm.photoUrl,
    activeFirearm.image
  ].filter((url, index, arr) => typeof url === "string" && url.trim() && arr.indexOf(url) === index);
  const clientId = activeFirearm.userId?._id || activeFirearm.userId || "-";
  const notes = activeFirearm.notes;
  const caliber = activeFirearm.caliber || "-";
  const type = activeFirearm.type || "-";

  const photoUrls = normalizedPhotos.map((url) =>
    url.startsWith("http") ? url : `${window.location.origin}${url}`
  );

  return (
    <div className="firearm-details-page">
      <div className="firearm-details-card">
        <h2 className="firearm-details-title">{make} {model}</h2>

        <div className="firearm-details-body">
          <div className="firearm-details-photos">
            {photoUrls.length > 0 ? (
              <>
                <img
                  src={photoUrls[0]}
                  alt={`${make} ${model}`}
                  className="firearm-details-image"
                />
                {photoUrls.length > 1 && (
                  <div className="firearm-details-thumb-grid">
                    {photoUrls.slice(1).map((url, idx) => (
                      <img
                        key={`${url}-${idx}`}
                        src={url}
                        alt={`${make} ${model} view ${idx + 2}`}
                        className="firearm-details-thumb"
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="firearm-details-no-photo">No uploaded photos for this firearm.</div>
            )}
          </div>

          <div className="firearm-details-info">
            {(role === "gunsmith" || role === "admin") && (
              <p><strong>Client ID:</strong> {clientId}</p>
            )}
            <p><strong>Type:</strong> {type}</p>
            <p><strong>Caliber:</strong> {caliber}</p>
            <p><strong>Manufacturer:</strong> {make}</p>
            <p><strong>Serial Number:</strong> {serial}</p>

            <p className="firearm-details-notes">
              <strong>Notes:</strong> {notes || "No notes provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
