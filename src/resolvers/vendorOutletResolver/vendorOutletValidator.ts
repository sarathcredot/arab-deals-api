import { body, query } from "express-validator";


export const addVendorOutletValidatior = [
    body('variables.input.vendorId').notEmpty().isMongoId(),
    body('input.variables.outletName').optional({ checkFalsy: true }),
    body('input.variables.country').optional({ checkFalsy: true }),
    body('input.variables.district').optional({ checkFalsy: true }),
    body('input.variables.village').optional({ checkFalsy: true }),
    body('input.variables.address').optional({ checkFalsy: true }),
    body('input.variables.contactPersonName').optional({ checkFalsy: true }),
    body('input.variables.contactPersonNumber').optional({ checkFalsy: true }),
    body('input.variables.contactPersonDesignation').optional({ checkFalsy: true }),
  ];

export const updateVendorOutletValidatior = [
    body('variables.input.vendorId').notEmpty().isMongoId(),
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

