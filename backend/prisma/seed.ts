import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  console.log('Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@cricket.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Super Admin created:', superAdmin.email);

  const tournamentAdmin = await prisma.user.create({
    data: {
      email: 'tournament@cricket.com',
      password: hashedPassword,
      name: 'Tournament Admin',
      role: 'TOURNAMENT_ADMIN',
    },
  });

  const teamOwner1 = await prisma.user.create({
    data: {
      email: 'owner1@cricket.com',
      password: hashedPassword,
      name: 'Team Owner 1',
      role: 'TEAM_OWNER',
    },
  });

  const teamOwner2 = await prisma.user.create({
    data: {
      email: 'owner2@cricket.com',
      password: hashedPassword,
      name: 'Team Owner 2',
      role: 'TEAM_OWNER',
    },
  });

  const scorer = await prisma.user.create({
    data: {
      email: 'scorer@cricket.com',
      password: hashedPassword,
      name: 'Match Scorer',
      role: 'SCORER',
    },
  });
  console.log('✅ Scorer created:', scorer.email);

  console.log('✅ Users created');

  // Create teams
  console.log('Creating teams...');
  const team1 = await prisma.team.create({
    data: {
      name: 'Mumbai Strikers',
      shortName: 'MS',
      logoUrl: 'https://via.placeholder.com/150',
      primaryColor: '#1E40AF',
      budget: 10000000,
      ownerId: teamOwner1.id,
    },
  });

  await prisma.teamStats.create({
    data: { teamId: team1.id },
  });

  const team2 = await prisma.team.create({
    data: {
      name: 'Delhi Warriors',
      shortName: 'DW',
      logoUrl: 'https://via.placeholder.com/150',
      primaryColor: '#DC2626',
      budget: 10000000,
      ownerId: teamOwner2.id,
    },
  });

  await prisma.teamStats.create({
    data: { teamId: team2.id },
  });

  const team3 = await prisma.team.create({
    data: {
      name: 'Bangalore Champions',
      shortName: 'BC',
      logoUrl: 'https://via.placeholder.com/150',
      primaryColor: '#059669',
      budget: 10000000,
      ownerId: teamOwner1.id,
    },
  });

  await prisma.teamStats.create({
    data: { teamId: team3.id },
  });

  const team4 = await prisma.team.create({
    data: {
      name: 'Chennai Kings',
      shortName: 'CK',
      logoUrl: 'https://via.placeholder.com/150',
      primaryColor: '#F59E0B',
      budget: 10000000,
      ownerId: teamOwner2.id,
    },
  });

  await prisma.teamStats.create({
    data: { teamId: team4.id },
  });

  console.log('✅ Teams created');

  // Create players
  console.log('Creating players...');
  const players = [
    // Batsmen
    {
      name: 'Virat Sharma',
      role: 'BATSMAN',
      age: 28,
      nationality: 'India',
      basePrice: 2000000,
      totalMatches: 120,
      totalRuns: 4500,
      battingAverage: 45.5,
      strikeRate: 135.2,
      highestScore: 103,
    },
    {
      name: 'Rohit Patel',
      role: 'BATSMAN',
      age: 30,
      nationality: 'India',
      basePrice: 1800000,
      totalMatches: 95,
      totalRuns: 3800,
      battingAverage: 42.1,
      strikeRate: 128.5,
      highestScore: 98,
    },
    {
      name: 'Steve Smith Jr',
      role: 'BATSMAN',
      age: 29,
      nationality: 'Australia',
      basePrice: 2200000,
      totalMatches: 110,
      totalRuns: 4200,
      battingAverage: 48.3,
      strikeRate: 125.8,
      highestScore: 112,
    },
    {
      name: 'Kane Brown',
      role: 'BATSMAN',
      age: 31,
      nationality: 'New Zealand',
      basePrice: 1900000,
      totalMatches: 100,
      totalRuns: 3900,
      battingAverage: 43.8,
      strikeRate: 122.3,
      highestScore: 95,
    },
    // Bowlers
    {
      name: 'Jasprit Singh',
      role: 'BOWLER',
      age: 26,
      nationality: 'India',
      basePrice: 1500000,
      totalMatches: 85,
      totalWickets: 110,
      bowlingAverage: 22.5,
      economyRate: 7.2,
    },
    {
      name: 'Pat Cummins',
      role: 'BOWLER',
      age: 28,
      nationality: 'Australia',
      basePrice: 1700000,
      totalMatches: 75,
      totalWickets: 95,
      bowlingAverage: 24.1,
      economyRate: 7.8,
    },
    {
      name: 'Trent Boult',
      role: 'BOWLER',
      age: 32,
      nationality: 'New Zealand',
      basePrice: 1600000,
      totalMatches: 90,
      totalWickets: 105,
      bowlingAverage: 23.2,
      economyRate: 7.5,
    },
    {
      name: 'Rashid Khan',
      role: 'BOWLER',
      age: 25,
      nationality: 'Afghanistan',
      basePrice: 1800000,
      totalMatches: 80,
      totalWickets: 98,
      bowlingAverage: 21.8,
      economyRate: 6.9,
    },
    // All-rounders
    {
      name: 'Ben Stokes',
      role: 'ALL_ROUNDER',
      age: 30,
      nationality: 'England',
      basePrice: 2500000,
      totalMatches: 95,
      totalRuns: 2800,
      totalWickets: 72,
      battingAverage: 38.5,
      strikeRate: 142.3,
      bowlingAverage: 28.5,
      economyRate: 8.2,
    },
    {
      name: 'Hardik Pandya',
      role: 'ALL_ROUNDER',
      age: 28,
      nationality: 'India',
      basePrice: 2300000,
      totalMatches: 88,
      totalRuns: 2500,
      totalWickets: 65,
      battingAverage: 35.2,
      strikeRate: 148.5,
      bowlingAverage: 30.1,
      economyRate: 8.5,
    },
    {
      name: 'Andre Russell',
      role: 'ALL_ROUNDER',
      age: 33,
      nationality: 'West Indies',
      basePrice: 2400000,
      totalMatches: 100,
      totalRuns: 3100,
      totalWickets: 78,
      battingAverage: 36.8,
      strikeRate: 175.2,
      bowlingAverage: 27.3,
      economyRate: 9.1,
    },
    // Wicketkeepers
    {
      name: 'MS Dhoni Jr',
      role: 'WICKETKEEPER',
      age: 27,
      nationality: 'India',
      basePrice: 2100000,
      totalMatches: 105,
      totalRuns: 3400,
      battingAverage: 40.5,
      strikeRate: 132.8,
      highestScore: 92,
    },
    {
      name: 'Quinton de Kock',
      role: 'WICKETKEEPER',
      age: 29,
      nationality: 'South Africa',
      basePrice: 1900000,
      totalMatches: 92,
      totalRuns: 3200,
      battingAverage: 38.2,
      strikeRate: 128.3,
      highestScore: 108,
    },
  ];

  const createdPlayers = [];
  for (const playerData of players) {
    const player = await prisma.player.create({
      data: playerData as any,
    });
    createdPlayers.push(player);
  }

  console.log('✅ Players created');

  // Assign some players to teams
  console.log('Creating player contracts...');
  await prisma.contract.create({
    data: {
      playerId: createdPlayers[0].id,
      teamId: team1.id,
      amount: 2000000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.contract.create({
    data: {
      playerId: createdPlayers[4].id,
      teamId: team1.id,
      amount: 1500000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.contract.create({
    data: {
      playerId: createdPlayers[8].id,
      teamId: team1.id,
      amount: 2500000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.contract.create({
    data: {
      playerId: createdPlayers[1].id,
      teamId: team2.id,
      amount: 1800000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.contract.create({
    data: {
      playerId: createdPlayers[5].id,
      teamId: team2.id,
      amount: 1700000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.contract.create({
    data: {
      playerId: createdPlayers[9].id,
      teamId: team2.id,
      amount: 2300000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Player contracts created');

  // Create tournament
  console.log('Creating tournament...');
  const tournament = await prisma.tournament.create({
    data: {
      name: 'Premier Cricket League 2026',
      format: 'T20',
      type: 'LEAGUE',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-05-31'),
      prizePool: 50000000,
      description: 'The biggest T20 cricket tournament of the year',
      adminId: tournamentAdmin.id,
    },
  });

  console.log('✅ Tournament created');

  // Add teams to tournament
  console.log('Adding teams to tournament...');
  await prisma.tournamentTeam.create({
    data: {
      tournamentId: tournament.id,
      teamId: team1.id,
    },
  });

  await prisma.tournamentTeam.create({
    data: {
      tournamentId: tournament.id,
      teamId: team2.id,
    },
  });

  await prisma.tournamentTeam.create({
    data: {
      tournamentId: tournament.id,
      teamId: team3.id,
    },
  });

  await prisma.tournamentTeam.create({
    data: {
      tournamentId: tournament.id,
      teamId: team4.id,
    },
  });

  // Create points table entries
  await prisma.pointsTable.create({
    data: {
      tournamentId: tournament.id,
      teamId: team1.id,
      played: 2,
      won: 2,
      points: 4,
      netRunRate: 0.85,
      runsScored: 350,
      runsConceded: 320,
      oversPlayed: 40,
      oversFaced: 40,
    },
  });

  await prisma.pointsTable.create({
    data: {
      tournamentId: tournament.id,
      teamId: team2.id,
      played: 2,
      won: 1,
      lost: 1,
      points: 2,
      netRunRate: -0.25,
      runsScored: 330,
      runsConceded: 340,
      oversPlayed: 40,
      oversFaced: 40,
    },
  });

  await prisma.pointsTable.create({
    data: {
      tournamentId: tournament.id,
      teamId: team3.id,
      played: 1,
      won: 0,
      lost: 1,
      points: 0,
      netRunRate: -0.45,
      runsScored: 145,
      runsConceded: 165,
      oversPlayed: 20,
      oversFaced: 20,
    },
  });

  await prisma.pointsTable.create({
    data: {
      tournamentId: tournament.id,
      teamId: team4.id,
      played: 1,
      won: 0,
      lost: 1,
      points: 0,
      netRunRate: -0.65,
      runsScored: 140,
      runsConceded: 170,
      oversPlayed: 20,
      oversFaced: 20,
    },
  });

  console.log('✅ Teams added to tournament');

  // Create a completed match with sample data
  console.log('Creating sample match...');
  const match = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      homeTeamId: team1.id,
      awayTeamId: team2.id,
      venue: 'Wankhede Stadium',
      matchDate: new Date('2026-03-15'),
      status: 'COMPLETED',
      tossWinnerId: team1.id,
      tossDecision: 'bat',
      winnerId: team1.id,
      winMargin: '15 runs',
      resultText: 'Mumbai Strikers won by 15 runs',
      manOfMatch: createdPlayers[0].id,
    },
  });

  await prisma.matchAnalytics.create({
    data: {
      matchId: match.id,
      powerplayRuns1: 48,
      powerplayWickets1: 1,
      powerplayRuns2: 42,
      powerplayWickets2: 2,
      deathOversRuns1: 72,
      deathOversWickets1: 3,
      deathOversRuns2: 65,
      deathOversWickets2: 4,
    },
  });

  // First innings
  const innings1 = await prisma.innings.create({
    data: {
      matchId: match.id,
      battingTeamId: team1.id,
      bowlingTeamId: team2.id,
      inningsNumber: 1,
      status: 'COMPLETED',
      totalRuns: 175,
      totalWickets: 6,
      totalOvers: 20.0,
      extras: 8,
    },
  });

  // Batting performances for innings 1
  await prisma.battingPerformance.create({
    data: {
      inningsId: innings1.id,
      playerId: createdPlayers[0].id,
      teamId: team1.id,
      runs: 65,
      ballsFaced: 42,
      fours: 6,
      sixes: 3,
      strikeRate: 154.76,
      isOut: true,
      dismissal: 'CAUGHT',
    },
  });

  await prisma.battingPerformance.create({
    data: {
      inningsId: innings1.id,
      playerId: createdPlayers[8].id,
      teamId: team1.id,
      runs: 48,
      ballsFaced: 32,
      fours: 4,
      sixes: 2,
      strikeRate: 150.0,
      isOut: true,
      dismissal: 'BOWLED',
    },
  });

  // Bowling performances for innings 1
  await prisma.bowlingPerformance.create({
    data: {
      inningsId: innings1.id,
      playerId: createdPlayers[5].id,
      teamId: team2.id,
      oversBowled: 4.0,
      runsConceded: 32,
      wickets: 2,
      maidens: 0,
      economyRate: 8.0,
    },
  });

  await prisma.bowlingPerformance.create({
    data: {
      inningsId: innings1.id,
      playerId: createdPlayers[9].id,
      teamId: team2.id,
      oversBowled: 4.0,
      runsConceded: 35,
      wickets: 1,
      maidens: 0,
      economyRate: 8.75,
    },
  });

  // Second innings
  const innings2 = await prisma.innings.create({
    data: {
      matchId: match.id,
      battingTeamId: team2.id,
      bowlingTeamId: team1.id,
      inningsNumber: 2,
      status: 'COMPLETED',
      totalRuns: 160,
      totalWickets: 9,
      totalOvers: 20.0,
      extras: 12,
    },
  });

  // Batting performances for innings 2
  await prisma.battingPerformance.create({
    data: {
      inningsId: innings2.id,
      playerId: createdPlayers[1].id,
      teamId: team2.id,
      runs: 52,
      ballsFaced: 38,
      fours: 5,
      sixes: 2,
      strikeRate: 136.84,
      isOut: true,
      dismissal: 'CAUGHT',
    },
  });

  await prisma.battingPerformance.create({
    data: {
      inningsId: innings2.id,
      playerId: createdPlayers[9].id,
      teamId: team2.id,
      runs: 38,
      ballsFaced: 28,
      fours: 3,
      sixes: 1,
      strikeRate: 135.71,
      isOut: true,
      dismissal: 'LBW',
    },
  });

  // Bowling performances for innings 2
  await prisma.bowlingPerformance.create({
    data: {
      inningsId: innings2.id,
      playerId: createdPlayers[4].id,
      teamId: team1.id,
      oversBowled: 4.0,
      runsConceded: 28,
      wickets: 3,
      maidens: 0,
      economyRate: 7.0,
    },
  });

  await prisma.bowlingPerformance.create({
    data: {
      inningsId: innings2.id,
      playerId: createdPlayers[8].id,
      teamId: team1.id,
      oversBowled: 3.0,
      runsConceded: 24,
      wickets: 2,
      maidens: 0,
      economyRate: 8.0,
    },
  });

  console.log('✅ Sample match created');

  // Create a live match
  console.log('Creating live match...');
  const liveMatch = await prisma.match.create({
    data: {
      tournamentId: tournament.id,
      homeTeamId: team3.id,
      awayTeamId: team4.id,
      venue: 'M. Chinnaswamy Stadium',
      matchDate: new Date(),
      status: 'LIVE',
      tossWinnerId: team3.id,
      tossDecision: 'bat',
    },
  });

  await prisma.matchAnalytics.create({
    data: {
      matchId: liveMatch.id,
    },
  });

  const liveInnings = await prisma.innings.create({
    data: {
      matchId: liveMatch.id,
      battingTeamId: team3.id,
      bowlingTeamId: team4.id,
      inningsNumber: 1,
      status: 'IN_PROGRESS',
      totalRuns: 45,
      totalWickets: 2,
      totalOvers: 6.3,
      extras: 3,
    },
  });
  console.log('✅ Live innings created:', liveInnings.id);

  console.log('✅ Live match created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${5} users created`);
  console.log(`   - ${4} teams created`);
  console.log(`   - ${createdPlayers.length} players created`);
  console.log(`   - ${1} tournament created`);
  console.log(`   - ${2} matches created (1 completed, 1 live)`);
  console.log('\n🔑 Test Credentials:');
  console.log('   Admin: admin@cricket.com / password123');
  console.log('   Tournament Admin: tournament@cricket.com / password123');
  console.log('   Team Owner: owner1@cricket.com / password123');
  console.log('   Scorer: scorer@cricket.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
