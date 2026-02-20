import express from 'express';
import * as calendarController from '../controllers/calendar.controller';

const router = express.Router();

// iCal export endpoints (100% free, no API keys needed)
router.get('/match/:id/ical', calendarController.exportMatchIcal);
router.get('/tournament/:id/ical', calendarController.exportTournamentIcal);

export default router;
