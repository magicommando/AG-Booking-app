const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['repair', 'cleaning', 'modification', 'inspection'] },
  duration: { type: Number }, // in minutes
  price: { type: Number },
  aiRecommended: { type: Boolean, default: false }
});

module.exports = mongoose.model('Service', serviceSchema);
