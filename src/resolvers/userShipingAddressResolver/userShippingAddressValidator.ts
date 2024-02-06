
import { body } from 'express-validator';

export const userShippingAddressCreateValidator = [
    body('variables.input.firstname').trim().notEmpty(),
    body('variables.input.email').trim().optional({ checkFalsy: true }).isEmail(),
    body('variables.input.mobile').trim().notEmpty(),
    body('variables.input.streetName').trim().notEmpty(),
    body('variables.input.city').trim().notEmpty(),
    body('variables.input.postCode').trim().notEmpty(),
    body('variables.input.apartment').trim().optional({ checkFalsy: true }),
    body('variables.input.suite').trim().optional({ checkFalsy: true }),
    body('variables.input.unit').trim().optional({ checkFalsy: true }),
    body('variables.input.country').trim().optional({ checkFalsy: true }),
    body('variables.input.houseNumber').trim().optional({ checkFalsy: true }),
    body('variables.input.companyName').trim().optional({ checkFalsy: true }),
    body('variables.input.vatNumber').trim().optional({ checkFalsy: true }),
];


export const userShippingAddressQueryValidator = [
    body('variables.input._id').trim().isMongoId()
];


export const userShippingAddressUpdateValidator = [
    body('variables.input._id').trim().isMongoId(),
    body('variables.input.first').trim().optional({ checkFalsy: true }),
    body('variables.input.email').trim().optional({ checkFalsy: true }).isEmail(),
    body('variables.input.mobile').trim().optional({ checkFalsy: true }),
    body('variables.input.streetName').trim().optional({ checkFalsy: true }),
    body('variables.input.city').trim().optional({ checkFalsy: true }),
    body('variables.input.country').trim().optional({ checkFalsy: true }),
    body('variables.input.apartment').trim().optional({ checkFalsy: true }),
    body('variables.input.postCode').trim().optional({ checkFalsy: true }),
    body('variables.input.suite').trim().optional({ checkFalsy: true }),
    body('variables.input.unit').trim().optional({ checkFalsy: true }),
    body('variables.input.houseNumber').trim().optional({ checkFalsy: true }),
    body('variables.input.companyName').trim().optional({ checkFalsy: true }),
    body('variables.input.vatNumber').trim().optional({ checkFalsy: true }),
];

