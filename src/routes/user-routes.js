import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { catchErrors } from '../lib/catch-errors.js';
import { findUser, getUsers, registerUser } from '../lib/db.js';
import { jwtOptions, requireAuthentication } from '../lib/login.js';
import { comparePasswords, findById, findByUsername } from '../lib/users.js';
import {
  registrationValidationMiddleware,
  validateRequest,
} from '../lib/validation.js';

export const userRouter = express.Router();

async function isAdmin(req, res, next) {
  const { user } = req;
  if (user.admin) {
    return next();
  }
  return res.status(401).json({ error: 'not admin' });
}

async function login(req, res) {
  const { username, password = '' } = req.body;

  const user = await findByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'no such user' });
  }

  const correctPassword = await comparePasswords(password, user.password);

  if (correctPassword) {
    const payload = { id: user.id, isAdmin: user.admin };
    const tokenOptions = { expiresIn: 200 };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
    return res.json({ token });
  }

  return res.status(401).json({ error: 'incorrect password' });
}

async function registerRoute(req, res) {
  const { name, username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 11);

  const result = await registerUser(name, username, hashedPassword);
  if (result) {
    return res.status(200).json({ result });
  }
  return res.status(500).json({ error: 'unable to register' });
}

async function usersRoute(req, res) {
  const users = await getUsers();
  res.status(200).json({ users });
}

async function meRoute(req, res) {
  const { user } = req;
  const me = await findUser(user.id);
  res.status(200).json({ me });
}

async function userIdRoute(req, res) {
  const { id } = req.params;
  const user = await findUser(id);
  res.status(200).json({ user });
}

userRouter.get('/', requireAuthentication, isAdmin, catchErrors(usersRoute));
userRouter.post('/login', catchErrors(login));
userRouter.post(
  '/register',
  registrationValidationMiddleware,
  validateRequest,
  catchErrors(registerRoute)
);
userRouter.get('/me', requireAuthentication, catchErrors(meRoute));
userRouter.get(
  '/:id',
  requireAuthentication,
  isAdmin,
  catchErrors(userIdRoute)
);
