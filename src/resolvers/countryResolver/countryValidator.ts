import { body, query } from "express-validator";


export const countryCreateValidator = [
    body('variables.input.name').trim().optional({ checkFalsy: true }),
    body('variables.input.countryLogo').trim().optional({ checkFalsy: true }),
    body('variables.input.countryCode').trim().optional({ checkFalsy: true }),
    body('variables.input.isBlocked').trim().optional({ checkFalsy: true }),
]


export const getAllCountriesValidator = [
    body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
    body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
]


export const countryQueryValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
]


export const countryUpdateValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
    body('variables.input.name').trim().optional({ checkFalsy: true }),
    body('variables.input.countryLogo').trim().optional({ checkFalsy: true }),
    body('variables.input.countryCode').trim().optional({ checkFalsy: true }),
    body('variables.input.isBlocked').trim().optional({ checkFalsy: true }),
]

export const countryDeleteValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
]
