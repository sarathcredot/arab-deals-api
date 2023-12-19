
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
  body('variables.input.password').isLength({ min: 6 }),
  body('variables.input.country').trim().notEmpty(),
  body('variables.input.brand').optional({ checkFalsy: true }).trim(),
  body('variables.input.companyName').optional({ checkFalsy: true }).trim(),
  body('variables.input.businessOutletName').optional({ checkFalsy: true }).trim(),
  body('variables.input.crNumber').optional({ checkFalsy: true }).trim(),
  body('variables.input.crLicence').optional({ checkFalsy: true }).trim(),
  body('variables.input.businessLicence').optional({ checkFalsy: true }).trim(),
  body('variables.input.chamberOfCommerceCertificate').optional({ checkFalsy: true }).trim(),
  body('variables.input.companyType').optional({ checkFalsy: true }).trim(),
  body('variables.input.businessAddress').optional({ checkFalsy: true }).trim(),
  body('variables.input.contactPersonName').optional({ checkFalsy: true }).trim(),
  body('variables.input.contactPersonPhoneNumber').optional({ checkFalsy: true }).trim(),
  body('variables.input.contactPersonDesignation').optional({ checkFalsy: true }).trim(),
  body('variables.input.sellingProductDetails').optional({ checkFalsy: true }).trim(),
  body('variables.input.sellingProductBrands').optional({ checkFalsy: true }).trim(),
];

export const getVendorRecordValidator = [
  body('variables.input._id').isMongoId(),
];

export const vendorProfileApprovalValidator = [
  body('variables.input._id').isMongoId(),
  body('variables.input.approvalStatus').optional({ checkFalsy: true }).isBoolean(),
];