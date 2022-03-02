import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import express from 'express';
import { createSchema, dropSchema, end } from '../lib/db';

import { userRouter } from '../routes/user-routes.js';
/**
 * Hér er test gagnagrunnur búinn til og hent áður en test eru keyrð.
 * package.json sér um að nota dotenv-cli til að loada .env.test sem vísar í þann gagnagrunn
 * sem ætti *ekki* að vera sá sami og við notum „almennt“
 */
const app = express();
app.use(express.json());
app.use('/user', userRouter);
describe('routeTest', () => {
  beforeAll(async () => {
    await dropSchema();
    await createSchema();
  });

  afterAll(async () => {
    await end();
  });

  it('tests GET /user', async () => {});
});
