const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clean existing data to avoid duplication errors on consecutive runs
  // Delete in reverse order of foreign keys
  await prisma.reputationScore.deleteMany({});
  await prisma.claim.deleteMany({});
  await prisma.lostItem.deleteMany({});
  await prisma.foundItem.deleteMany({});
  await prisma.itemReview.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.itemImage.deleteMany({});
  await prisma.marketplaceItem.deleteMany({});
  await prisma.skillSession.deleteMany({});
  await prisma.skillRequest.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.user.deleteMany({});

  // Hashed password
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Seed Users & Profiles
  // Student 1
  const student1 = await prisma.user.create({
    data: {
      email: 'alice@college.edu',
      password: hashedPassword,
      role: 'STUDENT',
      isVerified: true,
      profile: {
        create: {
          name: 'Alice Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          bio: 'CS Junior. Love trading tech gear and sharing coding skills.',
          major: 'Computer Science',
          graduationYear: 2027,
          marketplaceRating: 4.8,
          skillRating: 4.9,
          trustScore: 98.0,
          successfulExchanges: 5,
          itemsReturned: 2,
          reputationScore: 120,
          skills: {
            create: [
              { name: 'React.js', type: 'OFFERED' },
              { name: 'Python', type: 'OFFERED' },
              { name: 'UI Design', type: 'WANTED' }
            ]
          }
        }
      }
    }
  });

  // Student 2
  const student2 = await prisma.user.create({
    data: {
      email: 'bob@college.edu',
      password: hashedPassword,
      role: 'STUDENT',
      isVerified: true,
      profile: {
        create: {
          name: 'Bob Smith',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          bio: 'Electrical Engineering sophomore. Always repairing devices.',
          major: 'Electrical Engineering',
          graduationYear: 2028,
          marketplaceRating: 4.5,
          skillRating: 4.7,
          trustScore: 95.0,
          successfulExchanges: 3,
          itemsReturned: 1,
          reputationScore: 85,
          skills: {
            create: [
              { name: 'Hardware Repair', type: 'OFFERED' },
              { name: 'C++', type: 'OFFERED' },
              { name: 'React.js', type: 'WANTED' }
            ]
          }
        }
      }
    }
  });

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@college.edu',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      profile: {
        create: {
          name: 'CampusConnect Admin',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          bio: 'Campus administrator and moderation team lead.',
          major: 'Administration',
          graduationYear: 2026,
          marketplaceRating: 5.0,
          skillRating: 5.0,
          trustScore: 100.0,
          successfulExchanges: 0,
          itemsReturned: 0,
          reputationScore: 500,
        }
      }
    }
  });

  // Seed Marketplace Items
  const item1 = await prisma.marketplaceItem.create({
    data: {
      sellerId: student1.id,
      title: 'Cracking the Coding Interview - 6th Edition',
      description: 'Barely used book, no highlighting or dog ears. Essential for software engineering internship preparation.',
      price: 25.0,
      category: 'BOOKS',
      status: 'AVAILABLE',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400' }
        ]
      }
    }
  });

  const item2 = await prisma.marketplaceItem.create({
    data: {
      sellerId: student2.id,
      title: 'Scientific Calculator TI-84 Plus',
      description: 'Graphing calculator in great condition. Required for most calculus and physics classes.',
      price: 50.0,
      category: 'ELECTRONICS',
      status: 'AVAILABLE',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1594818855745-f600a0944062?w=400' }
        ]
      }
    }
  });

  // Seed Lost and Found
  await prisma.lostItem.create({
    data: {
      reporterId: student1.id,
      title: 'Black Leather Wallet',
      description: 'Lost my wallet near the library. It contains a student ID for Alice Johnson.',
      category: 'Others',
      location: 'Main Library - 2nd Floor',
      lostAt: new Date(),
      status: 'LOST',
      verificationQuestion: 'What color is the inner lining of the wallet and what is the last digit of the student ID?'
    }
  });

  await prisma.foundItem.create({
    data: {
      reporterId: student2.id,
      title: 'Apple AirPods Case',
      description: 'Found a white AirPods charging case on a bench near the Campus Center green.',
      category: 'Electronics',
      location: 'Campus Center Lawn',
      foundAt: new Date(),
      status: 'FOUND',
      verificationQuestion: 'Does the case have any engraving or protective sleeve, and what color is it?'
    }
  });

  // Reputation Scores
  await prisma.reputationScore.createMany({
    data: [
      { userId: student1.id, score: 50, category: 'MARKETPLACE', details: 'Positive rating on sales' },
      { userId: student1.id, score: 50, category: 'SKILL', details: 'Successful React teaching session' },
      { userId: student1.id, score: 20, category: 'TRUST', details: 'Returned a lost textbook to owner' },
      { userId: student2.id, score: 30, category: 'MARKETPLACE', details: 'Sold calculator successfully' },
      { userId: student2.id, score: 45, category: 'SKILL', details: 'Helped 3 students with hardware repair' },
      { userId: student2.id, score: 10, category: 'TRUST', details: 'Reported found AirPods case' }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
