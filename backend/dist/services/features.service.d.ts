export declare class FeaturesService {
    getPlayerMilestones(playerId: string): Promise<{
        playerId: string;
        playerName: string;
        batting: {
            fifties: {
                count: number;
                details: {
                    runs: number;
                    balls: number;
                    date: Date;
                    venue: string;
                    opposition: string;
                }[];
            };
            hundreds: {
                count: number;
                details: {
                    runs: number;
                    balls: number;
                    date: Date;
                    venue: string;
                }[];
            };
            doubleHundreds: {
                count: number;
                details: {
                    runs: number;
                    balls: number;
                    date: Date;
                    venue: string;
                }[];
            };
            highestScore: number;
        };
        bowling: {
            threeWickets: {
                count: number;
            };
            fourWickets: {
                count: number;
            };
            fiveWickets: {
                count: number;
                details: {
                    wickets: number;
                    runs: number;
                    overs: number;
                    date: Date;
                    venue: string;
                }[];
            };
            bestFigures: {
                wickets: number;
                runs: number;
            };
        };
    }>;
    getTournamentAwards(tournamentId: string): Promise<{
        tournamentId: string;
        tournamentName: string;
        awards: {
            orangeCap: {
                playerId: any;
                playerName: any;
                imageUrl: any;
                runs: any;
                matches: any;
                average: string;
                highestScore: any;
            };
            purpleCap: {
                playerId: any;
                playerName: any;
                imageUrl: any;
                wickets: any;
                matches: any;
                average: string;
                bestFigures: string;
            };
            mostSixes: {
                playerId: any;
                playerName: any;
                sixes: any;
            };
            mostFours: {
                playerId: any;
                playerName: any;
                fours: any;
            };
            bestStrikeRate: {
                playerId: any;
                playerName: any;
                strikeRate: string;
                runs: any;
                balls: any;
            };
            bestEconomy: {
                playerId: any;
                playerName: any;
                economy: string;
                wickets: any;
                overs: any;
            };
        };
        champion: any;
    }>;
    comparePlayers(player1Id: string, player2Id: string): Promise<{
        player1: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.PlayerRole;
            stats: {
                matches: number;
                runs: number;
                wickets: number;
                battingAverage: number;
                strikeRate: number;
                bowlingAverage: number;
                economyRate: number;
                highestScore: number;
                fifties: number;
                hundreds: number;
                fiveWickets: number;
            };
        };
        player2: {
            id: string;
            name: string;
            role: import(".prisma/client").$Enums.PlayerRole;
            stats: {
                matches: number;
                runs: number;
                wickets: number;
                battingAverage: number;
                strikeRate: number;
                bowlingAverage: number;
                economyRate: number;
                highestScore: number;
                fifties: number;
                hundreds: number;
                fiveWickets: number;
            };
        };
    }>;
    getHeadToHead(team1Id: string, team2Id: string): Promise<{
        totalMatches: number;
        team1: {
            id: string;
            wins: number;
        };
        team2: {
            id: string;
            wins: number;
        };
        ties: number;
        recentMatches: {
            matchId: string;
            date: Date;
            venue: string;
            result: string;
            winner: string;
        }[];
    }>;
    getVenueStatistics(venue: string): Promise<{
        venue: string;
        totalMatches: number;
        averageScore: number;
        averageWickets: string | number;
        tossWinMatchWinPercentage: string | number;
        battingFirstWinPercentage: string | number;
        bowlingFirstWinPercentage: string | number;
    }>;
    predictMatchOutcome(matchId: string): Promise<{
        matchId: string;
        prediction: {
            homeTeam: {
                name: string;
                winProbability: string;
                recentForm: number;
            };
            awayTeam: {
                name: string;
                winProbability: string;
                recentForm: number;
            };
        };
        note: string;
    }>;
    calculateFantasyPoints(matchId: string): Promise<{
        matchId: string;
        players: any[];
        topPerformer: any;
    }>;
}
//# sourceMappingURL=features.service.d.ts.map