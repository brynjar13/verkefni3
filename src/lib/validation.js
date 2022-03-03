import { body, validationResult } from 'express-validator';
import xss from 'xss';
import { findEventByName, getEvent } from './db.js';
import { findByUsername } from './users.js';

export const eventValidation = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('nafn á viðburði má ekki vera tómt'),
  body('name')
    .isLength({ max: 64 })
    .withMessage('nafn á viðburði má ekki vera meira en 64 stafir'),
];

export const registrationValidationMiddleware = [
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 64 })
    .withMessage('Nafn má ekki vera meira en 64 stafir'),
  body('username')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Notendanafn verður að vera allavegana 5 stafir'),
  body('username')
    .isLength({ max: 64 })
    .withMessage('Notendanafn á að vera minna en 64 stafir'),
  body('password')
    .isLength({ min: 5 })
    .withMessage('Lykilorð þarf að vera allavegana 5 stafir'),
  body('password')
    .isLength({ max: 256 })
    .withMessage('Lykilorð má ekki vera meira en 256 stafir'),
];

export async function eventValidateRequest(req, res, next) {
  const errors = validationResult(req);
  const { name } = req.body;
  const result = await findEventByName(name);
  const customValidation = [];
  if (result !== null && result !== false) {
    customValidation.push({ error: 'Það er til viðburður með þetta nafn' });
  }
  if (!errors.isEmpty() || customValidation.length > 0) {
    return res
      .status(400)
      .json({ errors: errors.errors.concat(customValidation) });
  }
  return next();
}

export async function validateRequest(req, res, next) {
  const errors = validationResult(req);
  const { username } = req.body;
  const result = await findByUsername(username);
  const customValidation = [];
  if (result !== null && result !== false) {
    customValidation.push({ param: username, msg: 'Notendanafn í notkun' });
  }
  if (!errors.isEmpty() || customValidation.length > 0) {
    return res
      .status(400)
      .json({ errors: errors.errors.concat(customValidation) });
  }

  return next();
}

export const xssSanitizationMiddleware = [
  body('name').customSanitizer((v) => xss(v)),
  body('description').customSanitizer((v) => xss(v)),
];

export const registerXssSanitizationMiddleware = [
  body('comment').customSanitizer((v) => xss(v)),
];

export const sanitizationMiddleware = [
  body('name').trim().escape(),
  body('description').trim().escape(),
];

export const registerSanitizationMiddleware = [body('comment').trim().escape()];
