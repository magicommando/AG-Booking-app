import { useEffect, useState } from "react";
import axios from "axios";
import { useAppState, authHeader } from "../../state/AppState";
import ModalConfirm from "../../components/UI/ModalConfirm";

export default function InventoryTable() {
  const { token } = useAppState();
  const [items, setItems] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Load inventory
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/inventory", authHeader(token))
      .then(res => setItems(res.data))
      .catch(err => console.error(err));
  }, [token]);

  // Delete item
  function requestDelete(item) {
    setSelectedItem(item);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    try {
      await axios.delete(
        `http://localhost:5000/api/inventory/${selectedItem._id}`,
        authHeader(token)
      );

      setItems(prev => prev.filter(i => i._id !== selectedItem._id));
      setConfirmOpen(false);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  return (
    <div className="inventory-table">
      <h2>Inventory</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Qty</th>
            <th>Category</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.map(item => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.category}</td>
              <td>
                <button onClick={() => requestDelete(item)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalConfirm
        open={confirmOpen}
        title="Delete Inventory Item"
        message={`Delete ${selectedItem?.name}?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
