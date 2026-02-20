'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { matchAPI, playerAPI } from '@/lib/api';
import { LivePolls } from '@/components/polls/LivePolls';
import { CreatePoll } from '@/components/polls/CreatePoll';

export default function LiveScoringPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const [match, setMatch] = useState<any>(null);
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<any[]>([]);

  // Toss state
  const [showTossDialog, setShowTossDialog] = useState(false);
  const [tossWinnerId, setTossWinnerId] = useState('');
  const [tossDecision, setTossDecision] = useState('');

  // Innings state
  const [showStartInningsDialog, setShowStartInningsDialog] = useState(false);
  const [inningsNumber, setInningsNumber] = useState(1);

  // Ball recording state
  const [showBallDialog, setShowBallDialog] = useState(false);
  const [currentInningsId, setCurrentInningsId] = useState('');
  const [strikerId, setStrikerId] = useState(''); // On-strike batsman
  const [nonStrikerId, setNonStrikerId] = useState(''); // Non-strike batsman
  const [batsmanId, setBatsmanId] = useState(''); // For wicket tracking (deprecated but keeping for backward compatibility)
  const [dismissedBatsmen, setDismissedBatsmen] = useState<string[]>([]); // Track who's out
  const [bowlerId, setBowlerId] = useState('');
  const [wicketTakerId, setWicketTakerId] = useState('');
  const [runOutBatsmanId, setRunOutBatsmanId] = useState(''); // Track which batsman is run out
  const [currentOverBowler, setCurrentOverBowler] = useState('');
  const [previousOverBowler, setPreviousOverBowler] = useState('');
  const [ballsInCurrentOver, setBallsInCurrentOver] = useState(0);
  const [ballData, setBallData] = useState({
    runs: 0,
    isWicket: false,
    wicketType: '',
    isWide: false,
    isNoBall: false,
    isBye: false,
    isLegBye: false,
  });

  // Advanced tracking state
  const [showAdvancedTracking, setShowAdvancedTracking] = useState(false);
  const [locationData, setLocationData] = useState({
    shotType: '',
    shotZone: '',
    pitchLine: '',
    pitchLength: '',
  });

  useEffect(() => {
    if (matchId) {
      fetchMatchData();
    }
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      const [matchRes, liveRes, playersRes] = await Promise.all([
        fetch(`http://localhost:5000/api/matches/${matchId}`),
        matchAPI.getLiveScore(matchId),
        playerAPI.getAll(),
      ]);

      const matchData = await matchRes.json();
      setMatch(matchData.data);
      setLiveData(liveRes.data.data);
      setPlayers(playersRes.data.data || []);

      // If there's an active innings, set it as current
      if (matchData.data.innings && matchData.data.innings.length > 0) {
        const activeInnings = matchData.data.innings.find(
          (i: any) => i.status === 'IN_PROGRESS'
        );
        if (activeInnings && !currentInningsId) {
          setCurrentInningsId(activeInnings.id);
        }

        // Track current over information
        if (activeInnings && activeInnings.overs && activeInnings.overs.length > 0) {
          const overs = activeInnings.overs;
          const currentOver = overs[overs.length - 1];
          const ballCount = currentOver.balls?.length || 0;

          // Check if current over is complete (6 balls)
          if (ballCount >= 6) {
            // Over completed - reset for new over
            setBallsInCurrentOver(0);
            setCurrentOverBowler('');
            setPreviousOverBowler(currentOver.bowlerId);
            setBowlerId(''); // Clear bowler selection for new over
          } else {
            // Mid-over or new over starting
            setBallsInCurrentOver(ballCount);
            setCurrentOverBowler(currentOver.bowlerId);

            // If mid-over, also restore bowlerId to preserve bowler selection
            if (ballCount > 0) {
              setBowlerId(currentOver.bowlerId);
            }

            // Set previous over bowler if exists
            if (overs.length > 1) {
              setPreviousOverBowler(overs[overs.length - 2].bowlerId);
            }
          }
        }

        // Track dismissed batsmen
        if (activeInnings && activeInnings.battingPerformances) {
          const dismissed = activeInnings.battingPerformances
            .filter((perf: any) => perf.isOut === true)
            .map((perf: any) => perf.playerId);
          setDismissedBatsmen(dismissed);

          // Restore current batsmen from database (for session persistence)
          // But only if they are not dismissed
          if (activeInnings.currentStrikerId && !dismissed.includes(activeInnings.currentStrikerId)) {
            setStrikerId(activeInnings.currentStrikerId);
          } else {
            setStrikerId(''); // Clear if dismissed
          }

          if (activeInnings.currentNonStrikerId && !dismissed.includes(activeInnings.currentNonStrikerId)) {
            setNonStrikerId(activeInnings.currentNonStrikerId);
          } else {
            setNonStrikerId(''); // Clear if dismissed
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch match data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordToss = async () => {
    if (!tossWinnerId || !tossDecision) {
      alert('Please select toss winner and decision');
      return;
    }

    try {
      const response = await matchAPI.recordToss(matchId, tossWinnerId, tossDecision);
      // The backend returns { match, innings } - extract the innings ID
      if (response.data.data.innings) {
        setCurrentInningsId(response.data.data.innings.id);
      }

      // Reset over tracking for new match
      setCurrentOverBowler('');
      setPreviousOverBowler('');
      setBallsInCurrentOver(0);
      setBatsmanId('');
      setBowlerId('');

      alert('Toss recorded successfully! Match is now LIVE.');
      setShowTossDialog(false);
      fetchMatchData();
    } catch (error: any) {
      console.error('Failed to record toss:', error);
      alert(error.response?.data?.message || 'Failed to record toss');
    }
  };

  const handleStartInnings = async () => {
    try {
      const response = await matchAPI.startInnings(matchId, inningsNumber);
      alert(`Innings ${inningsNumber} started!`);
      setCurrentInningsId(response.data.data.id);
      setShowStartInningsDialog(false);

      // Reset over tracking for new innings
      setCurrentOverBowler('');
      setPreviousOverBowler('');
      setBallsInCurrentOver(0);
      setBatsmanId('');
      setBowlerId('');

      fetchMatchData();
    } catch (error: any) {
      console.error('Failed to start innings:', error);
      alert(error.response?.data?.message || 'Failed to start innings');
    }
  };

  // Helper functions for advanced tracking
  const calculatePitchX = (line?: string): number | undefined => {
    const mapping: Record<string, number> = {
      'wide-leg': -1,
      'leg': -0.5,
      'middle': 0,
      'off': 0.5,
      'wide-off': 1,
    };
    return line ? mapping[line] : undefined;
  };

  const calculatePitchY = (length?: string): number | undefined => {
    const mapping: Record<string, number> = {
      'yorker': 0.95,
      'full': 0.75,
      'good': 0.5,
      'short': 0.25,
      'bouncer': 0.1,
    };
    return length ? mapping[length] : undefined;
  };

  const calculateShotAngle = (zone?: string): number | undefined => {
    const mapping: Record<string, number> = {
      'straight': 0,
      'mid-off': 15,
      'cover': 45,
      'point': 90,
      'third-man': 135,
      'fine-leg': -135,
      'square-leg': -90,
      'mid-wicket': -45,
      'mid-on': -15,
      'long-off': 30,
      'long-on': -30,
    };
    return zone ? mapping[zone] : undefined;
  };

  const generateBallTrajectory = (shotAngle?: number, distance?: number, pitchY?: number): string | undefined => {
    if (!shotAngle && shotAngle !== 0) return undefined;
    if (!distance) return undefined;

    const points: Array<{ x: number; y: number; z: number }> = [];
    const steps = 50;

    // Convert angle to radians
    const angleRad = (shotAngle * Math.PI) / 180;

    // Normalize distance (0-100 scale)
    const normalizedDistance = distance / 100;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;

      // Horizontal position
      const horizontalDistance = normalizedDistance * 4.4 * t; // Max 4.4 units
      const x = Math.sin(angleRad) * horizontalDistance * 0.5; // Side movement
      const z = -2.2 + Math.cos(angleRad) * horizontalDistance; // Forward/back movement

      // Vertical position (parabolic arc)
      const maxHeight = pitchY !== undefined ? 0.5 + pitchY * 1.5 : 1.5;
      const y = 0.5 + Math.sin(t * Math.PI) * maxHeight;

      points.push({ x, y, z });
    }

    return JSON.stringify(points);
  };

  const handleRecordBall = async () => {
    if (!strikerId || !bowlerId) {
      alert('Please select striker and bowler');
      return;
    }

    if (!nonStrikerId) {
      alert('Please select non-striker batsman');
      return;
    }

    // Cricket rules validation
    // Rule 1: Cannot change bowler mid-over (except at start of new over)
    if (ballsInCurrentOver > 0 && ballsInCurrentOver < 6 && currentOverBowler && bowlerId !== currentOverBowler) {
      alert(`Cannot change bowler mid-over. Current over bowler: ${bowlingTeamPlayers.find((p: any) => p.id === currentOverBowler)?.name}`);
      return;
    }

    // Rule 2: Same bowler cannot bowl consecutive overs
    if (ballsInCurrentOver === 0 && previousOverBowler && bowlerId === previousOverBowler) {
      alert(`Same bowler cannot bowl consecutive overs. ${bowlingTeamPlayers.find((p: any) => p.id === bowlerId)?.name} bowled the previous over.`);
      return;
    }

    // Determine extra type and if it's an extra
    let isExtra = false;
    let extraType = undefined;
    let extraRuns = 0;

    if (ballData.isWide) {
      isExtra = true;
      extraType = 'WIDE';
      extraRuns = 1 + ballData.runs;
    } else if (ballData.isNoBall) {
      isExtra = true;
      extraType = 'NO_BALL';
      extraRuns = 1 + ballData.runs;
    } else if (ballData.isBye) {
      isExtra = true;
      extraType = 'BYE';
      extraRuns = ballData.runs;
    } else if (ballData.isLegBye) {
      isExtra = true;
      extraType = 'LEG_BYE';
      extraRuns = ballData.runs;
    }

    // Validate wicket information
    if (ballData.isWicket) {
      if (!ballData.wicketType) {
        alert('Please select wicket type');
        return;
      }
      // Check if wicket type requires fielder selection
      const requiresFielder = ['CAUGHT', 'RUN_OUT', 'STUMPED', 'CAUGHT_AND_BOWLED'].includes(ballData.wicketType);
      if (requiresFielder && ballData.wicketType !== 'CAUGHT_AND_BOWLED' && !wicketTakerId) {
        alert('Please select who took the wicket');
        return;
      }
      // For run-outs, must specify which batsman is out
      if (ballData.wicketType === 'RUN_OUT' && !runOutBatsmanId) {
        alert('Please select which batsman is run out');
        return;
      }
    }

    // Generate commentary
    const batsmanName = battingTeamPlayers.find((p: any) => p.id === strikerId)?.name || 'Batsman';
    const bowlerName = bowlingTeamPlayers.find((p: any) => p.id === bowlerId)?.name || 'Bowler';
    let commentary = '';

    if (ballData.isWicket) {
      const wicketTakerName = wicketTakerId ? bowlingTeamPlayers.find((p: any) => p.id === wicketTakerId)?.name : bowlerName;
      // For run-outs, use the selected batsman's name
      const dismissedBatsmanName = ballData.wicketType === 'RUN_OUT'
        ? battingTeamPlayers.find((p: any) => p.id === runOutBatsmanId)?.name || 'Batsman'
        : batsmanName;

      switch (ballData.wicketType) {
        case 'BOWLED':
          commentary = `OUT! ${batsmanName} b ${bowlerName}. Timber! What a delivery!`;
          break;
        case 'CAUGHT':
          commentary = `OUT! ${batsmanName} c ${wicketTakerName} b ${bowlerName}. Great catch!`;
          break;
        case 'CAUGHT_AND_BOWLED':
          commentary = `OUT! ${batsmanName} c & b ${bowlerName}. Brilliant catch by the bowler!`;
          break;
        case 'LBW':
          commentary = `OUT! ${batsmanName} lbw b ${bowlerName}. Plumb in front!`;
          break;
        case 'RUN_OUT':
          commentary = `OUT! ${dismissedBatsmanName} run out (${wicketTakerName}). Brilliant fielding!`;
          break;
        case 'STUMPED':
          commentary = `OUT! ${batsmanName} st ${wicketTakerName} b ${bowlerName}. Lightning fast stumping!`;
          break;
        case 'HIT_WICKET':
          commentary = `OUT! ${batsmanName} hit wicket b ${bowlerName}. Unfortunate dismissal!`;
          break;
        default:
          commentary = `OUT! ${batsmanName} dismissed.`;
      }
    } else if (ballData.isWide) {
      commentary = `Wide! ${bowlerName} strays down the leg side. ${1 + ballData.runs} extra${1 + ballData.runs > 1 ? 's' : ''}.`;
    } else if (ballData.isNoBall) {
      commentary = `No Ball! ${bowlerName} oversteps. Free hit coming up! ${1 + ballData.runs} runs.`;
    } else if (ballData.isBye) {
      commentary = `${ballData.runs} Bye${ballData.runs > 1 ? 's' : ''}! Keeper misses it.`;
    } else if (ballData.isLegBye) {
      commentary = `${ballData.runs} Leg Bye${ballData.runs > 1 ? 's' : ''}! Off the pads.`;
    } else {
      switch (ballData.runs) {
        case 0:
          commentary = `Dot ball. ${bowlerName} to ${batsmanName}, no run.`;
          break;
        case 1:
          commentary = `${batsmanName} works it away for a single.`;
          break;
        case 2:
          commentary = `${batsmanName} finds the gap, they run two!`;
          break;
        case 3:
          commentary = `Good running! ${batsmanName} takes three runs.`;
          break;
        case 4:
          commentary = `FOUR! ${batsmanName} finds the boundary! Superb shot!`;
          break;
        case 6:
          commentary = `SIX! ${batsmanName} sends it sailing over the boundary! Maximum!`;
          break;
        default:
          commentary = `${batsmanName} scores ${ballData.runs} run${ballData.runs > 1 ? 's' : ''}.`;
      }
    }

    try {
      // Calculate strike rotation BEFORE sending to backend
      // Count rotation events - if odd count, rotate; if even count, cancel out
      const isLegalDelivery = !ballData.isWide && !ballData.isNoBall;
      let rotationCount = 0;

      // Rotation event 1: End of over
      if (isLegalDelivery) {
        const newBallCount = ballsInCurrentOver + 1;
        if (newBallCount >= 6) {
          rotationCount++; // Over completed
        }
      }

      // Rotation event 2: Odd runs (1, 3, 5)
      if (!ballData.isWicket && !ballData.isBye && !ballData.isLegBye) {
        if (ballData.runs % 2 === 1) {
          rotationCount++; // Odd runs scored
        }
      }

      // Apply rotation only if odd number of events (1 or 3)
      // Even number of events (0 or 2) cancel out
      const shouldRotateStrike = rotationCount % 2 === 1;

      // Calculate rotated batsmen to send to backend
      let finalStrikerId = strikerId;
      let finalNonStrikerId = nonStrikerId;

      if (shouldRotateStrike && !ballData.isWicket) {
        // After this ball, batsmen will swap ends
        finalStrikerId = nonStrikerId;
        finalNonStrikerId = strikerId;
      }

      // Determine which batsman is dismissed (for run-outs, use selected batsman)
      const dismissedBatsmanId = ballData.isWicket
        ? (ballData.wicketType === 'RUN_OUT' ? runOutBatsmanId : strikerId)
        : undefined;

      // If wicket, clear the dismissed batsman from final striker/non-striker
      if (ballData.isWicket) {
        if (dismissedBatsmanId === finalStrikerId) {
          finalStrikerId = ''; // New batsman needed
        } else if (dismissedBatsmanId === finalNonStrikerId) {
          finalNonStrikerId = ''; // New batsman needed
        }
      }

      await matchAPI.recordBall(matchId, {
        inningsId: currentInningsId,
        batsmanId: strikerId,
        bowlerId,
        runs: ballData.runs,
        isWicket: ballData.isWicket,
        wicketType: ballData.wicketType || undefined,
        dismissedPlayerId: dismissedBatsmanId,
        wicketTakerId: ballData.isWicket && wicketTakerId ? wicketTakerId : (ballData.wicketType === 'CAUGHT_AND_BOWLED' ? bowlerId : undefined),
        isExtra,
        extraType,
        extraRuns: isExtra ? extraRuns : undefined,
        commentary,
        // Send rotated batsmen for session persistence
        strikerId: finalStrikerId,
        nonStrikerId: finalNonStrikerId,
        // Advanced tracking data (optional)
        locationData: {
          shotType: locationData.shotType || undefined,
          shotZone: locationData.shotZone || undefined,
          shotAngle: calculateShotAngle(locationData.shotZone),
          shotDistance: ballData.runs >= 4 ? 100 : ballData.runs > 0 ? ballData.runs * 20 : undefined,
          pitchLine: locationData.pitchLine || undefined,
          pitchLength: locationData.pitchLength || undefined,
          pitchX: calculatePitchX(locationData.pitchLine),
          pitchY: calculatePitchY(locationData.pitchLength),
          ballSpeed: locationData.pitchLength ? (
            locationData.pitchLength === 'yorker' ? 140 :
            locationData.pitchLength === 'full' ? 135 :
            locationData.pitchLength === 'good' ? 130 :
            locationData.pitchLength === 'short' ? 125 : 120
          ) : undefined,
          ballTrajectory: generateBallTrajectory(
            calculateShotAngle(locationData.shotZone),
            ballData.runs >= 4 ? 100 : ballData.runs > 0 ? ballData.runs * 20 : undefined,
            calculatePitchY(locationData.pitchLength)
          ),
        },
      });

      // Handle wicket - add to dismissed list
      if (ballData.isWicket) {
        if (ballData.wicketType === 'RUN_OUT') {
          setDismissedBatsmen([...dismissedBatsmen, runOutBatsmanId]);
        } else {
          setDismissedBatsmen([...dismissedBatsmen, strikerId]);
        }
      }

      // Update over tracking
      if (ballsInCurrentOver === 0) {
        // Starting new over
        setCurrentOverBowler(bowlerId);
      }

      if (isLegalDelivery) {
        const newBallCount = ballsInCurrentOver + 1;

        if (newBallCount >= 6) {
          // Over completed - reset for next over
          setPreviousOverBowler(bowlerId);
          setCurrentOverBowler('');
          setBallsInCurrentOver(0);
          setBowlerId(''); // Reset bowler selection for new over
        } else {
          setBallsInCurrentOver(newBallCount);
        }
      }
      setWicketTakerId('');
      setRunOutBatsmanId('');
      setBallData({
        runs: 0,
        isWicket: false,
        wicketType: '',
        isWide: false,
        isNoBall: false,
        isBye: false,
        isLegBye: false,
      });
      setLocationData({
        shotType: '',
        shotZone: '',
        pitchLine: '',
        pitchLength: '',
      });

      fetchMatchData();
    } catch (error: any) {
      console.error('Failed to record ball:', error);
      alert(error.response?.data?.message || 'Failed to record ball');
    }
  };

  const handleCompleteInnings = async () => {
    if (!currentInningsId) {
      alert('No active innings');
      return;
    }

    if (!confirm('Are you sure you want to complete this innings?')) {
      return;
    }

    try {
      await matchAPI.completeInnings(matchId, currentInningsId);

      // Check which innings just completed
      const completedInnings = match.innings?.find((i: any) => i.id === currentInningsId);

      // Reset over tracking
      setCurrentOverBowler('');
      setPreviousOverBowler('');
      setBallsInCurrentOver(0);
      setBatsmanId('');
      setBowlerId('');

      if (completedInnings?.inningsNumber === 1) {
        alert('First innings completed! Now start the second innings.');
        setCurrentInningsId('');
        setInningsNumber(2);
        setShowStartInningsDialog(true);
      } else {
        alert('Second innings completed!');
        setCurrentInningsId('');
      }
      fetchMatchData();
    } catch (error: any) {
      console.error('Failed to complete innings:', error);
      alert(error.response?.data?.message || 'Failed to complete innings');
    }
  };

  const handleCompleteMatch = async () => {
    if (!confirm('Are you sure you want to complete this match? This will finalize the result.')) {
      return;
    }

    try {
      await matchAPI.completeMatch(matchId);
      alert('Match completed successfully!');
      router.push(`/dashboard/matches/${matchId}`);
    } catch (error: any) {
      console.error('Failed to complete match:', error);
      alert(error.response?.data?.message || 'Failed to complete match');
    }
  };

  if (loading) {
    return <div className="p-8">Loading match data...</div>;
  }

  if (!match) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Match not found</p>
            <Link href="/dashboard/matches" className="text-blue-600 hover:underline mt-4 block">
              ← Back to Matches
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get players for the match
  let battingTeamPlayers: any[] = [];
  let bowlingTeamPlayers: any[] = [];

  if (match.isQuickMatch && match.matchSquads) {
    // For quick matches, use matchSquads
    const homeSquadPlayerIds = match.matchSquads
      .filter((sq: any) => sq.teamId === match.homeTeamId)
      .map((sq: any) => sq.playerId);
    const awaySquadPlayerIds = match.matchSquads
      .filter((sq: any) => sq.teamId === match.awayTeamId)
      .map((sq: any) => sq.playerId);

    const homeSquadPlayers = match.matchSquads
      .filter((sq: any) => sq.teamId === match.homeTeamId)
      .map((sq: any) => sq.player);
    const awaySquadPlayers = match.matchSquads
      .filter((sq: any) => sq.teamId === match.awayTeamId)
      .map((sq: any) => sq.player);

    // Determine which team is batting based on current innings
    if (liveData?.currentInnings) {
      const battingTeamId = liveData.currentInnings.battingTeamId;
      battingTeamPlayers = battingTeamId === match.homeTeamId ? homeSquadPlayers : awaySquadPlayers;
      bowlingTeamPlayers = battingTeamId === match.homeTeamId ? awaySquadPlayers : homeSquadPlayers;
    } else {
      // Default: use all players if innings not started
      battingTeamPlayers = [...homeSquadPlayers, ...awaySquadPlayers];
      bowlingTeamPlayers = [...homeSquadPlayers, ...awaySquadPlayers];
    }
  } else {
    // For regular matches, use team contracts
    const homeTeamPlayers = players.filter((p: any) =>
      match.homeTeam?.contracts?.some((c: any) => c.playerId === p.id)
    );
    const awayTeamPlayers = players.filter((p: any) =>
      match.awayTeam?.contracts?.some((c: any) => c.playerId === p.id)
    );

    // Determine which team is batting based on current innings
    if (liveData?.currentInnings) {
      const battingTeamId = liveData.currentInnings.battingTeamId;
      battingTeamPlayers = battingTeamId === match.homeTeamId ? homeTeamPlayers : awayTeamPlayers;
      bowlingTeamPlayers = battingTeamId === match.homeTeamId ? awayTeamPlayers : homeTeamPlayers;
    } else {
      // Default: use all players if innings not started
      battingTeamPlayers = [...homeTeamPlayers, ...awayTeamPlayers];
      bowlingTeamPlayers = [...homeTeamPlayers, ...awayTeamPlayers];
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/dashboard/matches/${matchId}`} className="text-sm text-blue-600 hover:underline">
          ← Back to Match
        </Link>
        <h1 className="text-3xl font-bold mt-2">Live Scoring</h1>
        <p className="text-gray-600 mt-1">
          {match.homeTeam?.name} vs {match.awayTeam?.name}
        </p>
      </div>

      {/* Match Status */}
      <Card>
        <CardHeader>
          <CardTitle>Match Status: {match.status}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {match.status === 'SCHEDULED' && (
              <button
                onClick={() => setShowTossDialog(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                🎯 Record Toss (This will start the match)
              </button>
            )}

            {match.status === 'LIVE' && currentInningsId && (
              <>
                <button
                  onClick={() => {
                    // If mid-over, pre-select the current bowler
                    if (ballsInCurrentOver > 0 && ballsInCurrentOver < 6 && currentOverBowler) {
                      setBowlerId(currentOverBowler);
                    }
                    setShowBallDialog(true);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  ⚾ Record Ball
                </button>
                <button
                  onClick={handleCompleteInnings}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  ⏸️ Complete Current Innings
                </button>
              </>
            )}

            {match.status === 'LIVE' && !currentInningsId && match.innings?.filter((i: any) => i.status === 'COMPLETED').length === 1 && (
              <button
                onClick={() => {
                  setInningsNumber(2);
                  setShowStartInningsDialog(true);
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                ▶️ Start Second Innings
              </button>
            )}

            {match.status === 'LIVE' && !currentInningsId && match.innings?.filter((i: any) => i.status === 'COMPLETED').length === 2 && (
              <button
                onClick={handleCompleteMatch}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                🏁 Complete Match
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Score Display */}
      {liveData?.live && liveData.currentInnings && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {match.innings?.find((i: any) => i.id === currentInningsId)?.battingTeam?.name || 'Batting Team'} Innings
                </CardTitle>
                {match.innings?.length > 0 && match.innings[0].status === 'COMPLETED' && liveData.currentInnings.inningsNumber === 2 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Target</p>
                    <p className="text-2xl font-bold text-red-600">
                      {match.innings[0].totalRuns + 1}
                    </p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                {liveData.currentInnings.totalRuns}/{liveData.currentInnings.totalWickets}
                <span className="text-xl text-gray-600 ml-4">
                  ({liveData.currentInnings.totalOvers} overs)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Extras:</span> {liveData.currentInnings.extras}
                </div>
                <div>
                  <span className="text-gray-600">Run Rate:</span>{' '}
                  {liveData.currentInnings.totalOvers > 0
                    ? (liveData.currentInnings.totalRuns / liveData.currentInnings.totalOvers).toFixed(2)
                    : '0.00'}
                </div>
                {match.innings?.length > 0 && match.innings[0].status === 'COMPLETED' && liveData.currentInnings.inningsNumber === 2 && (
                  <div>
                    <span className="text-gray-600">Required RR:</span>{' '}
                    {liveData.currentInnings.totalOvers > 0 && match.customOvers
                      ? (((match.innings[0].totalRuns + 1) - liveData.currentInnings.totalRuns) / (match.customOvers - liveData.currentInnings.totalOvers)).toFixed(2)
                      : '0.00'}
                  </div>
                )}
              </div>
              {currentOverBowler && ballsInCurrentOver > 0 && ballsInCurrentOver < 6 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Over:</span>
                    <span className="font-medium">
                      {bowlingTeamPlayers.find((p: any) => p.id === currentOverBowler)?.name || 'Unknown'} - Ball {ballsInCurrentOver}/6
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Players */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Batting Team */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🏏 Batting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {liveData.currentInnings.battingPerformances && liveData.currentInnings.battingPerformances.length > 0 ? (
                    <>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Current Batsmen</p>
                        {liveData.currentInnings.battingPerformances
                          .filter((perf: any) => perf.isOut === false)
                          .slice(0, 2)
                          .map((perf: any) => (
                            <div key={perf.id} className="flex justify-between items-center py-2 border-b">
                              <div>
                                <span className="font-semibold">{perf.player?.name}</span>
                                <span className="text-xs text-green-600 ml-2">● Batting</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold">{perf.runs}</span>
                                <span className="text-gray-600 text-sm"> ({perf.ballsFaced})</span>
                                <div className="text-xs text-gray-500">SR: {perf.strikeRate?.toFixed(1)}</div>
                              </div>
                            </div>
                          ))}
                      </div>
                      {liveData.currentInnings.battingPerformances.filter((perf: any) => perf.isOut === true).length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Out</p>
                          {liveData.currentInnings.battingPerformances
                            .filter((perf: any) => perf.isOut === true)
                            .map((perf: any) => (
                              <div key={perf.id} className="flex justify-between items-center py-1 text-sm text-gray-600">
                                <span>{perf.player?.name}</span>
                                <span>{perf.runs} ({perf.ballsFaced})</span>
                              </div>
                            ))}
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Yet to Bat</p>
                        <div className="flex flex-wrap gap-2">
                          {battingTeamPlayers
                            .filter((p: any) => !liveData.currentInnings.battingPerformances.some((perf: any) => perf.playerId === p.id))
                            .map((player: any) => (
                              <span key={player.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {player.name}
                              </span>
                            ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">No batting data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bowling Team */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚾ Bowling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {liveData.currentInnings.bowlingPerformances && liveData.currentInnings.bowlingPerformances.length > 0 ? (
                    <>
                      {currentOverBowler && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Current Bowler</p>
                          {liveData.currentInnings.bowlingPerformances
                            .filter((perf: any) => perf.playerId === currentOverBowler)
                            .map((perf: any) => (
                              <div key={perf.id} className="flex justify-between items-center py-2 border-b bg-blue-50 px-2 rounded">
                                <div>
                                  <span className="font-semibold">{perf.player?.name}</span>
                                  <span className="text-xs text-blue-600 ml-2">● Bowling</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold">{perf.wickets}-{perf.runsConceded}</span>
                                  <span className="text-gray-600 text-sm"> ({perf.oversBowled})</span>
                                  <div className="text-xs text-gray-500">ER: {perf.economyRate?.toFixed(2)}</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Other Bowlers</p>
                        {liveData.currentInnings.bowlingPerformances
                          .filter((perf: any) => perf.playerId !== currentOverBowler)
                          .map((perf: any) => (
                            <div key={perf.id} className="flex justify-between items-center py-1 text-sm">
                              <span>{perf.player?.name}</span>
                              <span className="text-gray-600">{perf.wickets}-{perf.runsConceded} ({perf.oversBowled})</span>
                            </div>
                          ))}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Yet to Bowl</p>
                        <div className="flex flex-wrap gap-2">
                          {bowlingTeamPlayers
                            .filter((p: any) => !liveData.currentInnings.bowlingPerformances.some((perf: any) => perf.playerId === p.id))
                            .map((player: any) => (
                              <span key={player.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {player.name}
                              </span>
                            ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">No bowling data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Commentary */}
          {match.commentary && match.commentary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>📝 Recent Commentary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {match.commentary.map((comment: any, idx: number) => (
                    <div key={comment.id || idx} className="border-b pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="text-xs text-gray-500">
                            {comment.overNumber}.{comment.ballNumber}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="text-sm">{comment.text || 'No commentary'}</span>
                        </div>
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(comment.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {match.commentary.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No commentary yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 How to Score a Match</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Step 1:</strong> Record Toss - Select which team won the toss and their decision (bat/bowl). This automatically starts the first innings.</p>
          <p><strong>Step 2:</strong> Record Balls - Enter ball-by-ball scores for each delivery</p>
          <p><strong>Step 3:</strong> Complete Innings - When first innings ends, then start the second innings</p>
          <p><strong>Step 4:</strong> Complete Match - Finalize the match to calculate results and winner</p>
        </CardContent>
      </Card>

      {/* Toss Dialog */}
      {showTossDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Record Toss</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Toss Winner</label>
                <select
                  value={tossWinnerId}
                  onChange={(e) => setTossWinnerId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select team</option>
                  <option value={match.homeTeamId}>{match.homeTeam?.name}</option>
                  <option value={match.awayTeamId}>{match.awayTeam?.name}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
                <select
                  value={tossDecision}
                  onChange={(e) => setTossDecision(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select decision</option>
                  <option value="bat">Bat First</option>
                  <option value="bowl">Bowl First</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowTossDialog(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordToss}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Record Toss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Innings Dialog */}
      {showStartInningsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Start Innings {inningsNumber}</h3>
            <p className="text-gray-600 mb-6">
              Ready to start innings {inningsNumber}? The match will go LIVE.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowStartInningsDialog(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleStartInnings}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              >
                Start Innings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ball Recording Dialog */}
      {showBallDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 my-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Record Ball</h3>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Current Over Info */}
              {ballsInCurrentOver > 0 && ballsInCurrentOver < 6 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-medium">
                    📊 Current Over: Ball {ballsInCurrentOver + 1} of 6
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Bowler and batsman are locked during the over
                  </p>
                </div>
              )}

              {ballsInCurrentOver === 0 && previousOverBowler && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 font-medium">
                    🔄 New Over - Select a different bowler
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Previous bowler: {bowlingTeamPlayers.find((p: any) => p.id === previousOverBowler)?.name}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ⚾ Striker (On Strike) {strikerId && !dismissedBatsmen.includes(strikerId) && <span className="text-xs text-gray-500">(Locked until wicket)</span>}
                  </label>
                  <select
                    value={strikerId}
                    onChange={(e) => setStrikerId(e.target.value)}
                    disabled={strikerId !== '' && !dismissedBatsmen.includes(strikerId)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select striker</option>
                    {battingTeamPlayers
                      .filter((player: any) => !dismissedBatsmen.includes(player.id) && player.id !== nonStrikerId)
                      .map((player: any) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                  </select>
                  {strikerId && !dismissedBatsmen.includes(strikerId) && (
                    <p className="text-xs text-gray-500 mt-1">
                      🔒 Locked - Will auto-rotate based on runs
                    </p>
                  )}
                  {strikerId === '' && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Select a new batsman
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏏 Non-Striker {nonStrikerId && !dismissedBatsmen.includes(nonStrikerId) && <span className="text-xs text-gray-500">(Locked until wicket)</span>}
                  </label>
                  <select
                    value={nonStrikerId}
                    onChange={(e) => setNonStrikerId(e.target.value)}
                    disabled={nonStrikerId !== '' && !dismissedBatsmen.includes(nonStrikerId)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select non-striker</option>
                    {battingTeamPlayers
                      .filter((player: any) => !dismissedBatsmen.includes(player.id) && player.id !== strikerId)
                      .map((player: any) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                  </select>
                  {nonStrikerId && !dismissedBatsmen.includes(nonStrikerId) && (
                    <p className="text-xs text-gray-500 mt-1">
                      🔒 Locked - Will auto-rotate based on runs
                    </p>
                  )}
                  {nonStrikerId === '' && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Select a new batsman
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bowler {ballsInCurrentOver > 0 && ballsInCurrentOver < 6 && <span className="text-xs text-gray-500">(Locked)</span>}
                </label>
                <select
                  value={bowlerId}
                  onChange={(e) => setBowlerId(e.target.value)}
                  disabled={ballsInCurrentOver > 0 && ballsInCurrentOver < 6 && bowlerId !== ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select bowler</option>
                  {bowlingTeamPlayers
                    .filter((player: any) => {
                      // Filter out previous over bowler if starting new over
                      if (ballsInCurrentOver === 0 && previousOverBowler) {
                        return player.id !== previousOverBowler;
                      }
                      return true;
                    })
                    .map((player: any) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                </select>
                {ballsInCurrentOver === 0 && previousOverBowler && (
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ Cannot select {bowlingTeamPlayers.find((p: any) => p.id === previousOverBowler)?.name} (bowled previous over)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Runs</label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={ballData.runs}
                  onChange={(e) => setBallData({ ...ballData, runs: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={ballData.isWicket}
                    onChange={(e) => setBallData({ ...ballData, isWicket: e.target.checked })}
                    className="rounded"
                  />
                  <span>Wicket</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={ballData.isWide}
                    onChange={(e) => setBallData({ ...ballData, isWide: e.target.checked })}
                    className="rounded"
                  />
                  <span>Wide</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={ballData.isNoBall}
                    onChange={(e) => setBallData({ ...ballData, isNoBall: e.target.checked })}
                    className="rounded"
                  />
                  <span>No Ball</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={ballData.isBye}
                    onChange={(e) => setBallData({ ...ballData, isBye: e.target.checked })}
                    className="rounded"
                  />
                  <span>Bye</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={ballData.isLegBye}
                    onChange={(e) => setBallData({ ...ballData, isLegBye: e.target.checked })}
                    className="rounded"
                  />
                  <span>Leg Bye</span>
                </label>
              </div>

              {ballData.isWicket && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wicket Type *</label>
                    <select
                      value={ballData.wicketType}
                      onChange={(e) => {
                        setBallData({ ...ballData, wicketType: e.target.value });
                        setWicketTakerId(''); // Reset wicket taker when type changes
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select type</option>
                      <option value="BOWLED">Bowled</option>
                      <option value="CAUGHT">Caught</option>
                      <option value="CAUGHT_AND_BOWLED">Caught & Bowled</option>
                      <option value="LBW">LBW</option>
                      <option value="RUN_OUT">Run Out</option>
                      <option value="STUMPED">Stumped</option>
                      <option value="HIT_WICKET">Hit Wicket</option>
                    </select>
                  </div>

                  {ballData.wicketType === 'CAUGHT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Caught by *</label>
                      <select
                        value={wicketTakerId}
                        onChange={(e) => setWicketTakerId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select fielder</option>
                        {bowlingTeamPlayers.map((player: any) => (
                          <option key={player.id} value={player.id}>
                            {player.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {ballData.wicketType === 'RUN_OUT' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Which batsman is out? *</label>
                        <select
                          value={runOutBatsmanId}
                          onChange={(e) => setRunOutBatsmanId(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select batsman</option>
                          {strikerId && (
                            <option value={strikerId}>
                              {battingTeamPlayers.find((p: any) => p.id === strikerId)?.name} (Striker)
                            </option>
                          )}
                          {nonStrikerId && (
                            <option value={nonStrikerId}>
                              {battingTeamPlayers.find((p: any) => p.id === nonStrikerId)?.name} (Non-Striker)
                            </option>
                          )}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Select who got run out</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Run out by *</label>
                        <select
                          value={wicketTakerId}
                          onChange={(e) => setWicketTakerId(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Select fielder</option>
                          {bowlingTeamPlayers.map((player: any) => (
                            <option key={player.id} value={player.id}>
                              {player.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Select the player who threw/broke the stumps</p>
                      </div>
                    </div>
                  )}

                  {ballData.wicketType === 'STUMPED' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stumped by *</label>
                      <select
                        value={wicketTakerId}
                        onChange={(e) => setWicketTakerId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select wicketkeeper</option>
                        {bowlingTeamPlayers.filter((p: any) => p.role === 'WICKETKEEPER').map((player: any) => (
                          <option key={player.id} value={player.id}>
                            {player.name}
                          </option>
                        ))}
                        {/* Show all if no wicketkeeper found */}
                        {bowlingTeamPlayers.filter((p: any) => p.role === 'WICKETKEEPER').length === 0 &&
                          bowlingTeamPlayers.map((player: any) => (
                            <option key={player.id} value={player.id}>
                              {player.name}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  )}

                  {ballData.wicketType === 'CAUGHT_AND_BOWLED' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        ℹ️ The wicket will be credited to the bowler ({bowlingTeamPlayers.find((p: any) => p.id === bowlerId)?.name || 'bowler'})
                      </p>
                    </div>
                  )}

                  {['BOWLED', 'LBW', 'HIT_WICKET'].includes(ballData.wicketType) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        ✓ Wicket will be credited to the bowler
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Advanced Tracking Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    📊 Advanced Tracking (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedTracking(!showAdvancedTracking)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showAdvancedTracking ? '▲ Hide' : '▼ Show'}
                  </button>
                </div>

                {showAdvancedTracking && (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-3">
                      Capture additional data for advanced visualizations (Wagon Wheel, Pitch Map, 3D Replay)
                    </p>

                    {/* Shot Data - only for runs */}
                    {ballData.runs > 0 && !ballData.isWicket && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Shot Type
                          </label>
                          <select
                            value={locationData.shotType}
                            onChange={(e) => setLocationData({ ...locationData, shotType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Select shot type</option>
                            <option value="drive">Drive</option>
                            <option value="pull">Pull</option>
                            <option value="cut">Cut</option>
                            <option value="sweep">Sweep</option>
                            <option value="flick">Flick</option>
                            <option value="hook">Hook</option>
                            <option value="loft">Loft</option>
                            <option value="glance">Glance</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Shot Zone
                          </label>
                          <select
                            value={locationData.shotZone}
                            onChange={(e) => setLocationData({ ...locationData, shotZone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Select zone</option>
                            <option value="straight">Straight</option>
                            <option value="mid-off">Mid Off</option>
                            <option value="cover">Cover</option>
                            <option value="point">Point</option>
                            <option value="third-man">Third Man</option>
                            <option value="fine-leg">Fine Leg</option>
                            <option value="square-leg">Square Leg</option>
                            <option value="mid-wicket">Mid Wicket</option>
                            <option value="mid-on">Mid On</option>
                            <option value="long-off">Long Off</option>
                            <option value="long-on">Long On</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* Pitch Data - always shown */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Pitch Line
                      </label>
                      <select
                        value={locationData.pitchLine}
                        onChange={(e) => setLocationData({ ...locationData, pitchLine: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">Select line</option>
                        <option value="wide-off">Wide Off</option>
                        <option value="off">Off Stump</option>
                        <option value="middle">Middle Stump</option>
                        <option value="leg">Leg Stump</option>
                        <option value="wide-leg">Wide Leg</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Pitch Length
                      </label>
                      <select
                        value={locationData.pitchLength}
                        onChange={(e) => setLocationData({ ...locationData, pitchLength: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">Select length</option>
                        <option value="yorker">Yorker</option>
                        <option value="full">Full</option>
                        <option value="good">Good Length</option>
                        <option value="short">Short</option>
                        <option value="bouncer">Bouncer</option>
                      </select>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-3">
                      <p className="text-xs text-blue-800">
                        💡 <strong>Tip:</strong> This data powers Wagon Wheel, Pitch Map, and 3D Replay visualizations. It's optional but highly recommended for detailed analysis.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowBallDialog(false);
                  setWicketTakerId('');
                  setRunOutBatsmanId('');
                  // Don't reset batsman/bowler if we're mid-over
                  setBallData({
                    runs: 0,
                    isWicket: false,
                    wicketType: '',
                    isWide: false,
                    isNoBall: false,
                    isBye: false,
                    isLegBye: false,
                  });
                  setLocationData({
                    shotType: '',
                    shotZone: '',
                    pitchLine: '',
                    pitchLength: '',
                  });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordBall}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Record Ball
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Polls & Predictions */}
      {match.status === 'LIVE' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span>
              <span>Live Polls & Predictions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <CreatePoll
                matchId={matchId}
                onPollCreated={() => {
                  // Polls will auto-refresh via Socket.IO
                }}
              />
              <div className="border-t pt-6">
                <LivePolls matchId={matchId} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
