import express from 'express';
import jwt from 'jsonwebtoken';
import { catchErrors } from '../lib/catch-errors.js';
import { findUser, getUsers } from '../lib/db.js';
import { jwtOptions, requireAuthentication } from '../lib/login.js';
import { comparePasswords, findById, findByUsername } from '../lib/users.js';

export const userRouter = express.Router();

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

async function usersRoute(req, res) {
  const { user } = req;
  const users = await getUsers();
  if (user.admin) {
    res.status(200).json({ users });
  }
  res.status(401).json({ error: 'not admin' });
}

async function meRoute(req, res) {
  const { user } = req;
  const me = await findUser(user.id);
  res.status(200).json({ me });
}

userRouter.get('/', requireAuthentication, catchErrors(usersRoute));
userRouter.post('/login', catchErrors(login));
userRouter.get('/me', requireAuthentication, catchErrors(meRoute));
