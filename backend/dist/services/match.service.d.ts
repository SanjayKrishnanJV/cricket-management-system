import { BallEvent } from '../types';
export declare class MatchService {
    createMatch(data: {
        tournamentId?: string;
        homeTeamId: string;
        awayTeamId: string;
        venue: string;
        matchDate: string;
        isQuickMatch?: boolean;
        customOvers?: number;
        homeSquad?: string[];
        awaySquad?: string[];
    }): Promise<{
        tournament: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            format: import(".prisma/client").$Enums.TournamentFormat;
            type: import(".prisma/client").$Enums.TournamentType;
            startDate: Date;
            endDate: Date;
            prizePool: number | null;
            description: string | null;
            adminId: string;
            oversPerMatch: number | null;
            powerplayOvers: number | null;
            maxPlayersPerTeam: number | null;
            minPlayersPerTeam: number | null;
            rules: string | null;
        };
        homeTeam: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shortName: string;
            logoUrl: string | null;
            primaryColor: string | null;
            budget: number;
            ownerId: string;
            captainId: string | null;
            viceCaptainId: string | null;
        };
        awayTeam: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shortName: string;
            logoUrl: string | null;
            primaryColor: string | null;
            budget: number;
            ownerId: string;
            captainId: string | null;
            viceCaptainId: string | null;
        };
    } & {
        id: string;
        tournamentId: string | null;
        homeTeamId: string;
        awayTeamId: string;
        venue: string;
        matchDate: Date;
        status: import(".prisma/client").$Enums.MatchStatus;
        isQuickMatch: boolean;
        customOvers: number | null;
        tossWinnerId: string | null;
        tossDecision: string | null;
        winnerId: string | null;
        winMargin: string | null;
        resultText: string | null;
        manOfMatch: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAllMatches(filters?: {
        tournamentId?: string;
        teamId?: string;
        status?: string;
    }): Promise<({
        tournament: {
            name: string;
            format: import(".prisma/client").$Enums.TournamentFormat;
        };
        homeTeam: {
            name: string;
            shortName: string;
            logoUrl: string;
        };
        awayTeam: {
            name: string;
            shortName: string;
            logoUrl: string;
        };
        matchSquads: ({
            player: {
                name: string;
                id: string;
                role: import(".prisma/client").$Enums.PlayerRole;
            };
        } & {
            id: string;
            createdAt: Date;
            matchId: string;
            playerId: string;
            teamId: string;
        })[];
    } & {
        id: string;
        tournamentId: string | null;
        homeTeamId: string;
        awayTeamId: string;
        venue: string;
        matchDate: Date;
        status: import(".prisma/client").$Enums.MatchStatus;
        isQuickMatch: boolean;
        customOvers: number | null;
        tossWinnerId: string | null;
        tossDecision: string | null;
        winnerId: string | null;
        winMargin: string | null;
        resultText: string | null;
        manOfMatch: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getMatchById(id: string): Promise<{
        tournament: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            format: import(".prisma/client").$Enums.TournamentFormat;
            type: import(".prisma/client").$Enums.TournamentType;
            startDate: Date;
            endDate: Date;
            prizePool: number | null;
            description: string | null;
            adminId: string;
            oversPerMatch: number | null;
            powerplayOvers: number | null;
            maxPlayersPerTeam: number | null;
            minPlayersPerTeam: number | null;
            rules: string | null;
        };
        homeTeam: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shortName: string;
            logoUrl: string | null;
            primaryColor: string | null;
            budget: number;
            ownerId: string;
            captainId: string | null;
            viceCaptainId: string | null;
        };
        awayTeam: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shortName: string;
            logoUrl: string | null;
            primaryColor: string | null;
            budget: number;
            ownerId: string;
            captainId: string | null;
            viceCaptainId: string | null;
        };
        innings: ({
            overs: ({
                balls: {
                    id: string;
                    createdAt: Date;
                    commentary: string | null;
                    overNumber: number;
                    inningsId: string;
                    bowlerId: string;
                    ballNumber: number;
                    runs: number;
                    isWicket: boolean;
                    wicketType: import(".prisma/client").$Enums.WicketType | null;
                    isExtra: boolean;
                    extraType: import(".prisma/client").$Enums.ExtraType | null;
                    extraRuns: number;
                    shotAngle: number | null;
                    shotDistance: number | null;
                    shotZone: string | null;
                    pitchLine: string | null;
                    pitchLength: string | null;
                    pitchX: number | null;
                    pitchY: number | null;
                    ballSpeed: number | null;
                    ballTrajectory: string | null;
                    shotType: string | null;
                    overId: string;
                    batsmanId: string;
                    dismissedPlayerId: string | null;
                    wicketTakerId: string | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                overNumber: number;
                inningsId: string;
                bowlerId: string;
                runsScored: number;
                wickets: number;
                maiden: boolean;
            })[];
            battingPerformances: ({
                player: {
                    name: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                strikeRate: number;
                ballsFaced: number;
                playerId: string;
                teamId: string;
                inningsId: string;
                runs: number;
                fours: number;
                sixes: number;
                isOut: boolean;
                dismissal: string | null;
            })[];
            bowlingPerformances: ({
                player: {
                    name: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                economyRate: number;
                playerId: string;
                teamId: string;
                inningsId: string;
                wickets: number;
                oversBowled: number;
                runsConceded: number;
                maidens: number;
            })[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.InningsStatus;
            createdAt: Date;
            updatedAt: Date;
            matchId: string;
            totalRuns: number;
            totalWickets: number;
            inningsNumber: number;
            battingTeamId: string;
            bowlingTeamId: string;
            totalOvers: number;
            extras: number;
            currentStrikerId: string | null;
            currentNonStrikerId: string | null;
        })[];
        commentary: {
            text: string;
            id: string;
            matchId: string;
            timestamp: Date;
            over: number;
            ball: number;
        }[];
        matchAnalytics: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            powerplayRuns1: number;
            powerplayWickets1: number;
            powerplayRuns2: number;
            powerplayWickets2: number;
            deathOversRuns1: number;
            deathOversWickets1: number;
            deathOversRuns2: number;
            deathOversWickets2: number;
            winProbability: string | null;
            keyMoments: string | null;
            matchId: string;
        };
        matchSquads: ({
            player: {
                name: string;
                id: string;
                role: import(".prisma/client").$Enums.PlayerRole;
            };
        } & {
            id: string;
            createdAt: Date;
            matchId: string;
            playerId: string;
            teamId: string;
        })[];
    } & {
        id: string;
        tournamentId: string | null;
        homeTeamId: string;
        awayTeamId: string;
        venue: string;
        matchDate: Date;
        status: import(".prisma/client").$Enums.MatchStatus;
        isQuickMatch: boolean;
        customOvers: number | null;
        tossWinnerId: string | null;
        tossDecision: string | null;
        winnerId: string | null;
        winMargin: string | null;
        resultText: string | null;
        manOfMatch: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    recordToss(matchId: string, tossWinnerId: string, tossDecision: string): Promise<{
        match: {
            id: string;
            tournamentId: string | null;
            homeTeamId: string;
            awayTeamId: string;
            venue: string;
            matchDate: Date;
            status: import(".prisma/client").$Enums.MatchStatus;
            isQuickMatch: boolean;
            customOvers: number | null;
            tossWinnerId: string | null;
            tossDecision: string | null;
            winnerId: string | null;
            winMargin: string | null;
            resultText: string | null;
            manOfMatch: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        innings: {
            id: string;
            status: import(".prisma/client").$Enums.InningsStatus;
            createdAt: Date;
            updatedAt: Date;
            matchId: string;
            totalRuns: number;
            totalWickets: number;
            inningsNumber: number;
            battingTeamId: string;
            bowlingTeamId: string;
            totalOvers: number;
            extras: number;
            currentStrikerId: string | null;
            currentNonStrikerId: string | null;
        };
    }>;
    startInnings(matchId: string, inningsNumber: number): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.InningsStatus;
        createdAt: Date;
        updatedAt: Date;
        matchId: string;
        totalRuns: number;
        totalWickets: number;
        inningsNumber: number;
        battingTeamId: string;
        bowlingTeamId: string;
        totalOvers: number;
        extras: number;
        currentStrikerId: string | null;
        currentNonStrikerId: string | null;
    }>;
    recordBall(inningsId: string, bowlerId: string, batsmanId: string, ballData: BallEvent): Promise<{
        id: string;
        createdAt: Date;
        commentary: string | null;
        overNumber: number;
        inningsId: string;
        bowlerId: string;
        ballNumber: number;
        runs: number;
        isWicket: boolean;
        wicketType: import(".prisma/client").$Enums.WicketType | null;
        isExtra: boolean;
        extraType: import(".prisma/client").$Enums.ExtraType | null;
        extraRuns: number;
        shotAngle: number | null;
        shotDistance: number | null;
        shotZone: string | null;
        pitchLine: string | null;
        pitchLength: string | null;
        pitchX: number | null;
        pitchY: number | null;
        ballSpeed: number | null;
        ballTrajectory: string | null;
        shotType: string | null;
        overId: string;
        batsmanId: string;
        dismissedPlayerId: string | null;
        wicketTakerId: string | null;
    }>;
    private updateBattingPerformance;
    private updateBowlingPerformance;
    completeInnings(inningsId: string): Promise<void>;
    completeMatch(matchId: string): Promise<{
        winnerId: string;
        resultText: string;
        manOfMatch: string;
    }>;
    getLiveScore(matchId: string): Promise<{
        match: {
            tournament: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                format: import(".prisma/client").$Enums.TournamentFormat;
                type: import(".prisma/client").$Enums.TournamentType;
                startDate: Date;
                endDate: Date;
                prizePool: number | null;
                description: string | null;
                adminId: string;
                oversPerMatch: number | null;
                powerplayOvers: number | null;
                maxPlayersPerTeam: number | null;
                minPlayersPerTeam: number | null;
                rules: string | null;
            };
            homeTeam: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                shortName: string;
                logoUrl: string | null;
                primaryColor: string | null;
                budget: number;
                ownerId: string;
                captainId: string | null;
                viceCaptainId: string | null;
            };
            awayTeam: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                shortName: string;
                logoUrl: string | null;
                primaryColor: string | null;
                budget: number;
                ownerId: string;
                captainId: string | null;
                viceCaptainId: string | null;
            };
            innings: ({
                overs: ({
                    balls: {
                        id: string;
                        createdAt: Date;
                        commentary: string | null;
                        overNumber: number;
                        inningsId: string;
                        bowlerId: string;
                        ballNumber: number;
                        runs: number;
                        isWicket: boolean;
                        wicketType: import(".prisma/client").$Enums.WicketType | null;
                        isExtra: boolean;
                        extraType: import(".prisma/client").$Enums.ExtraType | null;
                        extraRuns: number;
                        shotAngle: number | null;
                        shotDistance: number | null;
                        shotZone: string | null;
                        pitchLine: string | null;
                        pitchLength: string | null;
                        pitchX: number | null;
                        pitchY: number | null;
                        ballSpeed: number | null;
                        ballTrajectory: string | null;
                        shotType: string | null;
                        overId: string;
                        batsmanId: string;
                        dismissedPlayerId: string | null;
                        wicketTakerId: string | null;
                    }[];
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    overNumber: number;
                    inningsId: string;
                    bowlerId: string;
                    runsScored: number;
                    wickets: number;
                    maiden: boolean;
                })[];
                battingPerformances: ({
                    player: {
                        name: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    strikeRate: number;
                    ballsFaced: number;
                    playerId: string;
                    teamId: string;
                    inningsId: string;
                    runs: number;
                    fours: number;
                    sixes: number;
                    isOut: boolean;
                    dismissal: string | null;
                })[];
                bowlingPerformances: ({
                    player: {
                        name: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    economyRate: number;
                    playerId: string;
                    teamId: string;
                    inningsId: string;
                    wickets: number;
                    oversBowled: number;
                    runsConceded: number;
                    maidens: number;
                })[];
            } & {
                id: string;
                status: import(".prisma/client").$Enums.InningsStatus;
                createdAt: Date;
                updatedAt: Date;
                matchId: string;
                totalRuns: number;
                totalWickets: number;
                inningsNumber: number;
                battingTeamId: string;
                bowlingTeamId: string;
                totalOvers: number;
                extras: number;
                currentStrikerId: string | null;
                currentNonStrikerId: string | null;
            })[];
            commentary: {
                text: string;
                id: string;
                matchId: string;
                timestamp: Date;
                over: number;
                ball: number;
            }[];
            matchAnalytics: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                powerplayRuns1: number;
                powerplayWickets1: number;
                powerplayRuns2: number;
                powerplayWickets2: number;
                deathOversRuns1: number;
                deathOversWickets1: number;
                deathOversRuns2: number;
                deathOversWickets2: number;
                winProbability: string | null;
                keyMoments: string | null;
                matchId: string;
            };
            matchSquads: ({
                player: {
                    name: string;
                    id: string;
                    role: import(".prisma/client").$Enums.PlayerRole;
                };
            } & {
                id: string;
                createdAt: Date;
                matchId: string;
                playerId: string;
                teamId: string;
            })[];
        } & {
            id: string;
            tournamentId: string | null;
            homeTeamId: string;
            awayTeamId: string;
            venue: string;
            matchDate: Date;
            status: import(".prisma/client").$Enums.MatchStatus;
            isQuickMatch: boolean;
            customOvers: number | null;
            tossWinnerId: string | null;
            tossDecision: string | null;
            winnerId: string | null;
            winMargin: string | null;
            resultText: string | null;
            manOfMatch: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        live: boolean;
        currentInnings?: undefined;
    } | {
        match: {
            tournament: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                format: import(".prisma/client").$Enums.TournamentFormat;
                type: import(".prisma/client").$Enums.TournamentType;
                startDate: Date;
                endDate: Date;
                prizePool: number | null;
                description: string | null;
                adminId: string;
                oversPerMatch: number | null;
                powerplayOvers: number | null;
                maxPlayersPerTeam: number | null;
                minPlayersPerTeam: number | null;
                rules: string | null;
            };
            homeTeam: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                shortName: string;
                logoUrl: string | null;
                primaryColor: string | null;
                budget: number;
                ownerId: string;
                captainId: string | null;
                viceCaptainId: string | null;
            };
            awayTeam: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                shortName: string;
                logoUrl: string | null;
                primaryColor: string | null;
                budget: number;
                ownerId: string;
                captainId: string | null;
                viceCaptainId: string | null;
            };
            innings: ({
                overs: ({
                    balls: {
                        id: string;
                        createdAt: Date;
                        commentary: string | null;
                        overNumber: number;
                        inningsId: string;
                        bowlerId: string;
                        ballNumber: number;
                        runs: number;
                        isWicket: boolean;
                        wicketType: import(".prisma/client").$Enums.WicketType | null;
                        isExtra: boolean;
                        extraType: import(".prisma/client").$Enums.ExtraType | null;
                        extraRuns: number;
                        shotAngle: number | null;
                        shotDistance: number | null;
                        shotZone: string | null;
                        pitchLine: string | null;
                        pitchLength: string | null;
                        pitchX: number | null;
                        pitchY: number | null;
                        ballSpeed: number | null;
                        ballTrajectory: string | null;
                        shotType: string | null;
                        overId: string;
                        batsmanId: string;
                        dismissedPlayerId: string | null;
                        wicketTakerId: string | null;
                    }[];
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    overNumber: number;
                    inningsId: string;
                    bowlerId: string;
                    runsScored: number;
                    wickets: number;
                    maiden: boolean;
                })[];
                battingPerformances: ({
                    player: {
                        name: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    strikeRate: number;
                    ballsFaced: number;
                    playerId: string;
                    teamId: string;
                    inningsId: string;
                    runs: number;
                    fours: number;
                    sixes: number;
                    isOut: boolean;
                    dismissal: string | null;
                })[];
                bowlingPerformances: ({
                    player: {
                        name: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    economyRate: number;
                    playerId: string;
                    teamId: string;
                    inningsId: string;
                    wickets: number;
                    oversBowled: number;
                    runsConceded: number;
                    maidens: number;
                })[];
            } & {
                id: string;
                status: import(".prisma/client").$Enums.InningsStatus;
                createdAt: Date;
                updatedAt: Date;
                matchId: string;
                totalRuns: number;
                totalWickets: number;
                inningsNumber: number;
                battingTeamId: string;
                bowlingTeamId: string;
                totalOvers: number;
                extras: number;
                currentStrikerId: string | null;
                currentNonStrikerId: string | null;
            })[];
            commentary: {
                text: string;
                id: string;
                matchId: string;
                timestamp: Date;
                over: number;
                ball: number;
            }[];
            matchAnalytics: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                powerplayRuns1: number;
                powerplayWickets1: number;
                powerplayRuns2: number;
                powerplayWickets2: number;
                deathOversRuns1: number;
                deathOversWickets1: number;
                deathOversRuns2: number;
                deathOversWickets2: number;
                winProbability: string | null;
                keyMoments: string | null;
                matchId: string;
            };
            matchSquads: ({
                player: {
                    name: string;
                    id: string;
                    role: import(".prisma/client").$Enums.PlayerRole;
                };
            } & {
                id: string;
                createdAt: Date;
                matchId: string;
                playerId: string;
                teamId: string;
            })[];
        } & {
            id: string;
            tournamentId: string | null;
            homeTeamId: string;
            awayTeamId: string;
            venue: string;
            matchDate: Date;
            status: import(".prisma/client").$Enums.MatchStatus;
            isQuickMatch: boolean;
            customOvers: number | null;
            tossWinnerId: string | null;
            tossDecision: string | null;
            winnerId: string | null;
            winMargin: string | null;
            resultText: string | null;
            manOfMatch: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        live: boolean;
        currentInnings: {
            lastBalls: ({
                bowler: {
                    name: string;
                };
                batsman: {
                    name: string;
                };
            } & {
                id: string;
                createdAt: Date;
                commentary: string | null;
                overNumber: number;
                inningsId: string;
                bowlerId: string;
                ballNumber: number;
                runs: number;
                isWicket: boolean;
                wicketType: import(".prisma/client").$Enums.WicketType | null;
                isExtra: boolean;
                extraType: import(".prisma/client").$Enums.ExtraType | null;
                extraRuns: number;
                shotAngle: number | null;
                shotDistance: number | null;
                shotZone: string | null;
                pitchLine: string | null;
                pitchLength: string | null;
                pitchX: number | null;
                pitchY: number | null;
                ballSpeed: number | null;
                ballTrajectory: string | null;
                shotType: string | null;
                overId: string;
                batsmanId: string;
                dismissedPlayerId: string | null;
                wicketTakerId: string | null;
            })[];
            overs: ({
                balls: {
                    id: string;
                    createdAt: Date;
                    commentary: string | null;
                    overNumber: number;
                    inningsId: string;
                    bowlerId: string;
                    ballNumber: number;
                    runs: number;
                    isWicket: boolean;
                    wicketType: import(".prisma/client").$Enums.WicketType | null;
                    isExtra: boolean;
                    extraType: import(".prisma/client").$Enums.ExtraType | null;
                    extraRuns: number;
                    shotAngle: number | null;
                    shotDistance: number | null;
                    shotZone: string | null;
                    pitchLine: string | null;
                    pitchLength: string | null;
                    pitchX: number | null;
                    pitchY: number | null;
                    ballSpeed: number | null;
                    ballTrajectory: string | null;
                    shotType: string | null;
                    overId: string;
                    batsmanId: string;
                    dismissedPlayerId: string | null;
                    wicketTakerId: string | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                overNumber: number;
                inningsId: string;
                bowlerId: string;
                runsScored: number;
                wickets: number;
                maiden: boolean;
            })[];
            battingPerformances: ({
                player: {
                    name: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                strikeRate: number;
                ballsFaced: number;
                playerId: string;
                teamId: string;
                inningsId: string;
                runs: number;
                fours: number;
                sixes: number;
                isOut: boolean;
                dismissal: string | null;
            })[];
            bowlingPerformances: ({
                player: {
                    name: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                economyRate: number;
                playerId: string;
                teamId: string;
                inningsId: string;
                wickets: number;
                oversBowled: number;
                runsConceded: number;
                maidens: number;
            })[];
            id: string;
            status: import(".prisma/client").$Enums.InningsStatus;
            createdAt: Date;
            updatedAt: Date;
            matchId: string;
            totalRuns: number;
            totalWickets: number;
            inningsNumber: number;
            battingTeamId: string;
            bowlingTeamId: string;
            totalOvers: number;
            extras: number;
            currentStrikerId: string | null;
            currentNonStrikerId: string | null;
        };
    }>;
    updateMatch(id: string, data: {
        tournamentId?: string;
        homeTeamId?: string;
        awayTeamId?: string;
        venue?: string;
        matchDate?: string;
    }): Promise<{
        tournament: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            format: import(".prisma/client").$Enums.TournamentFormat;
            type: import(".prisma/client").$Enums.TournamentType;
            startDate: Date;
            endDate: Date;
            prizePool: number | null;
            description: string | null;
            adminId: string;
            oversPerMatch: number | null;
            powerplayOvers: number | null;
            maxPlayersPerTeam: number | null;
            minPlayersPerTeam: number | null;
            rules: string | null;
        };
        homeTeam: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shortName: string;
            logoUrl: string | null;
            primaryColor: string | null;
            budget: number;
            ownerId: string;
            captainId: string | null;
            viceCaptainId: string | null;
        };
        awayTeam: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shortName: string;
            logoUrl: string | null;
            primaryColor: string | null;
            budget: number;
            ownerId: string;
            captainId: string | null;
            viceCaptainId: string | null;
        };
    } & {
        id: string;
        tournamentId: string | null;
        homeTeamId: string;
        awayTeamId: string;
        venue: string;
        matchDate: Date;
        status: import(".prisma/client").$Enums.MatchStatus;
        isQuickMatch: boolean;
        customOvers: number | null;
        tossWinnerId: string | null;
        tossDecision: string | null;
        winnerId: string | null;
        winMargin: string | null;
        resultText: string | null;
        manOfMatch: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteMatch(id: string): Promise<void>;
    cancelMatch(id: string): Promise<{
        tournament: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            format: import(".prisma/client").$Enums.TournamentFormat;
            type: import(".prisma/client").$Enums.TournamentType;
            startDate: Date;
            endDate: Date;
            prizePool: number | null;
            description: string | null;
            adminId: string;
            oversPerMatch: number | null;
            powerplayOvers: number | null;
            maxPlayersPerTeam: number | null;
            minPlayersPerTeam: number | null;
            rules: string | null;
        };
        homeTeam: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shortName: string;
            logoUrl: string | null;
            primaryColor: string | null;
            budget: number;
            ownerId: string;
            captainId: string | null;
            viceCaptainId: string | null;
        };
        awayTeam: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shortName: string;
            logoUrl: string | null;
            primaryColor: string | null;
            budget: number;
            ownerId: string;
            captainId: string | null;
            viceCaptainId: string | null;
        };
    } & {
        id: string;
        tournamentId: string | null;
        homeTeamId: string;
        awayTeamId: string;
        venue: string;
        matchDate: Date;
        status: import(".prisma/client").$Enums.MatchStatus;
        isQuickMatch: boolean;
        customOvers: number | null;
        tossWinnerId: string | null;
        tossDecision: string | null;
        winnerId: string | null;
        winMargin: string | null;
        resultText: string | null;
        manOfMatch: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    validateTeamsForMatch(homeTeamId: string, awayTeamId: string): Promise<boolean>;
    getAllLiveMatches(): Promise<{
        id: string;
        homeTeam: {
            name: string;
            id: string;
            shortName: string;
            logoUrl: string;
        };
        awayTeam: {
            name: string;
            id: string;
            shortName: string;
            logoUrl: string;
        };
        venue: string;
        matchDate: Date;
        status: import(".prisma/client").$Enums.MatchStatus;
        currentInnings: {
            inningsNumber: number;
            battingTeam: {
                name: string;
                id: string;
                shortName: string;
                logoUrl: string;
            };
            score: string;
            overs: string;
            runRate: string;
        };
        target: number;
        requiredRunRate: string;
    }[]>;
    private calculateRequiredRunRate;
}
//# sourceMappingURL=match.service.d.ts.map