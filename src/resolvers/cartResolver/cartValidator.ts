import { body } from 'express-validator';

export const addToCartValidator = [
  body('variables.input.productId').notEmpty(),
  body('variables.input.quantity').isNumeric().custom(val => val > 0 && val <= 10),
];
export const addToCartInMobileValidator = [
  body('variables.input.productId').notEmpty(),
  body('variables.input.quantity').isNumeric().custom(val => val > 0 && val <= 10),
];
export const removeFromCartValidator = [
  body('variables.input.productId').notEmpty(),
];
export const removeFromCartInMobileValidator = [
  body('variables.input.productId').notEmpty(),
];

export const updateCartValidator = [
  body('variables.input.productId').notEmpty(),
];
export const updateCartInMobileValidator = [
  body('variables.input.productId').notEmpty(),
];


export const bulkAddToCartValidator = [
  body('variables.input.products').custom(products => {
    for (let product of products) {
      if (product.productId && product.quantity > 0 && product.quantity <= 10) {
        return true;
      }
      return false;
    }
  }),
];





