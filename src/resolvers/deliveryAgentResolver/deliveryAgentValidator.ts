import { body } from 'express-validator';

export const deliveryAgentCreateByAdminValidator = [
    body('variables.input.fullName').trim().notEmpty(),
    body('variables.input.contactNumber').trim().notEmpty().isMobilePhone('any'),
    body('variables.input.userID').trim().notEmpty(),
    body('variables.input.password').trim().notEmpty().isLength({ min: 6 }),
    body('variables.input.agentType').trim().notEmpty() .isIn(['ArabDeals', 'Vendor', 'ThirdParty']) .withMessage('Agent type must be one of: ArabDeals, Vendor, ThirdParty')
  ];