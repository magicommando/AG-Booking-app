const [saving, setSaving] = useState(false);

async function saveItem() {
  setSaving(true);

  if (id) {
    await axios.put(`/api/inventory/${id}`, item);
  } else {
    await axios.post("/api/inventory", item);
  }

  setSaving(false);
  navigate("/admin/inventory/table");
}

<button disabled={saving}>
  {saving ? "Saving..." : id ? "Update Item" : "Create Item"}
</button>
