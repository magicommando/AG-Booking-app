import { useState } from "react";
import { useAppState, useAppDispatch } from "../../state/AppState";
import { scanInventory } from "../../api/ai";

export default function AIInventoryScan() {
  const { token, inventoryItems } = useAppState();
  const dispatch = useAppDispatch();

  const [items, setItems] = useState(inventoryItems || []);
  const [result, setResult] = useState(null);

  function addItem() {
    setItems([...items, { productName: "", quantity: 0 }]);
  }

  async function handleScan() {
    const res = await scanInventory(token, items);

    dispatch({ type: "SET_INVENTORY_ITEMS", payload: items });
    setResult(res.results);
  }

  return (
    <div>
      <h2>AI Inventory Scan</h2>

      {items.map((item, i) => (
        <div key={i}>
          <input
            placeholder="Product Name"
            value={item.productName}
            onChange={(e) => {
              const newItems = [...items];
              newItems[i].productName = e.target.value;
              setItems(newItems);
            }}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={item.quantity}
            onChange={(e) => {
              const newItems = [...items];
              newItems[i].quantity = Number(e.target.value);
              setItems(newItems);
            }}
          />
        </div>
      ))}

      <button onClick={addItem}>Add Item</button>
      <button onClick={handleScan}>Run AI Scan</button>

      {result && (
        <div>
          <h3>AI Results</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
