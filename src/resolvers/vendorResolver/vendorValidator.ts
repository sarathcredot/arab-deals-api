
import { body } from 'express-validator';

export const vendorCreateValidator = [
  body('variables.input.fullName').trim().notEmpty(),
  body('variables.input.email').trim().isEmail(),
  // body('mobileNumber').trim().notEmpty(),
  body('variables.input.password').isLength({ min: 6 }),
  body('variables.input.country').trim().notEmpty(),
  body('variables.input.brand').optional({ checkFalsy: true }).trim(),
];

export const vendorLoginValidator = [
  body('variables.input.email').trim().isEmail(),
  body('variables.input.password').isLength({ min: 6, max: 20 }),
];
