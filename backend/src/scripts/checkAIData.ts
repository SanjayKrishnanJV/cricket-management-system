import prisma from '../config/database';

/**
 * Diagnostic script to check what data is available for AI predictions
 */
async function checkAIData() {
  console.log('🔍 Checking AI Data Availability...\n');

  try {
    // Check matches
    const totalMatches = await prisma.match.count();
    const completedMatches = await prisma.match.count({
      where: { status: 'COMPLETED' }
    });
    const liveMatches = await prisma.match.count({
      where: { status: 'LIVE' }
    });
    const scheduledMatches = await prisma.match.count({
      where: { status: 'SCHEDULED' }
    });

    console.log('📊 MATCHES:');
    console.log(`  Total: ${totalMatches}`);
    console.log(`  Completed: ${completedMatches}`);
    console.log(`  Live: ${liveMatches}`);
    console.log(`  Scheduled: ${scheduledMatches}\n`);

    // Check players
    const totalPlayers = await prisma.player.count();
    console.log('👥 PLAYERS:');
    console.log(`  Total: ${totalPlayers}\n`);

    // Check batting stats
    const battingStats = await prisma.battingPerformance.count();
    const playersWithBattingStats = await prisma.player.count({
      where: {
        battingStats: {
          some: {}
        }
      }
    });

    console.log('🏏 BATTING STATS:');
    console.log(`  Total batting records: ${battingStats}`);
    console.log(`  Players with batting stats: ${playersWithBattingStats}\n`);

    // Check bowling stats
    const bowlingStats = await prisma.bowlingPerformance.count();
    const playersWithBowlingStats = await prisma.player.count({
      where: {
        bowlingStats: {
          some: {}
        }
      }
    });

    console.log('⚡ BOWLING STATS:');
    console.log(`  Total bowling records: ${bowlingStats}`);
    console.log(`  Players with bowling stats: ${playersWithBowlingStats}\n`);

    // Check innings
    const innings = await prisma.innings.count();
    console.log('📋 INNINGS:');
    console.log(`  Total innings: ${innings}\n`);

    // Sample a few players with their stats
    const samplePlayers = await prisma.player.findMany({
      take: 3,
      include: {
        _count: {
          select: {
            battingStats: true,
            bowlingStats: true,
          }
        }
      }
    });

    console.log('📝 SAMPLE PLAYERS:');
    samplePlayers.forEach(player => {
      console.log(`  ${player.name}:`);
      console.log(`    Batting records: ${player._count.battingStats}`);
      console.log(`    Bowling records: ${player._count.bowlingStats}`);
      console.log(`    Total matches: ${player.totalMatches}`);
      console.log(`    Total runs: ${player.totalRuns}`);
      console.log(`    Total wickets: ${player.totalWickets}`);
      console.log(`    Batting avg: ${player.battingAverage}`);
      console.log(`    Strike rate: ${player.strikeRate}\n`);
    });

    // AI-specific data check
    console.log('🤖 AI PREDICTIONS DATA:');
    const matchPredictions = await prisma.matchPrediction.count();
    const teamSuggestions = await prisma.teamSuggestion.count();
    const performancePredictions = await prisma.performancePrediction.count();
    const injuryRisks = await prisma.injuryRisk.count();

    console.log(`  Match Predictions: ${matchPredictions}`);
    console.log(`  Team Suggestions: ${teamSuggestions}`);
    console.log(`  Performance Predictions: ${performancePredictions}`);
    console.log(`  Injury Risk Assessments: ${injuryRisks}\n`);

    // Recommendations
    console.log('💡 RECOMMENDATIONS:');
    if (completedMatches === 0) {
      console.log('  ⚠️  No completed matches found!');
      console.log('  → Complete at least 5-10 matches to get meaningful predictions');
    }
    if (battingStats === 0 && bowlingStats === 0) {
      console.log('  ⚠️  No player performance stats found!');
      console.log('  → Score some matches to generate batting/bowling stats');
    }
    if (totalPlayers < 22) {
      console.log('  ⚠️  Not enough players for team selection');
      console.log('  → Create at least 22 players (11 per team)');
    }
    if (completedMatches > 0 && battingStats > 0) {
      console.log('  ✅ You have enough data for AI predictions!');
    }

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAIData();
