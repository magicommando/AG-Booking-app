import { useEffect, useState } from "react";
import { useAppState } from "../../state/AppState";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import FirearmCard from "./FirearmCard";
import "./AdminFirearmList.css";

export default function AdminFirearmList() {
  const { token } = useAppState();
  const navigate = useNavigate();

  const [firearms, setFirearms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    async function loadFirearms() {
      try {
        const res = await api.get("/firearms", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFirearms(res.data);
      } catch (err) {
        console.error("Error loading firearms:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFirearms();
  }, [token]);

  function filteredFirearms() {
    let list = firearms;

    if (search.trim()) {
      list = list.filter((f) =>
        `${f.make || f.manufacturer || ""} ${f.model || ""} ${f.serial || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (filterType !== "all") {
      list = list.filter((f) => f.type === filterType);
    }

    return list;
  }

  if (loading) return <div className="adminfirearm-container">Loading...</div>;

  return (
    <div className="adminfirearm-container">
      <h2>All Firearms</h2>

      <div className="adminfirearm-controls">
        <input
          type="text"
          placeholder="Search by make, model, or serial..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="adminfirearm-input"
        />

        <select
          className="adminfirearm-input"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="pistol">Pistol</option>
          <option value="rifle">Rifle</option>
          <option value="shotgun">Shotgun</option>
          <option value="revolver">Revolver</option>
        </select>
      </div>

      <div className="adminfirearm-grid">
        {filteredFirearms().map((f) => (
          <FirearmCard
            key={f._id}
            firearm={f}
            showClientInfo
            showActions={false}
            onSelect={() => navigate(`/admin/firearms/${f._id}`)}
          />
        ))}
      </div>
    </div>
  );
}
