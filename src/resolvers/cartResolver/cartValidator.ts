import { body } from 'express-validator';

export const addToCartValidator = [
  body('variables.input.productId').notEmpty(),
  body('variables.input.quantity').isNumeric().custom(val => val > 0 && val <= 10),
];
export const removeFromCartValidator = [
  body('variables.input.productId').notEmpty(),
];






