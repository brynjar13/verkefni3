import dotenv from 'dotenv';
import fetch from 'node-fetch';

const { BASE_URL = 'http://localhost:3000' } = process.env;

dotenv.config();

export const baseUrl = BASE_URL;

export function getRandomInt(min, max) {
  const ceilMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(Math.random() * (floorMax - ceilMin) + ceilMin);
}

export async function methodAndParse(method, path, data = null, token = null) {
  const url = new URL(path, baseUrl);

  const options = { headers: {} };

  if (method !== 'GET') {
    options.method = method;
  }

  if (data) {
    options.headers['content-type'] = 'application/json';
    options.body = JSON.stringify(data);
  }

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  const result = await fetch(url, options);

  return {
    result: await result.json(),
    status: result.status,
  };
}

export async function fetchAndParse(path, token = null) {
  return methodAndParse('GET', path, null, token);
}

export async function postAndParse(path, data, token = null) {
  return methodAndParse('POST', path, data, token);
}

export async function patchAndParse(path, data, token = null) {
  return methodAndParse('PATCH', path, data, token);
}

export async function deleteAndParse(path, data, token = null) {
  return methodAndParse('DELETE', path, data, token);
}

export async function loginAndReturnToken(data) {
  const { result } = await postAndParse('/user/login', data);

  if (result && result.token) {
    return result.token;
  }

  return null;
}
