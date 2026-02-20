"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
async function checkAIData() {
    console.log('🔍 Checking AI Data Availability...\n');
    try {
        const totalMatches = await database_1.default.match.count();
        const completedMatches = await database_1.default.match.count({
            where: { status: 'COMPLETED' }
        });
        const liveMatches = await database_1.default.match.count({
            where: { status: 'LIVE' }
        });
        const scheduledMatches = await database_1.default.match.count({
            where: { status: 'SCHEDULED' }
        });
        console.log('📊 MATCHES:');
        console.log(`  Total: ${totalMatches}`);
        console.log(`  Completed: ${completedMatches}`);
        console.log(`  Live: ${liveMatches}`);
        console.log(`  Scheduled: ${scheduledMatches}\n`);
        const totalPlayers = await database_1.default.player.count();
        console.log('👥 PLAYERS:');
        console.log(`  Total: ${totalPlayers}\n`);
        const battingStats = await database_1.default.battingPerformance.count();
        const playersWithBattingStats = await database_1.default.player.count({
            where: {
                battingStats: {
                    some: {}
                }
            }
        });
        console.log('🏏 BATTING STATS:');
        console.log(`  Total batting records: ${battingStats}`);
        console.log(`  Players with batting stats: ${playersWithBattingStats}\n`);
        const bowlingStats = await database_1.default.bowlingPerformance.count();
        const playersWithBowlingStats = await database_1.default.player.count({
            where: {
                bowlingStats: {
                    some: {}
                }
            }
        });
        console.log('⚡ BOWLING STATS:');
        console.log(`  Total bowling records: ${bowlingStats}`);
        console.log(`  Players with bowling stats: ${playersWithBowlingStats}\n`);
        const innings = await database_1.default.innings.count();
        console.log('📋 INNINGS:');
        console.log(`  Total innings: ${innings}\n`);
        const samplePlayers = await database_1.default.player.findMany({
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
        console.log('🤖 AI PREDICTIONS DATA:');
        const matchPredictions = await database_1.default.matchPrediction.count();
        const teamSuggestions = await database_1.default.teamSuggestion.count();
        const performancePredictions = await database_1.default.performancePrediction.count();
        const injuryRisks = await database_1.default.injuryRisk.count();
        console.log(`  Match Predictions: ${matchPredictions}`);
        console.log(`  Team Suggestions: ${teamSuggestions}`);
        console.log(`  Performance Predictions: ${performancePredictions}`);
        console.log(`  Injury Risk Assessments: ${injuryRisks}\n`);
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
    }
    catch (error) {
        console.error('❌ Error checking data:', error);
    }
    finally {
        await database_1.default.$disconnect();
    }
}
checkAIData();
//# sourceMappingURL=checkAIData.js.map