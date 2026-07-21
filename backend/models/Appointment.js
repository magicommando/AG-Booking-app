const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gunsmithId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firearmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firearm', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'denied', 'completed'], default: 'pending' },
  aiSummary: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

appointmentSchema.index({ clientId: 1 });
appointmentSchema.index({ gunsmithId: 1 });
appointmentSchema.index({ date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
