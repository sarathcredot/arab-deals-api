
import { body } from 'express-validator';

export const tempVendorCreateValidator = [
  body('variables.input.fullName').trim().notEmpty(),
  // body('variables.input.email').trim().isEmail(),  // TODO:  remove if emailis not include in temp vendor creation
  body('variables.input.mobileNumber').trim().notEmpty(),
];
