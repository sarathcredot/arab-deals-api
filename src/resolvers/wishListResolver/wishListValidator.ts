import { body } from 'express-validator';

export const addToWishListValidator = [
  body('variables.input.productId').isMongoId(),
];

export const addToWishListInMobileValidator = [
  body('variables.input.productId').isMongoId(),
];



export const removeFromWishListValidator = [
  body('variables.input.productId').isMongoId(),
];
export const removeFromWishListInMobileValidator = [
  body('variables.input.productId').isMongoId(),
];

export const wishListItemExistsValidator = [
  body('variables.input.productId').isMongoId(),
];
export const wishListItemExistsInMobileValidator = [
  body('variables.input.productId').isMongoId(),
];








