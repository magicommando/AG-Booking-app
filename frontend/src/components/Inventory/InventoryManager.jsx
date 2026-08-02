import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "../../state/AppState";
import { deleteInventoryItem, fetchInventoryItems } from "../../services/inventoryService";
import "./InventoryManager.css";

export default function InventoryManager() {
  const navigate = useNavigate();
  const { token } = useAppState();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load inventory
  useEffect(() => {
    async function loadInventory() {
      try {
        setError("");
        const items = await fetchInventoryItems(token);
        setInventory(items);
      } catch (err) {
        console.error("Error loading inventory:", err);
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

  // Delete inventory item
  async function deleteItem(id) {
    if (!window.confirm("Delete this inventory item?")) return;

    try {
      await deleteInventoryItem(id, token);
      setInventory((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      console.error("Error deleting inventory item:", err);
      setError("Unable to delete inventory item.");
    }
  }

  if (loading) return <div className="inv-container">Loading...</div>;

  return (
    <div className="inv-container">
      <h2>Inventory Manager</h2>

      <div className="inv-toolbar">
        <Link className="inv-add-btn" to="/admin/inventory/new">
          + Add Item
        </Link>
        <Link className="inv-table-btn" to="/admin/inventory/table">
          Open Inventory Table
        </Link>
      </div>

      {error ? <p className="inv-error">{error}</p> : null}

      <div className="inv-grid">
        {inventory.map((item) => (
          <div key={item._id} className="inv-card">
            <h3>{item.name}</h3>
            <p><strong>Category:</strong> {item.category}</p>
            <p><strong>Quantity:</strong> {item.quantity}</p>
            <p><strong>Location:</strong> {item.location}</p>

            {item.lowStockAlert && (
              <p className="inv-lowstock">Low Stock!</p>
            )}

            <div className="inv-actions">
              <button onClick={() => navigate(`/admin/inventory/edit/${item._id}`)}>Edit</button>
              <button onClick={() => deleteItem(item._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {!error && inventory.length === 0 ? <p>No inventory items found.</p> : null}
    </div>
  );
}
