const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  gunsmithId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clientName: { type: String },
  acceptedAt: { type: Date, default: Date.now },
  partsNeeded: [{ type: String }],
  estimatedTime: { type: Number },
  progress: { type: String, enum: ['not started', 'in progress', 'completed'], default: 'not started' },
  notes: { type: String },
  completionNotification: {
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    message: { type: String }
  },
  invoice: {
    laborTime: { type: Number },
    partsCost: { type: Number },
    total: { type: Number }
  }
});

workOrderSchema.index({ appointmentId: 1 }, { unique: true });

module.exports = mongoose.model('WorkOrder', workOrderSchema);
