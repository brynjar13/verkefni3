import { describe, expect, it } from '@jest/globals';
import {
  deleteAndParse,
  fetchAndParse,
  loginAndReturnToken,
  patchAndParse,
  postAndParse,
} from './utils';

describe('Event router', () => {
  // Test GET /events
  it('Shows all available events', async () => {
    const { result, status } = await fetchAndParse('/events');

    expect(result.events).toBeDefined();
    expect(status).toBe(200);
  });

  // Test GET /event/:id
  it('Shows event by id', async () => {
    const { result, status } = await fetchAndParse('/events/5');

    expect(status).toBe(200);
    expect(result.event.id).toEqual(5);
  });

  // Test GET /events/:id
  it('shows not found if no event with id', async () => {
    const { result, status } = await fetchAndParse('/events/10');

    expect(status).toBe(404);
    expect(result.error).toEqual('fannst ekki');
  });

  // Test POST /events
  it('returns unauthorized if you try to create an event while not logged in', async () => {
    const data = {
      userid: 20,
      name: 'fundur 40',
      slug: 'fundur-40',
      description: '',
    };
    const { result, status } = await postAndParse('/events', data);
    expect(status).toBe(401);
    expect(result.error).toEqual('invalid token');
  });

  // Test PATCH /events/:id
  it('patches an event if you created the event or are admin', async () => {
    const username = 'admin';
    const password = '123';

    const token = await loginAndReturnToken({ username, password });

    expect(token).toBeTruthy();

    const data = {
      id: token.id,
      name: 'fundur 30',
      description: 'Pétur',
      updated: new Date(),
    };
    const { result, status } = await patchAndParse('/events/6', data, token);

    expect(status).toBe(200);
    expect(result.msg).toEqual('Viðburður uppfærður');
    expect(result.result.item.name).toEqual('fundur 30');
    expect(result.result.item.slug).toEqual('fundur-30');
    expect(result.result.item.description).toEqual('Pétur');
  });

  // Test PATCH /events/:id
  it('returns unauthorized if you try to patch event that you didnt make', async () => {
    const username = 'palli100';
    const password = '11111';

    const token = await loginAndReturnToken({ username, password });

    expect(token).toBeTruthy();
    const data = {
      userid: token.id,
      name: 'fundur 40',
      slug: 'fundur-40',
      description: '',
    };
    const { result, status } = await patchAndParse('/events/6', data, token);
    expect(status).toBe(401);
    expect(result.errors).toEqual(
      'bara admin eða sá sem bjó til viðburðinn má breyta honum'
    );
  });

  // Test DELETE /events/:id
  it('does not let you delete an event if you didnt create it', async () => {
    const username = 'palli100';
    const password = '11111';

    const data = { id: 4 };
    const token = await loginAndReturnToken({ username, password });

    expect(token).toBeTruthy();
    const { result, status } = await deleteAndParse('/events/6', data, token);

    expect(status).toBe(401);
    expect(result.errors).toEqual(
      'bara admin eða sá sem bjó til viðburðinn má eyða honum'
    );
  });

  // Test POST /events/:id/register
  it.skip('lets you register for event if logged in', async () => {
    const username = 'admin';
    const password = '123';

    const data = { comment: 'hallo' };
    const token = await loginAndReturnToken({ username, password });

    expect(token).toBeTruthy();

    const { result, status } = await postAndParse(
      '/events/6/register',
      data,
      token
    );
    expect(status).toBe(201);
    expect(result).toBe('Þú hefur verið skráður');
  });

  // Test POST /events/:id/register
  it('you cant register 2 times with same account', async () => {
    const username = 'admin';
    const password = '123';

    const data = { comment: 'hallo' };
    const token = await loginAndReturnToken({ username, password });

    expect(token).toBeTruthy();

    const { result, status } = await postAndParse(
      '/events/6/register',
      data,
      token
    );
    expect(status).toBe(400);
    expect(result.error).toBe('Þú ert nú þegar skráð-ur');
  });

  // Test DELETE /events/:id/register
  it('does not let unregister if you are not registered', async () => {
    const username = 'palli100';
    const password = '11111';
    const token = await loginAndReturnToken({ username, password });

    expect(token).toBeTruthy();
    const { result, status } = await deleteAndParse(
      '/events/6/register',
      null,
      token
    );

    expect(status).toBe(400);
    expect(result.error).toEqual(
      'Það er ekki hægt að afskrá sig nema að maður sé búinn að skrá sig first'
    );
  });
});
