import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../state/AppState";
import { deleteInventoryItem, fetchInventoryItems } from "../../services/inventoryService";
import "./InventoryTable.css";

export default function InventoryTable() {
  const navigate = useNavigate();
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
        const data = await fetchInventoryItems(token);
        setItems(data);
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
      `${item.name} ${item.category} ${item.sku} ${item.supplier}`
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

  async function handleDelete(id) {
    if (!window.confirm("Delete this inventory item?")) return;

    try {
      await deleteInventoryItem(id, token);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
      setError("Unable to delete inventory item.");
    }
  }

  if (loading) return <div className="inventory-container">Loading...</div>;
  if (error) return <div className="inventory-container">{error}</div>;

  return (
    <div className="inventory-container">
      <h2>Inventory</h2>

      <div className="inventory-toolbar">
        <button type="button" onClick={() => navigate("/admin/inventory")}>Back to Inventory Page</button>
        <button type="button" onClick={() => navigate("/admin/inventory/new")}>Add Item</button>
      </div>

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
            <th>Actions</th>
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
              <td className="inventory-actions-cell">
                <button type="button" onClick={() => navigate(`/admin/inventory/edit/${item._id}`)}>Edit</button>
                <button type="button" onClick={() => handleDelete(item._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
