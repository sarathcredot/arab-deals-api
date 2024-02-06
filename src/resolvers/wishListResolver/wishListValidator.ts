import { body } from 'express-validator';

export const addToWishListValidator = [
  body('variables.input.productId').notEmpty(),
];






