
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

// export const submitKYCValidator = [
//   body('variables.input.vendorId').isMongoId(),
//   body('variables.input.companyDetails.sectionName').optional({ checkFalsy: true }).isString(),
//   body('variables.input.companyDetails.name').optional({ checkFalsy: true }).isString(),
//   body('variables.input.companyDetails.type').optional({ checkFalsy: true }).isString(),
//   body('variables.input.companyDetails.crNumber').optional({ checkFalsy: true }).isString(),
//   body('variables.input.companyDetails.crLicence').optional({ checkFalsy: true }).isString(),
//   body('variables.input.companyDetails.status').optional({ checkFalsy: true }).isString(),
//   body('variables.input.companyDetails.remarks').optional({ checkFalsy: true }).isString(),

//   body('variables.input.businessOutlet.sectionName').optional({ checkFalsy: true }).isString(),
//   body('variables.input.businessOutlet.name').optional({ checkFalsy: true }).isString(),
//   body('variables.input.businessOutlet.address').optional({ checkFalsy: true }).isString(),
//   body('variables.input.businessOutlet.status').optional({ checkFalsy: true }).isString(),
//   body('variables.input.businessOutlet.remarks').optional({ checkFalsy: true }).isString(),

//   body('variables.input.sellingProduct.sectionName').optional({ checkFalsy: true }).isString(),
//   body('variables.input.sellingProduct.discribtion').optional({ checkFalsy: true }).isString(),
//   body('variables.input.sellingProduct.brand').optional({ checkFalsy: true }).isString(),
//   body('variables.input.sellingProduct.status').optional({ checkFalsy: true }).isString(),
//   body('variables.input.sellingProduct.remarks').optional({ checkFalsy: true }).isString(),
// ];

export const getKYCStatusValidator = [
  body('variables.input.vendorId').isMongoId(),
];

export const listKYCtByStatusValidator = [
  body('variables.input.status').optional({ checkFalsy: true }).isString(),
];

export const submitKYCCompanyDetailsValidator = [
  body('variables.input.vendorId').isMongoId(),
  body('variables.input.companyDetails.sectionName').optional({ checkFalsy: true }).isString(),
  body('variables.input.companyDetails.name').optional({ checkFalsy: true }).isString(),
  body('variables.input.companyDetails.type').optional({ checkFalsy: true }).isString(),
  body('variables.input.companyDetails.crNumber').optional({ checkFalsy: true }).isString(),
  body('variables.input.companyDetails.crLicence').optional({ checkFalsy: true }).isString(),
]

export const submitKYCBusinessOutletDetailsValidator = [
  body('variables.input.businessOutlet.sectionName').optional({ checkFalsy: true }).isString(),
  body('variables.input.businessOutlet.name').optional({ checkFalsy: true }).isString(),
  body('variables.input.businessOutlet.address').optional({ checkFalsy: true }).isString(),
]

export const submitKycBusinessOutletValidator = [
  body('variables.input.sellingProduct.sectionName').optional({ checkFalsy: true }).isString(),
  body('variables.input.sellingProduct.discription').optional({ checkFalsy: true }).isString(),
  body('variables.input.sellingProduct.brand').optional({ checkFalsy: true }).isString(),
]

export const  getAllKycRecordsValidator = [
  body('variables.input.page').optional({ checkFalsy: true }).custom(val => val >= 0),
  body('variables.input.size').optional({ checkFalsy: true }).custom(val => val > 0),
]

export const kycRecordByAdminQueryValidator = [
  body('variables.input._id').isMongoId(),
];

export const updateKycRecordByAdminQueryValidator = [
  body('variables.input._id').isMongoId(),
  body('variables.input.companyDetails.status').optional({ checkFalsy: true }).isString(),
  body('variables.input.businessOutlet.status').optional({ checkFalsy: true }).isString(),
  body('variables.input.sellingProduct.status').optional({ checkFalsy: true }).isString(),
  body('variables.input.companyDetails.remarks').optional().isArray().toArray(),
  body('variables.input.businessOutlet.remarks').optional().isArray().toArray(),
  body('variables.input.sellingProduct.remarks').optional().isArray().toArray(),
];
