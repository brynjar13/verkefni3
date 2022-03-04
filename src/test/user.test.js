import { describe, expect, it } from '@jest/globals';
import { fetchAndParse, loginAndReturnToken, postAndParse } from './utils';

describe('user route tests', () => {
  // Test GET /user/me
  it('Finds the user that is logged in', async () => {
    const username = 'admin';
    const password = '123';

    const token = await loginAndReturnToken({ username, password });

    expect(token).toBeTruthy();

    const { result, status } = await fetchAndParse('/user/me', token);

    expect(status).toBe(200);
    expect(result.me.id).toBe(1);
    expect(result.me.name).toBe('binni');
    expect(result.me.username).toBe('admin');
  });

  // Test GET /user/me
  it('Finds no user if not authenticated', async () => {
    const { result, status } = await fetchAndParse('/user/me');

    expect(status).toBe(401);
    expect(result.error).toBe('invalid token');
  });

  // Test GET /user/:id
  it('Finds user by id if admin', async () => {
    const username = 'admin';
    const password = '123';

    const token = await loginAndReturnToken({ username, password });

    expect(token).toBeTruthy();

    const { result, status } = await fetchAndParse('/user/1', token);

    expect(status).toBe(200);
    expect(result.user.id).toBe(1);
    expect(result.user.name).toBe('binni');
    expect(result.user.username).toBe('admin');
  });

  // Test GET /user/:id
  it('Finds user by id if admin', async () => {
    const username = 'admin';
    const password = '123';

    const token = await loginAndReturnToken({ username, password });

    expect(token).toBeTruthy();

    const { result, status } = await fetchAndParse('/user/7', token);

    expect(status).toBe(200);
    expect(result.user.id).toBe(7);
    expect(result.user.name).toBe('helga');
    expect(result.user.username).toBe('helga23');
  });

  // Test GET /user/:id
  it('Finds user by id if admin, returns not found if no user with id', async () => {
    const username = 'admin';
    const password = '123';

    const token = await loginAndReturnToken({ username, password });

    expect(token).toBeTruthy();

    const { status } = await fetchAndParse('/user/100', token);

    expect(status).toBe(404);
  });

  // Test GET /user/:id
  it('If not admin then no user', async () => {
    const username = 'helga23';
    const password = 'chicken';

    const token = await loginAndReturnToken({ username, password });

    expect(token).toBeTruthy();

    const { status } = await fetchAndParse('/user/7', token);

    expect(status).toBe(401);
  });

  // Test GET /user
  it('gets a list of all users if admin', async () => {
    const username = 'admin';
    const password = '123';

    const token = await loginAndReturnToken({ username, password });

    expect(token).toBeTruthy();

    const { status } = await fetchAndParse('/user', token);

    expect(status).toBe(200);
  });

  // Test GET /user
  it('returns unauthorized if not admin', async () => {
    const username = 'helga23';
    const password = 'chicken';

    const token = await loginAndReturnToken({ username, password });

    expect(token).toBeTruthy();

    const { status } = await fetchAndParse('/user', token);

    expect(status).toBe(401);
  });

  // Test POST user/register
  it.skip('Registers a new user', async () => {
    const data = { name: 'siggi', username: 'siggi290', password: 'password' };
    const { status } = await postAndParse('/user/register', data);
    expect(status).toBe(200);
  });
  // Test POST user/register
  it('Bad request if username already exists', async () => {
    const data = { name: 'siggi', username: 'siggi290', password: 'password' };
    const { result, status } = await postAndParse('/user/register', data);
    expect(status).toBe(400);
    expect(result.errors).toEqual([
      { msg: 'Notendanafn í notkun', param: 'siggi290' },
    ]);
  });
  // Test POST user/login
  it.skip('Logs in an existing user', async () => {
    const data = { name: 'siggi', username: 'siggi290', password: 'password' };
    const { status } = await postAndParse('/user/login', data);
    expect(status).toBe(200);
  });
  // Test POST user/login
  it('Bad request if no such user', async () => {
    const data = {
      name: 'siggi',
      username: 'siggi29078',
      password: 'password',
    };
    const { result, status } = await postAndParse('/user/login', data);
    expect(status).toBe(401);
    expect(result.error).toEqual('no such user');
  });
});
