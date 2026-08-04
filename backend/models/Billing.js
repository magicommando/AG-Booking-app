const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true, required: true },
  workOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gunsmithId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'refunded', 'overdue'], default: 'draft' },
  currency: { type: String, default: 'USD' },
  items: [{
    type: { type: String, enum: ['part', 'labor', 'service'], default: 'service' },
    description: { type: String, required: true },
    qty: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    lineTotal: { type: Number, default: 0 }
  }],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  paidAt: { type: Date },
  paymentMethod: { type: String },
  receipt: {
    receiptNumber: { type: String },
    note: { type: String },
    paidBy: { type: String }
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Billing', billingSchema);
