const express = require('express');

const authRouter = require('./auth');
const skillsRouter = require('./skills');
const marketplaceRouter = require('./marketplace');
const lostFoundRouter = require('./lostfound');
const chatRouter = require('./chat');
const notificationsRouter = require('./notifications');
const adminRouter = require('./admin');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/skills', skillsRouter);
router.use('/marketplace', marketplaceRouter);
router.use('/lostfound', lostFoundRouter);
router.use('/chat', chatRouter);
router.use('/notifications', notificationsRouter);
router.use('/admin', adminRouter);

module.exports = router;
