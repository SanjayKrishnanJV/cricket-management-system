/**
 * Enhanced Commentary Generator with multiple styles and AI-like variations
 */

interface CommentaryContext {
  ballData: {
    runs: number;
    isWicket: boolean;
    wicketType?: string;
    isWide?: boolean;
    isNoBall?: boolean;
    isBye?: boolean;
    isLegBye?: boolean;
    isExtra?: boolean;
    extraType?: string;
  };
  batsman: {
    name: string;
    runs: number;
    ballsFaced: number;
  };
  bowler: {
    name: string;
    oversBowled: number;
    runsConceded: number;
    wickets: number;
  };
  matchSituation: {
    currentRuns: number;
    currentWickets: number;
    overs: number;
    target?: number;
    requiredRunRate?: number;
  };
}

export type CommentaryStyle = 'excited' | 'analytical' | 'neutral' | 'dramatic';

export class CommentaryGenerator {
  private styles: CommentaryStyle[] = ['excited', 'analytical', 'neutral', 'dramatic'];
  private currentStyleIndex = 0;

  /**
   * Generate commentary with rotating styles
   */
  generateCommentary(context: CommentaryContext, preferredStyle?: CommentaryStyle): string {
    const style = preferredStyle || this.getNextStyle();

    // Wicket commentary (highest priority)
    if (context.ballData.isWicket) {
      return this.generateWicketCommentary(context, style);
    }

    // Boundary commentary
    if (context.ballData.runs === 6) {
      return this.generateSixCommentary(context, style);
    }

    if (context.ballData.runs === 4) {
      return this.generateFourCommentary(context, style);
    }

    // Extra runs
    if (context.ballData.isExtra) {
      return this.generateExtraCommentary(context, style);
    }

    // Dot ball
    if (context.ballData.runs === 0) {
      return this.generateDotBallCommentary(context, style);
    }

    // Singles and twos
    return this.generateRunsCommentary(context, style);
  }

  /**
   * Generate wicket commentary with multiple variations
   */
  private generateWicketCommentary(context: CommentaryContext, style: CommentaryStyle): string {
    const { ballData, batsman, bowler } = context;
    const wicketType = ballData.wicketType || 'OUT';

    const variations = {
      excited: [
        `🔥 GONE! ${batsman.name} is OUT! What a breakthrough for ${bowler.name}!`,
        `💥 WICKET! ${batsman.name} departs for ${batsman.runs}! ${bowler.name} strikes!`,
        `⚡ OUT! ${batsman.name} has to go! Brilliant bowling from ${bowler.name}!`,
        `🎯 TIMBER! ${batsman.name} is dismissed! ${bowler.name} gets the breakthrough!`,
      ],
      analytical: [
        `${batsman.name} ${wicketType} for ${batsman.runs} (${batsman.ballsFaced}) - ${bowler.name} gets his ${bowler.wickets + 1}${this.getOrdinalSuffix(bowler.wickets + 1)} wicket.`,
        `Clinical from ${bowler.name}. ${batsman.name} ${wicketType}, scoring ${batsman.runs} off ${batsman.ballsFaced} balls.`,
        `${bowler.name} breaks the partnership. ${batsman.name} ${wicketType} after making ${batsman.runs}.`,
      ],
      neutral: [
        `${batsman.name} is out ${wicketType}. ${batsman.runs} runs from ${batsman.ballsFaced} balls.`,
        `${batsman.name} ${wicketType} by ${bowler.name}. Score: ${context.matchSituation.currentRuns}/${context.matchSituation.currentWickets + 1}.`,
      ],
      dramatic: [
        `And... IT'S ALL OVER for ${batsman.name}! ${wicketType}! The crowd erupts!`,
        `WHAT. A. MOMENT! ${batsman.name} is ${wicketType}! ${bowler.name} punches the air in celebration!`,
        `The stadium holds its breath... and ${batsman.name} is OUT! Game-changing moment!`,
      ],
    };

    return this.selectRandomVariation(variations[style]);
  }

  /**
   * Generate six commentary
   */
  private generateSixCommentary(context: CommentaryContext, style: CommentaryStyle): string {
    const { batsman, bowler, matchSituation } = context;

    const variations = {
      excited: [
        `🚀 MASSIVE! ${batsman.name} sends it sailing over the rope! SIX!`,
        `💫 BANG! That's out of here! ${batsman.name} clears the boundary with ease!`,
        `⭐ HUGE HIT! ${batsman.name} launches it into the crowd! Maximum!`,
        `🔥 BOOM! ${batsman.name} smokes it! That's disappeared!`,
      ],
      analytical: [
        `${batsman.name} picks the length early and dispatches it for six. Now on ${batsman.runs + 6}.`,
        `Excellent timing from ${batsman.name}. Six runs added. ${bowler.name} under pressure.`,
        `${batsman.name} goes big. That's his ${this.getOrdinalSuffix(Math.floor((batsman.runs + 6) / 6))} six. Score moves to ${matchSituation.currentRuns + 6}/${matchSituation.currentWickets}.`,
      ],
      neutral: [
        `${batsman.name} hits a six. ${bowler.name} concedes the maximum.`,
        `Six runs to ${batsman.name}. The total moves to ${matchSituation.currentRuns + 6}.`,
      ],
      dramatic: [
        `IT'S MASSIVE! ${batsman.name} absolutely HAMMERS it! The ball is still rising!`,
        `UNBELIEVABLE! ${batsman.name} with a stroke of pure CLASS! That's gone the distance!`,
        `Can you believe it?! ${batsman.name} sends it into orbit! What a shot!`,
      ],
    };

    return this.selectRandomVariation(variations[style]);
  }

  /**
   * Generate four commentary
   */
  private generateFourCommentary(context: CommentaryContext, style: CommentaryStyle): string {
    const { batsman, bowler, matchSituation } = context;

    const variations = {
      excited: [
        `🎯 FOUR! Beautiful shot from ${batsman.name}!`,
        `✨ Glorious! ${batsman.name} finds the gap! Boundary!`,
        `⚡ Cracking stroke! ${batsman.name} beats the fielder!`,
        `🌟 Brilliant! ${batsman.name} threads the needle! Four runs!`,
      ],
      analytical: [
        `${batsman.name} places it perfectly. Four runs. Running tally: ${batsman.runs + 4}.`,
        `Well-executed shot by ${batsman.name}. Beats the field for four.`,
        `${batsman.name} finds the boundary. ${matchSituation.currentRuns + 4}/${matchSituation.currentWickets}.`,
      ],
      neutral: [
        `${batsman.name} hits a boundary. Four runs.`,
        `Four runs to ${batsman.name}. ${bowler.name} bowls.`,
      ],
      dramatic: [
        `What a SHOT! ${batsman.name} caresses it to the boundary! Pure timing!`,
        `Sublime! ${batsman.name} with a textbook stroke! Races away for FOUR!`,
        `CLASS personified! ${batsman.name} pierces the field! Boundary!`,
      ],
    };

    return this.selectRandomVariation(variations[style]);
  }

  /**
   * Generate dot ball commentary
   */
  private generateDotBallCommentary(context: CommentaryContext, style: CommentaryStyle): string {
    const { batsman, bowler, matchSituation } = context;

    const variations = {
      excited: [
        `Solid defense from ${batsman.name}! No run!`,
        `Well bowled! ${bowler.name} beats the bat!`,
        `Tight bowling! ${batsman.name} can't get it away!`,
      ],
      analytical: [
        `${bowler.name} bowls a dot. Good line and length.`,
        `${batsman.name} defends solidly. Dot ball.`,
        `No run. ${bowler.name} maintains pressure.`,
      ],
      neutral: [
        `Dot ball. ${batsman.name} blocks.`,
        `No run. ${bowler.name} to ${batsman.name}.`,
      ],
      dramatic: [
        `${batsman.name} SURVIVES! ${bowler.name} almost had him!`,
        `Close! ${batsman.name} just manages to keep it out!`,
        `Dangerous delivery! ${batsman.name} defends with caution!`,
      ],
    };

    // Add pressure commentary if chasing
    if (matchSituation.requiredRunRate && matchSituation.requiredRunRate > 10) {
      variations.excited.push(`Dot ball! Pressure building! Required rate: ${matchSituation.requiredRunRate.toFixed(2)}`);
      variations.analytical.push(`Dot ball adds to the pressure. Required run rate climbs to ${matchSituation.requiredRunRate.toFixed(2)}.`);
    }

    return this.selectRandomVariation(variations[style]);
  }

  /**
   * Generate extra runs commentary
   */
  private generateExtraCommentary(context: CommentaryContext, style: CommentaryStyle): string {
    const { ballData, bowler } = context;
    const extraType = ballData.extraType || 'EXTRA';

    const variations = {
      excited: [
        `${extraType}! ${bowler.name} loses his line!`,
        `Oh no! ${extraType} from ${bowler.name}!`,
      ],
      analytical: [
        `${extraType}. ${bowler.name} needs to tighten up his bowling.`,
        `Extra run conceded. ${extraType} called.`,
      ],
      neutral: [
        `${extraType}. One extra run.`,
        `${bowler.name} bowls a ${extraType}.`,
      ],
      dramatic: [
        `COSTLY! ${bowler.name} strays! ${extraType}!`,
        `${extraType}! ${bowler.name} under pressure!`,
      ],
    };

    return this.selectRandomVariation(variations[style]);
  }

  /**
   * Generate single/double runs commentary
   */
  private generateRunsCommentary(context: CommentaryContext, style: CommentaryStyle): string {
    const { ballData, batsman, matchSituation } = context;
    const runs = ballData.runs;

    const variations = {
      excited: [
        `${batsman.name} gets ${runs} run${runs > 1 ? 's' : ''}! Good running!`,
        `Quick ${runs}! ${batsman.name} keeps the scoreboard ticking!`,
      ],
      analytical: [
        `${batsman.name} takes ${runs}. Score: ${matchSituation.currentRuns + runs}/${matchSituation.currentWickets}.`,
        `${runs} run${runs > 1 ? 's' : ''} added. ${batsman.name} now on ${batsman.runs + runs}.`,
      ],
      neutral: [
        `${batsman.name} scores ${runs}.`,
        `${runs} run${runs > 1 ? 's' : ''}.`,
      ],
      dramatic: [
        `Smart cricket! ${batsman.name} rotates the strike with ${runs}!`,
        `Positive intent! ${batsman.name} picks up ${runs}!`,
      ],
    };

    return this.selectRandomVariation(variations[style]);
  }

  /**
   * Get next style in rotation
   */
  private getNextStyle(): CommentaryStyle {
    const style = this.styles[this.currentStyleIndex];
    this.currentStyleIndex = (this.currentStyleIndex + 1) % this.styles.length;
    return style;
  }

  /**
   * Select random variation from array
   */
  private selectRandomVariation(variations: string[]): string {
    return variations[Math.floor(Math.random() * variations.length)];
  }

  /**
   * Get ordinal suffix (1st, 2nd, 3rd, etc.)
   */
  private getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return num + 'st';
    if (j === 2 && k !== 12) return num + 'nd';
    if (j === 3 && k !== 13) return num + 'rd';
    return num + 'th';
  }

  /**
   * Generate milestone commentary (50s, 100s, 5-fer, etc.)
   */
  generateMilestoneCommentary(
    type: 'FIFTY' | 'CENTURY' | 'FIVE_WICKETS' | 'HAT_TRICK',
    playerName: string
  ): string {
    const milestones = {
      FIFTY: [
        `🎊 FIFTY! Brilliant knock from ${playerName}! Well played!`,
        `⭐ HALF-CENTURY! ${playerName} reaches 50! What an innings!`,
        `🔥 MAGNIFICENT FIFTY for ${playerName}! The crowd is on their feet!`,
      ],
      CENTURY: [
        `🏆 CENTURY! ${playerName} brings up his HUNDRED! Standing ovation!`,
        `💯 WHAT. A. KNOCK! ${playerName} reaches his CENTURY! Absolutely phenomenal!`,
        `👑 KING! ${playerName} scores a magnificent HUNDRED! This is special!`,
      ],
      FIVE_WICKETS: [
        `🎯 FIVE-FOR! ${playerName} takes his 5th wicket! Sensational bowling!`,
        `🔥 FIVE WICKETS for ${playerName}! What a spell of bowling!`,
        `⚡ FIFER! ${playerName} wreaks havoc! 5 wickets down!`,
      ],
      HAT_TRICK: [
        `🎩 HAT-TRICK! ${playerName} with THREE IN THREE! Unbelievable!`,
        `🔥🔥🔥 HAT-TRICK! ${playerName} makes history! Three wickets in a row!`,
        `EXTRAORDINARY! ${playerName} pulls off a HAT-TRICK! Incredible stuff!`,
      ],
    };

    return this.selectRandomVariation(milestones[type]);
  }
}

export const commentaryGenerator = new CommentaryGenerator();
