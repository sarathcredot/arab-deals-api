import { body, query } from "express-validator";


export const sizeMutationValidator = [
    body('variables.input.categoryId').isMongoId(),
    body('variables.input.size').trim().notEmpty(),
    body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),

]


export const sizeQueryValidator = [
    body('variables.input._id').isMongoId(),

]
