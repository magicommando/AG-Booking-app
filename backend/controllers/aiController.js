const AILog = require('../models/AILog');
const MediaAsset = require('../models/MediaAsset');
const aiEngine = require('../ai/aiEngine');
const mongoose = require('mongoose');
const { storeFileInGridFs, deleteFileByName } = require('../config/gridfs');
// ai analysis controller functions
exports.analyzeFirearm = async (req, res) => {
  try {
    const { firearmId, inputText, photoUrl, videoUrl, mediaUrl } = req.body;

    const aiResult = await aiEngine.analyzeFirearmIssue(inputText, {
      photoUrl,
      videoUrl,
      mediaUrl
    });

    const safeFirearmId = mongoose.Types.ObjectId.isValid(firearmId)
      ? firearmId
      : undefined;

    const log = await AILog.create({
      userId: req.user.userId,
      firearmId: safeFirearmId,
      inputText,
      photoUrl: photoUrl || mediaUrl,
      videoUrl: videoUrl || mediaUrl,
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

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No media file uploaded.' });
    }

    const mediaType = req.file.mimetype?.startsWith('video/') ? 'video' : 'image';
    const storageResult = await storeFileInGridFs(req.file, { userId: req.user?.userId, mediaType });
    const fileUrl = storageResult?.url || `/uploads/grid/${storageResult?.filename || req.file.originalname || 'upload'}`;

    const userId = req.user?.userId && mongoose.Types.ObjectId.isValid(req.user.userId)
      ? new mongoose.Types.ObjectId(req.user.userId)
      : undefined;

    const savedAsset = await MediaAsset.create({
      userId,
      url: fileUrl,
      fileName: storageResult?.filename || req.file.originalname,
      originalName: req.file.originalname,
      type: mediaType,
      contentType: req.file.mimetype,
      size: req.file.size,
      fileId: storageResult?.fileId
    });

    res.json({
      message: 'AI media uploaded',
      mediaUrl: fileUrl,
      mediaType,
      photoUrl: mediaType === 'image' ? fileUrl : undefined,
      videoUrl: mediaType === 'video' ? fileUrl : undefined,
      assetId: savedAsset._id,
      fileId: storageResult?.fileId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    const storageResult = await storeFileInGridFs(req.file, {
      userId: req.user?.userId,
      mediaType: 'image'
    });

    res.json({
      message: 'AI photo uploaded',
      photoUrl: storageResult.url,
      mediaUrl: storageResult.url,
      mediaType: 'image',
      fileId: storageResult.fileId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const incomingUrl = typeof req.body?.url === 'string' ? req.body.url : req.query?.url;
    if (!incomingUrl) {
      return res.status(400).json({ message: 'Media URL is required' });
    }

    const filename = incomingUrl.split('/').pop();
    if (!filename) {
      return res.status(400).json({ message: 'Unable to determine media filename' });
    }

    const deletedFromGrid = await deleteFileByName(filename);
    await MediaAsset.deleteMany({ fileName: filename, userId: req.user?.userId });

    res.json({
      message: 'Media deleted',
      deleted: deletedFromGrid || true,
      fileName: filename,
      url: incomingUrl
    });
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
