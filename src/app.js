import dotenv from 'dotenv';
import express from 'express';
import { eventRouter } from './routes/event-routes.js';
import { userRouter } from './routes/user-routes.js';

dotenv.config();

const { PORT: port = 3000 } = process.env;

const app = express();
app.use(express.json());

app.use('/events', eventRouter);
app.use('/user', userRouter);

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
