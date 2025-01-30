
import { body } from 'express-validator';

export const SuperAdminCreateValidator = [
  body('variables.input.email').trim().isEmail(),
  body('variables.input.password').isLength({ min: 6, max: 20 }),
  body('variables.input.fullName').trim().notEmpty(),
];

export const AdminCreateValidator = [
  body('variables.input.email').trim().isEmail(),
  body('variables.input.password').isLength({ min: 6, max: 20 }),
  body('variables.input.fullName').trim().notEmpty(),
  body('variables.input.accType').trim().notEmpty(),
];

export const AdminEditValidator = [
  body('variables.input.email').trim().isEmail(),
  // body('variables.input.password').isLength({ min: 6, max: 20 }),
  body('variables.input.fullName').trim().notEmpty(),
  body('variables.input.accType').trim().notEmpty(),
];




export const adminLoginValidator = [
  body('variables.input.email').trim().isEmail(),
  body('variables.input.password').isLength({ min: 6, max: 20 }),
];

export const SubAdminCreateValidator = [
  body('variables.input.email').trim().isEmail(),
  body('variables.input.password').isLength({ min: 6 }),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).isBoolean(),
  body('variables.input.fullName').trim().notEmpty(),
];

export const AdminUpdateValidator = [
  body('variables.input.email').optional({ checkFalsy: true }).trim().isEmail(),
  body('variables.input.password').optional({ checkFalsy: true }).isLength({ min: 6 }),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).isBoolean(),
  body('variables.input.fullName').optional({ checkFalsy: true }).trim(),
];

export const AdminApprovalForVendorValidator = [
  body('variables.input.email').optional({ checkFalsy: true }).trim().isEmail(),
  body('variables.input.password').optional({ checkFalsy: true }).isLength({ min: 6 }),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).isBoolean(),
  body('variables.input.fullName').optional({ checkFalsy: true }).trim(),
];



