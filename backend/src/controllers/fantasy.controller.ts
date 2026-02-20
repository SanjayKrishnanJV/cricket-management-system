import { Request, Response, NextFunction } from 'express';
import { fantasyService } from '../services/fantasy.service';
import { AppError } from '../middleware/errorHandler';

export const createLeague = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { name, type, tournamentId, maxTeams, teamBudget, maxPlayers } = req.body;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    if (!name || !type || !tournamentId) {
      throw new AppError('Name, type, and tournament ID are required', 400);
    }

    const result = await fantasyService.createLeague({
      name,
      type,
      tournamentId,
      createdBy: userId,
      maxTeams,
      teamBudget,
      maxPlayers,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const joinLeague = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { joinCode } = req.body;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    if (!joinCode) {
      throw new AppError('Join code is required', 400);
    }

    const result = await fantasyService.joinLeague(userId, joinCode);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { leagueId, name, players, captain, viceCaptain } = req.body;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    if (!leagueId || !name || !players || !Array.isArray(players)) {
      throw new AppError('League ID, name, and players array are required', 400);
    }

    const result = await fantasyService.createTeam({
      leagueId,
      userId,
      name,
      players,
      captain,
      viceCaptain,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getLeagueLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { leagueId } = req.params;

    if (!leagueId) {
      throw new AppError('League ID is required', 400);
    }

    const result = await fantasyService.getLeagueLeaderboard(leagueId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getPlayerValues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tournamentId } = req.params;

    if (!tournamentId) {
      throw new AppError('Tournament ID is required', 400);
    }

    const result = await fantasyService.getPlayerValues(tournamentId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const calculateMatchPoints = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { matchId } = req.params;

    if (!matchId) {
      throw new AppError('Match ID is required', 400);
    }

    const result = await fantasyService.calculateMatchPoints(matchId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const initializePlayerValues = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tournamentId } = req.params;

    if (!tournamentId) {
      throw new AppError('Tournament ID is required', 400);
    }

    const result = await fantasyService.initializePlayerValues(tournamentId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getTeamDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      throw new AppError('Team ID is required', 400);
    }

    const result = await fantasyService.getTeamDetails(teamId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
