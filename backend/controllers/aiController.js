const AILog = require('../models/AILog');
const aiEngine = require('../ai/aiEngine');
// ai analysis controller functions
exports.analyzeFirearm = async (req, res) => {
  try {
    const { userId, firearmId, inputText, photoUrl } = req.body;

    const aiResult = aiEngine.analyzeFirearmIssue(inputText, photoUrl);

    const log = await AILog.create({
      userId,
      firearmId,
      inputText,
      photoUrl,
      aiResponse: JSON.stringify(aiResult)
    });

    res.json({
      message: "AI diagnostics generated",
      diagnostics: aiResult,
      log
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// upload photo for AI analysis (client only, own firearms)
exports.uploadPhoto = async (req, res) => {
  try {
    const url = `/uploads/${req.file.filename}`;
    res.json({ message: 'AI photo uploaded', photoUrl: url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// AI inventory scan (gunsmith only)
exports.scanInventory = async (req, res) => {
  try {
    const items = req.body.items; // frontend sends inventory list
    const results = items.map(item => ({
      item,
      ai: { alert: item.quantity <= 2, recommendation: item.quantity <= 2 ? `Reorder ${item.productName}` : null }
    }));

    res.json({
      message: "AI inventory scan complete",
      results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// auto-fill work order based on AI analysis (gunsmith only)
exports.autoFillWorkOrder = async (req, res) => {
  try {
    // Milestone 6 will wire this to WorkOrder; for now just echo
    res.json({ message: 'Work order auto-fill placeholder' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//  save AI analysis to history (client only, own firearms)
exports.saveAIAnalysis = async (req, res) => {
  try {
    const { firearmId, inputText, photoUrl, aiResponse } = req.body;

    const log = await AILog.create({
      userId: req.user.userId,
      firearmId,
      inputText,
      photoUrl,
      aiResponse
    });

    res.json({ message: 'AI analysis saved', log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// get AI analysis history for a user (client only, own history)
exports.getUserAIHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: cannot view another user’s AI history' });
    }

    const logs = await AILog.find({ userId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
