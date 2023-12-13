import { body, query } from "express-validator";


export const categoryCreateValidator = [
    body('variables.input.categoryName').optional({ checkFalsy: true }).trim(),
    body('variables.input.parentId').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
]

export const categoriesQueryValidator = [
    body('variables.input.parentId').optional({ checkFalsy: true }),
]

export const categoryAutoCompleteQueryValidator = [
    body('variables.input.query').trim(),
]

export const categoryUpdateValidator = [
    body('variables.input.categoryName').optional({ checkFalsy: true }),
    body('variables.input.description').optional({ checkFalsy: true }),
    body('variables.input.parentId').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
]

export const categoryDeleteValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
]

export const categoryLevelValidator = [
    body('variables.input.limit').optional({ checkFalsy: true }).custom(val => val >= 0),
    body('variables.input.level').optional({ checkFalsy: true }).custom(val => val >= 0),
]
