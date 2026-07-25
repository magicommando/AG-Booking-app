const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const allow = require('../middleware/roles');
const validate = require('../middleware/validateMiddleware');
const upload = require('../middleware/fileUpload');
const { messageSchemas } = require('../validation/validationSchemas');
const messageController = require('../controllers/messageController');

// NEW: message attachments
router.post(
  '/attachment',
  auth,
  allow(['client', 'gunsmith']),
  upload.single('attachment'),
  messageController.uploadAttachment
);

router.post('/', auth, allow(['client', 'gunsmith']), validate(messageSchemas.send), messageController.sendMessage);

router.get('/:user1/:user2', auth, allow(['client', 'gunsmith']), messageController.getConversation);

module.exports = router;
