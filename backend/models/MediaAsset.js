const mongoose = require('mongoose');

const mediaAssetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firearmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firearm' },
  url: { type: String, required: true },
  fileName: { type: String, required: true },
  originalName: { type: String },
  type: { type: String, enum: ['image', 'video'], required: true },
  contentType: { type: String },
  size: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

mediaAssetSchema.index({ userId: 1, createdAt: -1 });
mediaAssetSchema.index({ firearmId: 1, createdAt: -1 });

module.exports = mongoose.model('MediaAsset', mediaAssetSchema);
