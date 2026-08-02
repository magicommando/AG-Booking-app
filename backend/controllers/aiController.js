const AILog = require('../models/AILog');
const aiEngine = require('../ai/aiEngine');
const mongoose = require('mongoose');
// ai analysis controller functions
exports.analyzeFirearm = async (req, res) => {
  try {
    const { firearmId, inputText, photoUrl } = req.body;

    const aiResult = aiEngine.analyzeFirearmIssue(inputText, photoUrl);

    const safeFirearmId = mongoose.Types.ObjectId.isValid(firearmId)
      ? firearmId
      : undefined;

    const log = await AILog.create({
      userId: req.user.userId,
      firearmId: safeFirearmId,
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
    const aiData = req.body?.aiData;

    if (!aiData || typeof aiData !== 'object') {
      return res.status(400).json({ message: 'aiData payload is required' });
    }

    const diagnostics = Array.isArray(aiData.diagnostics)
      ? aiData.diagnostics
      : (typeof aiData.diagnostics === 'string' ? [aiData.diagnostics] : []);

    const recommendations = Array.isArray(aiData.recommendations)
      ? aiData.recommendations
      : (typeof aiData.recommendations === 'string' ? [aiData.recommendations] : []);

    const partsNeeded = Array.isArray(aiData.parts)
      ? aiData.parts.filter((p) => typeof p === 'string' && p.trim())
      : [];

    const laborTime = Number.isFinite(Number(aiData.laborTime))
      ? Number(aiData.laborTime)
      : 0;
    const preferredFirearmId = typeof aiData.firearmId === 'string' ? aiData.firearmId : undefined;
    const preferredClientId = typeof aiData.clientId === 'string' ? aiData.clientId : undefined;
    const preferredClientName = typeof aiData.clientName === 'string' ? aiData.clientName : undefined;

    const noteBlocks = [];
    if (diagnostics.length > 0) {
      noteBlocks.push(`Diagnostics:\n- ${diagnostics.join('\n- ')}`);
    }

    if (recommendations.length > 0) {
      noteBlocks.push(`Recommendations:\n- ${recommendations.join('\n- ')}`);
    }

    if (typeof aiData.photoUrl === 'string' && aiData.photoUrl.trim()) {
      noteBlocks.push(`Photo Reference: ${aiData.photoUrl}`);
    }

    const draft = {
      progress: 'not started',
      partsNeeded,
      estimatedTime: laborTime,
      notes: noteBlocks.join('\n\n'),
      invoice: {
        laborTime
      },
      source: 'ai-autofill',
      preferredFirearmId,
      preferredClientId,
      preferredClientName
    };

    res.json({
      message: 'Work order draft auto-filled',
      draft
    });
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

// get AI analysis history for the authenticated user
exports.getMyAIHistory = async (req, res) => {
  try {
    const logs = await AILog.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
