const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/', aiController.saveAIAnalysis);
router.get('/:userId', aiController.getUserAIHistory);

module.exports = router;
