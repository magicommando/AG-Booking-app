const workOrderSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  gunsmithId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partsNeeded: [{ type: String }],
  estimatedTime: { type: Number },
  progress: { type: String, enum: ['not started', 'in progress', 'completed'], default: 'not started' },
  notes: { type: String },
  invoice: {
    laborTime: { type: Number },
    partsCost: { type: Number },
    total: { type: Number }
  }
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);
