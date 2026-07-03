const express = require('express');
const prisma = require('../services/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get notifications
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const list = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(list);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  const notificationId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const notif = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notif || notif.userId !== userId) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    const updatedNotif = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    res.json(updatedNotif);
  } catch (error) {
    console.error('Read notification error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Mark all as read
router.put('/read-all', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Read all notifications error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
