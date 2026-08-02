const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const allow = require('../middleware/roles');
const validate = require('../middleware/validateMiddleware');
const upload = require('../middleware/fileUpload');
const { aiSchemas } = require('../validation/validationSchemas');
const aiController = require('../controllers/aiController');

// NEW: upload photo for AI analysis
router.post(
  '/photo',
  auth,
  allow(['gunsmith', 'client']),
  upload.single('photo'),
  aiController.uploadPhoto
);

router.post('/firearm', auth, allow(['gunsmith', 'client']), validate(aiSchemas.analyzeFirearm), aiController.analyzeFirearm);

router.post('/inventory-scan', auth, allow(['gunsmith']), validate(aiSchemas.inventoryScan), aiController.scanInventory);

router.post('/work-order', auth, allow(['gunsmith']), aiController.autoFillWorkOrder);

router.post('/', auth, allow(['client', 'gunsmith']), validate(aiSchemas.saveAnalysis), aiController.saveAIAnalysis);

router.get('/logs/me', auth, allow(['client', 'gunsmith', 'admin']), aiController.getMyAIHistory);

router.get('/:userId', auth, allow(['client', 'gunsmith']), aiController.getUserAIHistory);

module.exports = router;
