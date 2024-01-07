
import { body } from 'express-validator';



export const VendorMobileOtpVerification = [
  body('variables.input.fullName').trim().notEmpty(),
  body('variables.input.mobileNumber').trim().notEmpty(),];

export const reSendMobileOtpVerification = [
  body('variables.input.fullName').trim().notEmpty(),
  body('variables.input.mobileNumber').trim().notEmpty()
];


export const otpVerificationValidator = [
  body('variables.input.code').trim().isNumeric().isLength({ min: 6, max: 6 }),
];


