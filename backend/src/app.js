require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes');
const prisma = require('./services/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for local development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusConnect backend is running.' });
});

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Startup Check & Server Launch
const server = app.listen(PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`🚀 CampusConnect Backend Server listening on port ${PORT}`);
  console.log(`👉 API Endpoint: http://localhost:${PORT}/api`);
  console.log(`======================================================\n`);

  // Verify DB connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully via Prisma.');
  } catch (dbError) {
    console.error('❌ Database connection failed. Please ensure your MySQL database is running and DATABASE_URL in .env is correct.');
    console.log('Note: Prisma is running in compiled mode and requires a valid database configuration to respond to query routes.\n');
  }

  // Check Gemini Key
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  Warning: GEMINI_API_KEY is not defined in .env. Review analysis will fall back to local rule-based evaluations.');
  } else {
    console.log('✅ GEMINI_API_KEY is loaded. Live Gemini AI review analysis is active.');
  }
});
