const mongoose = require('mongoose');

const scheduleDaySchema = new mongoose.Schema({
  gunsmithId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true }, // YYYY-MM-DD
  unavailableTimes: [{ type: String }]
}, { timestamps: true });

scheduleDaySchema.index({ gunsmithId: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('ScheduleDay', scheduleDaySchema);
