const Message = require('../models/Message');
const { storeFileInGridFs } = require('../config/gridfs');

exports.listConversations = async (req, res) => {
  try {
    const userId = String(req.user.userId);

    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
      .populate('sender', 'firstName lastName role')
      .populate('recipient', 'firstName lastName role')
      .sort({ createdAt: -1 });

    const byPartner = new Map();

    for (const msg of messages) {
      const senderId = String(msg.sender?._id || msg.sender);
      const recipientId = String(msg.recipient?._id || msg.recipient);
      const partner = senderId === userId ? msg.recipient : msg.sender;
      const partnerId = String(partner?._id || partner);

      if (!byPartner.has(partnerId)) {
        byPartner.set(partnerId, {
          _id: partnerId,
          participant: partner
            ? {
                _id: partnerId,
                firstName: partner.firstName,
                lastName: partner.lastName,
                role: partner.role
              }
            : null,
          lastMessage: {
            text: msg.content || '',
            createdAt: msg.createdAt
          },
          appointmentId: msg.appointmentId || null
        });
      }
    }

    res.json(Array.from(byPartner.values()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, appointmentId, text, attachments } = req.body;

    if (String(senderId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'Forbidden: sender mismatch' });
    }

    // Normalize attachments to [{ url, filename? }]
    let safeAttachments = [];
    if (Array.isArray(attachments)) {
      safeAttachments = attachments
        .map((item) => {
          if (typeof item === 'string') {
            return { url: item };
          }

          if (item && typeof item.url === 'string') {
            return {
              url: item.url,
              filename: item.filename
            };
          }

          return null;
        })
        .filter(Boolean);
    }

    const message = await Message.create({
      sender: senderId,
      recipient: receiverId,
      appointmentId,
      content: text,
      attachments: safeAttachments
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'firstName lastName role')
      .populate('recipient', 'firstName lastName role');

    res.json({ message: 'Message sent', data: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// uploadAttachment is now handled in a separate route, and the URL is returned to the client. The client can then include this URL in the attachments array when sending a message.
exports.uploadAttachment = async (req, res) => {
  try {
    const storageResult = await storeFileInGridFs(req.file, {
      userId: req.user?.userId,
      mediaType: req.file?.mimetype?.startsWith('video/') ? 'video' : 'image'
    });

    res.json({ message: 'Attachment uploaded', url: storageResult.url, mediaUrl: storageResult.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getConversation = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    if (String(req.user.userId) !== String(user1) && String(req.user.userId) !== String(user2)) {
      return res.status(403).json({ message: 'Forbidden: cannot view others’ conversation' });
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 }
      ]
    })
      .populate('sender', 'firstName lastName role')
      .populate('recipient', 'firstName lastName role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
