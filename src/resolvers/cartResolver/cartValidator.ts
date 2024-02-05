import { body } from 'express-validator';

export const addToCartValidator = [
  body('variables.input.productId').notEmpty(),
  body('variables.input.quantity').notEmpty(),
];
export const removeFromCartValidator = [
  body('variables.input.productId').notEmpty(),
];






