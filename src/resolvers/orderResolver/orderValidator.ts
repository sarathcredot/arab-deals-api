
import { body } from 'express-validator';

export const createOrderValidator = [
    body('variables.input.shippingAddressId').trim().isMongoId(),
    body('variables.input.paymentMode').trim().isIn(["COD"]),
    body('variables.input.grandTotal').trim().isNumeric().custom(val => val >= 0)
];

export const getAdminOrdersValidator = [
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


export const getAdminOrderDetailsValidator = [
    body('variables.input.orderId').trim().isString().notEmpty(),
];

export const getUserOrderDetailsValidator = [
    body('variables.input.orderId').trim().isString().notEmpty(),
];




export const getAdminOrderShippingProductsValidator = [
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

export const getAdminOrderReturnProductsValidator = [
    body('variables.input._id').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.userId').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.orderId').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.itemId').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.productId').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.skuId').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.paymentMode').trim().optional({ checkFalsy: true }).isIn(["COD"]),
    body('variables.input.returnStatus').trim().optional({ checkFalsy: true }).isIn(["PENDING", "APPROVED", "REJECTED"]),
    body('variables.input.deliveryStartDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.deliveryEndDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.returnRequestStartDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.returnRequestEndDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.returnStartDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.returnEndDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.returnRejectStartDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.returnRejectEndDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.courierId').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.invoiceNumber').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.page').trim().optional({ checkFalsy: true }).isInt().custom(val => val >= 0),
    body('variables.input.size').trim().optional({ checkFalsy: true }).isInt().custom(val => val > 0),
    body('variables.input.sort').trim().optional({ checkFalsy: true }).isIn(["Pending", "Approved", "Rejected"]),
];

export const getAdminOrderRefundProductsValidator = [
    body('variables.input._id').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.userId').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.orderId').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.itemId').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.productId').trim().optional({ checkFalsy: true }).isMongoId(),
    body('variables.input.skuId').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.paymentMode').trim().optional({ checkFalsy: true }).isIn(["COD"]),
    body('variables.input.refundStatus').trim().optional({ checkFalsy: true }).isIn(["PENDING", "PAID"]),
    body('variables.input.refundRequestStartDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.refundRequestEndDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.refundStartDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.refundEndDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.courierId').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.invoiceNumber').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.page').trim().optional({ checkFalsy: true }).isInt().custom(val => val >= 0),
    body('variables.input.size').trim().optional({ checkFalsy: true }).isInt().custom(val => val > 0),
    body('variables.input.sort').trim().optional({ checkFalsy: true }).isIn(["Pending", "Paid"]),
];



export const getAdminOrderProductValidator = [
    body('variables.input._id').trim().isMongoId()
];

export const getAdminOrderProductsValidator = [
    body('variables.input.orderId').trim().isString()
];


export const getUserOrderProductValidator = [
    body('variables.input._id').trim().isMongoId()
];



export const updateAdminOrderProductValidator = [
    body('variables.input._id').trim().isMongoId(),
    body('variables.input.paymentRemark').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.shippingStatus').trim().optional({ checkFalsy: true }).isIn(["PENDING", "PACKAGE_IN_PROGRESS", "SHIPPED", "DELIVERED", "CANCELED"]),
    body('variables.input.paymentStatus').trim().optional({ checkFalsy: true }).isIn(["PENDING", "COMPLETED"]),
    body('variables.input.shippedDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.deliveryDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.returnStatus').trim().optional({ checkFalsy: true }).isIn(["NA", "PENDING", "APPROVED", "REJECTED"]),
    body('variables.input.returnUserReason').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.returnAdminComment').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.returnRequestDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.returnDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.returnRejectedDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.refundStatus').trim().optional({ checkFalsy: true }).isIn(["NA", "PENDING", "PAID"]),
    body('variables.input.refundAmount').trim().optional({ checkFalsy: true }).isNumeric().custom(val => val >= 0),
    body('variables.input.refundRequestDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.refundDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.refundComment').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.cancelUserReason').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.cancelAdminComment').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.cancelledDate').trim().optional({ checkFalsy: true }).isDate(),
    body('variables.input.courierId').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.invoiceNumber').trim().optional({ checkFalsy: true }).isString(),
    body('variables.input.shippingCharge').trim().optional({ checkFalsy: true }).isNumeric(),
]

export const getUserOrderProductsValidator = [
    body('variables.input.page').trim().optional({ checkFalsy: true }).isInt().custom(val => val >= 0),
    body('variables.input.size').trim().optional({ checkFalsy: true }).isInt().custom(val => val > 0),
];

export const returnUserOrderValidator = [
    body('variables.input._id').trim().isMongoId(),
    body('variables.input.returnUserReason').trim().notEmpty(),
];


export const cancelUserOrderValidator = [
    body('variables.input._id').trim().isMongoId(),
];

export const getUserOrderProductsByAdminValidator = [
    body('variables.input.page').trim().optional({ checkFalsy: true }).isInt().custom(val => val >= 0),
    body('variables.input.size').trim().optional({ checkFalsy: true }).isInt().custom(val => val > 0),
    body('variables.input.userId').isMongoId(),
];


