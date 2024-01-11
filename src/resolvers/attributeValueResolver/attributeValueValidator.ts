import { body } from 'express-validator';

export const CreateAttributeValueValidator = [
  body('variables.input.attributeId').isMongoId(),
  body('variables.input.value').optional({ checkFalsy: true }).trim(),
  body('variables.input.colorCode').optional({ checkFalsy: true }).trim(),
  body('variables.input.priority').optional({ checkFalsy: true }).isInt({ min: 1 }),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];


export const EditAttributeValueValidator = [
  body('variables.input.attributeValueId').isMongoId(),
  body('variables.input.value').optional({ checkFalsy: true }).trim(),
  body('variables.input.colorCode').optional({ checkFalsy: true }).trim(),
  body('variables.input.priority').optional({ checkFalsy: true }).isInt({ min: 1 }),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];
