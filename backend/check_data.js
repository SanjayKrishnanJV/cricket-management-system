const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const [users, teams, players, matches] = await Promise.all([
      prisma.user.count(),
      prisma.team.count(),
      prisma.player.count(),
      prisma.match.count(),
    ]);

    console.log('Database Record Counts:');
    console.log('======================');
    console.log('Users:', users);
    console.log('Teams:', teams);
    console.log('Players:', players);
    console.log('Matches:', matches);

    if (users === 0 && teams === 0 && players === 0 && matches === 0) {
      console.log('\n⚠️  WARNING: Database appears to be empty!');
    } else {
      console.log('\n✅ Data found in database');
    }
  } catch (error) {
    console.error('Error checking database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
