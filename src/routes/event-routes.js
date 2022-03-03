import express from 'express';
import slugify from 'slugify';
import { catchErrors } from '../lib/catch-errors.js';
import {
  createEvent,
  findUser,
  getEvent,
  listEvents,
  register,
  removeEvent,
  update,
} from '../lib/db.js';
import { requireAuthentication } from '../lib/login.js';
import {
  eventValidateRequest,
  eventValidation,
  sanitizationMiddleware,
  xssSanitizationMiddleware,
} from '../lib/validation.js';

export const eventRouter = express.Router();

async function allEventRoute(req, res) {
  const events = await listEvents();
  res.json({ events });
}

async function makeEvent(req, res) {
  const { name, description } = req.body;
  const { id } = req.user;
  const slug = slugify(name);
  let success;
  try {
    success = await createEvent(id, name, slug, description);
  } catch (error) {
    console.error(error);
  }
  if (success) {
    return res.status(200).json({ sucess: 'event created' });
  }
  return res.status(500).json({ error: 'not created' });
}

async function registerForEvent(req, res) {
  const { username, comment } = req;
  const { id } = req.params;
  let success;
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

async function patchEvent(req, res) {
  const { name, description } = req.body;
  const { id } = req.params;
  const result = await update(id, { name, description });
  if (!result) {
    return res.status(400).json({ error: 'not found' });
  }
  return res.status(200).json({ result });
}

async function deleteEvent(req, res) {
  const { id } = req.params;
  const event = await getEvent(id);
  if (!event) {
    return res.status(404).json({ error: 'not found' });
  }
  const { user } = req;
  let success;
  if (user.id === event.userid || user.admin) {
    try {
      success = await removeEvent(id);
    } catch (error) {
      console.error(error);
    }
    if (success) {
      return res.status(200).json({ msg: 'Event deleted' });
    }
    return res.status(500).json({ error: 'something went wrong' });
  }
  return res
    .status(401)
    .json({ errors: 'bara admin eða sá sem bjó til viðburðinn má eyða honum' });
}
eventRouter.get('/', catchErrors(allEventRoute));
eventRouter.post(
  '/',
  requireAuthentication,
  eventValidation,
  xssSanitizationMiddleware,
  catchErrors(eventValidateRequest),
  sanitizationMiddleware,
  catchErrors(makeEvent)
);
eventRouter.get('/:id', catchErrors(eventRoute));
eventRouter.patch('/:id', catchErrors(patchEvent));
eventRouter.delete('/:id', requireAuthentication, catchErrors(deleteEvent));
eventRouter.post(
  '/:id/register',
  requireAuthentication,
  catchErrors(registerForEvent)
);
