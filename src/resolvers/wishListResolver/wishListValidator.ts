import { body } from 'express-validator';

export const addToWishListValidator = [
  body('variables.input.productId').isMongoId(),
];



export const removeFromWishListValidator = [
  body('variables.input.productId').isMongoId(),
];

export const wishListItemExistsValidator = [
  body('variables.input.productId').isMongoId(),
];




// Mobile 


export const addToWishListMobileValidator = [
  body('variables.input.productId').isMongoId(),
];

export const removeFromWishListMobileValidator = [
  body('variables.input.productId').isMongoId(),
];

export const wishListItemExistsMobileValidator = [
  body('variables.input.productId').isMongoId(),
];









