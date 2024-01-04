import { body, query } from "express-validator";


export const addVendorCompanyValidator = [
    body('variables.input.companyName').optional({ checkFalsy: true }),
    body('variables.input.companyType').optional({ checkFalsy: true }),
    body('variables.input.crNumber').optional({ checkFalsy: true }),
]


export const getAllVendorCompanyValidator = [
    body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
    body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
]

export const vendorCompanyQueryValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
]


export const editVendorCompanyValidator = [
    body('variables.input.vendorId').notEmpty().isMongoId(),
    body('variables.input.companyName').optional({ checkFalsy: true }),
    body('variables.input.companyType').optional({ checkFalsy: true }),
    body('variables.input.crNumber').optional({ checkFalsy: true }),
]

export const vendorCompanyDeleteValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
]

export const vendorCompanyStatusUpdationValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
    body('variables.input.status').optional({ checkFalsy: true }),
]
