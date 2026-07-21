const mongoose = require('mongoose');

const firearmSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  manufacturer: { type: String, required: true },
  model: { type: String, required: true },
  serial: { type: String },
  caliber: { type: String },
  photos: [{ type: String }], // URLs or file paths
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

firearmSchema.index({ userId: 1 });

module.exports = mongoose.model('Firearm', firearmSchema);
