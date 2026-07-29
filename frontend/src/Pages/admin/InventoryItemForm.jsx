import { useState, useEffect } from "react";
import axios from "axios";
import { useAppState, authHeader } from "../../state/AppState";
import { useNavigate, useParams } from "react-router-dom";

export default function InventoryItemForm() {
  const { token } = useAppState();
  const navigate = useNavigate();
  const { id } = useParams();

  const [item, setItem] = useState({
    name: "",
    quantity: 0,
    category: ""
  });

  // Load existing item if editing
  useEffect(() => {
    if (!id) return;

    axios
      .get(`http://localhost:5000/api/inventory/${id}`, authHeader(token))
      .then(res => setItem(res.data))
      .catch(err => console.error(err));
  }, [id, token]);

  async function saveItem() {
    try {
      if (id) {
        await axios.put(
          `http://localhost:5000/api/inventory/${id}`,
          item,
          authHeader(token)
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/inventory",
          item,
          authHeader(token)
        );
      }

      navigate("/admin/inventory/table");
    } catch (err) {
      console.error("Save failed:", err);
    }
  }

  return (
    <div className="inventory-form">
      <h2>{id ? "Edit Item" : "New Item"}</h2>

      <input
        type="text"
        placeholder="Name"
        value={item.name}
        onChange={(e) => setItem({ ...item, name: e.target.value })}
      />

      <input
        type="number"
        placeholder="Quantity"
        value={item.quantity}
        onChange={(e) => setItem({ ...item, quantity: e.target.value })}
      />

      <input
        type="text"
        placeholder="Category"
        value={item.category}
        onChange={(e) => setItem({ ...item, category: e.target.value })}
      />

      <button onClick={saveItem}>
        {id ? "Update Item" : "Create Item"}
      </button>
    </div>
  );
}
