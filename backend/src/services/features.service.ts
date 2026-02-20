import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CricketUtils } from '../utils/cricket.utils';

export class FeaturesService {
  // ===== PLAYER MILESTONES =====
  async getPlayerMilestones(playerId: string) {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        battingStats: {
          include: {
            innings: {
              include: {
                match: {
                  select: {
                    matchDate: true,
                    venue: true,
                    homeTeam: { select: { name: true } },
                    awayTeam: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
        bowlingStats: {
          include: {
            innings: {
              include: {
                match: {
                  select: {
                    matchDate: true,
                    venue: true,
                    homeTeam: { select: { name: true } },
                    awayTeam: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!player) {
      throw new AppError('Player not found', 404);
    }

    // Batting Milestones
    const fifties = player.battingStats.filter(s => s.runs >= 50 && s.runs < 100);
    const hundreds = player.battingStats.filter(s => s.runs >= 100 && s.runs < 200);
    const doubleHundreds = player.battingStats.filter(s => s.runs >= 200);

    // Bowling Milestones
    const threeWickets = player.bowlingStats.filter(s => s.wickets >= 3 && s.wickets < 5);
    const fourWickets = player.bowlingStats.filter(s => s.wickets >= 4 && s.wickets < 5);
    const fiveWickets = player.bowlingStats.filter(s => s.wickets >= 5);

    return {
      playerId: player.id,
      playerName: player.name,
      batting: {
        fifties: {
          count: fifties.length,
          details: fifties.map(s => ({
            runs: s.runs,
            balls: s.ballsFaced,
            date: s.innings.match.matchDate,
            venue: s.innings.match.venue,
            opposition: s.innings.match.homeTeam.name === player.name
              ? s.innings.match.awayTeam.name
              : s.innings.match.homeTeam.name,
          })),
        },
        hundreds: {
          count: hundreds.length,
          details: hundreds.map(s => ({
            runs: s.runs,
            balls: s.ballsFaced,
            date: s.innings.match.matchDate,
            venue: s.innings.match.venue,
          })),
        },
        doubleHundreds: {
          count: doubleHundreds.length,
          details: doubleHundreds.map(s => ({
            runs: s.runs,
            balls: s.ballsFaced,
            date: s.innings.match.matchDate,
            venue: s.innings.match.venue,
          })),
        },
        highestScore: player.highestScore,
      },
      bowling: {
        threeWickets: {
          count: threeWickets.length,
        },
        fourWickets: {
          count: fourWickets.length,
        },
        fiveWickets: {
          count: fiveWickets.length,
          details: fiveWickets.map(s => ({
            wickets: s.wickets,
            runs: s.runsConceded,
            overs: s.oversBowled,
            date: s.innings.match.matchDate,
            venue: s.innings.match.venue,
          })),
        },
        bestFigures: {
          wickets: Math.max(...player.bowlingStats.map(s => s.wickets), 0),
          runs: player.bowlingStats.find(s =>
            s.wickets === Math.max(...player.bowlingStats.map(bs => bs.wickets), 0)
          )?.runsConceded || 0,
        },
      },
    };
  }

  // ===== TOURNAMENT AWARDS =====
  async getTournamentAwards(tournamentId: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        matches: {
          where: { status: 'COMPLETED' },
          include: {
            innings: {
              include: {
                battingPerformances: {
                  include: {
                    player: { select: { id: true, name: true, imageUrl: true } },
                  },
                },
                bowlingPerformances: {
                  include: {
                    player: { select: { id: true, name: true, imageUrl: true } },
                  },
                },
              },
            },
          },
        },
        pointsTable: {
          orderBy: [{ points: 'desc' }, { netRunRate: 'desc' }],
        },
      },
    });

    if (!tournament) {
      throw new AppError('Tournament not found', 404);
    }

    // Aggregate batting stats
    const battingMap = new Map();
    tournament.matches.forEach(match => {
      match.innings.forEach(innings => {
        innings.battingPerformances.forEach(perf => {
          const existing = battingMap.get(perf.playerId);
          if (existing) {
            existing.runs += perf.runs;
            existing.balls += perf.ballsFaced;
            existing.fours += perf.fours;
            existing.sixes += perf.sixes;
            existing.matches += 1;
            existing.highestScore = Math.max(existing.highestScore, perf.runs);
          } else {
            battingMap.set(perf.playerId, {
              playerId: perf.playerId,
              playerName: perf.player.name,
              imageUrl: perf.player.imageUrl,
              runs: perf.runs,
              balls: perf.ballsFaced,
              fours: perf.fours,
              sixes: perf.sixes,
              matches: 1,
              highestScore: perf.runs,
            });
          }
        });
      });
    });

    // Aggregate bowling stats
    const bowlingMap = new Map();
    tournament.matches.forEach(match => {
      match.innings.forEach(innings => {
        innings.bowlingPerformances.forEach(perf => {
          const existing = bowlingMap.get(perf.playerId);
          if (existing) {
            existing.wickets += perf.wickets;
            existing.runs += perf.runsConceded;
            existing.overs += perf.oversBowled;
            existing.matches += 1;
            if (perf.wickets > existing.bestWickets) {
              existing.bestWickets = perf.wickets;
              existing.bestRuns = perf.runsConceded;
            }
          } else {
            bowlingMap.set(perf.playerId, {
              playerId: perf.playerId,
              playerName: perf.player.name,
              imageUrl: perf.player.imageUrl,
              wickets: perf.wickets,
              runs: perf.runsConceded,
              overs: perf.oversBowled,
              matches: 1,
              bestWickets: perf.wickets,
              bestRuns: perf.runsConceded,
            });
          }
        });
      });
    });

    const battingStats = Array.from(battingMap.values());
    const bowlingStats = Array.from(bowlingMap.values());

    // Get champion team data
    let championData = null;
    if (tournament.pointsTable && tournament.pointsTable.length > 0) {
      const championEntry = tournament.pointsTable[0];
      const championTeam = await prisma.team.findUnique({
        where: { id: championEntry.teamId },
        select: { name: true, logoUrl: true },
      });

      if (championTeam) {
        championData = {
          teamName: championTeam.name,
          logoUrl: championTeam.logoUrl,
          points: championEntry.points,
          played: championEntry.played,
          won: championEntry.won,
          netRunRate: championEntry.netRunRate,
        };
      }
    }

    // Awards
    const orangeCap = battingStats.sort((a, b) => b.runs - a.runs)[0];
    const purpleCap = bowlingStats.sort((a, b) => b.wickets - a.wickets)[0];
    const mostSixes = battingStats.sort((a, b) => b.sixes - a.sixes)[0];
    const mostFours = battingStats.sort((a, b) => b.fours - a.fours)[0];
    const bestStrikeRate = battingStats
      .filter(s => s.balls >= 50)
      .sort((a, b) => (b.runs / b.balls) - (a.runs / a.balls))[0];
    const bestEconomy = bowlingStats
      .filter(s => s.overs >= 10)
      .sort((a, b) => (a.runs / a.overs) - (b.runs / b.overs))[0];

    return {
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      awards: {
        orangeCap: orangeCap
          ? {
              playerId: orangeCap.playerId,
              playerName: orangeCap.playerName,
              imageUrl: orangeCap.imageUrl,
              runs: orangeCap.runs,
              matches: orangeCap.matches,
              average: (orangeCap.runs / orangeCap.matches).toFixed(2),
              highestScore: orangeCap.highestScore,
            }
          : null,
        purpleCap: purpleCap
          ? {
              playerId: purpleCap.playerId,
              playerName: purpleCap.playerName,
              imageUrl: purpleCap.imageUrl,
              wickets: purpleCap.wickets,
              matches: purpleCap.matches,
              average: (purpleCap.runs / purpleCap.wickets).toFixed(2),
              bestFigures: `${purpleCap.bestWickets}/${purpleCap.bestRuns}`,
            }
          : null,
        mostSixes: mostSixes
          ? {
              playerId: mostSixes.playerId,
              playerName: mostSixes.playerName,
              sixes: mostSixes.sixes,
            }
          : null,
        mostFours: mostFours
          ? {
              playerId: mostFours.playerId,
              playerName: mostFours.playerName,
              fours: mostFours.fours,
            }
          : null,
        bestStrikeRate: bestStrikeRate
          ? {
              playerId: bestStrikeRate.playerId,
              playerName: bestStrikeRate.playerName,
              strikeRate: ((bestStrikeRate.runs / bestStrikeRate.balls) * 100).toFixed(2),
              runs: bestStrikeRate.runs,
              balls: bestStrikeRate.balls,
            }
          : null,
        bestEconomy: bestEconomy
          ? {
              playerId: bestEconomy.playerId,
              playerName: bestEconomy.playerName,
              economy: (bestEconomy.runs / bestEconomy.overs).toFixed(2),
              wickets: bestEconomy.wickets,
              overs: bestEconomy.overs,
            }
          : null,
      },
      champion: championData,
    };
  }

  // ===== PLAYER COMPARISON =====
  async comparePlayers(player1Id: string, player2Id: string) {
    const [player1, player2] = await Promise.all([
      prisma.player.findUnique({
        where: { id: player1Id },
        include: {
          battingStats: true,
          bowlingStats: true,
        },
      }),
      prisma.player.findUnique({
        where: { id: player2Id },
        include: {
          battingStats: true,
          bowlingStats: true,
        },
      }),
    ]);

    if (!player1 || !player2) {
      throw new AppError('One or both players not found', 404);
    }

    return {
      player1: {
        id: player1.id,
        name: player1.name,
        role: player1.role,
        stats: {
          matches: player1.totalMatches,
          runs: player1.totalRuns,
          wickets: player1.totalWickets,
          battingAverage: player1.battingAverage,
          strikeRate: player1.strikeRate,
          bowlingAverage: player1.bowlingAverage,
          economyRate: player1.economyRate,
          highestScore: player1.highestScore,
          fifties: player1.battingStats.filter(s => s.runs >= 50 && s.runs < 100).length,
          hundreds: player1.battingStats.filter(s => s.runs >= 100).length,
          fiveWickets: player1.bowlingStats.filter(s => s.wickets >= 5).length,
        },
      },
      player2: {
        id: player2.id,
        name: player2.name,
        role: player2.role,
        stats: {
          matches: player2.totalMatches,
          runs: player2.totalRuns,
          wickets: player2.totalWickets,
          battingAverage: player2.battingAverage,
          strikeRate: player2.strikeRate,
          bowlingAverage: player2.bowlingAverage,
          economyRate: player2.economyRate,
          highestScore: player2.highestScore,
          fifties: player2.battingStats.filter(s => s.runs >= 50 && s.runs < 100).length,
          hundreds: player2.battingStats.filter(s => s.runs >= 100).length,
          fiveWickets: player2.bowlingStats.filter(s => s.wickets >= 5).length,
        },
      },
    };
  }

  // ===== HEAD-TO-HEAD RECORDS =====
  async getHeadToHead(team1Id: string, team2Id: string) {
    const matches = await prisma.match.findMany({
      where: {
        status: 'COMPLETED',
        OR: [
          { homeTeamId: team1Id, awayTeamId: team2Id },
          { homeTeamId: team2Id, awayTeamId: team1Id },
        ],
      },
      include: {
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
        innings: {
          select: {
            totalRuns: true,
            totalWickets: true,
            totalOvers: true,
            battingTeamId: true,
          },
        },
      },
      orderBy: { matchDate: 'desc' },
    });

    const team1Wins = matches.filter(m => m.winnerId === team1Id).length;
    const team2Wins = matches.filter(m => m.winnerId === team2Id).length;
    const ties = matches.filter(m => !m.winnerId).length;

    return {
      totalMatches: matches.length,
      team1: {
        id: team1Id,
        wins: team1Wins,
      },
      team2: {
        id: team2Id,
        wins: team2Wins,
      },
      ties,
      recentMatches: matches.slice(0, 5).map(m => {
        let winnerName = 'Tie';
        if (m.winnerId) {
          winnerName = m.winnerId === m.homeTeamId ? m.homeTeam.name : m.awayTeam.name;
        }
        return {
          matchId: m.id,
          date: m.matchDate,
          venue: m.venue,
          result: m.resultText,
          winner: winnerName,
        };
      }),
    };
  }

  // ===== VENUE STATISTICS =====
  async getVenueStatistics(venue: string) {
    const matches = await prisma.match.findMany({
      where: {
        venue: {
          contains: venue,
          mode: 'insensitive',
        },
        status: 'COMPLETED',
      },
      include: {
        tournament: { select: { format: true } },
        innings: {
          select: {
            totalRuns: true,
            totalWickets: true,
            totalOvers: true,
            battingTeamId: true,
          },
        },
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
      },
    });

    if (matches.length === 0) {
      throw new AppError('No matches found for this venue', 404);
    }

    const totalMatches = matches.length;
    const tossWinMatchWin = matches.filter(m =>
      m.tossWinnerId && m.tossWinnerId === m.winnerId
    ).length;

    const battingFirstWins = matches.filter(m => {
      if (!m.innings || m.innings.length < 2) return false;
      const firstInnings = m.innings.find(i => i.battingTeamId);
      return firstInnings && firstInnings.battingTeamId === m.winnerId;
    }).length;

    const totalRuns = matches.reduce((sum, m) =>
      sum + m.innings.reduce((s, i) => s + i.totalRuns, 0), 0
    );

    const totalWickets = matches.reduce((sum, m) =>
      sum + m.innings.reduce((s, i) => s + i.totalWickets, 0), 0
    );

    const totalOvers = matches.reduce((sum, m) =>
      sum + m.innings.reduce((s, i) => s + i.totalOvers, 0), 0
    );

    return {
      venue,
      totalMatches,
      averageScore: totalMatches > 0 ? Math.round(totalRuns / (totalMatches * 2)) : 0,
      averageWickets: totalMatches > 0 ? (totalWickets / (totalMatches * 2)).toFixed(1) : 0,
      tossWinMatchWinPercentage:
        totalMatches > 0 ? ((tossWinMatchWin / totalMatches) * 100).toFixed(1) : 0,
      battingFirstWinPercentage:
        totalMatches > 0 ? ((battingFirstWins / totalMatches) * 100).toFixed(1) : 0,
      bowlingFirstWinPercentage:
        totalMatches > 0 ? (((totalMatches - battingFirstWins) / totalMatches) * 100).toFixed(1) : 0,
    };
  }

  // ===== MATCH PREDICTION =====
  async predictMatchOutcome(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: {
          include: {
            homeMatches: {
              where: { status: 'COMPLETED' },
              take: 5,
              orderBy: { matchDate: 'desc' },
            },
          },
        },
        awayTeam: {
          include: {
            awayMatches: {
              where: { status: 'COMPLETED' },
              take: 5,
              orderBy: { matchDate: 'desc' },
            },
          },
        },
        innings: {
          include: {
            balls: true,
          },
        },
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    // Recent form (last 5 matches)
    const homeWins = match.homeTeam.homeMatches.filter(m => m.winnerId === match.homeTeamId).length;
    const awayWins = match.awayTeam.awayMatches.filter(m => m.winnerId === match.awayTeamId).length;

    // Simple prediction based on recent form
    const homeWinProb = (homeWins / 5) * 100;
    const awayWinProb = (awayWins / 5) * 100;
    const total = homeWinProb + awayWinProb;

    return {
      matchId: match.id,
      prediction: {
        homeTeam: {
          name: match.homeTeam.name,
          winProbability: total > 0 ? ((homeWinProb / total) * 100).toFixed(1) : '50.0',
          recentForm: homeWins,
        },
        awayTeam: {
          name: match.awayTeam.name,
          winProbability: total > 0 ? ((awayWinProb / total) * 100).toFixed(1) : '50.0',
          recentForm: awayWins,
        },
      },
      note: 'Prediction based on recent form (last 5 matches)',
    };
  }

  // ===== PLAYER FANTASY POINTS =====
  async calculateFantasyPoints(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        innings: {
          include: {
            battingPerformances: {
              include: {
                player: { select: { id: true, name: true, role: true } },
              },
            },
            bowlingPerformances: {
              include: {
                player: { select: { id: true, name: true, role: true } },
              },
            },
            balls: {
              where: { isWicket: true },
              select: {
                wicketType: true,
                wicketTakerId: true,
                dismissedPlayerId: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    const fantasyPoints = new Map();

    match.innings.forEach(innings => {
      // Batting points
      innings.battingPerformances.forEach(perf => {
        const points = {
          playerId: perf.playerId,
          playerName: perf.player.name,
          role: perf.player.role,
          runs: perf.runs,
          fours: perf.fours * 1,
          sixes: perf.sixes * 2,
          fifty: perf.runs >= 50 && perf.runs < 100 ? 8 : 0,
          hundred: perf.runs >= 100 ? 16 : 0,
          strikeRateBonus: perf.strikeRate > 150 ? 6 : perf.strikeRate > 130 ? 4 : 0,
          total: 0,
        };

        points.total =
          points.runs +
          points.fours +
          points.sixes +
          points.fifty +
          points.hundred +
          points.strikeRateBonus;

        fantasyPoints.set(perf.playerId, points);
      });

      // Bowling points
      innings.bowlingPerformances.forEach(perf => {
        const existing = fantasyPoints.get(perf.playerId) || {
          playerId: perf.playerId,
          playerName: perf.player.name,
          role: perf.player.role,
          runs: 0,
          fours: 0,
          sixes: 0,
          fifty: 0,
          hundred: 0,
          strikeRateBonus: 0,
          total: 0,
        };

        const bowlingPoints = {
          wickets: perf.wickets * 25,
          maidens: perf.maidens * 12,
          threeWickets: perf.wickets >= 3 && perf.wickets < 5 ? 4 : 0,
          fourWickets: perf.wickets >= 4 && perf.wickets < 5 ? 8 : 0,
          fiveWickets: perf.wickets >= 5 ? 16 : 0,
          economyBonus: perf.economyRate < 5 ? 6 : perf.economyRate < 6 ? 4 : 0,
        };

        const bowlingTotal =
          bowlingPoints.wickets +
          bowlingPoints.maidens +
          bowlingPoints.threeWickets +
          bowlingPoints.fourWickets +
          bowlingPoints.fiveWickets +
          bowlingPoints.economyBonus;

        fantasyPoints.set(perf.playerId, {
          ...existing,
          ...bowlingPoints,
          total: existing.total + bowlingTotal,
        });
      });
    });

    // Sort by total points
    const sortedPoints = Array.from(fantasyPoints.values()).sort((a, b) => b.total - a.total);

    return {
      matchId: match.id,
      players: sortedPoints,
      topPerformer: sortedPoints[0] || null,
    };
  }
}
