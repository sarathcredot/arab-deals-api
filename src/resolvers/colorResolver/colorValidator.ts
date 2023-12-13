import { body, query } from "express-validator";


export const colorMutationValidator = [
    body('variables.input.categoryId').notEmpty().isMongoId(),
    body('variables.input.colorName').trim().notEmpty(),
    body('variables.input.colorCode').notEmpty(),
    body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),

]


export const colorQueryValidator = [
    body('variables.input._id').isMongoId(),

]

export const colorUpdateValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
    body('variables.input.colorName').optional({ checkFalsy: true }).toBoolean(true).trim(),
    body('variables.input.colorCode').optional({ checkFalsy: true }).toBoolean(true),
    body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),

]
