import { useEffect, useState } from "react";
import { useAppState } from "../../state/AppState";
import axios from "axios";
import "./InventoryTable.css";

export default function InventoryTable() {
  const { token } = useAppState();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadInventory() {
      try {
        const res = await axios.get("http://localhost:5000/api/inventory", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItems(res.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load inventory.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadInventory();
    } else {
      setLoading(false);
    }
  }, [token]);

  function filteredItems() {
    const filtered = items.filter((item) =>
      `${item.name} ${item.category} ${item.sku}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const valA = a[sortField]?.toString().toLowerCase() ?? "";
      const valB = b[sortField]?.toString().toLowerCase() ?? "";

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  function toggleSort(field) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  if (loading) return <div className="inventory-container">Loading...</div>;
  if (error) return <div className="inventory-container">{error}</div>;

  return (
    <div className="inventory-container">
      <h2>Inventory</h2>

      <input
        type="text"
        placeholder="Search inventory..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="inventory-search"
      />

      <table className="inventory-table">
        <thead>
          <tr>
            <th onClick={() => toggleSort("name")}>Name</th>
            <th onClick={() => toggleSort("category")}>Category</th>
            <th onClick={() => toggleSort("sku")}>SKU</th>
            <th onClick={() => toggleSort("quantity")}>Qty</th>
            <th onClick={() => toggleSort("cost")}>Cost</th>
            <th onClick={() => toggleSort("supplier")}>Supplier</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems().map((item) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.sku}</td>
              <td>{item.quantity}</td>
              <td>{item.cost != null ? `$${item.cost}` : "N/A"}</td>
              <td>{item.supplier || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
