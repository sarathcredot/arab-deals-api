import { body, query } from "express-validator";


export const addVendorCompanyValidator = [
    body('variables.input.companyName').trim().notEmpty(),
    body('variables.input.companyType').trim().notEmpty(),
    body('variables.input.crNumber').trim().notEmpty()
]


export const getAllVendorCompanyValidator = [
    body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
    body('variables.input.status').optional({ checkFalsy: true }).isIn(["PENDING", "UNDER_VERIFICATION", "COMPLETED", "REJECTED"]),
    body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
    body('variables.input.fullName').optional({ checkFalsy: true }),
    body('variables.input.companyName').optional({ checkFalsy: true }),
    body('variables.input.vendorId').optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.crNumber').optional({ checkFalsy: true }),
]

export const vendorCompanyQueryValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
]


export const editVendorCompanyValidator = [
    body('variables.input.companyName').optional({ checkFalsy: true }),
    body('variables.input.companyType').optional({ checkFalsy: true }),
    body('variables.input.crNumber').optional({ checkFalsy: true }),
]

export const vendorCompanyDeleteValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
]

export const vendorEditByAdminValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
    body('variables.input.status').optional({ checkFalsy: true }),
    body('variables.input.companyName').optional({ checkFalsy: true }),
    body('variables.input.companyType').optional({ checkFalsy: true }),
    body('variables.input.crNumber').optional({ checkFalsy: true }),
    body('variables.input.remarks').isArray({ min: 0 }),
]
