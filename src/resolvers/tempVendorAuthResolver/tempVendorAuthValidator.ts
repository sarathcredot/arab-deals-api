
import { body } from 'express-validator';

export const tempVendorCreateValidator = [
  body('variables.input.fullName').trim().notEmpty(),
  body('variables.input.email').trim().isEmail(),
  body('mobileNumber').trim().notEmpty(),
  body('variables.input.password').isLength({ min: 6 }),
  body('variables.input.country').trim().notEmpty(),
  body('variables.input.brand').optional({ checkFalsy: true }).trim(),
];

