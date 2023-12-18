
import { body } from 'express-validator';


export const vendorLoginValidator = [
  body('variables.input.email').trim().isEmail(),
  body('variables.input.password').isLength({ min: 6, max: 20 }),
];

export const tempVendorVerificationValidator = [
  body('variables.input.temporaryMobileOtp.code').trim().isNumeric().isLength({ min: 6, max: 6 }),
];

export const getAllVendorsRecordsValidator = [
  body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
];