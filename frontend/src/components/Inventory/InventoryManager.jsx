import { useEffect, useState } from "react";
import { useAppState } from "../../state/AppState";
import axios from "axios";
import "./InventoryManager.css";

export default function InventoryManager() {
  const { token } = useAppState();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: 0,
    location: "",
    notes: ""
  });

  // Load inventory
  useEffect(() => {
    async function loadInventory() {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/inventory",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInventory(res.data);
      } catch (err) {
        console.error("Error loading inventory:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInventory();
  }, [token]);

  // Open modal for add/edit
  function openModal(item = null) {
    setEditItem(item);

    if (item) {
      setForm({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        location: item.location,
        notes: item.notes
      });
    } else {
      setForm({
        name: "",
        category: "",
        quantity: 0,
        location: "",
        notes: ""
      });
    }

    setModalOpen(true);
  }

  // Save inventory item
  async function saveItem() {
    try {
      if (editItem) {
        await axios.put(
          `http://localhost:5000/api/inventory/${editItem._id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/inventory",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Error saving inventory item:", err);
    }
  }

  // Delete inventory item
  async function deleteItem(id) {
    if (!window.confirm("Delete this inventory item?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/inventory/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInventory(inventory.filter((i) => i._id !== id));
    } catch (err) {
      console.error("Error deleting inventory item:", err);
    }
  }

  if (loading) return <div className="inv-container">Loading...</div>;

  return (
    <div className="inv-container">
      <h2>Inventory Manager</h2>

      <button className="inv-add-btn" onClick={() => openModal()}>
        + Add Item
      </button>

      <div className="inv-grid">
        {inventory.map((item) => (
          <div key={item._id} className="inv-card">
            <h3>{item.name}</h3>
            <p><strong>Category:</strong> {item.category}</p>
            <p><strong>Quantity:</strong> {item.quantity}</p>
            <p><strong>Location:</strong> {item.location}</p>

            {item.quantity < 5 && (
              <p className="inv-lowstock">Low Stock!</p>
            )}

            <div className="inv-actions">
              <button onClick={() => openModal(item)}>Edit</button>
              <button onClick={() => deleteItem(item._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="inv-modal">
          <div className="inv-modal-content">
            <h3>{editItem ? "Edit Item" : "Add Item"}</h3>

            <input
              type="text"
              placeholder="Item Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              type="text"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            <input
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            />

            <input
              type="text"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />

            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <div className="inv-modal-actions">
              <button onClick={saveItem}>Save</button>
              <button onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
