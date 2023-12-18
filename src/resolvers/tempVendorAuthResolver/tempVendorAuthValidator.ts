
import { body } from 'express-validator';

export const tempVendorCreateValidator = [
  body('variables.input.fullName').trim().notEmpty(),
  // body('variables.input.email').trim().isEmail(),
  body('variables.input.mobileNumber').trim().notEmpty(),
];
// export const tempVendorCreateValidator = [
//   body('variables.input.fullName').trim().notEmpty(),
//   body('variables.input.email').trim().isEmail(),
//   body('variables.input.mobileNumber').trim().notEmpty(),
//   body('variables.input.password').isLength({ min: 6 }),
//   body('variables.input.country').trim().notEmpty(),
//   body('variables.input.brand').optional({ checkFalsy: true }).trim(),
// ];

export const tempVendorVerificationValidator = [
  body('variables.input._id').isMongoId(),
  body('variables.input.temporaryMobileOtp.code').trim().isNumeric().isLength({ min: 6, max: 6 }),
];
