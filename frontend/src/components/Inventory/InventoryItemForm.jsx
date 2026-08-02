import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppState } from "../../state/AppState";
import {
  createInventoryItem,
  fetchInventoryItemById,
  placeInventoryOrder,
  updateInventoryItem
} from "../../services/inventoryService";
import "./InventoryItemForm.css";

export default function InventoryItemForm() {
  const { token } = useAppState();
  const navigate = useNavigate();
  const { id } = useParams();

  const [item, setItem] = useState({
    name: "",
    quantity: 0,
    category: "",
    location: "",
    notes: "",
    sku: "",
    cost: "",
    supplier: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [placeOrderNow, setPlaceOrderNow] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState("");
  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    async function loadItem() {
      if (!id || !token) return;

      try {
        setError("");
        const data = await fetchInventoryItemById(id, token);
        setItem({
          name: data?.name || "",
          quantity: Number(data?.quantity || 0),
          category: data?.category || "",
          location: data?.location || "",
          notes: data?.notes || "",
          sku: data?.sku || "",
          cost: data?.cost ?? "",
          supplier: data?.supplier || ""
        });
        setOrderHistory(Array.isArray(data?.partOrders) ? data.partOrders : []);
      } catch (err) {
        console.error("Failed to load inventory item:", err);
        setError("Unable to load inventory item.");
      }
    }

    loadItem();
  }, [id, token]);

  async function saveItem() {
    if (!token) {
      setError("You must be logged in.");
      return;
    }

    if (!item.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (placeOrderNow && (!Number.isFinite(Number(orderQuantity)) || Number(orderQuantity) <= 0)) {
      setError("Order quantity must be greater than 0.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: item.name.trim(),
        quantity: Number(item.quantity),
        category: item.category,
        location: item.location,
        notes: item.notes,
        sku: item.sku,
        cost: item.cost === "" ? undefined : Number(item.cost),
        supplier: item.supplier
      };

      let targetItemId = id;

      if (id) {
        const updated = await updateInventoryItem(id, payload, token);
        targetItemId = updated?.item?._id || id;
      } else {
        const created = await createInventoryItem(payload, token);
        targetItemId = created?.item?._id;
      }

      if (placeOrderNow) {
        if (!targetItemId) {
          throw new Error("Unable to place order: item id missing");
        }

        const orderRes = await placeInventoryOrder(
          targetItemId,
          {
            quantity: Number(orderQuantity),
            supplier: item.supplier,
            notes: orderNotes
          },
          token
        );

        setOrderHistory(Array.isArray(orderRes?.item?.partOrders) ? orderRes.item.partOrders : []);
        setSuccess(`Order placed and signed by ${orderRes?.order?.signedByName || "gunsmith"}.`);
      }

      if (!id) {
        navigate("/admin/inventory");
        return;
      }

      setSuccess((prev) => prev || "Item updated.");
    } catch (err) {
      console.error("Save failed:", err);
      setError(err.response?.data?.message || err.response?.data?.error || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="inv-form-container">
      <h2>{id ? "Edit Item" : "New Item"}</h2>

      <div className="inv-form-card">
        {error ? <p className="inv-form-error">{error}</p> : null}
        {success ? <p className="inv-form-success">{success}</p> : null}

        <label htmlFor="inv-name">Name</label>
        <input
          id="inv-name"
          className="inv-input"
          type="text"
          placeholder="Item name"
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.target.value })}
        />

        <label htmlFor="inv-quantity">Quantity</label>
        <input
          id="inv-quantity"
          className="inv-input"
          type="number"
          placeholder="Quantity"
          value={item.quantity}
          onChange={(e) => setItem({ ...item, quantity: Number(e.target.value) })}
        />

        <label htmlFor="inv-category">Category</label>
        <input
          id="inv-category"
          className="inv-input"
          type="text"
          placeholder="Category"
          value={item.category}
          onChange={(e) => setItem({ ...item, category: e.target.value })}
        />

        <label htmlFor="inv-location">Location</label>
        <input
          id="inv-location"
          className="inv-input"
          type="text"
          placeholder="Location"
          value={item.location}
          onChange={(e) => setItem({ ...item, location: e.target.value })}
        />

        <label htmlFor="inv-sku">SKU</label>
        <input
          id="inv-sku"
          className="inv-input"
          type="text"
          placeholder="SKU"
          value={item.sku}
          onChange={(e) => setItem({ ...item, sku: e.target.value })}
        />

        <label htmlFor="inv-cost">Cost</label>
        <input
          id="inv-cost"
          className="inv-input"
          type="number"
          placeholder="Cost"
          value={item.cost}
          onChange={(e) => setItem({ ...item, cost: e.target.value })}
        />

        <label htmlFor="inv-supplier">Supplier</label>
        <input
          id="inv-supplier"
          className="inv-input"
          type="text"
          placeholder="Supplier"
          value={item.supplier}
          onChange={(e) => setItem({ ...item, supplier: e.target.value })}
        />

        <label htmlFor="inv-notes">Notes</label>
        <textarea
          id="inv-notes"
          className="inv-textarea"
          placeholder="Notes"
          value={item.notes}
          onChange={(e) => setItem({ ...item, notes: e.target.value })}
        />

        <div className="inv-order-section">
          <label className="inv-order-toggle">
            <input
              type="checkbox"
              checked={placeOrderNow}
              onChange={(e) => setPlaceOrderNow(e.target.checked)}
            />
            Place Order For New Parts
          </label>

          {placeOrderNow ? (
            <>
              <label htmlFor="inv-order-qty">Order Quantity</label>
              <input
                id="inv-order-qty"
                className="inv-input"
                type="number"
                min="1"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(Number(e.target.value))}
              />

              <label htmlFor="inv-order-notes">Order Notes</label>
              <textarea
                id="inv-order-notes"
                className="inv-textarea inv-order-notes"
                placeholder="Optional note for this order"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </>
          ) : null}
        </div>

        {orderHistory.length > 0 ? (
          <div className="inv-order-history">
            <h3>Order Signatures</h3>
            {orderHistory.map((order) => (
              <div key={order._id} className="inv-order-row">
                <p><strong>Qty:</strong> {order.quantity}</p>
                <p><strong>Supplier:</strong> {order.supplier || "N/A"}</p>
                <p><strong>Signed By:</strong> {order.signedByName}</p>
                <p><strong>Date:</strong> {order.placedAt ? new Date(order.placedAt).toLocaleString() : "-"}</p>
              </div>
            ))}
          </div>
        ) : null}

        <button className="inv-save-btn" type="button" disabled={saving} onClick={saveItem}>
          {saving ? "Saving..." : id ? "Update Item" : "Create Item"}
        </button>

        <button
          className="inv-save-btn inv-cancel-btn"
          type="button"
          onClick={() => navigate("/admin/inventory")}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
