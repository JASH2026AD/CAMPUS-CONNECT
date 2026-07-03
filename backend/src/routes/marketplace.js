const express = require('express');
const prisma = require('../services/db');
const { authenticate } = require('../middleware/auth');
const { analyzeReview } = require('../services/gemini');

const router = express.Router();

// Get all marketplace items (with search, category, and seller details)
router.get('/', authenticate, async (req, res) => {
  const { category, query, sellerId, minPrice, maxPrice } = req.query;

  try {
    const items = await prisma.marketplaceItem.findMany({
      where: {
        status: 'AVAILABLE',
        ...(category && category !== 'All' ? { category } : {}),
        ...(sellerId ? { sellerId: parseInt(sellerId) } : {}),
        ...(query ? {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } }
          ]
        } : {}),
        price: {
          gte: minPrice ? parseFloat(minPrice) : 0,
          lte: maxPrice ? parseFloat(maxPrice) : 999999
        }
      },
      include: {
        images: true,
        seller: {
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
    console.error('Fetch marketplace items error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get marketplace item details by ID (including reviews)
router.get('/:itemId', authenticate, async (req, res) => {
  const itemId = parseInt(req.params.itemId);

  try {
    const item = await prisma.marketplaceItem.findUnique({
      where: { id: itemId },
      include: {
        images: true,
        seller: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                profile: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Marketplace item not found.' });
    }

    res.json(item);
  } catch (error) {
    console.error('Fetch marketplace item details error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Create product listing
router.post('/', authenticate, async (req, res) => {
  const { title, description, price, category, images } = req.body;
  const sellerId = req.user.id;

  if (!title || !description || !price || !category) {
    return res.status(400).json({ error: 'Title, description, price, and category are required.' });
  }

  try {
    const item = await prisma.marketplaceItem.create({
      data: {
        sellerId,
        title,
        description,
        price: parseFloat(price),
        category,
        status: 'AVAILABLE',
        images: {
          create: Array.isArray(images) && images.length > 0
            ? images.map(url => ({ url }))
            : [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' }] // default
        }
      },
      include: {
        images: true
      }
    });

    // Update reputation score for posting listing
    await prisma.profile.update({
      where: { userId: sellerId },
      data: { reputationScore: { increment: 5 } }
    });

    await prisma.reputationScore.create({
      data: {
        userId: sellerId,
        score: 5,
        category: 'MARKETPLACE',
        details: `Created listing: ${title}`
      }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Create marketplace item error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Mark item as sold
router.put('/:itemId/sold', authenticate, async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const userId = req.user.id;

  try {
    const item = await prisma.marketplaceItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (item.sellerId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to modify this listing.' });
    }

    const updatedItem = await prisma.marketplaceItem.update({
      where: { id: itemId },
      data: { status: 'SOLD' }
    });

    // Award reputation points for completing a trade
    await prisma.profile.update({
      where: { userId: item.sellerId },
      data: {
        reputationScore: { increment: 20 },
        successfulExchanges: { increment: 1 }
      }
    });

    await prisma.reputationScore.create({
      data: {
        userId: item.sellerId,
        score: 20,
        category: 'MARKETPLACE',
        details: `Sold item: ${item.title}`
      }
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Mark item sold error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Wishlist toggle
router.post('/:itemId/wishlist', authenticate, async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const userId = req.user.id;

  try {
    const existing = await prisma.wishlist.findFirst({
      where: { userId, itemId }
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return res.json({ wishlisted: false, message: 'Removed from wishlist.' });
    } else {
      await prisma.wishlist.create({ data: { userId, itemId } });
      return res.json({ wishlisted: true, message: 'Added to wishlist.' });
    }
  } catch (error) {
    console.error('Wishlist error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get user wishlist
router.get('/user/wishlist', authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const list = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        item: {
          include: {
            images: true,
            seller: {
              select: {
                id: true,
                email: true,
                profile: true
              }
            }
          }
        }
      }
    });

    res.json(list.map(w => w.item));
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Add Item Review with AUTOMATIC AI ANALYSIS (Gemini Review Analyzer)
router.post('/:itemId/review', authenticate, async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const reviewerId = req.user.id;
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required.' });
  }

  try {
    const item = await prisma.marketplaceItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (item.sellerId === reviewerId) {
      return res.status(400).json({ error: 'You cannot review your own listing.' });
    }

    // Call Gemini review analyzer (has local mock fallback)
    console.log(`Analyzing review with Gemini: "${comment}"`);
    const aiAnalysis = await analyzeReview(comment);
    console.log('AI Analysis Results:', aiAnalysis);

    const review = await prisma.itemReview.create({
      data: {
        reviewerId,
        itemId,
        rating: parseFloat(rating),
        comment,
        sentiment: aiAnalysis.sentiment,
        summary: aiAnalysis.summary,
        spamProbability: aiAnalysis.spamProbability,
        pros: Array.isArray(aiAnalysis.pros) ? aiAnalysis.pros.join(', ') : aiAnalysis.pros,
        cons: Array.isArray(aiAnalysis.cons) ? aiAnalysis.cons.join(', ') : aiAnalysis.cons,
        trustPercentage: parseFloat(aiAnalysis.trustPercentage || 100)
      }
    });

    // Update seller marketplace rating
    const allReviews = await prisma.itemReview.findMany({
      where: { item: { sellerId: item.sellerId } }
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    // Adjust trust score if spam is detected
    let trustPenalty = 0;
    if (aiAnalysis.spamProbability > 0.6) {
      trustPenalty = 15; // Penalty for suspect reviews
    }

    await prisma.profile.update({
      where: { userId: item.sellerId },
      data: {
        marketplaceRating: avgRating,
        trustScore: { decrement: trustPenalty }
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// File report on item
router.post('/:itemId/report', authenticate, async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const reporterId = req.user.id;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'Reason is required.' });
  }

  try {
    const item = await prisma.marketplaceItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedUserId: item.sellerId,
        marketplaceItemId: itemId,
        reason,
        status: 'PENDING'
      }
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Report item error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Standalone review analysis sandbox route
router.post('/analyze', authenticate, async (req, res) => {
  const { comment } = req.body;
  if (!comment) {
    return res.status(400).json({ error: 'Comment text is required for analysis.' });
  }

  try {
    console.log(`Analyzing standalone review comment: "${comment}"`);
    const aiAnalysis = await analyzeReview(comment);
    res.json(aiAnalysis);
  } catch (error) {
    console.error('Standalone analysis error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
