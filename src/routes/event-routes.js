import express from 'express';
import { catchErrors } from '../lib/catch-errors.js';
import { findUser, getEvent, listEvents, register } from '../lib/db.js';
import { requireAuthentication } from '../lib/login.js';

export const eventRouter = express.Router();

async function allEventRoute(req, res) {
  const events = await listEvents();
  res.json({ events });
}

async function makeEvent(req, res) {
  const { name, slug, description } = req.body;
}

async function registerForEvent(req, res) {
  const { username, comment } = req;
  const { id } = req.params;
  let success;
  // laga mögulega, setja name í comment eða eh
  try {
    success = await register(username, comment, id);
  } catch (error) {
    console.error(error);
  }

  if (success) {
    return res.status(200).json({ msg: 'Þú hefur verið skráð/ur' });
  }
  return res.status(500).json({ error: 'something went wrong' });
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
// eventRouter.post('/', requireAuthentication, catchErrors(makeEvent));
eventRouter.get('/:id', catchErrors(eventRoute));
eventRouter.post(
  '/:id/register',
  requireAuthentication,
  catchErrors(registerForEvent)
);
