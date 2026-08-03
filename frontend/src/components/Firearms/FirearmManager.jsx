import FirearmCard from "./FirearmCard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppState } from "../../state/AppState";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./FirearmManager.css";

export default function FirearmManager() {
  const navigate = useNavigate();
  const { token } = useAppState();

  const [firearms, setFirearms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editFirearm, setEditFirearm] = useState(null);

  const [form, setForm] = useState({
    make: "",
    model: "",
    serial: "",
    type: ""
  });

  // Load firearms
  useEffect(() => {
    async function loadFirearms() {
      try {
        const res = await api.get("/firearms",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFirearms(res.data);
      } catch (err) {
        console.error("Error loading firearms:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFirearms();
  }, [token]);

  // Open modal for add/edit
  function openModal(firearm = null) {
    setEditFirearm(firearm);

    if (firearm) {
      setForm({
        make: firearm.make || firearm.manufacturer || "",
        model: firearm.model,
        serial: firearm.serial || firearm.serialNumber || "",
        type: firearm.type || ""
      });
    } else {
      setForm({ make: "", model: "", serial: "", type: "" });
    }

    setModalOpen(true);
  }

  // Save firearm
  async function saveFirearm() {
    try {
      if (editFirearm) {
        const res = await api.put(`/firearms/${editFirearm._id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFirearms((prev) => prev.map((f) => (f._id === editFirearm._id ? res.data.firearm : f)));
      } else {
        const res = await api.post("/firearms",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFirearms((prev) => [res.data.firearm, ...prev]);
      }

      setModalOpen(false);
      setEditFirearm(null);
      setForm({ make: "", model: "", serial: "", type: "" });
    } catch (err) {
      console.error("Error saving firearm:", err);
    }
  }

  // Delete firearm
  async function deleteFirearm(id) {
    if (!window.confirm("Delete this firearm?")) return;

    try {
      await api.delete(`/firearms/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFirearms(firearms.filter((f) => f._id !== id));
    } catch (err) {
      console.error("Error deleting firearm:", err);
    }
  }

  if (loading) return <div className="fm-container">Loading...</div>;

  return (
    <div className="fm-container">
      <h2>Your Firearms</h2>

      {firearms.map((f) => (
        <FirearmCard
          key={f._id}
          firearm={f}
          onSelect={() => navigate(`/firearms/${f._id}`)}
        />
      ))}
      
      <button className="fm-add-btn" onClick={() => openModal()}>
        + Add Firearm
      </button>

      <div className="fm-grid">
        {firearms.map((f) => (
          <div key={f._id} className="fm-card">
            <h3>{f.make || f.manufacturer} {f.model}</h3>
            <p><strong>Serial:</strong> {f.serial}</p>
            <p><strong>Type:</strong> {f.type}</p>

            <div className="fm-actions">
              <button onClick={() => openModal(f)}>Edit</button>
              <button onClick={() => deleteFirearm(f._id)}>Delete</button>
              <Link to={`/firearms/${f._id}`} className="fm-details-btn">
                Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fm-modal">
          <div className="fm-modal-content">
            <h3>{editFirearm ? "Edit Firearm" : "Add Firearm"}</h3>

            <input
              type="text"
              placeholder="Make"
              value={form.make}
              onChange={(e) => setForm({ ...form, make: e.target.value })}
            />

            <input
              type="text"
              placeholder="Model"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />

            <input
              type="text"
              placeholder="Serial Number"
              value={form.serial}
              onChange={(e) => setForm({ ...form, serial: e.target.value })}
            />

            <input
              type="text"
              placeholder="Type (Pistol, Rifle, etc.)"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            />

            <div className="fm-modal-actions">
              <button onClick={saveFirearm}>Save</button>
              <button onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
