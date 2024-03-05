import { body, query } from "express-validator";


export const addVendorOutletValidatior = [
  body('variables.input.outletName').trim().notEmpty(),
  body('variables.input.country').trim().notEmpty(),
  body('variables.input.district').trim().notEmpty(),
  body('variables.input.village').trim().notEmpty(),
  body('variables.input.address').trim().notEmpty(),
  body('variables.input.contactPersonName').trim().notEmpty(),
  body('variables.input.contactPersonNumber').trim().notEmpty(),
  body('variables.input.contactPersonDesignation').trim().notEmpty(),
];

export const updateVendorOutletValidatior = [
  body('variables.input.outletName').optional({ checkFalsy: true }),
  body('variables.input.country').optional({ checkFalsy: true }),
  body('variables.input.district').optional({ checkFalsy: true }),
  body('variables.input.village').optional({ checkFalsy: true }),
  body('variables.input.address').optional({ checkFalsy: true }),
  body('variables.input.contactPersonName').optional({ checkFalsy: true }),
  body('variables.input.contactPersonNumber').optional({ checkFalsy: true }),
  body('variables.input.contactPersonDesignation').optional({ checkFalsy: true }),
];


export const updateVendorOutletByAdminValidatior = [
  body('variables.input._id').notEmpty().isMongoId(),
  body('variables.input.outletName').optional({ checkFalsy: true }),
  body('variables.input.country').optional({ checkFalsy: true }),
  body('variables.input.district').optional({ checkFalsy: true }),
  body('variables.input.village').optional({ checkFalsy: true }),
  body('variables.input.address').optional({ checkFalsy: true }),
  body('variables.input.contactPersonName').optional({ checkFalsy: true }),
  body('variables.input.contactPersonNumber').optional({ checkFalsy: true }),
  body('variables.input.contactPersonDesignation').optional({ checkFalsy: true }),
];


export const getAllVendorOutletValidator = [
  body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
]

export const vendorOutletQueryValidator = [
  body('variables.input._id').notEmpty().isMongoId(),
]


export const vendorOutletDeleteValidator = [
  body('variables.input._id').notEmpty().isMongoId(),
]

export const vendorOutletStatusUpdationValidator = [
  body('variables.input._id').notEmpty().isMongoId(),
  body('variables.input.status').optional({ checkFalsy: true }),
]

