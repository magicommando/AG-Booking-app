const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['repair', 'cleaning', 'modification', 'inspection'] },
  duration: { type: Number }, // in minutes
  price: { type: Number },
  aiRecommended: { type: Boolean, default: false }
});

serviceSchema.index({ category: 1 });

module.exports = mongoose.model('Service', serviceSchema);
