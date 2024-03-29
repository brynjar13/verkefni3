import dotenv from 'dotenv';
import express from 'express';
import passport from './lib/login.js';
import { eventRouter } from './routes/event-routes.js';
import { userRouter } from './routes/user-routes.js';

dotenv.config({ path: '../.env.test' });

const {
  PORT: port = 3000,
  JWT_SECRET: jwtSecret,
  DATABASE_URL: databaseUrl,
} = process.env;

if (!databaseUrl || !jwtSecret) {
  console.error('vantar .env gildi');
  process.exit(1);
}

const app = express();
app.use(express.json());

app.use(passport.initialize());

app.use('/user', userRouter);
app.use('/events', eventRouter);

/** Middleware sem sér um 404 villur. */
app.use((req, res) => {
  res.status(404).json({ error: 'fannst ekki' });
});

/** Middleware sem sér um villumeðhöndlun. */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'villa kom upp' });
});

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
