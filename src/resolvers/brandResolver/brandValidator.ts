import { body, query } from "express-validator";


export const brandCreateValidator = [
    body('variables.input.brandName').trim().notEmpty(),
    body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),

]


export const getAllBrandsValidator = [
    body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
    body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
]

export const getAllBrandsWithVendorByAdminValidator = [
    body('variables.input.vendorId').notEmpty().isMongoId(),
    body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
    body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
]

export const getAllBrandsWithVendorByVendorValidator = [
    body('variables.input.vendorId').notEmpty().isMongoId(),
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

export const getBrandsWithCategoryValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
]

