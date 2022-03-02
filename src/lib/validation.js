import { body, validationResult } from 'express-validator';
import xss from 'xss';
import { findByUsername } from './users.js';

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

export async function validateRequest(req, res, next) {
  const errors = validationResult(req);
  const { username } = req;
  const result = await findByUsername(username);
  const customValidation = [];
  if (result !== null) {
    customValidation.push({ param: username, msg: 'Notendanafn í notkun' });
  }
  if (!errors.isEmpty() || customValidation.length > 0) {
    return res
      .status(400)
      .json({ errors: errors.errors.concat(customValidation) });
  }

  return next();
}

export function xssSanitizationMiddleware() {
  return [
    body('name').customSanitizer((v) => xss(v)),
    body('username').customSanitizer((v) => xss(v)),
  ];
}

export function sanitizationMiddleware() {
  return [body('name').trim().escape(), body('username').trim().escape()];
}
