const express = require('express');
const prisma = require('../services/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get list of active conversations (contacts)
router.get('/conversations', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch all messages involving the user
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      include: {
        sender: { select: { id: true, email: true, profile: true } },
        receiver: { select: { id: true, email: true, profile: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by contact ID
    const contactsMap = {};
    messages.forEach(msg => {
      const contact = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!contactsMap[contact.id]) {
        contactsMap[contact.id] = {
          contact,
          lastMessage: msg.content,
          createdAt: msg.createdAt,
          isRead: msg.senderId === userId ? true : msg.isRead
        };
      }
    });

    const conversations = Object.values(contactsMap).sort((a, b) => b.createdAt - a.createdAt);
    res.json(conversations);
  } catch (error) {
    console.error('Fetch conversations error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get messages history with a user
router.get('/messages/:contactId', authenticate, async (req, res) => {
  const userId = req.user.id;
  const contactId = parseInt(req.params.contactId);

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: contactId },
          { senderId: contactId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages sent by the contact to current user as read
    await prisma.message.updateMany({
      where: {
        senderId: contactId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json(messages);
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Send message
router.post('/messages', authenticate, async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id;

  if (!receiverId || !content) {
    return res.status(400).json({ error: 'Receiver ID and content are required.' });
  }

  if (senderId === parseInt(receiverId)) {
    return res.status(400).json({ error: 'You cannot send a message to yourself.' });
  }

  try {
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: parseInt(receiverId),
        content,
        isRead: false
      }
    });

    // Create a real-time notification
    await prisma.notification.create({
      data: {
        userId: parseInt(receiverId),
        title: 'New Chat Message',
        message: content.length > 50 ? content.substring(0, 50) + '...' : content,
        type: 'CHAT'
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
