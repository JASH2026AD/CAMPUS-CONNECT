const express = require('express');
const prisma = require('../services/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get admin stats / dashboard analytics
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const studentUsers = await prisma.user.count({ where: { role: 'STUDENT' } });
    const adminUsers = await prisma.user.count({ where: { role: 'ADMIN' } });
    
    const totalMarketplaceItems = await prisma.marketplaceItem.count();
    const availableItems = await prisma.marketplaceItem.count({ where: { status: 'AVAILABLE' } });
    const soldItems = await prisma.marketplaceItem.count({ where: { status: 'SOLD' } });
    
    const totalLostItems = await prisma.lostItem.count();
    const totalFoundItems = await prisma.foundItem.count();
    const totalClaims = await prisma.claim.count();
    const pendingClaims = await prisma.claim.count({ where: { status: 'PENDING' } });
    
    const totalReports = await prisma.report.count();
    const pendingReports = await prisma.report.count({ where: { status: 'PENDING' } });
    
    const totalSkillRequests = await prisma.skillRequest.count();
    const completedSessions = await prisma.skillSession.count({ where: { status: 'COMPLETED' } });

    res.json({
      users: { total: totalUsers, students: studentUsers, admins: adminUsers },
      marketplace: { total: totalMarketplaceItems, available: availableItems, sold: soldItems },
      lostFound: { lost: totalLostItems, found: totalFoundItems, claims: totalClaims, pendingClaims },
      reports: { total: totalReports, pending: pendingReports },
      skills: { requests: totalSkillRequests, completedSessions }
    });
  } catch (error) {
    console.error('Fetch admin stats error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Manage users - list all users
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Manage users - delete user
router.delete('/users/:userId', authenticate, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ error: 'Cannot delete admin accounts.' });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Moderate reports - list all reports
router.get('/reports', authenticate, requireAdmin, async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { email: true, profile: true } },
        reportedUser: { select: { email: true, profile: true } },
        marketplaceItem: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Resolve a report (update status / optionally remove item)
router.put('/reports/:reportId/resolve', authenticate, requireAdmin, async (req, res) => {
  const reportId = parseInt(req.params.reportId);
  const { action } = req.body; // 'RESOLVE' or 'DELETE_ITEM'

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { marketplaceItem: true }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    if (action === 'DELETE_ITEM' && report.marketplaceItemId) {
      // Delete the marketplace item
      await prisma.marketplaceItem.delete({
        where: { id: report.marketplaceItemId }
      });

      // Reduce reported user trust score for spam/violation
      if (report.reportedUserId) {
        await prisma.profile.update({
          where: { userId: report.reportedUserId },
          data: {
            trustScore: { decrement: 20 },
            reputationScore: { decrement: 50 }
          }
        });

        await prisma.reputationScore.create({
          data: {
            userId: report.reportedUserId,
            score: -50,
            category: 'TRUST',
            details: 'Item removed by Admin due to reports'
          }
        });
      }
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { status: 'RESOLVED' }
    });

    res.json(updatedReport);
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
