
import { body } from 'express-validator';


export const vendorLoginValidator = [
  body('variables.input.mobileNumber').optional({ checkFalsy: true }).trim(),
  body('variables.input.countryCode').optional({ checkFalsy: true }).trim(),
];


export const getAllVendorsRecordsByAdminValidator = [
  body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];

export const getAllVendorsRecordsByVendorValidator = [
  body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];

export const VendorCreateValidator = [
  body('variables.input.fullName').trim().notEmpty(),
  body('variables.input.email').optional({ checkFalsy: true }).trim().isEmail(),
];


export const VendorCreateByAdminValidator = [
  body('variables.input.fullName').trim().notEmpty(),
  body('variables.input.email').optional({ checkFalsy: true }).trim().isEmail(),
  body('variables.input.mobileNumber').trim().notEmpty(),
  body('variables.input.countryCode').trim().notEmpty(),
  body('variables.input.isBlocked').trim().isIn([true, false]),
];


export const VendorSignupValidator = [
  body('variables.input.fullName').trim().notEmpty(),
  body('variables.input.email').optional({ checkFalsy: true }).trim().isEmail(),
  body('variables.input.token').notEmpty(),
];


export const getVendorRecordValidator = [
  body('variables.input._id').isMongoId(),
];

export const vendorKycStatusValidator = [
  body('variables.input._id').isMongoId(),
  body('variables.input.status').optional({ checkFalsy: true }).isBoolean(),
];

export const VendorUpdateValidator = [
  body('variables.input.fullName').optional({ checkFalsy: true }).trim(),
  body('variables.input.email').trim().optional({ checkFalsy: true }).isEmail(),
];

export const VendorUpdateByAdminValidator = [
  body('variables.input._id').isMongoId(),
  body('variables.input.fullName').optional({ checkFalsy: true }).trim(),
  body('variables.input.email').trim().optional({ checkFalsy: true }).isEmail(),
  body('variables.input.countryCode').optional({ checkFalsy: true }).trim(),
  body('variables.input.mobileNumber').optional({ checkFalsy: true }).trim(),
  body('variables.input.brand').optional({ checkFalsy: true }).trim(),
  body('variables.input.categories').optional({ checkFalsy: true }).trim(),
];



export const loginOtpVerificationValidator = [
  body('variables.input.code').trim().isNumeric().isLength({ min: 5, max: 5 }),
  body('variables.input._id').isMongoId()
];
