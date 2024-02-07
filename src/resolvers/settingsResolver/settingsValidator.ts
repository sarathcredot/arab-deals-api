
import { body } from 'express-validator';

export const updatePaymentConfigValidator = [
    body('variables.input.onlinePayment').isIn([true, false]),
    body('variables.input.cod').trim().isIn([true, false])
];


export const updateShippingConfigValidator = [
    body('variables.input.shippingCharge').isNumeric().custom(val => val >= 0),
    body('variables.input.freeShippingThreshold').isNumeric().custom(val => val >= 0),
    body('variables.input.returnPeriod').isNumeric().custom(val => val >= 0)
];


