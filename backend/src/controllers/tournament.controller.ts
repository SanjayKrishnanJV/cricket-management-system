import { Request, Response, NextFunction } from 'express';
import { TournamentService } from '../services/tournament.service';
import { tournamentSchedulingService } from '../services/tournament-scheduling.service';
import { AuthRequest } from '../types';

const tournamentService = new TournamentService();

export class TournamentController {
  async createTournament(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        adminId: req.user!.id,
      };
      const tournament = await tournamentService.createTournament(data);
      res.status(201).json({
        status: 'success',
        data: tournament,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTournaments(req: Request, res: Response, next: NextFunction) {
    try {
      const tournaments = await tournamentService.getAllTournaments();
      res.status(200).json({
        status: 'success',
        data: tournaments,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTournamentById(req: Request, res: Response, next: NextFunction) {
    try {
      const tournament = await tournamentService.getTournamentById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: tournament,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTournament(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tournament = await tournamentService.updateTournament(
        req.params.id,
        req.body
      );
      res.status(200).json({
        status: 'success',
        data: tournament,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTournament(req: Request, res: Response, next: NextFunction) {
    try {
      await tournamentService.deleteTournament(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Tournament deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async addTeamToTournament(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.body;
      const result = await tournamentService.addTeamToTournament(
        req.params.id,
        teamId
      );
      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateFixtures(req: Request, res: Response, next: NextFunction) {
    try {
      const matches = await tournamentService.generateFixtures(req.params.id);
      res.status(201).json({
        status: 'success',
        data: matches,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPointsTable(req: Request, res: Response, next: NextFunction) {
    try {
      const pointsTable = await tournamentService.getPointsTable(req.params.id);
      res.status(200).json({
        status: 'success',
        data: pointsTable,
      });
    } catch (error) {
      next(error);
    }
  }

  async scheduleMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await tournamentSchedulingService.scheduleRoundRobinMatches(req.params.id);
      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async schedulePlayoffs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await tournamentSchedulingService.schedulePlayoffs(req.params.id);
      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStandings(req: Request, res: Response, next: NextFunction) {
    try {
      const standings = await tournamentSchedulingService.getStandings(req.params.id);
      res.status(200).json({
        status: 'success',
        data: standings,
      });
    } catch (error) {
      next(error);
    }
  }
}
