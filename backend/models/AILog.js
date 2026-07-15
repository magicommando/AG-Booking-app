const aiLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firearmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Firearm' },
  inputText: { type: String },
  photoUrl: { type: String },
  aiResponse: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AILog', aiLogSchema);
