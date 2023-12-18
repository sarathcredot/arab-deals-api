
import { body } from 'express-validator';



export const mobileOtpVerification = [
  body('variables.input._id').isMongoId(),
];


