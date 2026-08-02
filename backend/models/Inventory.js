const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  gunsmithId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true },
  category: { type: String },
  location: { type: String },
  notes: { type: String },
  brand: { type: String },
  partNumber: { type: String },
  quantity: { type: Number, default: 0 },
  vendor: { type: String },
  price: { type: Number },
  lowStockAlert: { type: Boolean, default: false },
  partOrders: [
    {
      quantity: { type: Number, required: true },
      supplier: { type: String },
      notes: { type: String },
      status: { type: String, enum: ['placed', 'received', 'cancelled'], default: 'placed' },
      signedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      signedByName: { type: String, required: true },
      placedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

inventorySchema.index({ gunsmithId: 1 });
inventorySchema.index({ lowStockAlert: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
