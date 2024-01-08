
import { body } from 'express-validator';


export const vendorLoginValidator = [
  body('variables.input.mobileNumber').optional({ checkFalsy: true }).trim(),
];


export const getAllVendorsRecordsByAdminValidator = [
  body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];

export const getAllAttributeRecordsValidator = [
  body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];

export const CreateAttributeValidator = [
  body('variables.input.companyName').optional({ checkFalsy: true }).trim(),
  body('variables.input.companyName').optional({ checkFalsy: true }).trim(),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];

export const getVendorRecordValidator = [
  body('variables.input._id').isMongoId(),
];

export const vendorKycStatusValidator = [
  body('variables.input._id').isMongoId(),
  body('variables.input.status').optional({ checkFalsy: true }).isBoolean(),
];

export const EditAttributeValidator = [
  body('variables.input.attributeId').isMongoId(),
  body('variables.input.companyName').optional({ checkFalsy: true }).trim(),
  body('variables.input.companyName').optional({ checkFalsy: true }).trim(),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];


export const loginOtpVerificationValidator = [
  body('variables.input.code').trim().isNumeric().isLength({ min: 6, max: 6 }),
];
