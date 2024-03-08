import { body, query } from "express-validator";

export const productsQueryValidator = [
    body('variables.input.page').optional({ checkFalsy: true }).custom(val => val >= 0),
    body('variables.input.status').optional({ checkFalsy: true }).isIn(["PENDING", "UNDER_VERIFICATION", "APPROVED", "REJECTED"]),
    body('variables.input.productSize').optional({ checkFalsy: true }).isArray({ min: 0 }),
    body('variables.input.bestSeller').optional({ checkFalsy: true }).isIn([true, false]),
    body('variables.input.maxPrice').optional({ checkFalsy: true }).custom(val => val > 0),
    body('variables.input.minPrice').optional({ checkFalsy: true }).custom(val => val >= 0),
    body('variables.input.discount').optional({ checkFalsy: true }).custom(val => val >= 0),
    body('variables.input.newest').optional({ checkFalsy: true }).toBoolean(true),
    body('variables.input.priceLowToHigh').optional({ checkFalsy: true }).toBoolean(true),
    body('variables.input.priceHighToLow').optional({ checkFalsy: true }).toBoolean(true),
    body('variables.input.query').trim().optional({ checkFalsy: true }),
    body('variables.input.parentCategory').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.categories').optional({ checkFalsy: true }).isArray({ min: 0 }).custom(val => {
        for (let item of val) {
            if (!item) {
                return false;
            }
        }
        return true;
    }),
    body('variables.input.brands').optional({ checkFalsy: true }).isArray({ min: 0 }).custom(val => {
        for (let item of val) {
            if (!item) {
                return false;
            }
        }
        return true;
    }),
    body('variables.input.attributes').optional({ checkFalsy: true }).isArray({ min: 0 }).custom((attributes) => {
        for (let attribute of attributes) {
            if (!attribute.id || !attribute.values || !Array.isArray(attribute.values) || attribute.values.length === 0) {
                return false;
            }
        }
        return true;
    }),
];

export const vendorProductsQueryValidator = [
    body('variables.input.page').optional({ checkFalsy: true }).custom(val => val >= 0),
    body('variables.input.status').optional({ checkFalsy: true }).isIn(["PENDING", "UNDER_VERIFICATION", "APPROVED", "REJECTED"]),
    body('variables.input.productSize').optional({ checkFalsy: true }).isArray({ min: 0 }),
    body('variables.input.bestSeller').optional({ checkFalsy: true }).isIn([true, false]),
    body('variables.input.maxPrice').optional({ checkFalsy: true }).custom(val => val > 0),
    body('variables.input.minPrice').optional({ checkFalsy: true }).custom(val => val >= 0),
    body('variables.input.discount').optional({ checkFalsy: true }).custom(val => val >= 0),
    body('variables.input.newest').optional({ checkFalsy: true }).toBoolean(true),
    body('variables.input.priceLowToHigh').optional({ checkFalsy: true }).toBoolean(true),
    body('variables.input.priceHighToLow').optional({ checkFalsy: true }).toBoolean(true),
    body('variables.input.query').trim().optional({ checkFalsy: true }),
    body('variables.input.parentCategory').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.categories').optional({ checkFalsy: true }).isArray({ min: 0 }).custom(val => {
        for (let item of val) {
            if (!item) {
                return false;
            }
        }
        return true;
    }),
    body('variables.input.brands').optional({ checkFalsy: true }).isArray({ min: 0 }).custom(val => {
        for (let item of val) {
            if (!item) {
                return false;
            }
        }
        return true;
    }),
    body('variables.input.attributes').optional({ checkFalsy: true }).isArray({ min: 0 }).custom((attributes) => {
        for (let attribute of attributes) {
            if (!attribute.id || !attribute.values || !Array.isArray(attribute.values) || attribute.values.length === 0) {
                return false;
            }
        }
        return true;
    }),
];

export const adminProductsQueryValidator = [
    body('variables.input.page').optional({ checkFalsy: true }).custom(val => val >= 0),
    body('variables.input.productSize').optional({ checkFalsy: true }).isArray({ min: 0 }),
    body('variables.input.bestSeller').optional({ checkFalsy: true }).isIn([true, false]),
    body('variables.input.maxPrice').optional({ checkFalsy: true }).custom(val => val > 0),
    body('variables.input.minPrice').optional({ checkFalsy: true }).custom(val => val >= 0),
    body('variables.input.discount').optional({ checkFalsy: true }).custom(val => val >= 0),
    body('variables.input.newest').optional({ checkFalsy: true }).toBoolean(true),
    body('variables.input.status').optional({ checkFalsy: true }).isIn(["PENDING", "UNDER_VERIFICATION", "APPROVED", "REJECTED"]),
    body('variables.input.priceLowToHigh').optional({ checkFalsy: true }).toBoolean(true),
    body('variables.input.priceHighToLow').optional({ checkFalsy: true }).toBoolean(true),
    body('variables.input.query').trim().optional({ checkFalsy: true }),
    body('variables.input.parentCategory').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.categories').optional({ checkFalsy: true }).isArray({ min: 0 }).custom(val => {
        for (let item of val) {
            if (!item) {
                return false;
            }
        }
        return true;
    }),
    body('variables.input.brands').optional({ checkFalsy: true }).isArray({ min: 0 }).custom(val => {
        for (let item of val) {
            if (!item) {
                return false;
            }
        }
        return true;
    }),
    body('variables.input.attributes').optional({ checkFalsy: true }).isArray({ min: 0 }).custom((attributes) => {
        for (let attribute of attributes) {
            if (!attribute.id || !attribute.values || !Array.isArray(attribute.values) || attribute.values.length === 0) {
                return false;
            }
        }
        return true;
    }),
];



export const productQueryValidator = [
    body('variables.input._id').isMongoId(),
]

export const variantsQueryValidator = [
    body('variables.input._id').isMongoId(),
    body('variables.input.productCode').optional({ checkFalsy: true }),
]


export const adminVariantsTableQueryValidator = [
    body('variables.input.productCode').custom(val => val > 0)
]


export const variantsTableByVendorQueryValidator = [
    body('variables.input.productCode').optional({ checkFalsy: true }),
]

export const productsAutoCompleteQueryValidator = [
    body('variables.input.query').toLowerCase().trim(),
]


export const createProductValidator = [
    body('variables.input.productName').trim().isLength({ min: 1 }).withMessage('Product name is required'),
    body('variables.input.shortDescription').trim().isLength({ min: 1 }).withMessage('Short description is required'),
    body('variables.input.skuId').optional({ checkFalsy: true }),
    body('variables.input.description').optional({ checkFalsy: true }),
    body('variables.input.rating').optional({ checkFalsy: true }).isFloat({ min: 1, max: 5 }).withMessage('Invalid rating'),
    body('variables.input.sellingPrice').isFloat({ min: 0 }).withMessage('Invalid selling price'),
    body('variables.input.price').isFloat({ min: 0 }).withMessage('Invalid price'),
    body('variables.input.mrp').isFloat({ min: 0 }).withMessage('Invalid MRP'),
    body('variables.input.tags').optional({ checkFalsy: true }),
    body('variables.input.productCode').optional({ checkFalsy: true }),
    body('variables.input.stock').isInt({ min: 0 }).withMessage('Invalid stock value'),
    body('variables.input.categoryId').isMongoId().withMessage('Invalid category ID'),
    body('variables.input.productInfo').optional({ checkFalsy: true }).isArray({ min: 0 })
];

export const productUpdateValidator = [
    body('variables.input.productName').optional({ checkFalsy: true }),
    body('variables.input.shortDescription').optional({ checkFalsy: true }),
    body('variables.input.skuId').optional({ checkFalsy: true }),
    body('variables.input.description').optional({ checkFalsy: true }),
    body('variables.input.material').optional({ checkFalsy: true }),
    body('variables.input.rating').optional({ checkFalsy: true }),
    body('variables.input.sellingPrice').optional({ checkFalsy: true }),
    body('variables.input.price').optional({ checkFalsy: true }),
    body('variables.input.mrp').optional({ checkFalsy: true }),
    body('variables.input.tags').optional({ checkFalsy: true }),
    body('variables.input.stock').optional({ checkFalsy: true }),
    body('variables.input.productInfo').optional({ checkFalsy: true }).isArray({ min: 0 })
];

export const productUpdateByAdminValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
    body('variables.input.brandId').optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.brandName').optional({ checkFalsy: true }),
    body('variables.input.productName').optional({ checkFalsy: true }),
    body('variables.input.shortDescription').optional({ checkFalsy: true }),
    body('variables.input.skuId').optional({ checkFalsy: true }),
    body('variables.input.warehouseSkuId').optional({ checkFalsy: true }),
    body('variables.input.description').optional({ checkFalsy: true }),
    body('variables.input.rating').optional({ checkFalsy: true }),
    body('variables.input.sellingPrice').optional({ checkFalsy: true }),
    body('variables.input.price').optional({ checkFalsy: true }),
    body('variables.input.mrp').optional({ checkFalsy: true }),
    body('variables.input.tags').optional({ checkFalsy: true }),
    body('variables.input.isBlocked').optional({ checkFalsy: true }).toBoolean(true),
    body('variables.input.stock').optional({ checkFalsy: true }),
    body('variables.input.productInfo').optional({ checkFalsy: true }).isArray({ min: 0 })
];

export const productDeleteValidator = [
    body('variables.input._id').notEmpty().isMongoId(),
]

export const createVariantValidator = [
    body('variables.input.productName').trim().isLength({ min: 1 }).withMessage('Product name is required'),
    body('variables.input.shortDescription').trim().isLength({ min: 1 }).withMessage('Short description is required'),
    body('variables.input.skuId').optional({ checkFalsy: true }),
    body('variables.input.description').optional({ checkFalsy: true }),
    body('variables.input.material').optional({ checkFalsy: true }),
    body('variables.input.rating').optional({ checkFalsy: true }).isFloat({ min: 1, max: 5 }).withMessage('Invalid rating'),
    body('variables.input.sellingPrice').isFloat({ min: 0 }).withMessage('Invalid selling price'),
    body('variables.input.price').isFloat({ min: 0 }).withMessage('Invalid price'),
    body('variables.input.mrp').isFloat({ min: 0 }).withMessage('Invalid MRP'),
    body('variables.input.productCode').notEmpty(),
    body('variables.input.stock').isInt({ min: 0 }).withMessage('Invalid stock value'),
    body('variables.input.categoryId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid category ID'),
];

export const relatedProductsQueryValidator = [
    body('variables.input._id').isMongoId(),
    body('variables.input.limit').optional({ checkFalsy: true }).custom(val => val > 0),
]

export const productUpdateStatusValidator = [
    body('variables.input._id').isMongoId()
]


export const macPriceValidator = [
    body('variables.input.categories').optional({ checkFalsy: true }).isArray({ min: 0 }).custom(val => {
        for (let item of val) {
            if (!item) {
                return false;
            }
        }
        return true;
    }),
]