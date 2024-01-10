
import { body } from 'express-validator';

export const getAllAttributeRecordsValidator = [
  body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];

export const CreateAttributeValidator = [
  body('variables.input.companyName').optional({ checkFalsy: true }).trim(),
  body('variables.input.companyName').optional({ checkFalsy: true }).trim(),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];

export const EditAttributeValidator = [
  body('variables.input.attributeId').isMongoId(),
  body('variables.input.companyName').optional({ checkFalsy: true }).trim(),
  body('variables.input.companyName').optional({ checkFalsy: true }).trim(),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];

export const getAttributeRecordValidator = [
  body('variables.input.attributeId').isMongoId(),
  body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];