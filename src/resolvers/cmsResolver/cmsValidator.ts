import { body, query } from "express-validator";


export const cmsCreateValidator = [
    body('variables.input.pageName').trim().optional({ checkFalsy: true }),
    body('variables.input.title').trim().optional({ checkFalsy: true }),
    body('variables.input.subTitle').trim().optional({ checkFalsy: true }),
    body('variables.input.buttons').optional({ checkFalsy: true }).isArray({ min: 0 }).custom(val => {
        for (let button of val) {
            if (!button.buttonText && !button.redirectionURL) {
                return false;
            }
        }
        return true;
    }),
    body('variables.input.description').optional({ checkFalsy: true }).isArray({ min: 0 }).custom(val => {
        for (let item of val) {
            if (!item) {
                return false;
            }
        }
        return true;
    })
]

export const cmsSectionQueryValidator = [
    body('variables.input.sectionName').notEmpty()
]

export const cmsUpdateValidator = [
    body('variables.input.sectionName').trim().optional({ checkFalsy: true }),
    body('variables.input.pageName').trim().optional({ checkFalsy: true }),
    body('variables.input.title').trim().optional({ checkFalsy: true }),
    body('variables.input.subTitle').trim().optional({ checkFalsy: true }),
    body('variables.input.buttons').optional({ checkFalsy: true }).isArray({ min: 0 }).custom(val => {
        for (let button of val) {
            if (!button.buttonText && !button.redirectionURL) {
                return false;
            }
        }
        return true;
    }),
    body('variables.input.description').optional({ checkFalsy: true }).isArray({ min: 0 }).custom(val => {
        for (let item of val) {
            if (!item) {
                return false;
            }
        }
        return true;
    })
];

export const cmsDeleteValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
]


export const getAllCmsRecordsValidator = [
    body('variables.input.page').optional({ checkFalsy: true }).isInt({ min: 0 }),
    body('variables.input.size').optional({ checkFalsy: true }).isInt({ min: 1 }),
    body('variables.input.projection').optional().isArray().custom((value, { req }) => {
        if (!Array.isArray(value)) {
            throw new Error('Projection must be an array.');
        }

        const allowedFields = [
            '_id',
            'pageName',
            'sectionName',
            'title',
            'subTitle',
            'description',
            'images._id',
            'images.fileType',
            'images.fileURL',
            'images.mimeType',
            'images.originalName',
            'images.createdAt',
            'buttons._id',
            'buttons.buttonText',
            'buttons.redirectionURL',
            'createdAt',
            'updatedAt'
        ];

        for (const field of value) {
            if (!allowedFields.includes(field)) {
                throw new Error(`Invalid projection field: ${field}`);
            }
        }

        return true;
    }),
];

export const cmsRecordByAdminQueryValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
]