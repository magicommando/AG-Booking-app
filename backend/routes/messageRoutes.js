const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/', messageController.sendMessage);
router.get('/:user1/:user2', messageController.getConversation);

module.exports = router;
