import { body } from 'express-validator';


export const exportAdminOrdersValidator = [
    body('variables.input._id').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.userId').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.orderId').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.paymentMode').trim().optional({ checkFalsy: true }).isIn(["COD"]),
    body('variables.input.orderStatus').trim().optional({ checkFalsy: true }).isIn(["PENDING", "IN_PROGRESS", "COMPLETED"]),
    body('variables.input.startDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.endDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.page').trim().optional({ checkFalsy: true }).isInt().custom(val => val >= 0),
    body('variables.input.size').trim().optional({ checkFalsy: true }).isInt().custom(val => val > 0),
];

export const getJobsValidator = [
    body('variables.input.page').optional({ checkFalsy: true }).custom(val => val >= 0),
    body('variables.input.size').optional({ checkFalsy: true }).custom(val => val > 0),
    body('variables.input.name').trim().optional({ checkFalsy: true }).isIn(["ORDER_EXPORT", "SHIPPING_EXPORT"]),
];
export const getAdminDownloadTokenValidator = [
    body('variables.input._id').isMongoId(),
];

export const exportAdminOrderShippingProductsValidator = [
    body('variables.input._id').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.userId').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.orderId').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.itemId').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.productId').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.skuId').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.paymentMode').trim().optional({ checkFalsy: true }).isIn(["COD"]),
    body('variables.input.paymentStatus').trim().optional({ checkFalsy: true }).isIn(["PENDING", "COMPLETED"]),
    body('variables.input.shippingStatus').trim().optional({ checkFalsy: true }).isIn(["PENDING", "PACKAGE_IN_PROGRESS", "SHIPPED", "DELIVERED", "CANCELED"]),
    body('variables.input.orderStartDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.orderEndDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.shippingStartDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.shippingEndDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.deliveryStartDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.deliveryEndDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.cancelledStartDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.cancelledEndDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.courierId').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.invoiceNumber').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.page').trim().optional({ checkFalsy: true }).isInt().custom(val => val >= 0),
    body('variables.input.size').trim().optional({ checkFalsy: true }).isInt().custom(val => val > 0),
    body('variables.input.sort').trim().optional({ checkFalsy: true }).isIn(["Ship", "Delivery", "Cancel"]),
];