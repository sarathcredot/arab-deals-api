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


export const getAllBrandsValidator = [
    body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
    body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
]

export const brandQueryValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
]


export const brandUpdateValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
    body('variables.input.brandName').trim().optional({ checkFalsy: true }),
    body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
]

export const brandDeleteValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
]

