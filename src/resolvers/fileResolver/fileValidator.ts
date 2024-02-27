
import { body } from 'express-validator';

export const getAdminSignedUrlValidator = [
    body('variables.input.fileURL').notEmpty(),
    body('variables.input.mimeType').notEmpty()
];


export const getUserInvoiceSignedUrlValidator = [
    body('variables.input._id').isMongoId(),
];

