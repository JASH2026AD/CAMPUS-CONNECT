const express = require('express');
const prisma = require('../services/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get lost items
router.get('/lost', authenticate, async (req, res) => {
  const { category, query, status } = req.query;

  try {
    const items = await prisma.lostItem.findMany({
      where: {
        status: status || 'LOST',
        ...(category && category !== 'All' ? { category } : {}),
        ...(query ? {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { location: { contains: query } }
          ]
        } : {})
      },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(items);
  } catch (error) {
    console.error('Fetch lost items error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get found items
router.get('/found', authenticate, async (req, res) => {
  const { category, query, status } = req.query;

  try {
    const items = await prisma.foundItem.findMany({
      where: {
        status: status || 'FOUND',
        ...(category && category !== 'All' ? { category } : {}),
        ...(query ? {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { location: { contains: query } }
          ]
        } : {})
      },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(items);
  } catch (error) {
    console.error('Fetch found items error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Report lost item
router.post('/lost', authenticate, async (req, res) => {
  const { title, description, category, location, lostAt, imageUrl, verificationQuestion } = req.body;
  const reporterId = req.user.id;

  if (!title || !description || !category || !location || !lostAt || !verificationQuestion) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const item = await prisma.lostItem.create({
      data: {
        reporterId,
        title,
        description,
        category,
        location,
        lostAt: new Date(lostAt),
        status: 'LOST',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=400',
        verificationQuestion
      }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Report lost item error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Report found item
router.post('/found', authenticate, async (req, res) => {
  const { title, description, category, location, foundAt, imageUrl, verificationQuestion } = req.body;
  const reporterId = req.user.id;

  if (!title || !description || !category || !location || !foundAt || !verificationQuestion) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const item = await prisma.foundItem.create({
      data: {
        reporterId,
        title,
        description,
        category,
        location,
        foundAt: new Date(foundAt),
        status: 'FOUND',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=400',
        verificationQuestion
      }
    });

    // Reward for reporting a found item
    await prisma.profile.update({
      where: { userId: reporterId },
      data: { reputationScore: { increment: 10 } }
    });

    await prisma.reputationScore.create({
      data: {
        userId: reporterId,
        score: 10,
        category: 'TRUST',
        details: `Reported found item: ${title}`
      }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Report found item error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Submit a claim
router.post('/claim', authenticate, async (req, res) => {
  const { itemId, itemType, answer } = req.body; // itemType: 'LOST' or 'FOUND'
  const claimerId = req.user.id;

  if (!itemId || !itemType || !answer) {
    return res.status(400).json({ error: 'Item ID, type, and verification answer are required.' });
  }

  try {
    let itemOwnerId;
    let title;

    if (itemType === 'LOST') {
      const item = await prisma.lostItem.findUnique({ where: { id: itemId } });
      if (!item) return res.status(404).json({ error: 'Lost item not found.' });
      itemOwnerId = item.reporterId;
      title = item.title;
    } else if (itemType === 'FOUND') {
      const item = await prisma.foundItem.findUnique({ where: { id: itemId } });
      if (!item) return res.status(404).json({ error: 'Found item not found.' });
      itemOwnerId = item.reporterId;
      title = item.title;
    } else {
      return res.status(400).json({ error: 'Invalid item type.' });
    }

    if (itemOwnerId === claimerId) {
      return res.status(400).json({ error: 'You cannot claim your own reported item.' });
    }

    const claim = await prisma.claim.create({
      data: {
        claimerId,
        answer,
        status: 'PENDING',
        ...(itemType === 'LOST' ? { lostItemId: itemId } : { foundItemId: itemId })
      },
      include: {
        claimer: { select: { profile: true } }
      }
    });

    // Notify item owner
    await prisma.notification.create({
      data: {
        userId: itemOwnerId,
        title: 'New Claim Received',
        message: `${claim.claimer.profile?.name || 'A student'} has filed a claim on your reported item: "${title}".`,
        type: 'LOST_FOUND'
      }
    });

    res.status(201).json(claim);
  } catch (error) {
    console.error('Submit claim error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Approve/Reject a claim
router.put('/claim/:claimId', authenticate, async (req, res) => {
  const claimId = parseInt(req.params.claimId);
  const { status } = req.body; // 'APPROVED' or 'REJECTED'
  const userId = req.user.id;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        lostItem: true,
        foundItem: true
      }
    });

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found.' });
    }

    const isLostReporter = claim.lostItem && claim.lostItem.reporterId === userId;
    const isFoundReporter = claim.foundItem && claim.foundItem.reporterId === userId;

    if (!isLostReporter && !isFoundReporter) {
      return res.status(403).json({ error: 'Not authorized to moderate this claim.' });
    }

    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: { status }
    });

    const itemTitle = claim.lostItem ? claim.lostItem.title : claim.foundItem.title;

    if (status === 'APPROVED') {
      // Mark item as claimed
      if (claim.lostItemId) {
        await prisma.lostItem.update({
          where: { id: claim.lostItemId },
          data: { status: 'CLAIMED' }
        });
      } else if (claim.foundItemId) {
        await prisma.foundItem.update({
          where: { id: claim.foundItemId },
          data: { status: 'CLAIMED' }
        });

        // Found item approved -> successful return!
        // Increment the reporter's itemsReturned
        await prisma.profile.update({
          where: { userId: claim.foundItem.reporterId },
          data: {
            itemsReturned: { increment: 1 },
            reputationScore: { increment: 30 } // heavy boost for returning items
          }
        });

        await prisma.reputationScore.create({
          data: {
            userId: claim.foundItem.reporterId,
            score: 30,
            category: 'RETURN_RATE',
            details: `Successfully returned found item: ${claim.foundItem.title}`
          }
        });
      }

      // Reject all other pending claims for this item
      if (claim.lostItemId) {
        await prisma.claim.updateMany({
          where: { lostItemId: claim.lostItemId, id: { not: claimId } },
          data: { status: 'REJECTED' }
        });
      } else if (claim.foundItemId) {
        await prisma.claim.updateMany({
          where: { foundItemId: claim.foundItemId, id: { not: claimId } },
          data: { status: 'REJECTED' }
        });
      }
    }

    // Notify claimer
    await prisma.notification.create({
      data: {
        userId: claim.claimerId,
        title: `Claim ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
        message: `Your claim on "${itemTitle}" has been ${status.toLowerCase()} by the reporter.`,
        type: 'LOST_FOUND'
      }
    });

    res.json(updatedClaim);
  } catch (error) {
    console.error('Moderate claim error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get user claims and claims filed on user's reports
router.get('/user/claims', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    // Claims filed by current user
    const myClaims = await prisma.claim.findMany({
      where: { claimerId: userId },
      include: {
        lostItem: { include: { reporter: { select: { profile: true } } } },
        foundItem: { include: { reporter: { select: { profile: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Claims received on items reported by current user
    const receivedClaims = await prisma.claim.findMany({
      where: {
        OR: [
          { lostItem: { reporterId: userId } },
          { foundItem: { reporterId: userId } }
        ]
      },
      include: {
        claimer: { select: { id: true, email: true, profile: true } },
        lostItem: true,
        foundItem: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ myClaims, receivedClaims });
  } catch (error) {
    console.error('Fetch user claims error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
