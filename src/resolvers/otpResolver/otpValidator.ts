
import { body } from 'express-validator';



export const mobileOtpVerification = [
  body('variables.input._id').isMongoId(),
];

export const reSendMobileOtpVerification = [
  body('variables.input._id').isMongoId(),
];


export const otpVerificationValidator = [
  body('variables.input._id').isMongoId(),
  body('variables.input.mobileOtp').trim().isNumeric().isLength({ min: 6, max: 6 }),
];


