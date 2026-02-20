import { DRSStatus, ThirdUmpireDecision, InjurySeverity } from '@prisma/client';
export declare class AdministrationService {
    createDRSReview(data: {
        matchId: string;
        inningsId: string;
        ballId?: string;
        overNumber: number;
        ballNumber: number;
        reviewingTeamId: string;
        battingTeamId: string;
        bowlingTeamId: string;
        batsmanId: string;
        bowlerId: string;
        drsType: string;
        onFieldDecision: string;
        reviewedBy: string;
    }): Promise<{
        match: {
            id: string;
            venue: string;
        };
        innings: {
            id: string;
            inningsNumber: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.DRSStatus;
        matchId: string;
        overNumber: number;
        inningsId: string;
        bowlerId: string;
        battingTeamId: string;
        bowlingTeamId: string;
        ballNumber: number;
        batsmanId: string;
        ballId: string | null;
        reasoning: string | null;
        reviewingTeamId: string;
        drsType: import(".prisma/client").$Enums.DRSType;
        onFieldDecision: string;
        reviewedBy: string;
        thirdUmpireDecision: import(".prisma/client").$Enums.ThirdUmpireDecision;
        finalDecision: string;
        ultraEdge: boolean;
        ballTracking: boolean;
        hotSpot: boolean;
        snickoMeter: boolean;
        evidenceData: string | null;
        reviewDuration: number | null;
        reviewedAt: Date;
    }>;
    getDRSReviewsByMatch(matchId: string): Promise<({} & {
        id: string;
        status: import(".prisma/client").$Enums.DRSStatus;
        matchId: string;
        overNumber: number;
        inningsId: string;
        bowlerId: string;
        battingTeamId: string;
        bowlingTeamId: string;
        ballNumber: number;
        batsmanId: string;
        ballId: string | null;
        reasoning: string | null;
        reviewingTeamId: string;
        drsType: import(".prisma/client").$Enums.DRSType;
        onFieldDecision: string;
        reviewedBy: string;
        thirdUmpireDecision: import(".prisma/client").$Enums.ThirdUmpireDecision;
        finalDecision: string;
        ultraEdge: boolean;
        ballTracking: boolean;
        hotSpot: boolean;
        snickoMeter: boolean;
        evidenceData: string | null;
        reviewDuration: number | null;
        reviewedAt: Date;
    })[]>;
    updateDRSDecision(reviewId: string, data: {
        thirdUmpireDecision: ThirdUmpireDecision;
        finalDecision: string;
        status: DRSStatus;
        ultraEdge?: boolean;
        ballTracking?: boolean;
        hotSpot?: boolean;
        snickoMeter?: boolean;
        evidenceData?: string;
        reasoning?: string;
        reviewDuration?: number;
    }): Promise<{
        match: {
            id: string;
            venue: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.DRSStatus;
        matchId: string;
        overNumber: number;
        inningsId: string;
        bowlerId: string;
        battingTeamId: string;
        bowlingTeamId: string;
        ballNumber: number;
        batsmanId: string;
        ballId: string | null;
        reasoning: string | null;
        reviewingTeamId: string;
        drsType: import(".prisma/client").$Enums.DRSType;
        onFieldDecision: string;
        reviewedBy: string;
        thirdUmpireDecision: import(".prisma/client").$Enums.ThirdUmpireDecision;
        finalDecision: string;
        ultraEdge: boolean;
        ballTracking: boolean;
        hotSpot: boolean;
        snickoMeter: boolean;
        evidenceData: string | null;
        reviewDuration: number | null;
        reviewedAt: Date;
    }>;
    getDRSStats(matchId: string): Promise<{
        totalReviews: number;
        successfulReviews: number;
        successRate: number;
        team1TotalReviews: number;
        team2TotalReviews: number;
        team1ReviewsRemaining: number;
        team2ReviewsRemaining: number;
        byType: Record<string, number>;
    }>;
    recordInjury(data: {
        matchId: string;
        playerId: string;
        teamId: string;
        injuryType: string;
        severity: InjurySeverity;
        description: string;
        inningsId?: string;
        overNumber?: number;
        ballNumber?: number;
        assessedBy?: string;
        diagnosis?: string;
        treatmentPlan?: string;
        expectedRecovery?: Date;
    }): Promise<{
        match: {
            id: string;
            venue: string;
        };
        player: {
            name: string;
            id: string;
            role: import(".prisma/client").$Enums.PlayerRole;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.InjuryStatus;
        updatedAt: Date;
        matchId: string;
        description: string;
        playerId: string;
        teamId: string;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        injuryType: string;
        severity: import(".prisma/client").$Enums.InjurySeverity;
        assessedBy: string | null;
        diagnosis: string | null;
        treatmentPlan: string | null;
        expectedRecovery: Date | null;
        actualRecovery: Date | null;
        injuredAt: Date;
    }>;
    updateInjury(injuryId: string, data: {
        status?: string;
        severity?: string;
        diagnosis?: string;
        treatmentPlan?: string;
        expectedRecovery?: Date;
        actualRecovery?: Date;
    }): Promise<{
        match: {
            id: string;
            venue: string;
        };
        player: {
            name: string;
            id: string;
            role: import(".prisma/client").$Enums.PlayerRole;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.InjuryStatus;
        updatedAt: Date;
        matchId: string;
        description: string;
        playerId: string;
        teamId: string;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        injuryType: string;
        severity: import(".prisma/client").$Enums.InjurySeverity;
        assessedBy: string | null;
        diagnosis: string | null;
        treatmentPlan: string | null;
        expectedRecovery: Date | null;
        actualRecovery: Date | null;
        injuredAt: Date;
    }>;
    getInjuriesByMatch(matchId: string): Promise<({
        player: {
            name: string;
            id: string;
            role: import(".prisma/client").$Enums.PlayerRole;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.InjuryStatus;
        updatedAt: Date;
        matchId: string;
        description: string;
        playerId: string;
        teamId: string;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        injuryType: string;
        severity: import(".prisma/client").$Enums.InjurySeverity;
        assessedBy: string | null;
        diagnosis: string | null;
        treatmentPlan: string | null;
        expectedRecovery: Date | null;
        actualRecovery: Date | null;
        injuredAt: Date;
    })[]>;
    getInjuriesByPlayer(playerId: string): Promise<({
        match: {
            id: string;
            venue: string;
            matchDate: Date;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.InjuryStatus;
        updatedAt: Date;
        matchId: string;
        description: string;
        playerId: string;
        teamId: string;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        injuryType: string;
        severity: import(".prisma/client").$Enums.InjurySeverity;
        assessedBy: string | null;
        diagnosis: string | null;
        treatmentPlan: string | null;
        expectedRecovery: Date | null;
        actualRecovery: Date | null;
        injuredAt: Date;
    })[]>;
    getActiveInjuries(): Promise<({
        match: {
            id: string;
            venue: string;
            matchDate: Date;
        };
        player: {
            name: string;
            id: string;
            role: import(".prisma/client").$Enums.PlayerRole;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.InjuryStatus;
        updatedAt: Date;
        matchId: string;
        description: string;
        playerId: string;
        teamId: string;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        injuryType: string;
        severity: import(".prisma/client").$Enums.InjurySeverity;
        assessedBy: string | null;
        diagnosis: string | null;
        treatmentPlan: string | null;
        expectedRecovery: Date | null;
        actualRecovery: Date | null;
        injuredAt: Date;
    })[]>;
    createSubstitution(data: {
        matchId: string;
        replacedPlayerId: string;
        substitutePlayerId: string;
        teamId: string;
        substituteType: string;
        reason: string;
        injuryId?: string;
        approvedBy?: string;
        inningsId?: string;
        overNumber?: number;
        ballNumber?: number;
        canBat?: boolean;
        canBowl?: boolean;
        canField?: boolean;
    }): Promise<{
        injury: {
            id: string;
            status: import(".prisma/client").$Enums.InjuryStatus;
            updatedAt: Date;
            matchId: string;
            description: string;
            playerId: string;
            teamId: string;
            overNumber: number | null;
            inningsId: string | null;
            ballNumber: number | null;
            injuryType: string;
            severity: import(".prisma/client").$Enums.InjurySeverity;
            assessedBy: string | null;
            diagnosis: string | null;
            treatmentPlan: string | null;
            expectedRecovery: Date | null;
            actualRecovery: Date | null;
            injuredAt: Date;
        };
        replacedPlayer: {
            name: string;
            id: string;
            role: import(".prisma/client").$Enums.PlayerRole;
        };
        substitutePlayer: {
            name: string;
            id: string;
            role: import(".prisma/client").$Enums.PlayerRole;
        };
    } & {
        id: string;
        matchId: string;
        teamId: string;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        endedAt: Date | null;
        substituteType: import(".prisma/client").$Enums.SubstituteType;
        reason: string;
        approvedBy: string | null;
        canBat: boolean;
        canBowl: boolean;
        canField: boolean;
        substitutedAt: Date;
        injuryId: string | null;
        replacedPlayerId: string;
        substitutePlayerId: string;
    }>;
    endSubstitution(substituteId: string): Promise<{
        replacedPlayer: {
            name: string;
            id: string;
        };
        substitutePlayer: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        matchId: string;
        teamId: string;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        endedAt: Date | null;
        substituteType: import(".prisma/client").$Enums.SubstituteType;
        reason: string;
        approvedBy: string | null;
        canBat: boolean;
        canBowl: boolean;
        canField: boolean;
        substitutedAt: Date;
        injuryId: string | null;
        replacedPlayerId: string;
        substitutePlayerId: string;
    }>;
    getSubstitutionsByMatch(matchId: string): Promise<({
        injury: {
            id: string;
            status: import(".prisma/client").$Enums.InjuryStatus;
            updatedAt: Date;
            matchId: string;
            description: string;
            playerId: string;
            teamId: string;
            overNumber: number | null;
            inningsId: string | null;
            ballNumber: number | null;
            injuryType: string;
            severity: import(".prisma/client").$Enums.InjurySeverity;
            assessedBy: string | null;
            diagnosis: string | null;
            treatmentPlan: string | null;
            expectedRecovery: Date | null;
            actualRecovery: Date | null;
            injuredAt: Date;
        };
        replacedPlayer: {
            name: string;
            id: string;
            role: import(".prisma/client").$Enums.PlayerRole;
        };
        substitutePlayer: {
            name: string;
            id: string;
            role: import(".prisma/client").$Enums.PlayerRole;
        };
    } & {
        id: string;
        matchId: string;
        teamId: string;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        endedAt: Date | null;
        substituteType: import(".prisma/client").$Enums.SubstituteType;
        reason: string;
        approvedBy: string | null;
        canBat: boolean;
        canBowl: boolean;
        canField: boolean;
        substitutedAt: Date;
        injuryId: string | null;
        replacedPlayerId: string;
        substitutePlayerId: string;
    })[]>;
    recordWeather(data: {
        matchId: string;
        condition: string;
        temperature?: number;
        humidity?: number;
        windSpeed?: number;
        windDirection?: string;
        rainfall?: number;
        visibility?: string;
        inningsId?: string;
        overNumber?: number;
        playImpact?: string;
        dlsAffected?: boolean;
    }): Promise<{
        match: {
            id: string;
            venue: string;
        };
    } & {
        id: string;
        matchId: string;
        overNumber: number | null;
        inningsId: string | null;
        condition: import(".prisma/client").$Enums.WeatherCondition;
        temperature: number | null;
        humidity: number | null;
        windSpeed: number | null;
        windDirection: string | null;
        rainfall: number | null;
        visibility: string | null;
        recordedAt: Date;
        playImpact: string | null;
        dlsAffected: boolean;
    }>;
    getWeatherByMatch(matchId: string): Promise<{
        id: string;
        matchId: string;
        overNumber: number | null;
        inningsId: string | null;
        condition: import(".prisma/client").$Enums.WeatherCondition;
        temperature: number | null;
        humidity: number | null;
        windSpeed: number | null;
        windDirection: string | null;
        rainfall: number | null;
        visibility: string | null;
        recordedAt: Date;
        playImpact: string | null;
        dlsAffected: boolean;
    }[]>;
    getCurrentWeather(matchId: string): Promise<{
        id: string;
        matchId: string;
        overNumber: number | null;
        inningsId: string | null;
        condition: import(".prisma/client").$Enums.WeatherCondition;
        temperature: number | null;
        humidity: number | null;
        windSpeed: number | null;
        windDirection: string | null;
        rainfall: number | null;
        visibility: string | null;
        recordedAt: Date;
        playImpact: string | null;
        dlsAffected: boolean;
    }>;
    recordPitchCondition(data: {
        matchId: string;
        condition: string;
        grassCover?: string;
        hardness?: number;
        cracks?: boolean;
        paceAndBounce?: string;
        turn?: string;
        wearProgress?: string;
        assessedBy?: string;
        favorsBatting?: boolean;
        favorsBowling?: boolean;
        inningsId?: string;
    }): Promise<{
        match: {
            id: string;
            venue: string;
        };
    } & {
        id: string;
        matchId: string;
        inningsId: string | null;
        assessedAt: Date;
        assessedBy: string | null;
        condition: import(".prisma/client").$Enums.PitchCondition;
        grassCover: string | null;
        hardness: number | null;
        cracks: boolean;
        paceAndBounce: string | null;
        turn: string | null;
        wearProgress: string | null;
        favorsBatting: boolean | null;
        favorsBowling: boolean | null;
    }>;
    getPitchConditionsByMatch(matchId: string): Promise<{
        id: string;
        matchId: string;
        inningsId: string | null;
        assessedAt: Date;
        assessedBy: string | null;
        condition: import(".prisma/client").$Enums.PitchCondition;
        grassCover: string | null;
        hardness: number | null;
        cracks: boolean;
        paceAndBounce: string | null;
        turn: string | null;
        wearProgress: string | null;
        favorsBatting: boolean | null;
        favorsBowling: boolean | null;
    }[]>;
    getCurrentPitchCondition(matchId: string): Promise<{
        id: string;
        matchId: string;
        inningsId: string | null;
        assessedAt: Date;
        assessedBy: string | null;
        condition: import(".prisma/client").$Enums.PitchCondition;
        grassCover: string | null;
        hardness: number | null;
        cracks: boolean;
        paceAndBounce: string | null;
        turn: string | null;
        wearProgress: string | null;
        favorsBatting: boolean | null;
        favorsBowling: boolean | null;
    }>;
    calculateDLS(data: {
        matchId: string;
        inningsId: string;
        originalTarget: number;
        originalOvers: number;
        interruptionStart: Date;
        interruptionEnd?: Date;
        oversLost: number;
        wicketsLost: number;
        dlsVersion?: string;
        calculatedBy?: string;
    }): Promise<{
        match: {
            id: string;
            venue: string;
        };
    } & {
        id: string;
        matchId: string;
        inningsId: string;
        wicketsLost: number;
        calculatedAt: Date;
        originalTarget: number;
        originalOvers: number;
        interruptionStart: Date;
        interruptionEnd: Date | null;
        oversLost: number;
        resourcesAvailable: number;
        parScore: number | null;
        revisedTarget: number | null;
        revisedOvers: number | null;
        dlsVersion: string;
        calculatedBy: string | null;
    }>;
    getDLSCalculationsByMatch(matchId: string): Promise<({} & {
        id: string;
        matchId: string;
        inningsId: string;
        wicketsLost: number;
        calculatedAt: Date;
        originalTarget: number;
        originalOvers: number;
        interruptionStart: Date;
        interruptionEnd: Date | null;
        oversLost: number;
        resourcesAvailable: number;
        parScore: number | null;
        revisedTarget: number | null;
        revisedOvers: number | null;
        dlsVersion: string;
        calculatedBy: string | null;
    })[]>;
    createRefereeReport(data: {
        matchId: string;
        refereeName: string;
        refereeId?: string;
        matchSummary: string;
        fairPlay?: boolean;
        sportsmanship?: string;
        team1OverRate?: number;
        team2OverRate?: number;
        overRateIssues?: boolean;
        overRatePenalty?: string;
        observations?: string;
        groundConditions?: string;
        facilitiesQuality?: string;
        umpire1Name?: string;
        umpire2Name?: string;
        thirdUmpireName?: string;
        matchCommissioner?: string;
    }): Promise<{
        match: {
            id: string;
            venue: string;
            matchDate: Date;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        matchId: string;
        approvedBy: string | null;
        refereeName: string;
        refereeId: string | null;
        matchSummary: string;
        fairPlay: boolean;
        sportsmanship: string | null;
        team1OverRate: number | null;
        team2OverRate: number | null;
        overRateIssues: boolean;
        overRatePenalty: string | null;
        observations: string | null;
        groundConditions: string | null;
        facilitiesQuality: string | null;
        umpire1Name: string | null;
        umpire2Name: string | null;
        thirdUmpireName: string | null;
        matchCommissioner: string | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
    }>;
    updateRefereeReport(reportId: string, data: Partial<{
        matchSummary: string;
        fairPlay: boolean;
        sportsmanship: string;
        team1OverRate: number;
        team2OverRate: number;
        overRateIssues: boolean;
        overRatePenalty: string;
        observations: string;
        groundConditions: string;
        facilitiesQuality: string;
        umpire1Name: string;
        umpire2Name: string;
        thirdUmpireName: string;
        matchCommissioner: string;
        status: string;
    }>): Promise<{
        match: {
            id: string;
            venue: string;
        };
        incidents: {
            id: string;
            matchId: string;
            description: string;
            overNumber: number | null;
            inningsId: string | null;
            ballNumber: number | null;
            severity: import(".prisma/client").$Enums.IncidentSeverity;
            occurredAt: Date;
            reportId: string;
            incidentType: string;
            playersInvolved: string | null;
            teamsInvolved: string | null;
            actionTaken: string | null;
            penaltyApplied: string | null;
            witnessStatements: string | null;
            videoEvidence: boolean;
        }[];
        violations: {
            id: string;
            matchId: string;
            description: string;
            playerId: string | null;
            teamId: string | null;
            overNumber: number | null;
            inningsId: string | null;
            ballNumber: number | null;
            severity: import(".prisma/client").$Enums.IncidentSeverity;
            occurredAt: Date;
            reportId: string;
            violationType: import(".prisma/client").$Enums.ViolationType;
            article: string | null;
            penaltyPoints: number;
            matchBan: number;
            financialPenalty: number | null;
            warningIssued: boolean;
            appealFiled: boolean;
            appealOutcome: string | null;
        }[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        matchId: string;
        approvedBy: string | null;
        refereeName: string;
        refereeId: string | null;
        matchSummary: string;
        fairPlay: boolean;
        sportsmanship: string | null;
        team1OverRate: number | null;
        team2OverRate: number | null;
        overRateIssues: boolean;
        overRatePenalty: string | null;
        observations: string | null;
        groundConditions: string | null;
        facilitiesQuality: string | null;
        umpire1Name: string | null;
        umpire2Name: string | null;
        thirdUmpireName: string | null;
        matchCommissioner: string | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
    }>;
    getRefereeReport(matchId: string): Promise<{
        match: {
            id: string;
            venue: string;
            matchDate: Date;
        };
        incidents: {
            id: string;
            matchId: string;
            description: string;
            overNumber: number | null;
            inningsId: string | null;
            ballNumber: number | null;
            severity: import(".prisma/client").$Enums.IncidentSeverity;
            occurredAt: Date;
            reportId: string;
            incidentType: string;
            playersInvolved: string | null;
            teamsInvolved: string | null;
            actionTaken: string | null;
            penaltyApplied: string | null;
            witnessStatements: string | null;
            videoEvidence: boolean;
        }[];
        violations: ({
            player: {
                name: string;
                id: string;
            };
        } & {
            id: string;
            matchId: string;
            description: string;
            playerId: string | null;
            teamId: string | null;
            overNumber: number | null;
            inningsId: string | null;
            ballNumber: number | null;
            severity: import(".prisma/client").$Enums.IncidentSeverity;
            occurredAt: Date;
            reportId: string;
            violationType: import(".prisma/client").$Enums.ViolationType;
            article: string | null;
            penaltyPoints: number;
            matchBan: number;
            financialPenalty: number | null;
            warningIssued: boolean;
            appealFiled: boolean;
            appealOutcome: string | null;
        })[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        matchId: string;
        approvedBy: string | null;
        refereeName: string;
        refereeId: string | null;
        matchSummary: string;
        fairPlay: boolean;
        sportsmanship: string | null;
        team1OverRate: number | null;
        team2OverRate: number | null;
        overRateIssues: boolean;
        overRatePenalty: string | null;
        observations: string | null;
        groundConditions: string | null;
        facilitiesQuality: string | null;
        umpire1Name: string | null;
        umpire2Name: string | null;
        thirdUmpireName: string | null;
        matchCommissioner: string | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
    }>;
    submitReport(reportId: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        matchId: string;
        approvedBy: string | null;
        refereeName: string;
        refereeId: string | null;
        matchSummary: string;
        fairPlay: boolean;
        sportsmanship: string | null;
        team1OverRate: number | null;
        team2OverRate: number | null;
        overRateIssues: boolean;
        overRatePenalty: string | null;
        observations: string | null;
        groundConditions: string | null;
        facilitiesQuality: string | null;
        umpire1Name: string | null;
        umpire2Name: string | null;
        thirdUmpireName: string | null;
        matchCommissioner: string | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
    }>;
    recordIncident(data: {
        reportId: string;
        matchId: string;
        incidentType: string;
        severity: string;
        description: string;
        inningsId?: string;
        overNumber?: number;
        ballNumber?: number;
        playersInvolved?: string;
        teamsInvolved?: string;
        actionTaken?: string;
        penaltyApplied?: string;
        witnessStatements?: string;
        videoEvidence?: boolean;
    }): Promise<{
        match: {
            id: string;
            venue: string;
        };
        report: {
            id: string;
            refereeName: string;
        };
    } & {
        id: string;
        matchId: string;
        description: string;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        severity: import(".prisma/client").$Enums.IncidentSeverity;
        occurredAt: Date;
        reportId: string;
        incidentType: string;
        playersInvolved: string | null;
        teamsInvolved: string | null;
        actionTaken: string | null;
        penaltyApplied: string | null;
        witnessStatements: string | null;
        videoEvidence: boolean;
    }>;
    updateIncident(incidentId: string, data: Partial<{
        description: string;
        actionTaken: string;
        penaltyApplied: string;
        witnessStatements: string;
        videoEvidence: boolean;
    }>): Promise<{
        id: string;
        matchId: string;
        description: string;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        severity: import(".prisma/client").$Enums.IncidentSeverity;
        occurredAt: Date;
        reportId: string;
        incidentType: string;
        playersInvolved: string | null;
        teamsInvolved: string | null;
        actionTaken: string | null;
        penaltyApplied: string | null;
        witnessStatements: string | null;
        videoEvidence: boolean;
    }>;
    getIncidentsByMatch(matchId: string): Promise<({
        report: {
            refereeName: string;
        };
    } & {
        id: string;
        matchId: string;
        description: string;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        severity: import(".prisma/client").$Enums.IncidentSeverity;
        occurredAt: Date;
        reportId: string;
        incidentType: string;
        playersInvolved: string | null;
        teamsInvolved: string | null;
        actionTaken: string | null;
        penaltyApplied: string | null;
        witnessStatements: string | null;
        videoEvidence: boolean;
    })[]>;
    recordViolation(data: {
        reportId: string;
        matchId: string;
        playerId?: string;
        teamId?: string;
        violationType: string;
        severity: string;
        description: string;
        article?: string;
        inningsId?: string;
        overNumber?: number;
        ballNumber?: number;
        penaltyPoints?: number;
        matchBan?: number;
        financialPenalty?: number;
        warningIssued?: boolean;
    }): Promise<{
        match: {
            id: string;
            venue: string;
        };
        player: {
            name: string;
            id: string;
        };
        report: {
            id: string;
            refereeName: string;
        };
    } & {
        id: string;
        matchId: string;
        description: string;
        playerId: string | null;
        teamId: string | null;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        severity: import(".prisma/client").$Enums.IncidentSeverity;
        occurredAt: Date;
        reportId: string;
        violationType: import(".prisma/client").$Enums.ViolationType;
        article: string | null;
        penaltyPoints: number;
        matchBan: number;
        financialPenalty: number | null;
        warningIssued: boolean;
        appealFiled: boolean;
        appealOutcome: string | null;
    }>;
    updateViolation(violationId: string, data: Partial<{
        description: string;
        article: string;
        penaltyPoints: number;
        matchBan: number;
        financialPenalty: number;
        warningIssued: boolean;
        appealFiled: boolean;
        appealOutcome: string;
    }>): Promise<{
        match: {
            id: string;
            venue: string;
        };
        player: {
            name: string;
            id: string;
        };
        report: {
            id: string;
            refereeName: string;
        };
    } & {
        id: string;
        matchId: string;
        description: string;
        playerId: string | null;
        teamId: string | null;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        severity: import(".prisma/client").$Enums.IncidentSeverity;
        occurredAt: Date;
        reportId: string;
        violationType: import(".prisma/client").$Enums.ViolationType;
        article: string | null;
        penaltyPoints: number;
        matchBan: number;
        financialPenalty: number | null;
        warningIssued: boolean;
        appealFiled: boolean;
        appealOutcome: string | null;
    }>;
    getViolationsByMatch(matchId: string): Promise<({
        match: {
            id: string;
            venue: string;
        };
        player: {
            name: string;
            id: string;
        };
        report: {
            id: string;
            refereeName: string;
        };
    } & {
        id: string;
        matchId: string;
        description: string;
        playerId: string | null;
        teamId: string | null;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        severity: import(".prisma/client").$Enums.IncidentSeverity;
        occurredAt: Date;
        reportId: string;
        violationType: import(".prisma/client").$Enums.ViolationType;
        article: string | null;
        penaltyPoints: number;
        matchBan: number;
        financialPenalty: number | null;
        warningIssued: boolean;
        appealFiled: boolean;
        appealOutcome: string | null;
    })[]>;
    getViolationsByPlayer(playerId: string): Promise<({
        match: {
            id: string;
            venue: string;
            matchDate: Date;
        };
        player: {
            name: string;
            id: string;
        };
        report: {
            id: string;
            refereeName: string;
        };
    } & {
        id: string;
        matchId: string;
        description: string;
        playerId: string | null;
        teamId: string | null;
        overNumber: number | null;
        inningsId: string | null;
        ballNumber: number | null;
        severity: import(".prisma/client").$Enums.IncidentSeverity;
        occurredAt: Date;
        reportId: string;
        violationType: import(".prisma/client").$Enums.ViolationType;
        article: string | null;
        penaltyPoints: number;
        matchBan: number;
        financialPenalty: number | null;
        warningIssued: boolean;
        appealFiled: boolean;
        appealOutcome: string | null;
    })[]>;
}
export declare const administrationService: AdministrationService;
//# sourceMappingURL=administration.service.d.ts.map