const AILog = require('../models/AILog');

exports.saveAIAnalysis = async (req, res) => {
  try {
    const log = await AILog.create(req.body);
    res.json({ message: 'AI analysis saved', log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserAIHistory = async (req, res) => {
  try {
    const logs = await AILog.find({ userId: req.params.userId });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
