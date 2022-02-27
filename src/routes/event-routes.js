import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';
import { getEvent, listEvents } from '../lib/db.js';

export const eventRouter = express.Router();

async function allEventRoute(req, res) {
  const events = await listEvents();
  res.json({ events });
}

async function eventRoute(req, res) {
  const { id } = req.params;
  const event = await getEvent(Number(id));
  if (!event) {
    res.status(404).json({ error: 'fannst ekki' });
  }
  res.json({ event });
}

eventRouter.get('/', catchErrors(allEventRoute));
eventRouter.get('/:id', catchErrors(eventRoute));
