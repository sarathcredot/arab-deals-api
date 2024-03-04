import { body, query } from "express-validator";


export const addVendorOutletValidatior = [
  body('input.variables.outletName').notEmpty(),
  body('input.variables.country').notEmpty(),
  body('input.variables.district').notEmpty(),
  body('input.variables.village').notEmpty(),
  body('input.variables.address').notEmpty(),
  body('input.variables.contactPersonName').notEmpty(),
  body('input.variables.contactPersonNumber').notEmpty(),
  body('input.variables.contactPersonDesignation').notEmpty(),
];

export const updateVendorOutletValidatior = [
  body('input.variables.outletName').optional({ checkFalsy: true }),
  body('input.variables.country').optional({ checkFalsy: true }),
  body('input.variables.district').optional({ checkFalsy: true }),
  body('input.variables.village').optional({ checkFalsy: true }),
  body('input.variables.address').optional({ checkFalsy: true }),
  body('input.variables.contactPersonName').optional({ checkFalsy: true }),
  body('input.variables.contactPersonNumber').optional({ checkFalsy: true }),
  body('input.variables.contactPersonDesignation').optional({ checkFalsy: true }),
];


export const updateVendorOutletByAdminValidatior = [
  body('variables.input._id').notEmpty().isMongoId(),
  body('input.variables.outletName').optional({ checkFalsy: true }),
  body('input.variables.country').optional({ checkFalsy: true }),
  body('input.variables.district').optional({ checkFalsy: true }),
  body('input.variables.village').optional({ checkFalsy: true }),
  body('input.variables.address').optional({ checkFalsy: true }),
  body('input.variables.contactPersonName').optional({ checkFalsy: true }),
  body('input.variables.contactPersonNumber').optional({ checkFalsy: true }),
  body('input.variables.contactPersonDesignation').optional({ checkFalsy: true }),
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

