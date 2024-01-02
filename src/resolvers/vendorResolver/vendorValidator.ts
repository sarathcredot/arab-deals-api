
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

export const VendorCreateValidator = [
  body('variables.input.fullName').trim().notEmpty(),
  body('variables.input.email').trim().isEmail(),
  body('variables.input.mobileNumber').trim().notEmpty(),
  body('variables.input.companyName').optional({ checkFalsy: true }).trim(),
];

export const getVendorRecordValidator = [
  body('variables.input._id').isMongoId(),
];

export const vendorProfileApprovalValidator = [
  body('variables.input._id').isMongoId(),
  body('variables.input.approvalStatus').optional({ checkFalsy: true }).isBoolean(),
];

export const VendorUpdateValidator = [
  body('variables.input.fullName').optional({ checkFalsy: true }).trim(),
  body('variables.input.email').trim().optional({ checkFalsy: true }).isEmail(),
  body('variables.input.mobileNumber').optional({ checkFalsy: true }).trim(),
  body('variables.input.country').optional({ checkFalsy: true }).trim(),
  body('variables.input.brand').optional({ checkFalsy: true }).trim(),
  body('variables.input.companyName').optional({ checkFalsy: true }).trim(),
];
