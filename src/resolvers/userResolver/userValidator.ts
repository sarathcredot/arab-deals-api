import { body } from 'express-validator';

export const userNumberValidator = [
  body('variables.input.mobileNumber').notEmpty(),
];
export const userOtpValidator = [
  body('variables.input.code').notEmpty().isLength({ min: 5 }),
  body('variables.input._id').notEmpty().isMongoId()
];
export const userBlockValidator = [
  body('variables.input._id').notEmpty(),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];

export const usersQueryValidator = [
  body('variables.input.page').optional({ checkFalsy: true }).custom(val => val >= 0),
  body('variables.input.size').optional({ checkFalsy: true }).custom(val => val > 0),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
  body('variables.input.query').optional({ checkFalsy: true }),
]

export const userQueryValidator = [
  body('variables.input._id').notEmpty(),
]

export const userUpdateProfileValidator = [
  body('variables.input.email').optional({ checkFalsy: true }).trim().isEmail(),
  body('variables.input.firstName').optional({ checkFalsy: true }).notEmpty(),
  body('variables.input.lastName').optional({ checkFalsy: true }).notEmpty(),
  body('variables.input.displayName').optional({ checkFalsy: true }).notEmpty(),
];

export const userUpdateProfileByAdminValidator = [
  body('variables.input._id').isMongoId(),
  body('variables.input.email').optional({ checkFalsy: true }).trim().isEmail(),
  body('variables.input.firstName').optional({ checkFalsy: true }).notEmpty(),
  body('variables.input.lastName').optional({ checkFalsy: true }).notEmpty(),
  body('variables.input.displayName').optional({ checkFalsy: true }).notEmpty(),
  body('variables.input.mobileNumber').optional({ checkFalsy: true }).notEmpty(),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).isIn([true, false]),
];





