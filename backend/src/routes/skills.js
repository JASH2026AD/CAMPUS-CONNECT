const express = require('express');
const prisma = require('../services/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Search students by skill name or major
router.get('/search', authenticate, async (req, res) => {
  const { query, type } = req.query; // type: 'OFFERED' or 'WANTED'

  try {
    const profiles = await prisma.profile.findMany({
      where: {
        OR: [
          {
            skills: {
              some: {
                name: { contains: query },
                ...(type ? { type } : {})
              }
            }
          },
          { name: { contains: query } },
          { major: { contains: query } }
        ]
      },
      include: {
        skills: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    res.json(profiles);
  } catch (error) {
    console.error('Skill search error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Send skill request
router.post('/request', authenticate, async (req, res) => {
  const { receiverId, skillName, message } = req.body;
  const senderId = req.user.id;

  if (receiverId === senderId) {
    return res.status(400).json({ error: 'You cannot send a skill exchange request to yourself.' });
  }

  try {
    const request = await prisma.skillRequest.create({
      data: {
        senderId,
        receiverId,
        skillName,
        message,
        status: 'PENDING'
      },
      include: {
        sender: { select: { profile: true } },
        receiver: { select: { profile: true } }
      }
    });

    // Create Notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: 'New Skill Exchange Request',
        message: `${request.sender.profile?.name || 'A student'} wants to exchange skills: "${skillName}".`,
        type: 'SKILL'
      }
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Create skill request error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Accept/Reject request
router.put('/request/:requestId', authenticate, async (req, res) => {
  const { status } = req.body; // 'ACCEPTED' or 'REJECTED'
  const requestId = parseInt(req.params.requestId);
  const userId = req.user.id;

  if (!['ACCEPTED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status update.' });
  }

  try {
    const skillReq = await prisma.skillRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: { select: { profile: true } },
        receiver: { select: { profile: true } }
      }
    });

    if (!skillReq) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    if (skillReq.receiverId !== userId) {
      return res.status(403).json({ error: 'Not authorized to respond to this request.' });
    }

    const updatedRequest = await prisma.skillRequest.update({
      where: { id: requestId },
      data: { status }
    });

    // Notify sender
    await prisma.notification.create({
      data: {
        userId: skillReq.senderId,
        title: `Skill Request ${status === 'ACCEPTED' ? 'Accepted' : 'Rejected'}`,
        message: `${skillReq.receiver.profile?.name || 'A student'} has ${status.toLowerCase()} your skill request for "${skillReq.skillName}".`,
        type: 'SKILL'
      }
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Update skill request error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Schedule skill session
router.post('/session', authenticate, async (req, res) => {
  const { requestId, scheduledAt } = req.body;

  try {
    const skillReq = await prisma.skillRequest.findUnique({
      where: { id: requestId }
    });

    if (!skillReq) {
      return res.status(404).json({ error: 'Skill request not found.' });
    }

    if (skillReq.senderId !== req.user.id && skillReq.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to schedule for this request.' });
    }

    const session = await prisma.skillSession.create({
      data: {
        requestId,
        scheduledAt: new Date(scheduledAt),
        status: 'SCHEDULED'
      }
    });

    const otherUser = skillReq.senderId === req.user.id ? skillReq.receiverId : skillReq.senderId;
    await prisma.notification.create({
      data: {
        userId: otherUser,
        title: 'Skill Session Scheduled',
        message: `A new session has been scheduled for your skill exchange on ${new Date(scheduledAt).toLocaleString()}.`,
        type: 'SKILL'
      }
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Schedule session error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Rate / complete skill session
router.put('/session/:sessionId/complete', authenticate, async (req, res) => {
  const sessionId = parseInt(req.params.sessionId);
  const { rating, review } = req.body; // rating: float, review: string
  const userId = req.user.id;

  try {
    const session = await prisma.skillSession.findUnique({
      where: { id: sessionId },
      include: {
        request: true
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    const isSender = session.request.senderId === userId;
    const isReceiver = session.request.receiverId === userId;

    if (!isSender && !isReceiver) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    let updateData = {};
    if (isSender) {
      updateData.ratingToReceiver = parseFloat(rating);
      updateData.reviewToReceiver = review;
    } else {
      updateData.ratingToSender = parseFloat(rating);
      updateData.reviewToSender = review;
    }

    // Check if both rated, then set to COMPLETED
    const checkSession = await prisma.skillSession.findUnique({
      where: { id: sessionId }
    });

    const isComplete = (isSender && checkSession.ratingToSender !== null) || 
                       (isReceiver && checkSession.ratingToReceiver !== null);

    if (isComplete || (checkSession.ratingToSender !== null && checkSession.ratingToReceiver !== null)) {
      updateData.status = 'COMPLETED';
    }

    const updatedSession = await prisma.skillSession.update({
      where: { id: sessionId },
      data: updateData
    });

    // Update the other user's skill rating and reputation score
    const targetUserId = isSender ? session.request.receiverId : session.request.senderId;
    
    // Fetch all ratings for that user
    const senderSessions = await prisma.skillSession.findMany({
      where: {
        request: { senderId: targetUserId },
        ratingToSender: { not: null }
      }
    });

    const receiverSessions = await prisma.skillSession.findMany({
      where: {
        request: { receiverId: targetUserId },
        ratingToReceiver: { not: null }
      }
    });

    const allRatings = [
      ...senderSessions.map(s => s.ratingToSender),
      ...receiverSessions.map(s => s.ratingToReceiver)
    ];

    if (isSender) allRatings.push(parseFloat(rating)); // add current rating

    const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;

    // Update Profile and reputation
    await prisma.profile.update({
      where: { userId: targetUserId },
      data: {
        skillRating: avgRating,
        successfulExchanges: { increment: updateData.status === 'COMPLETED' ? 1 : 0 },
        reputationScore: { increment: 15 } // exchange boost
      }
    });

    await prisma.reputationScore.create({
      data: {
        userId: targetUserId,
        score: 15,
        category: 'SKILL',
        details: `Received rating ${rating} on exchange`
      }
    });

    res.json(updatedSession);
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get user skill requests & session history
router.get('/history', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const requests = await prisma.skillRequest.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      include: {
        sender: {
          select: { id: true, email: true, profile: true }
        },
        receiver: {
          select: { id: true, email: true, profile: true }
        },
        sessions: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
