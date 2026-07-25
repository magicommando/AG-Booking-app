const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const allow = require('../middleware/roles');
const validate = require('../middleware/validateMiddleware');
const { messageSchemas } = require('../validation/validationSchemas');
const messageController = require('../controllers/messageController');

// Send message
router.post(
  '/',
  auth,
  allow(['client', 'gunsmith']),
  validate(messageSchemas.send),
  messageController.sendMessage
);

// Get conversation
router.get(
  '/:user1/:user2',
  auth,
  allow(['client', 'gunsmith']),
  messageController.getConversation
);

module.exports = router;
