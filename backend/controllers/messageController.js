const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, appointmentId, text, attachments } = req.body;
    
    if (senderId !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: sender mismatch' });
    }

    // Validate attachments (must be URLs)
    let safeAttachments = [];
    if (Array.isArray(attachments)) {
      safeAttachments = attachments.filter(url => typeof url === 'string');
    }

    const message = await Message.create({
      senderId,
      receiverId,
      appointmentId,
      text,
      attachments: safeAttachments
    });
    res.json({ message: 'Message sent', data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// uploadAttachment is now handled in a separate route, and the URL is returned to the client. The client can then include this URL in the attachments array when sending a message.
exports.uploadAttachment = async (req, res) => {
  try {
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ message: 'Attachment uploaded', url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getConversation = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    if (req.user.userId !== user1 && req.user.userId !== user2) {
      return res.status(403).json({ message: 'Forbidden: cannot view others’ conversation' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
