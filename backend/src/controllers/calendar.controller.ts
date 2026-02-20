import { Request, Response, NextFunction } from 'express';
import { calendarService } from '../services/calendar.service';

export const exportMatchIcal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const icalData = await calendarService.generateICalForMatch(id);

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="match-${id}.ics"`);
    res.send(icalData);
  } catch (error) {
    next(error);
  }
};

export const exportTournamentIcal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const icalData = await calendarService.generateICalForTournament(id);

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="tournament-${id}.ics"`);
    res.send(icalData);
  } catch (error) {
    next(error);
  }
};
