import { orderProductModel } from "../models";
import { Types, Document, QueryOptions, PipelineStage, ProjectionFields, FilterQuery, UpdateQuery, AnyObject } from "mongoose";
import { collections } from "../configs";


export interface FileData {
    _id?: string,
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string,
    createdAt?: Date
}


export interface IOrderProduct {
    _id?: Types.ObjectId;
    userId?: Types.ObjectId;
    productId?: Types.ObjectId;
    orderId?: string;
    itemId?: string;
    productName?: string;
    shortDescription?: string;
    skuId?: string;
    image?: FileData;
    returnPeriod?: number;
    mrp?: number;
    sellingPrice?: number;
    shippingCharge?: number;
    paymentMode?: string;
    paymentStatus?: string;
    paymentRemark?: string;
    orderDate?: Date;
    shippingStatus?: string;
    shippedDate?: Date;
    deliveryDate?: Date;
    returnStatus?: string;
    returnUserReason?: string;
    returnAdminComment?: string;
    returnRequestDate?: Date;
    returnRejectedDate?: Date;
    returnDate?: Date;
    refundStatus?: string;
    refundAmount?: number;
    refundRequestDate?: Date;
    refundDate?: Date;
    refundComment?: string;
    cancelUserReason?: string;
    cancelAdminComment?: string;
    cancelledDate?: Date;
    courierId?: string;
    invoiceNumber?: string;
    invoice?: FileData;
}


export interface IOrderProductDocument extends Document {
    _id?: Types.ObjectId;
    userId?: Types.ObjectId;
    productId?: Types.ObjectId;
    orderId?: string;
    itemId?: string;
    productName?: string;
    shortDescription?: string;
    skuId?: string;
    image?: FileData;
    returnPeriod?: number;
    mrp?: number;
    sellingPrice?: number;
    shippingCharge?: number;
    paymentMode?: string;
    paymentStatus?: string;
    paymentRemark?: string;
    orderDate?: Date;
    shippingStatus?: string;
    shippedDate?: Date;
    deliveryDate?: Date;
    returnStatus?: string;
    returnUserReason?: string;
    returnAdminComment?: string;
    returnRequestDate?: Date;
    returnRejectedDate?: Date;
    returnDate?: Date;
    refundStatus?: string;
    refundAmount?: number;
    refundRequestDate?: Date;
    refundDate?: Date;
    refundComment?: string;
    cancelUserReason?: string;
    cancelAdminComment?: string;
    cancelledDate?: Date;
    courierId?: string;
    invoiceNumber?: string;
    invoice?: FileData;
}

export interface IOrderProductUpdateQuery {
    shippingCharge?: number;
    paymentStatus?: string;
    paymentRemark?: string;
    shippingStatus?: string;
    shippedDate?: Date;
    deliveryDate?: Date;
    returnStatus?: string;
    returnUserReason?: string;
    returnAdminComment?: string;
    returnRequestDate?: Date;
    returnDate?: Date;
    returnRejectedDate?: Date;
    refundStatus?: string;
    refundAmount?: number;
    refundRequestDate?: Date;
    refundDate?: Date;
    refundComment?: string;
    cancelUserReason?: string;
    cancelAdminComment?: string;
    cancelledDate?: Date;
    courierId?: string;
    invoiceNumber?: string;
    invoice?: FileData;
}




export interface IShippingProductsOptions {
    _id?: Types.ObjectId;
    userId?: Types.ObjectId;
    orderId?: string;
    productId?: Types.ObjectId;
    itemId?: string;
    skuId?: string;
    paymentMode?: string;
    paymentStatus?: string;
    shippingStatus?: string;
    orderStartDate?: Date;
    orderEndDate?: Date;
    shippingStartDate?: Date;
    shippingEndDate?: Date;
    deliveryStartDate?: Date;
    deliveryEndDate?: Date;
    cancelledStartDate?: Date;
    cancelledEndDate?: Date;
    courierId?: string;
    invoiceNumber?: string;
    page: number;
    size: number;
    sort: string;
}


export interface IReturnProductsOptions {
    _id?: Types.ObjectId;
    userId?: Types.ObjectId;
    orderId?: string;
    productId?: Types.ObjectId;
    itemId?: string;
    skuId?: string;
    paymentMode?: string;
    returnStatus?: string;
    deliveryStartDate?: Date;
    deliveryEndDate?: Date;
    returnRequestStartDate?: Date;
    returnRequestEndDate?: Date;
    returnStartDate?: Date;
    returnEndDate?: Date;
    returnRejectStartDate?: Date;
    returnRejectEndDate?: Date;
    courierId?: string;
    invoiceNumber?: string;
    page: number;
    size: number;
    sort: string;
}

export interface IRefundProductsOptions {
    _id?: Types.ObjectId;
    userId?: Types.ObjectId;
    orderId?: string;
    productId?: Types.ObjectId;
    itemId?: string;
    skuId?: string;
    paymentMode?: string;
    refundStatus?: string;
    refundRequestStartDate?: Date;
    refundRequestEndDate?: Date;
    refundStartDate?: Date;
    refundEndDate?: Date;
    courierId?: string;
    invoiceNumber?: string;
    page: number;
    size: number;
    sort: string;
}


export interface IOrderProductDetails extends IOrderProduct {
    username: string;
}


export interface IOrderProducts {
    maxRecords: number;
    records: IOrderProductDetails[];
}



export interface IUserOrderProductsOptions {
    page: number;
    size: number;
    userId?: Types.ObjectId;
}


export interface IUserOrderProducts {
    maxRecords: number;
    records: IOrderProduct[];
}


export const createOrderProducts = async (records: IOrderProduct[]): Promise<IOrderProductDocument[] | null> => {
    return await orderProductModel.insertMany(records);
}

export const getOrderProductsWithFilters = async (filters: FilterQuery<IOrderProduct>, projection: ProjectionFields<IOrderProduct> = {}, options: QueryOptions = {}): Promise<IOrderProductDocument[] | []> => {
    return await orderProductModel.find(filters, projection, options);
}

export const getOrderProductWithId = async (_id: Types.ObjectId, projection: ProjectionFields<IOrderProduct> = {}, options: QueryOptions = {}): Promise<IOrderProductDocument | null> => {
    return await orderProductModel.findById(_id, projection, options);
}


export const getOrderProductWithFilters = async (filters: FilterQuery<IOrderProduct>, projection: ProjectionFields<IOrderProduct> = {}, options: QueryOptions = {}): Promise<IOrderProductDocument | null> => {
    return await orderProductModel.findOne(filters, projection, options);
}



export const updateOrderProduct = async (_id: Types.ObjectId, updateQuery: UpdateQuery<IOrderProductUpdateQuery>): Promise<IOrderProductDocument | null> => {
    return await orderProductModel.findByIdAndUpdate(_id, updateQuery);
}


export const getShippingProducts = async (options: IShippingProductsOptions): Promise<IOrderProducts> => {

    let pipeline: PipelineStage[] = [];

    if (options._id) {
        pipeline.push(
            {
                $match: {
                    _id: options._id
                }
            }
        )
    }
    if (options.productId) {
        pipeline.push(
            {
                $match: {
                    productId: options.productId
                }
            }
        )
    }
    if (options.orderId) {
        pipeline.push(
            {
                $match: {
                    orderId: options.orderId
                }
            }
        )
    }
    if (options.itemId) {
        pipeline.push(
            {
                $match: {
                    itemId: options.itemId
                }
            }
        )
    }
    if (options.userId) {
        pipeline.push(
            {
                $match: {
                    userId: options.userId
                }
            }
        )
    }
    if (options.skuId) {
        pipeline.push(
            {
                $match: {
                    skuId: options.skuId
                }
            }
        )
    }
    if (options.paymentStatus) {
        pipeline.push(
            {
                $match: {
                    paymentStatus: options.paymentStatus
                }
            }
        )
    }
    if (options.paymentMode) {
        pipeline.push(
            {
                $match: {
                    paymentMode: options.paymentMode
                }
            }
        )
    }
    if (options.shippingStatus) {
        pipeline.push(
            {
                $match: {
                    shippingStatus: options.shippingStatus
                }
            }
        )
    }
    if (options.orderStartDate) {
        pipeline.push(
            {
                $match: {
                    orderDate: { $gte: options.orderStartDate }
                }
            }
        )
    }
    if (options.orderEndDate) {
        pipeline.push(
            {
                $match: {
                    orderDate: { $lte: options.orderEndDate }
                }
            }
        )
    }
    if (options.shippingStartDate) {
        pipeline.push(
            {
                $match: {
                    shippedDate: { $lgte: options.shippingStartDate }
                }
            }
        )
    }
    if (options.shippingEndDate) {
        pipeline.push(
            {
                $match: {
                    shippedDate: { $lte: options.shippingEndDate }
                }
            }
        )
    }
    if (options.deliveryStartDate) {
        pipeline.push(
            {
                $match: {
                    deliveryDate: { $gte: options.deliveryStartDate }
                }
            }
        )
    }
    if (options.deliveryEndDate) {
        pipeline.push(
            {
                $match: {
                    deliveryDate: { $lte: options.deliveryEndDate }
                }
            }
        )
    }
    if (options.cancelledStartDate) {
        pipeline.push(
            {
                $match: {
                    cancelledDate: { $lte: options.cancelledStartDate }
                }
            }
        )
    }
    if (options.cancelledEndDate) {
        pipeline.push(
            {
                $match: {
                    cancelledDate: { $gte: options.cancelledEndDate }
                }
            }
        )
    }
    if (options.courierId) {
        pipeline.push(
            {
                $match: {
                    courierId: options.courierId
                }
            }
        )
    }
    if (options.invoiceNumber) {
        pipeline.push(
            {
                $match: {
                    invoiceNumber: options.invoiceNumber
                }
            }
        )
    }

    switch (options.sort) {
        case "Ship":
            pipeline.push(
                {
                    $sort: { shippedDate: -1, _id: -1 }
                }
            )
            break;
        case "Delivery":
            pipeline.push(
                {
                    $sort: { deliveryDate: -1, _id: -1 }
                }
            )
            break;
        case "Cancel":
            pipeline.push(
                {
                    $sort: { cancelledDate: -1, _id: -1 }
                }
            )
            break;
        default:
            pipeline.push(
                {
                    $sort: { orderDate: -1, _id: -1 }
                }
            )
            break;
    }

    pipeline.push(
        {
            $facet: {
                metadata: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 }
                        }
                    }
                ],
                data: [
                    {
                        $skip: options.page * options.size
                    },
                    {
                        $limit: options.size
                    },
                    {
                        $lookup: {
                            from: collections.USERS,
                            let: { userId: "$userId" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$userId"]
                                        }
                                    }
                                },
                                {
                                    $limit: 1
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        fullname: 1
                                    }
                                }
                            ],
                            as: "userInfo"
                        }
                    },
                    {
                        $unwind: {
                            path: "$userInfo",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            orderId: 1,
                            userId: 1,
                            productId: 1,
                            itemId: 1,
                            username: "$userInfo.fullname",
                            productName: 1,
                            skuId: 1,
                            image: 1,
                            sellingPrice: 1,
                            shippingCharge: 1,
                            paymentMode: 1,
                            paymentStatus: 1,
                            orderDate: 1,
                            shippingStatus: 1,
                            shippedDate: 1,
                            deliveryDate: 1,
                            courierId: 1,
                            invoiceNumber: 1,
                            cancelledDate: 1,
                        }
                    }
                ]
            }
        },
        {
            $project: {
                maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
                data: 1
            }
        }
    );

    const result = await orderProductModel.aggregate(pipeline);
    let response = {
        records: [],
        maxRecords: 0
    };
    if (result.length) {
        response.records = result[0].data || [];
        response.maxRecords = result[0].maxRecords || 0;
    }

    return response;
}



export const getReturnProducts = async (options: IReturnProductsOptions): Promise<IOrderProducts> => {

    let pipeline: PipelineStage[] = [];

    if (options._id) {
        pipeline.push(
            {
                $match: {
                    _id: options._id
                }
            }
        )
    }
    if (options.productId) {
        pipeline.push(
            {
                $match: {
                    productId: options.productId
                }
            }
        )
    }
    if (options.orderId) {
        pipeline.push(
            {
                $match: {
                    orderId: options.orderId
                }
            }
        )
    }
    if (options.itemId) {
        pipeline.push(
            {
                $match: {
                    itemId: options.itemId
                }
            }
        )
    }
    if (options.userId) {
        pipeline.push(
            {
                $match: {
                    userId: options.userId
                }
            }
        )
    }
    if (options.skuId) {
        pipeline.push(
            {
                $match: {
                    skuId: options.skuId
                }
            }
        )
    }
    if (options.paymentMode) {
        pipeline.push(
            {
                $match: {
                    paymentMode: options.paymentMode
                }
            }
        )
    }
    if (options.returnStatus) {
        pipeline.push(
            {
                $match: {
                    returnStatus: options.returnStatus
                }
            }
        )
    }
    if (options.deliveryStartDate) {
        pipeline.push(
            {
                $match: {
                    deliveryDate: { $gte: options.deliveryStartDate }
                }
            }
        )
    }
    if (options.deliveryEndDate) {
        pipeline.push(
            {
                $match: {
                    deliveryDate: { $lte: options.deliveryEndDate }
                }
            }
        )
    }
    if (options.returnRequestStartDate) {
        pipeline.push(
            {
                $match: {
                    returnRequestDate: { $gte: options.returnRequestStartDate }
                }
            }
        )
    }
    if (options.returnRequestEndDate) {
        pipeline.push(
            {
                $match: {
                    returnRequestDate: { $lte: options.returnRequestEndDate }
                }
            }
        )
    }
    if (options.returnStartDate) {
        pipeline.push(
            {
                $match: {
                    returnDate: { $gte: options.returnStartDate }
                }
            }
        )
    }
    if (options.returnEndDate) {
        pipeline.push(
            {
                $match: {
                    returnDate: { $lte: options.returnEndDate }
                }
            }
        )
    }
    if (options.returnRejectStartDate) {
        pipeline.push(
            {
                $match: {
                    returnRejectedDate: { $gte: options.returnRejectStartDate }
                }
            }
        )
    }
    if (options.returnRejectEndDate) {
        pipeline.push(
            {
                $match: {
                    returnRejectedDate: { $lte: options.returnRejectEndDate }
                }
            }
        )
    }
    if (options.courierId) {
        pipeline.push(
            {
                $match: {
                    courierId: options.courierId
                }
            }
        )
    }
    if (options.invoiceNumber) {
        pipeline.push(
            {
                $match: {
                    invoiceNumber: options.invoiceNumber
                }
            }
        )
    }

    switch (options.sort) {
        case "Pending":
            pipeline.push(
                {
                    $sort: { returnRequestDate: -1, _id: -1 }
                }
            )
            break;
        case "Approved":
            pipeline.push(
                {
                    $sort: { returnDate: -1, _id: -1 }
                }
            )
            break;
        case "Rejected":
            pipeline.push(
                {
                    $sort: { returnRejectedDate: -1, _id: -1 }
                }
            )
            break;
    }

    pipeline.push(
        {
            $facet: {
                metadata: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 }
                        }
                    }
                ],
                data: [
                    {
                        $skip: options.page * options.size
                    },
                    {
                        $limit: options.size
                    },
                    {
                        $lookup: {
                            from: collections.USERS,
                            let: { userId: "$userId" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$userId"]
                                        }
                                    }
                                },
                                {
                                    $limit: 1
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        fullname: 1
                                    }
                                }
                            ],
                            as: "userInfo"
                        }
                    },
                    {
                        $unwind: {
                            path: "$userInfo",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            orderId: 1,
                            userId: 1,
                            productId: 1,
                            itemId: 1,
                            username: "$userInfo.fullname",
                            productName: 1,
                            skuId: 1,
                            image: 1,
                            sellingPrice: 1,
                            shippingCharge: 1,
                            paymentMode: 1,
                            deliveryDate: 1,
                            returnStatus: 1,
                            returnRequestDate: 1,
                            returnDate: 1,
                            returnRejectedDate: 1,
                            courierId: 1,
                            invoiceNumber: 1,
                        }
                    }
                ]
            }
        },
        {
            $project: {
                maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
                data: 1
            }
        }
    );

    const result = await orderProductModel.aggregate(pipeline);
    let response = {
        records: [],
        maxRecords: 0
    };
    if (result.length) {
        response.records = result[0].data || [];
        response.maxRecords = result[0].maxRecords || 0;
    }

    return response;
}




export const getRefundProducts = async (options: IRefundProductsOptions): Promise<IOrderProducts> => {

    let pipeline: PipelineStage[] = [];

    if (options._id) {
        pipeline.push(
            {
                $match: {
                    _id: options._id
                }
            }
        )
    }
    if (options.productId) {
        pipeline.push(
            {
                $match: {
                    productId: options.productId
                }
            }
        )
    }
    if (options.orderId) {
        pipeline.push(
            {
                $match: {
                    orderId: options.orderId
                }
            }
        )
    }
    if (options.itemId) {
        pipeline.push(
            {
                $match: {
                    itemId: options.itemId
                }
            }
        )
    }
    if (options.userId) {
        pipeline.push(
            {
                $match: {
                    userId: options.userId
                }
            }
        )
    }
    if (options.skuId) {
        pipeline.push(
            {
                $match: {
                    skuId: options.skuId
                }
            }
        )
    }
    if (options.paymentMode) {
        pipeline.push(
            {
                $match: {
                    paymentMode: options.paymentMode
                }
            }
        )
    }
    if (options.refundStatus) {
        pipeline.push(
            {
                $match: {
                    refundStatus: options.refundStatus
                }
            }
        )
    }
    if (options.refundRequestStartDate) {
        pipeline.push(
            {
                $match: {
                    refundRequestDate: { $gte: options.refundRequestStartDate }
                }
            }
        )
    }
    if (options.refundRequestEndDate) {
        pipeline.push(
            {
                $match: {
                    refundRequestDate: { $lte: options.refundRequestEndDate }
                }
            }
        )
    }
    if (options.refundStartDate) {
        pipeline.push(
            {
                $match: {
                    refundDate: { $gte: options.refundStartDate }
                }
            }
        )
    }
    if (options.refundEndDate) {
        pipeline.push(
            {
                $match: {
                    refundDate: { $lte: options.refundEndDate }
                }
            }
        )
    }
    if (options.courierId) {
        pipeline.push(
            {
                $match: {
                    courierId: options.courierId
                }
            }
        )
    }
    if (options.invoiceNumber) {
        pipeline.push(
            {
                $match: {
                    invoiceNumber: options.invoiceNumber
                }
            }
        )
    }

    switch (options.sort) {
        case "Pending":
            pipeline.push(
                {
                    $sort: { refundRequestDate: -1, _id: -1 }
                }
            )
            break;
        case "Paid":
            pipeline.push(
                {
                    $sort: { refundDate: -1, _id: -1 }
                }
            )
            break;
    }

    pipeline.push(
        {
            $facet: {
                metadata: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 }
                        }
                    }
                ],
                data: [
                    {
                        $skip: options.page * options.size
                    },
                    {
                        $limit: options.size
                    },
                    {
                        $lookup: {
                            from: collections.USERS,
                            let: { userId: "$userId" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$userId"]
                                        }
                                    }
                                },
                                {
                                    $limit: 1
                                },
                                {
                                    $project: {
                                        _id: 0,
                                        fullname: 1
                                    }
                                }
                            ],
                            as: "userInfo"
                        }
                    },
                    {
                        $unwind: {
                            path: "$userInfo",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            orderId: 1,
                            productId: 1,
                            itemId: 1,
                            userId: 1,
                            username: "$userInfo.fullname",
                            productName: 1,
                            skuId: 1,
                            image: 1,
                            sellingPrice: 1,
                            shippingCharge: 1,
                            paymentMode: 1,
                            refundStatus: 1,
                            refundAmount: 1,
                            refundRequestDate: 1,
                            refundDate: 1,
                            refundComment: 1,
                            courierId: 1,
                            invoiceNumber: 1,
                        }
                    }
                ]
            }
        },
        {
            $project: {
                maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
                data: 1
            }
        }
    );

    const result = await orderProductModel.aggregate(pipeline);
    let response = {
        records: [],
        maxRecords: 0
    };
    if (result.length) {
        response.records = result[0].data || [];
        response.maxRecords = result[0].maxRecords || 0;
    }

    return response;
}



export const getUserOrderProducts = async (options: IUserOrderProductsOptions): Promise<IUserOrderProducts> => {

    let pipeline: PipelineStage[] = [];

    pipeline.push(
        {
            $match: {
                userId: options.userId
            }
        },
        {
            $sort: { _id: -1 }
        },
        {
            $facet: {
                metadata: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 }
                        }
                    }
                ],
                data: [
                    {
                        $skip: options.page * options.size
                    },
                    {
                        $limit: options.size
                    },
                    {
                        $project: {
                            _id: 1,
                            orderId: 1,
                            itemId: 1,
                            productId: 1,
                            productName: 1,
                            shortDescription: 1,
                            skuId: 1,
                            image: 1,
                            sellingPrice: 1,
                            shippingCharge: 1,
                            paymentMode: 1,
                            paymentStatus: 1,
                            orderDate: 1,
                            shippingStatus: 1,
                            shippedDate: 1,
                            deliveryDate: 1,
                            cancelledDate: 1,
                            returnPeriod: 1,
                            returnStatus: 1,
                            returnUserReason: 1,
                            returnRequestDate: 1,
                            returnRejectedDate: 1,
                            returnDate: 1,
                            refundStatus: 1,
                            refundAmount: 1,
                            refundDate: 1,
                            cancelUserReason: 1,
                            invoice: 1,
                            courierId: 1,
                            invoiceNumber: 1,
                        }
                    }
                ]
            }
        },
        {
            $project: {
                maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
                data: 1
            }
        }
    );

    const result = await orderProductModel.aggregate(pipeline);
    let response = {
        records: [],
        maxRecords: 0
    };
    if (result.length) {
        response.records = result[0].data || [];
        response.maxRecords = result[0].maxRecords || 0;
    }

    return response;
}

