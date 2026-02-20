"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CricketUtils = void 0;
class CricketUtils {
    static calculateStrikeRate(runs, balls) {
        if (balls === 0)
            return 0;
        return parseFloat(((runs / balls) * 100).toFixed(2));
    }
    static calculateBattingAverage(runs, dismissals) {
        if (dismissals === 0)
            return runs;
        return parseFloat((runs / dismissals).toFixed(2));
    }
    static calculateBowlingAverage(runs, wickets) {
        if (wickets === 0)
            return 0;
        return parseFloat((runs / wickets).toFixed(2));
    }
    static calculateEconomyRate(runs, overs) {
        if (overs === 0)
            return 0;
        return parseFloat((runs / overs).toFixed(2));
    }
    static calculateNetRunRate(runsScored, oversPlayed, runsConceded, oversFaced) {
        if (oversPlayed === 0 || oversFaced === 0)
            return 0;
        const runRate = runsScored / oversPlayed;
        const runRateConceded = runsConceded / oversFaced;
        return parseFloat((runRate - runRateConceded).toFixed(3));
    }
    static ballsToOvers(balls) {
        const completeOvers = Math.floor(balls / 6);
        const remainingBalls = balls % 6;
        return parseFloat(`${completeOvers}.${remainingBalls}`);
    }
    static oversToBalls(overs) {
        const oversStr = overs.toString();
        const [completeOvers, balls] = oversStr.split('.').map(Number);
        return completeOvers * 6 + (balls || 0);
    }
    static calculateCurrentRunRate(runs, overs) {
        if (overs === 0)
            return 0;
        return parseFloat((runs / overs).toFixed(2));
    }
    static calculateRequiredRunRate(target, currentRuns, oversRemaining) {
        if (oversRemaining === 0)
            return 0;
        const runsNeeded = target - currentRuns;
        return parseFloat((runsNeeded / oversRemaining).toFixed(2));
    }
    static isPowerplay(overNumber, format) {
        if (format === 'T20')
            return overNumber < 6;
        if (format === 'ODI')
            return overNumber < 10;
        return false;
    }
    static isDeathOvers(overNumber, format) {
        if (format === 'T20')
            return overNumber >= 16;
        if (format === 'ODI')
            return overNumber >= 40;
        return false;
    }
    static calculateProjectedScore(currentRuns, currentOvers, totalOvers) {
        if (currentOvers === 0)
            return 0;
        const runRate = currentRuns / currentOvers;
        return Math.round(runRate * totalOvers);
    }
    static generateResultText(winningTeamName, losingTeamName, margin, isWicketMargin, isDraw = false) {
        if (isDraw)
            return 'Match Drawn';
        if (isWicketMargin) {
            return `${winningTeamName} won by ${margin} wicket${margin > 1 ? 's' : ''}`;
        }
        else {
            return `${winningTeamName} won by ${margin} runs`;
        }
    }
    static calculateWinProbability(target, currentRuns, wicketsLost, oversRemaining) {
        if (target === 0)
            return 50;
        const runsNeeded = target - currentRuns;
        const wicketsInHand = 10 - wicketsLost;
        const requiredRunRate = oversRemaining > 0 ? runsNeeded / oversRemaining : 0;
        let probability = 50;
        if (runsNeeded <= 0)
            return 100;
        if (wicketsInHand === 0)
            return 0;
        if (oversRemaining === 0)
            return 0;
        probability += (wicketsInHand - 5) * 5;
        if (requiredRunRate < 6)
            probability += 20;
        else if (requiredRunRate < 8)
            probability += 10;
        else if (requiredRunRate < 10)
            probability -= 10;
        else
            probability -= 20;
        if (runsNeeded < 20)
            probability += 15;
        else if (runsNeeded < 50)
            probability += 10;
        else if (runsNeeded > 100)
            probability -= 10;
        return Math.max(0, Math.min(100, probability));
    }
    static determineManOfMatch(performances) {
        if (performances.length === 0)
            return null;
        let maxScore = 0;
        let manOfMatch = performances[0].playerId;
        performances.forEach(perf => {
            let score = 0;
            if (perf.runs)
                score += perf.runs * 1.5;
            if (perf.wickets)
                score += perf.wickets * 25;
            if (perf.strikeRate && perf.strikeRate > 150)
                score += 20;
            if (perf.economyRate && perf.economyRate < 6)
                score += 15;
            if (score > maxScore) {
                maxScore = score;
                manOfMatch = perf.playerId;
            }
        });
        return manOfMatch;
    }
}
exports.CricketUtils = CricketUtils;
//# sourceMappingURL=cricket.utils.js.map