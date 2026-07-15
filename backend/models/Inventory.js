const inventorySchema = new mongoose.Schema({
  gunsmithId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true },
  brand: { type: String },
  partNumber: { type: String },
  quantity: { type: Number, default: 0 },
  vendor: { type: String },
  price: { type: Number },
  lowStockAlert: { type: Boolean, default: false }
});

module.exports = mongoose.model('Inventory', inventorySchema);
