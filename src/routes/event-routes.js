import express from 'express';
import slugify from 'slugify';
import { catchErrors } from '../lib/catch-errors.js';
import {
  checkRegistration,
  createEvent,
  findUser,
  getEvent,
  getRegistrations,
  listEvents,
  register,
  removeEvent,
  update,
} from '../lib/db.js';
import { requireAuthentication } from '../lib/login.js';
import {
  eventValidateRequest,
  eventValidation,
  registerSanitizationMiddleware,
  registerXssSanitizationMiddleware,
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
    return res.status(201).json({ sucess: 'Viðburður búinn til' });
  }
  return res.status(500).json({ error: 'something went wrong' });
}

async function registerForEvent(req, res) {
  const { comment } = req.body;
  const { user } = req;
  const { id } = req.params;
  const event = await getEvent(id);
  if (!event) {
    return res.status(404).json({ error: 'Not found' });
  }
  const username = await findUser(user.id);
  const registrations = await getRegistrations(id);
  for (let i = 0; i < registrations.length; i += 1) {
    if (username === registrations.name) {
      return res.status(400).json({ error: 'Þú ert nú þegar skráð-ur' });
    }
  }
  let success;
  try {
    success = await register(username.username, comment, id);
  } catch (error) {
    console.error(error);
  }

  if (success) {
    return res.status(201).json({ msg: 'Þú hefur verið skráð-ur' });
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
  const { user } = req;
  const { id } = req.params;
  const result = await update(id, { name, description });
  if (!result) {
    return res.status(404).json({ error: 'Fannst ekki' });
  }
  return res.status(200).json({ result });
}

async function deleteEvent(req, res) {
  const { id } = req.params;
  const event = await getEvent(id);
  if (!event) {
    return res.status(404).json({ error: 'Fannst ekki' });
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
      return res.status(204).json({ msg: 'Viðburði eytt' });
    }
    return res.status(500).json({ error: 'something went wrong' });
  }
  return res
    .status(401)
    .json({ errors: 'bara admin eða sá sem bjó til viðburðinn má eyða honum' });
}

async function deleteRegistration(req, res) {
  const { user } = req;
  const { id } = req.params;
  const event = await getEvent(id);
  const username = await findUser(user.id);
  if (!event) {
    return res.status(404).json({ error: 'Fannst ekki' });
  }
  const check = await checkRegistration(username.username, id);
  if (!check) {
    res.status(400).json({
      error:
        'Það er ekki hægt að afskrá sig nema að maður sé búinn að skrá sig first',
    });
  }
  return res.status(204).json({ msg: 'Afskráning tókst' });
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
eventRouter.patch('/:id', requireAuthentication, catchErrors(patchEvent));
eventRouter.delete('/:id', requireAuthentication, catchErrors(deleteEvent));
eventRouter.post(
  '/:id/register',
  requireAuthentication,
  registerXssSanitizationMiddleware,
  registerSanitizationMiddleware,
  catchErrors(registerForEvent)
);
eventRouter.delete(
  '/:id/register',
  requireAuthentication,
  catchErrors(deleteRegistration)
);
