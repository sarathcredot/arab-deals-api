import { body } from 'express-validator';

// export const getAllAttributeRecordsValidator = [
//   body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
//   body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
//   body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
// ];

export const CreateAttributeValueValidator = [
    body('variables.input.attributeId').isMongoId(),
    body('variables.input.name').optional({ checkFalsy: true }).trim(),
    body('variables.input.description').optional({ checkFalsy: true }).trim(),
    body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];


export const EditAttributeValueValidator = [
  body('variables.input.attributeId').isMongoId(),
  body('variables.input.name').optional({ checkFalsy: true }).trim(),
  body('variables.input.description').optional({ checkFalsy: true }).trim(),
  body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
];
