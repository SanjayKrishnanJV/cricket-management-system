import { Request, Response, NextFunction } from 'express';
import { TeamService } from '../services/team.service';
import { AuthRequest } from '../types';

const teamService = new TeamService();

export class TeamController {
  async createTeam(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        ownerId: req.user!.id,
      };
      const team = await teamService.createTeam(data);
      res.status(201).json({
        status: 'success',
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const teams = await teamService.getAllTeams();
      res.status(200).json({
        status: 'success',
        data: teams,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeamById(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await teamService.getTeamById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await teamService.updateTeam(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTeam(req: Request, res: Response, next: NextFunction) {
    try {
      await teamService.deleteTeam(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Team deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeamSquad(req: Request, res: Response, next: NextFunction) {
    try {
      const squad = await teamService.getTeamSquad(req.params.id);
      res.status(200).json({
        status: 'success',
        data: squad,
      });
    } catch (error) {
      next(error);
    }
  }

  async addPlayerToTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { playerId, amount } = req.body;
      const contract = await teamService.addPlayerToTeam(
        req.params.id,
        playerId,
        amount
      );
      res.status(201).json({
        status: 'success',
        data: contract,
      });
    } catch (error) {
      next(error);
    }
  }

  async removePlayerFromTeam(req: Request, res: Response, next: NextFunction) {
    try {
      await teamService.removePlayerFromTeam(req.params.contractId);
      res.status(200).json({
        status: 'success',
        message: 'Player removed from team',
      });
    } catch (error) {
      next(error);
    }
  }

  async setCaptain(req: Request, res: Response, next: NextFunction) {
    try {
      const { playerId } = req.body;
      const team = await teamService.setCaptain(req.params.id, playerId);
      res.status(200).json({
        status: 'success',
        message: 'Captain set successfully',
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  async setViceCaptain(req: Request, res: Response, next: NextFunction) {
    try {
      const { playerId } = req.body;
      const team = await teamService.setViceCaptain(req.params.id, playerId);
      res.status(200).json({
        status: 'success',
        message: 'Vice-captain set successfully',
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }
}
