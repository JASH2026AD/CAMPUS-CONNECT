const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../services/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeyforcampusconnect123!';

// helper to validate edu email
const isCollegeEmail = (email) => {
  const domain = email.split('@')[1];
  return domain && (domain.endsWith('.edu') || domain === 'college.edu');
};

// Register
router.post('/register', async (req, res) => {
  const { email, password, name, major, graduationYear } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required.' });
  }

  if (!isCollegeEmail(email)) {
    return res.status(400).json({ error: 'Only verified college emails (.edu) are allowed to register.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user and profile in a transaction
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        verificationCode,
        isVerified: false,
        profile: {
          create: {
            name,
            major: major || '',
            graduationYear: graduationYear ? parseInt(graduationYear) : null,
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
            trustScore: 100.0,
            reputationScore: 10
          }
        }
      },
      include: {
        profile: true
      }
    });

    console.log(`\n======================================================`);
    console.log(`EMAIL VERIFICATION CODE FOR ${email}: [ ${verificationCode} ]`);
    console.log(`======================================================\n`);

    res.status(201).json({
      message: 'Registration successful. Verification code generated.',
      userId: newUser.id,
      email: newUser.email,
      // We return code in response for testing/mocking convenience, alongside server log
      verificationCode: verificationCode 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Something went wrong during registration.' });
  }
});

// Verify Email
router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationCode: null
      }
    });

    // Create an initial reputation entry
    await prisma.reputationScore.create({
      data: {
        userId: user.id,
        score: 10,
        category: 'TRUST',
        details: 'Account creation & email verification bonus'
      }
    });

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Account email has not been verified yet.', email });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Forgot Password (Mock)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email.' });
    }

    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    });

    console.log(`\n======================================================`);
    console.log(`PASSWORD RESET LINK FOR ${email}: /reset-password?token=${resetToken}`);
    console.log(`======================================================\n`);

    res.json({
      message: 'Password reset link sent to your console.',
      resetToken // Return for UI testability
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get User Profile
router.get('/profile/:userId', authenticate, async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          include: {
            skills: true
          }
        },
        reputationScores: true,
        marketplaceItems: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Edit Profile
router.put('/profile', authenticate, async (req, res) => {
  const { name, bio, major, graduationYear, avatar, skills } = req.body;
  const userId = req.user.id;

  try {
    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        name,
        bio,
        major,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        avatar
      }
    });

    // If skills are provided, sync them
    if (Array.isArray(skills)) {
      // Clear old skills
      await prisma.skill.deleteMany({ where: { profileId: updatedProfile.id } });
      
      // Create new skills
      if (skills.length > 0) {
        await prisma.skill.createMany({
          data: skills.map(s => ({
            profileId: updatedProfile.id,
            name: s.name,
            type: s.type // 'OFFERED' or 'WANTED'
          }))
        });
      }
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: { skills: true }
        }
      }
    });

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: fullUser.id,
        email: fullUser.email,
        role: fullUser.role,
        profile: fullUser.profile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
