import { orderProductModel } from "../models";
import {
  Types,
  Document,
  QueryOptions,
  PipelineStage,
  ProjectionFields,
  FilterQuery,
  UpdateQuery,
  AnyObject,
} from "mongoose";
import { collections } from "../configs";
import excel from "exceljs";
import path from "path";
import { IVendor } from "./vendorService";
import { IDeliveryAgent } from "./deliveryAgentService";

export interface IBestSellingProduct {
  _id: Types.ObjectId;
  count: number;
}

export interface FileData {
  _id?: Types.ObjectId;
  fileType?: string;
  fileURL?: string;
  mimeType?: string;
  originalName?: string;
  createdAt?: Date;
}

export interface IOrderProduct {
  _id?: Types.ObjectId;
  userId?: Types.ObjectId;
  vendorId?: Types.ObjectId;
  vendor?: IVendor;
  deliveryBoy?: IDeliveryAgent;
  productId?: Types.ObjectId;
  orderId?: string;
  itemId?: string;
  productName?: string;
  shortDescription?: string;
  skuId?: string;
  warehouseSkuId?: string;
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
  deliveryAssignedOn?: Date;
  returnOrderAssignedOn?: Date;
  courierId?: string;
  invoiceNumber?: string;
  invoice?: FileData;
  returnProductImage?: FileData[];
  refundBankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
  };
  returnAddress?: {
    firstname: string;
    email?: string;
    mobile?: string;
    streetName?: string;
    city?: string;
    houseNumber?: string;
    country?: string;
    postCode?: string;
    apartment?: string;
    suite?: string;
    unit?: string;
  };
}

export interface IVendorOrderProduct {
  _id?: Types.ObjectId;
  userId?: Types.ObjectId;
  vendorId?: Types.ObjectId;
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

export interface IUser {
  _id: Types.ObjectId;
  fullName: string;
}

export interface IReturnOrderProductDocument extends Document {
  _id?: Types.ObjectId;
  userId?: Types.ObjectId | IUser;
  productId?: Types.ObjectId;
  vendorId?: Types.ObjectId;
  vendorName?: string;
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
  returnProductImage?: FileData[];
  deliveryAssignedOn?: Date;
  returnOrderAssignedOn?: Date;
  refundBankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
  };
  returnAddress?: {
    firstname: string;
    email?: string;
    mobile?: string;
    streetName?: string;
    city?: string;
    houseNumber?: string;
    country?: string;
    postCode?: string;
    apartment?: string;
    suite?: string;
    unit?: string;
    governorate:string;
    village:string;
  };
  returndeliveryAgentId?: Types.ObjectId;
  returndeliveryAgentName?: string;
}

export interface IOrderProductDocument extends Document {
  _id?: Types.ObjectId;
  userId?: Types.ObjectId;
  productId?: Types.ObjectId;
  vendorId?: Types.ObjectId;
  vendorName?: string;
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
  returnProductImage?: FileData[];
  deliveryAssignedOn?: Date;
  returnOrderAssignedOn?: Date;
  refundBankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
  };
  returnAddress?: {
    firstname: string;
    email?: string;
    mobile?: string;
    streetName?: string;
    city?: string;
    houseNumber?: string;
    country?: string;
    postCode?: string;
    apartment?: string;
    suite?: string;
    unit?: string;
  };
  returndeliveryAgentId?: Types.ObjectId;
  returndeliveryAgentName?: string;
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
  vendorId?: Types.ObjectId;
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

export interface IVendorShippingProductsOptions {
  _id?: Types.ObjectId;
  userId?: Types.ObjectId;
  orderId?: string;
  vendorId: Types.ObjectId;
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
  vendorId?: Types.ObjectId;
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

export interface IVendorReturnProductsOptions {
  _id?: Types.ObjectId;
  userId?: Types.ObjectId;
  orderId?: string;
  vendorId: Types.ObjectId;
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
  vendorId?: Types.ObjectId;
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

export interface IVendorRefundProductsOptions {
  _id?: Types.ObjectId;
  userId?: Types.ObjectId;
  orderId?: string;
  vendorId: Types.ObjectId;
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

// export interface FileData {
//     _id?: Types.ObjectId,
//     fileType?: string,
//     fileURL?: string,
//     mimeType?: string,
//     originalName?: string,
//   }

export interface IOrderProductDetails extends IOrderProduct {
  username: string;
  vendorName: string;
}

export interface IOrderExportProductDetails extends IOrderProduct {
  username: string;
  shippingAddress: {};
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

export interface IUserOrderProductsByAdminOptions {
  page: number;
  size: number;
  userId: Types.ObjectId;
  orderId: string;
}

export interface IUserOrderProducts {
  maxRecords: number;
  records: IOrderProduct[];
}

export interface IUserOrderProductsByAdmin {
  maxRecords: number;
  records: IOrderProduct[];
}

export const createOrderProducts = async (
  records: IOrderProduct[]
): Promise<IOrderProductDocument[] | null> => {
  return await orderProductModel.insertMany(records);
};

export const getOrderProductsWithFilters = async (
  filters: FilterQuery<IOrderProduct>,
  projection: ProjectionFields<IOrderProduct> = {},
  options: QueryOptions = {}
): Promise<IOrderProductDocument[] | []> => {
  return await orderProductModel.find(filters, projection, options);
};

export const getOrderProductsWithFiltersIncludeVendor = async (
  filters: FilterQuery<IOrderProduct>,
  projection: ProjectionFields<IOrderProduct> = {},
  options: QueryOptions = {}
): Promise<any[] | []> => {
  return await orderProductModel
    .find(filters, projection, options)
    .populate({ path: "vendorId", select: "_id fullName" });
};

export const getOrderProductsWithFiltersIncludeVendorNew = async (
  filters: FilterQuery<IOrderProduct>,
  projection: ProjectionFields<IOrderProduct> = {},
  options: QueryOptions = {}
): Promise<any[] | []> => {
  // return await orderProductModel.find(filters, projection, options).populate({ path: "vendorId", select: "_id fullName" });
  const pipeline: PipelineStage[] = [
    {
      $match: filters,
    },
    {
      $lookup: {
        from: "vendors",
        localField: "vendorId",
        foreignField: "_id",
        as: "vendor",
      },
    },
    {
      $unwind: {
        path: "$vendor",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "deliveryagents",
        localField: "deliveryAgentId",
        foreignField: "_id",
        as: "deliveryBoy",
      },
    },
    {
      $unwind: {
        path: "$deliveryBoy",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "deliveryagents",
        localField: "returndeliveryAgentId",
        foreignField: "_id",
        as: "returnCollectorBoy",
      },
    },
    {
      $unwind: {
        path: "$returnCollectorBoy",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
  console.log(pipeline, "PIPELINE, ORDER PRODUCTS");
  const result = await orderProductModel.aggregate(pipeline).exec();
  console.log(JSON.stringify(result, null, 4), "RESULT ORDER PRODUCT BY ORDER ID");
  return result;
};

export const getOrderProductWithId = async (
  _id: Types.ObjectId,
  projection: ProjectionFields<IOrderProduct> = {},
  options: QueryOptions = {}
): Promise<IOrderProductDocument | null> => {
  return await orderProductModel.findById(_id, projection, options);
};

export const getOrderProductByIdIncludeVendor = async (
  _id: Types.ObjectId,
  projection: ProjectionFields<IOrderProduct> = {},
  options: QueryOptions = {}
): Promise<any> => {
  return await orderProductModel
    .findById(_id, projection, options)
    .populate({ path: "vendorId", select: "_id fullName" });
};

export const getVendorOrderProductById = async (
  _id: Types.ObjectId
): Promise<any> => {
  let pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $match: {
        _id: _id,
      },
    },
    {
      $lookup: {
        from: collections.ORDERS,
        let: { orderId: "$orderId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$orderId", "$$orderId"],
              },
            },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              shippingAddress: 1,
            },
          },
        ],
        as: "orderDetails",
      },
    },
    {
      $unwind: {
        path: "$orderDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        userId: 1,
        vendorId: 1,
        productId: 1,
        itemId: 1,
        orderId: 1,
        productName: 1,
        shortDescription: 1,
        skuId: 1,
        image: 1,
        returnPeriod: 1,
        mrp: 1,
        sellingPrice: 1,
        shippingCharge: 1,
        paymentMode: 1,
        paymentStatus: 1,
        paymentRemark: 1,
        orderDate: 1,
        shippingStatus: 1,
        shippedDate: 1,
        deliveryDate: 1,
        returnStatus: 1,
        returnUserReason: 1,
        returnAdminComment: 1,
        returnRequestDate: 1,
        returnRejectedDate: 1,
        returnDate: 1,
        refundStatus: 1,
        refundAmount: 1,
        refundRequestDate: 1,
        refundDate: 1,
        refundComment: 1,
        cancelUserReason: 1,
        cancelAdminComment: 1,
        cancelledDate: 1,
        courierId: 1,
        invoiceNumber: 1,
        invoice: 1,
        shippingAddress: "$orderDetails.shippingAddress",
      },
    }
  );

  const result = await orderProductModel.aggregate(pipeline);

  return result[0];
};

export const getOrderProductWithFilters = async (
  filters: FilterQuery<IOrderProduct>,
  projection: ProjectionFields<IOrderProduct> = {},
  options: QueryOptions = {}
): Promise<IOrderProductDocument | null> => {
  return await orderProductModel.findOne(filters, projection, options);
};

// export const getReturnOrderProductWithFilters = async (filters: object, projection: object, options: object,returnFilter?:object ): Promise<IOrderProductDocument[]> => {
//     return await orderProductModel.find(filters, projection, options)
//     .sort({returnOrderAssignedOn:1})
//   }

interface Options {
  lean: boolean;
  page: number;
  limit: number;
}
export const getReturnOrderProductWithFilters = async (
  filters: object,
  projection: object,
  options: Options
): Promise<{ records: IReturnOrderProductDocument[]; totalCount: number }> => {
  const { page, limit } = options;
  const skip = page * limit;

  console.log(page, limit, skip);

  console.log(filters);
  try {
    // Fetch records with pagination, sorting, and filters
    const records = await orderProductModel
      .find(filters)
      .populate("userId", "fullName")
      .sort({ returnOrderAssignedOn: 1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await orderProductModel.countDocuments(filters);
    console.log("records",records);
    console.log(totalCount);

    return { records, totalCount };
  } catch (error: any) {
    throw new Error(`Error fetching return orders: ${error.message}`);
  }
};

export const updateOrderProduct = async (
  _id: Types.ObjectId,
  updateQuery: UpdateQuery<IOrderProductUpdateQuery>
): Promise<IOrderProductDocument | null> => {
  return await orderProductModel.findByIdAndUpdate(_id, updateQuery);
};

export const getShippingProducts = async (
  options: IShippingProductsOptions
): Promise<IOrderProducts> => {
  let pipeline: PipelineStage[] = [];

  if (options._id) {
    pipeline.push({
      $match: {
        _id: options._id,
      },
    });
  }
  if (options.productId) {
    pipeline.push({
      $match: {
        productId: options.productId,
      },
    });
  }
  if (options.orderId) {
    pipeline.push({
      $match: {
        orderId: options.orderId,
      },
    });
  }
  if (options.itemId) {
    pipeline.push({
      $match: {
        itemId: options.itemId,
      },
    });
  }
  if (options.userId) {
    pipeline.push({
      $match: {
        userId: options.userId,
      },
    });
  }
  if (options.skuId) {
    pipeline.push({
      $match: {
        skuId: options.skuId,
      },
    });
  }
  if (options.paymentStatus) {
    pipeline.push({
      $match: {
        paymentStatus: options.paymentStatus,
      },
    });
  }
  if (options.paymentMode) {
    pipeline.push({
      $match: {
        paymentMode: options.paymentMode,
      },
    });
  }
  if (options.shippingStatus) {
    pipeline.push({
      $match: {
        shippingStatus: options.shippingStatus,
      },
    });
  } else {
    pipeline.push({
      $match: {
        shippingStatus: { $ne: "NA" },
      },
    });
  }
  if (options.orderStartDate) {
    pipeline.push({
      $match: {
        orderDate: { $gte: options.orderStartDate },
      },
    });
  }
  if (options.orderEndDate) {
    pipeline.push({
      $match: {
        orderDate: { $lte: options.orderEndDate },
      },
    });
  }
  if (options.shippingStartDate) {
    pipeline.push({
      $match: {
        shippedDate: { $gte: options.shippingStartDate },
      },
    });
  }
  if (options.shippingEndDate) {
    pipeline.push({
      $match: {
        shippedDate: { $lte: options.shippingEndDate },
      },
    });
  }
  if (options.deliveryStartDate) {
    pipeline.push({
      $match: {
        deliveryDate: { $gte: options.deliveryStartDate },
      },
    });
  }
  if (options.deliveryEndDate) {
    pipeline.push({
      $match: {
        deliveryDate: { $lte: options.deliveryEndDate },
      },
    });
  }
  if (options.cancelledStartDate) {
    pipeline.push({
      $match: {
        cancelledDate: { $lte: options.cancelledStartDate },
      },
    });
  }
  if (options.cancelledEndDate) {
    pipeline.push({
      $match: {
        cancelledDate: { $gte: options.cancelledEndDate },
      },
    });
  }
  if (options.courierId) {
    pipeline.push({
      $match: {
        courierId: options.courierId,
      },
    });
  }
  if (options.invoiceNumber) {
    pipeline.push({
      $match: {
        invoiceNumber: options.invoiceNumber,
      },
    });
  }
  if (options.vendorId) {
    pipeline.push({
      $match: {
        vendorId: options.vendorId,
      },
    });
  }

  switch (options.sort) {
    case "Ship":
      pipeline.push({
        $sort: { shippedDate: -1, _id: -1 },
      });
      break;
    case "Delivery":
      pipeline.push({
        $sort: { deliveryDate: -1, _id: -1 },
      });
      break;
    case "Cancel":
      pipeline.push({
        $sort: { cancelledDate: -1, _id: -1 },
      });
      break;
    default:
      pipeline.push({
        $sort: { orderDate: -1, _id: -1 },
      });
      break;
  }

  pipeline.push(
    {
      $facet: {
        metadata: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
            },
          },
        ],
        data: [
          {
            $skip: options.page * options.size,
          },
          {
            $limit: options.size,
          },
          {
            $lookup: {
              from: collections.USERS,
              let: { userId: "$userId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$userId"],
                    },
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $project: {
                    _id: 0,
                    firstName: 1,
                    lastName: 1,
                  },
                },
              ],
              as: "userInfo",
            },
          },
          {
            $unwind: {
              path: "$userInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: collections.VENDORS,
              let: { vendorId: "$vendorId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$vendorId"],
                    },
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $project: {
                    _id: 1,
                    fullName: 1,
                  },
                },
              ],
              as: "vendorInfo",
            },
          },
          {
            $unwind: {
              path: "$vendorInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              orderId: 1,
              userId: 1,
              vendorId: "$vendorInfo._id",
              vendorName: "$vendorInfo.fullName",
              productId: 1,
              itemId: 1,
              username: {
                $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"],
              },
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
            },
          },
        ],
      },
    },
    {
      $project: {
        maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
        data: 1,
      },
    }
  );

  const result = await orderProductModel.aggregate(pipeline);
  let response = {
    records: [],
    maxRecords: 0,
  };
  if (result.length) {
    response.records = result[0].data || [];
    response.maxRecords = result[0].maxRecords || 0;
  }

  return response;
};

export const getVendorShippingProducts = async (
  options: IVendorShippingProductsOptions
): Promise<IOrderProducts> => {
  let pipeline: PipelineStage[] = [];

  if (options._id) {
    pipeline.push({
      $match: {
        _id: options._id,
      },
    });
  }
  if (options.productId) {
    pipeline.push({
      $match: {
        productId: options.productId,
      },
    });
  }
  if (options.orderId) {
    pipeline.push({
      $match: {
        orderId: options.orderId,
      },
    });
  }
  if (options.itemId) {
    pipeline.push({
      $match: {
        itemId: options.itemId,
      },
    });
  }
  if (options.userId) {
    pipeline.push({
      $match: {
        userId: options.userId,
      },
    });
  }
  if (options.skuId) {
    pipeline.push({
      $match: {
        skuId: options.skuId,
      },
    });
  }
  if (options.paymentStatus) {
    pipeline.push({
      $match: {
        paymentStatus: options.paymentStatus,
      },
    });
  }
  if (options.paymentMode) {
    pipeline.push({
      $match: {
        paymentMode: options.paymentMode,
      },
    });
  }
  if (options.shippingStatus) {
    pipeline.push({
      $match: {
        shippingStatus: options.shippingStatus,
      },
    });
  } else {
    pipeline.push({
      $match: {
        shippingStatus: { $ne: "NA" },
      },
    });
  }
  if (options.orderStartDate) {
    pipeline.push({
      $match: {
        orderDate: { $gte: options.orderStartDate },
      },
    });
  }
  if (options.orderEndDate) {
    pipeline.push({
      $match: {
        orderDate: { $lte: options.orderEndDate },
      },
    });
  }
  if (options.shippingStartDate) {
    pipeline.push({
      $match: {
        shippedDate: { $gte: options.shippingStartDate },
      },
    });
  }
  if (options.shippingEndDate) {
    pipeline.push({
      $match: {
        shippedDate: { $lte: options.shippingEndDate },
      },
    });
  }
  if (options.deliveryStartDate) {
    pipeline.push({
      $match: {
        deliveryDate: { $gte: options.deliveryStartDate },
      },
    });
  }
  if (options.deliveryEndDate) {
    pipeline.push({
      $match: {
        deliveryDate: { $lte: options.deliveryEndDate },
      },
    });
  }
  if (options.cancelledStartDate) {
    pipeline.push({
      $match: {
        cancelledDate: { $lte: options.cancelledStartDate },
      },
    });
  }
  if (options.cancelledEndDate) {
    pipeline.push({
      $match: {
        cancelledDate: { $gte: options.cancelledEndDate },
      },
    });
  }
  if (options.courierId) {
    pipeline.push({
      $match: {
        courierId: options.courierId,
      },
    });
  }
  if (options.invoiceNumber) {
    pipeline.push({
      $match: {
        invoiceNumber: options.invoiceNumber,
      },
    });
  }

  switch (options.sort) {
    case "Ship":
      pipeline.push({
        $sort: { shippedDate: -1, _id: -1 },
      });
      break;
    case "Delivery":
      pipeline.push({
        $sort: { deliveryDate: -1, _id: -1 },
      });
      break;
    case "Cancel":
      pipeline.push({
        $sort: { cancelledDate: -1, _id: -1 },
      });
      break;
    default:
      pipeline.push({
        $sort: { orderDate: -1, _id: -1 },
      });
      break;
  }

  pipeline.push(
    {
      $match: {
        vendorId: options.vendorId,
      },
    },
    {
      $facet: {
        metadata: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
            },
          },
        ],
        data: [
          {
            $skip: options.page * options.size,
          },
          {
            $limit: options.size,
          },
          {
            $lookup: {
              from: collections.USERS,
              let: { userId: "$userId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$userId"],
                    },
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $project: {
                    _id: 0,
                    firstName: 1,
                    lastName: 1,
                  },
                },
              ],
              as: "userInfo",
            },
          },
          {
            $unwind: {
              path: "$userInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: collections.VENDORS,
              let: { vendorId: "$vendorId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$vendorId"],
                    },
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $project: {
                    _id: 1,
                    fullName: 1,
                  },
                },
              ],
              as: "vendorInfo",
            },
          },
          {
            $unwind: {
              path: "$vendorInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              orderId: 1,
              userId: 1,
              vendorId: "$vendorInfo._id",
              vendorName: "$vendorInfo.fullName",
              productId: 1,
              itemId: 1,
              username: {
                $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"],
              },
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
            },
          },
        ],
      },
    },
    {
      $project: {
        maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
        data: 1,
      },
    }
  );

  const result = await orderProductModel.aggregate(pipeline);
  let response = {
    records: [],
    maxRecords: 0,
  };
  if (result.length) {
    response.records = result[0].data || [];
    response.maxRecords = result[0].maxRecords || 0;
  }

  return response;
};

export const getReturnProducts = async (
  options: IReturnProductsOptions
): Promise<IOrderProducts> => {
  let pipeline: PipelineStage[] = [];

  if (options._id) {
    pipeline.push({
      $match: {
        _id: options._id,
      },
    });
  }
  if (options.productId) {
    pipeline.push({
      $match: {
        productId: options.productId,
      },
    });
  }
  if (options.orderId) {
    pipeline.push({
      $match: {
        orderId: options.orderId,
      },
    });
  }
  if (options.itemId) {
    pipeline.push({
      $match: {
        itemId: options.itemId,
      },
    });
  }
  if (options.userId) {
    pipeline.push({
      $match: {
        userId: options.userId,
      },
    });
  }
  if (options.skuId) {
    pipeline.push({
      $match: {
        skuId: options.skuId,
      },
    });
  }
  if (options.paymentMode) {
    pipeline.push({
      $match: {
        paymentMode: options.paymentMode,
      },
    });
  }
  if (options.returnStatus) {
    pipeline.push({
      $match: {
        returnStatus: options.returnStatus,
      },
    });
  } else {
    pipeline.push({
      $match: {
        returnStatus: { $ne: "NA" },
      },
    });
  }
  if (options.deliveryStartDate) {
    pipeline.push({
      $match: {
        deliveryDate: { $gte: options.deliveryStartDate },
      },
    });
  }
  if (options.deliveryEndDate) {
    pipeline.push({
      $match: {
        deliveryDate: { $lte: options.deliveryEndDate },
      },
    });
  }
  if (options.returnRequestStartDate) {
    pipeline.push({
      $match: {
        returnRequestDate: { $gte: options.returnRequestStartDate },
      },
    });
  }
  if (options.returnRequestEndDate) {
    pipeline.push({
      $match: {
        returnRequestDate: { $lte: options.returnRequestEndDate },
      },
    });
  }
  if (options.returnStartDate) {
    pipeline.push({
      $match: {
        returnDate: { $gte: options.returnStartDate },
      },
    });
  }
  if (options.returnEndDate) {
    pipeline.push({
      $match: {
        returnDate: { $lte: options.returnEndDate },
      },
    });
  }
  if (options.returnRejectStartDate) {
    pipeline.push({
      $match: {
        returnRejectedDate: { $gte: options.returnRejectStartDate },
      },
    });
  }
  if (options.returnRejectEndDate) {
    pipeline.push({
      $match: {
        returnRejectedDate: { $lte: options.returnRejectEndDate },
      },
    });
  }
  if (options.courierId) {
    pipeline.push({
      $match: {
        courierId: options.courierId,
      },
    });
  }
  if (options.invoiceNumber) {
    pipeline.push({
      $match: {
        invoiceNumber: options.invoiceNumber,
      },
    });
  }
  if (options.vendorId) {
    pipeline.push({
      $match: {
        vendorId: options.vendorId,
      },
    });
  }

  switch (options.sort) {
    case "Pending":
      pipeline.push({
        $sort: { returnRequestDate: -1, _id: -1 },
      });
      break;
    case "Approved":
      pipeline.push({
        $sort: { returnDate: -1, _id: -1 },
      });
      break;
    case "Rejected":
      pipeline.push({
        $sort: { returnRejectedDate: -1, _id: -1 },
      });
      break;
  }

  pipeline.push(
    {
      $facet: {
        metadata: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
            },
          },
        ],
        data: [
          {
            $skip: options.page * options.size,
          },
          {
            $limit: options.size,
          },
          {
            $lookup: {
              from: collections.USERS,
              let: { userId: "$userId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$userId"],
                    },
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $project: {
                    _id: 0,
                    firstName: 1,
                    lastName: 1,
                  },
                },
              ],
              as: "userInfo",
            },
          },
          {
            $unwind: {
              path: "$userInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: collections.VENDORS,
              let: { vendorId: "$vendorId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$vendorId"],
                    },
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $project: {
                    _id: 1,
                    fullName: 1,
                  },
                },
              ],
              as: "vendorInfo",
            },
          },
          {
            $unwind: {
              path: "$vendorInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              orderId: 1,
              userId: 1,
              vendorId: "$vendorInfo._id",
              vendorName: "$vendorInfo.fullName",
              productId: 1,
              itemId: 1,
              username: {
                $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"],
              },
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
            },
          },
        ],
      },
    },
    {
      $project: {
        maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
        data: 1,
      },
    }
  );

  const result = await orderProductModel.aggregate(pipeline);
  let response = {
    records: [],
    maxRecords: 0,
  };
  if (result.length) {
    response.records = result[0].data || [];
    response.maxRecords = result[0].maxRecords || 0;
  }

  return response;
};

export const getVendorReturnProducts = async (
  options: IVendorReturnProductsOptions
): Promise<IOrderProducts> => {
  let pipeline: PipelineStage[] = [];

  if (options._id) {
    pipeline.push({
      $match: {
        _id: options._id,
      },
    });
  }
  if (options.productId) {
    pipeline.push({
      $match: {
        productId: options.productId,
      },
    });
  }
  if (options.orderId) {
    pipeline.push({
      $match: {
        orderId: options.orderId,
      },
    });
  }
  if (options.itemId) {
    pipeline.push({
      $match: {
        itemId: options.itemId,
      },
    });
  }
  if (options.userId) {
    pipeline.push({
      $match: {
        userId: options.userId,
      },
    });
  }
  if (options.skuId) {
    pipeline.push({
      $match: {
        skuId: options.skuId,
      },
    });
  }
  if (options.paymentMode) {
    pipeline.push({
      $match: {
        paymentMode: options.paymentMode,
      },
    });
  }
  if (options.returnStatus) {
    pipeline.push({
      $match: {
        returnStatus: options.returnStatus,
      },
    });
  } else {
    pipeline.push({
      $match: {
        returnStatus: { $ne: "NA" },
      },
    });
  }
  if (options.deliveryStartDate) {
    pipeline.push({
      $match: {
        deliveryDate: { $gte: options.deliveryStartDate },
      },
    });
  }
  if (options.deliveryEndDate) {
    pipeline.push({
      $match: {
        deliveryDate: { $lte: options.deliveryEndDate },
      },
    });
  }
  if (options.returnRequestStartDate) {
    pipeline.push({
      $match: {
        returnRequestDate: { $gte: options.returnRequestStartDate },
      },
    });
  }
  if (options.returnRequestEndDate) {
    pipeline.push({
      $match: {
        returnRequestDate: { $lte: options.returnRequestEndDate },
      },
    });
  }
  if (options.returnStartDate) {
    pipeline.push({
      $match: {
        returnDate: { $gte: options.returnStartDate },
      },
    });
  }
  if (options.returnEndDate) {
    pipeline.push({
      $match: {
        returnDate: { $lte: options.returnEndDate },
      },
    });
  }
  if (options.returnRejectStartDate) {
    pipeline.push({
      $match: {
        returnRejectedDate: { $gte: options.returnRejectStartDate },
      },
    });
  }
  if (options.returnRejectEndDate) {
    pipeline.push({
      $match: {
        returnRejectedDate: { $lte: options.returnRejectEndDate },
      },
    });
  }
  if (options.courierId) {
    pipeline.push({
      $match: {
        courierId: options.courierId,
      },
    });
  }
  if (options.invoiceNumber) {
    pipeline.push({
      $match: {
        invoiceNumber: options.invoiceNumber,
      },
    });
  }

  switch (options.sort) {
    case "Pending":
      pipeline.push({
        $sort: { returnRequestDate: -1, _id: -1 },
      });
      break;
    case "Approved":
      pipeline.push({
        $sort: { returnDate: -1, _id: -1 },
      });
      break;
    case "Rejected":
      pipeline.push({
        $sort: { returnRejectedDate: -1, _id: -1 },
      });
      break;
  }

  pipeline.push(
    {
      $match: {
        vendorId: options.vendorId,
      },
    },
    {
      $facet: {
        metadata: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
            },
          },
        ],
        data: [
          {
            $skip: options.page * options.size,
          },
          {
            $limit: options.size,
          },
          {
            $lookup: {
              from: collections.USERS,
              let: { userId: "$userId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$userId"],
                    },
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $project: {
                    _id: 0,
                    firstName: 1,
                    lastName: 1,
                  },
                },
              ],
              as: "userInfo",
            },
          },
          {
            $unwind: {
              path: "$userInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: collections.VENDORS,
              let: { vendorId: "$vendorId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$vendorId"],
                    },
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $project: {
                    _id: 1,
                    fullName: 1,
                  },
                },
              ],
              as: "vendorInfo",
            },
          },
          {
            $unwind: {
              path: "$vendorInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              orderId: 1,
              userId: 1,
              vendorId: "$vendorInfo._id",
              vendorName: "$vendorInfo.fullName",
              productId: 1,
              itemId: 1,
              username: {
                $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"],
              },
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
            },
          },
        ],
      },
    },
    {
      $project: {
        maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
        data: 1,
      },
    }
  );

  const result = await orderProductModel.aggregate(pipeline);
  let response = {
    records: [],
    maxRecords: 0,
  };
  if (result.length) {
    response.records = result[0].data || [];
    response.maxRecords = result[0].maxRecords || 0;
  }

  return response;
};

export const getRefundProducts = async (
  options: IRefundProductsOptions
): Promise<IOrderProducts> => {
  let pipeline: PipelineStage[] = [];

  if (options._id) {
    pipeline.push({
      $match: {
        _id: options._id,
      },
    });
  }
  if (options.productId) {
    pipeline.push({
      $match: {
        productId: options.productId,
      },
    });
  }
  if (options.orderId) {
    pipeline.push({
      $match: {
        orderId: options.orderId,
      },
    });
  }
  if (options.itemId) {
    pipeline.push({
      $match: {
        itemId: options.itemId,
      },
    });
  }
  if (options.userId) {
    pipeline.push({
      $match: {
        userId: options.userId,
      },
    });
  }
  if (options.skuId) {
    pipeline.push({
      $match: {
        skuId: options.skuId,
      },
    });
  }
  if (options.paymentMode) {
    pipeline.push({
      $match: {
        paymentMode: options.paymentMode,
      },
    });
  }
  if (options.refundStatus) {
    pipeline.push({
      $match: {
        refundStatus: options.refundStatus,
      },
    });
  } else {
    pipeline.push({
      $match: {
        refundStatus: { $ne: "NA" },
      },
    });
  }
  if (options.refundRequestStartDate) {
    pipeline.push({
      $match: {
        refundRequestDate: { $gte: options.refundRequestStartDate },
      },
    });
  }
  if (options.refundRequestEndDate) {
    pipeline.push({
      $match: {
        refundRequestDate: { $lte: options.refundRequestEndDate },
      },
    });
  }
  if (options.refundStartDate) {
    pipeline.push({
      $match: {
        refundDate: { $gte: options.refundStartDate },
      },
    });
  }
  if (options.refundEndDate) {
    pipeline.push({
      $match: {
        refundDate: { $lte: options.refundEndDate },
      },
    });
  }
  if (options.courierId) {
    pipeline.push({
      $match: {
        courierId: options.courierId,
      },
    });
  }
  if (options.invoiceNumber) {
    pipeline.push({
      $match: {
        invoiceNumber: options.invoiceNumber,
      },
    });
  }
  if (options.vendorId) {
    pipeline.push({
      $match: {
        vendorId: options.vendorId,
      },
    });
  }

  switch (options.sort) {
    case "Pending":
      pipeline.push({
        $sort: { refundRequestDate: -1, _id: -1 },
      });
      break;
    case "Paid":
      pipeline.push({
        $sort: { refundDate: -1, _id: -1 },
      });
      break;
  }

  pipeline.push(
    {
      $facet: {
        metadata: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
            },
          },
        ],
        data: [
          {
            $skip: options.page * options.size,
          },
          {
            $limit: options.size,
          },
          {
            $lookup: {
              from: collections.USERS,
              let: { userId: "$userId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$userId"],
                    },
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $project: {
                    _id: 0,
                    firstName: 1,
                    lastName: 1,
                  },
                },
              ],
              as: "userInfo",
            },
          },
          {
            $unwind: {
              path: "$userInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: collections.VENDORS,
              let: { vendorId: "$vendorId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$vendorId"],
                    },
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $project: {
                    _id: 1,
                    fullName: 1,
                  },
                },
              ],
              as: "vendorInfo",
            },
          },
          {
            $unwind: {
              path: "$vendorInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              orderId: 1,
              productId: 1,
              itemId: 1,
              vendorId: "$vendorInfo._id",
              vendorName: "$vendorInfo.fullName",
              userId: 1,
              username: {
                $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"],
              },
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
            },
          },
        ],
      },
    },
    {
      $project: {
        maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
        data: 1,
      },
    }
  );

  const result = await orderProductModel.aggregate(pipeline);
  let response = {
    records: [],
    maxRecords: 0,
  };
  if (result.length) {
    response.records = result[0].data || [];
    response.maxRecords = result[0].maxRecords || 0;
  }

  return response;
};

export const getVendorRefundProducts = async (
  options: IVendorRefundProductsOptions
): Promise<IOrderProducts> => {
  let pipeline: PipelineStage[] = [];

  if (options._id) {
    pipeline.push({
      $match: {
        _id: options._id,
      },
    });
  }
  if (options.productId) {
    pipeline.push({
      $match: {
        productId: options.productId,
      },
    });
  }
  if (options.orderId) {
    pipeline.push({
      $match: {
        orderId: options.orderId,
      },
    });
  }
  if (options.itemId) {
    pipeline.push({
      $match: {
        itemId: options.itemId,
      },
    });
  }
  if (options.userId) {
    pipeline.push({
      $match: {
        userId: options.userId,
      },
    });
  }
  if (options.skuId) {
    pipeline.push({
      $match: {
        skuId: options.skuId,
      },
    });
  }
  if (options.paymentMode) {
    pipeline.push({
      $match: {
        paymentMode: options.paymentMode,
      },
    });
  }
  if (options.refundStatus) {
    pipeline.push({
      $match: {
        refundStatus: options.refundStatus,
      },
    });
  } else {
    pipeline.push({
      $match: {
        refundStatus: { $ne: "NA" },
      },
    });
  }
  if (options.refundRequestStartDate) {
    pipeline.push({
      $match: {
        refundRequestDate: { $gte: options.refundRequestStartDate },
      },
    });
  }
  if (options.refundRequestEndDate) {
    pipeline.push({
      $match: {
        refundRequestDate: { $lte: options.refundRequestEndDate },
      },
    });
  }
  if (options.refundStartDate) {
    pipeline.push({
      $match: {
        refundDate: { $gte: options.refundStartDate },
      },
    });
  }
  if (options.refundEndDate) {
    pipeline.push({
      $match: {
        refundDate: { $lte: options.refundEndDate },
      },
    });
  }
  if (options.courierId) {
    pipeline.push({
      $match: {
        courierId: options.courierId,
      },
    });
  }
  if (options.invoiceNumber) {
    pipeline.push({
      $match: {
        invoiceNumber: options.invoiceNumber,
      },
    });
  }

  switch (options.sort) {
    case "Pending":
      pipeline.push({
        $sort: { refundRequestDate: -1, _id: -1 },
      });
      break;
    case "Paid":
      pipeline.push({
        $sort: { refundDate: -1, _id: -1 },
      });
      break;
  }

  pipeline.push(
    {
      $match: {
        vendorId: options.vendorId,
      },
    },
    {
      $facet: {
        metadata: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
            },
          },
        ],
        data: [
          {
            $skip: options.page * options.size,
          },
          {
            $limit: options.size,
          },
          {
            $lookup: {
              from: collections.USERS,
              let: { userId: "$userId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$userId"],
                    },
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $project: {
                    _id: 0,
                    firstName: 1,
                    lastName: 1,
                  },
                },
              ],
              as: "userInfo",
            },
          },
          {
            $unwind: {
              path: "$userInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: collections.VENDORS,
              let: { vendorId: "$vendorId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$vendorId"],
                    },
                  },
                },
                {
                  $limit: 1,
                },
                {
                  $project: {
                    _id: 1,
                    fullName: 1,
                  },
                },
              ],
              as: "vendorInfo",
            },
          },
          {
            $unwind: {
              path: "$vendorInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              orderId: 1,
              productId: 1,
              itemId: 1,
              vendorId: "$vendorInfo._id",
              vendorName: "$vendorInfo.fullName",
              userId: 1,
              username: {
                $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"],
              },
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
            },
          },
        ],
      },
    },
    {
      $project: {
        maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
        data: 1,
      },
    }
  );

  const result = await orderProductModel.aggregate(pipeline);
  let response = {
    records: [],
    maxRecords: 0,
  };
  if (result.length) {
    response.records = result[0].data || [];
    response.maxRecords = result[0].maxRecords || 0;
  }

  return response;
};

export const getUserOrderProducts = async (
  options: IUserOrderProductsOptions
): Promise<IUserOrderProducts> => {
  let pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $match: {
        userId: options.userId,
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $facet: {
        metadata: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
            },
          },
        ],
        data: [
          {
            $skip: options.page * options.size,
          },
          {
            $limit: options.size,
          },
          {
            $project: {
              _id: 1,
              orderId: 1,
              itemId: 1,
              vendorId: 1,
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
            },
          },
        ],
      },
    },
    {
      $project: {
        maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
        data: 1,
      },
    }
  );

  const result = await orderProductModel.aggregate(pipeline);
  let response = {
    records: [],
    maxRecords: 0,
  };
  if (result.length) {
    response.records = result[0].data || [];
    response.maxRecords = result[0].maxRecords || 0;
  }

  return response;
};

export const getUserOrderProductsByAdmin = async (
  options: IUserOrderProductsByAdminOptions
): Promise<IUserOrderProductsByAdmin> => {
  let pipeline: PipelineStage[] = [];

  if (options.orderId !== "") {
    let query = options.orderId || "";
    const regexQuery = new RegExp(query, "i");
    pipeline.push({ $match: { orderId: { $regex: regexQuery } } });
  }

  pipeline.push(
    {
      $match: {
        userId: options.userId,
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $facet: {
        metadata: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
            },
          },
        ],
        data: [
          {
            $skip: options.page * options.size,
          },
          {
            $limit: options.size,
          },
          {
            $project: {
              _id: 1,
              orderId: 1,
              itemId: 1,
              vendorId: 1,
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
            },
          },
        ],
      },
    },
    {
      $project: {
        maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
        data: 1,
      },
    }
  );

  const result = await orderProductModel.aggregate(pipeline);
  let response = {
    records: [],
    maxRecords: 0,
  };
  if (result.length) {
    response.records = result[0].data || [];
    response.maxRecords = result[0].maxRecords || 0;
  }

  return response;
};

export const exportShippingProducts = async (
  options: IShippingProductsOptions,
  exportFolder: string
): Promise<string> => {
  let pipeline: PipelineStage[] = [];

  if (options.vendorId) {
    pipeline.push({
      $match: {
        vendorId: options.vendorId,
      },
    });
  }

  if (options._id) {
    pipeline.push({
      $match: {
        _id: options._id,
      },
    });
  }
  if (options.productId) {
    pipeline.push({
      $match: {
        productId: options.productId,
      },
    });
  }
  if (options.orderId) {
    pipeline.push({
      $match: {
        orderId: options.orderId,
      },
    });
  }
  if (options.itemId) {
    pipeline.push({
      $match: {
        itemId: options.itemId,
      },
    });
  }
  if (options.userId) {
    pipeline.push({
      $match: {
        userId: options.userId,
      },
    });
  }
  if (options.vendorId) {
    pipeline.push({
      $match: {
        vendorId: options.vendorId,
      },
    });
  }
  if (options.skuId) {
    pipeline.push({
      $match: {
        skuId: options.skuId,
      },
    });
  }
  if (options.paymentStatus) {
    pipeline.push({
      $match: {
        paymentStatus: options.paymentStatus,
      },
    });
  }
  if (options.paymentMode) {
    pipeline.push({
      $match: {
        paymentMode: options.paymentMode,
      },
    });
  }
  if (options.shippingStatus) {
    pipeline.push({
      $match: {
        shippingStatus: options.shippingStatus,
      },
    });
  } else {
    pipeline.push({
      $match: {
        shippingStatus: { $ne: "NA" },
      },
    });
  }
  if (options.orderStartDate) {
    pipeline.push({
      $match: {
        orderDate: { $gte: options.orderStartDate },
      },
    });
  }
  if (options.orderEndDate) {
    pipeline.push({
      $match: {
        orderDate: { $lte: options.orderEndDate },
      },
    });
  }
  if (options.shippingStartDate) {
    pipeline.push({
      $match: {
        shippedDate: { $gte: options.shippingStartDate },
      },
    });
  }
  if (options.shippingEndDate) {
    pipeline.push({
      $match: {
        shippedDate: { $lte: options.shippingEndDate },
      },
    });
  }
  if (options.deliveryStartDate) {
    pipeline.push({
      $match: {
        deliveryDate: { $gte: options.deliveryStartDate },
      },
    });
  }
  if (options.deliveryEndDate) {
    pipeline.push({
      $match: {
        deliveryDate: { $lte: options.deliveryEndDate },
      },
    });
  }
  if (options.cancelledStartDate) {
    pipeline.push({
      $match: {
        cancelledDate: { $lte: options.cancelledStartDate },
      },
    });
  }
  if (options.cancelledEndDate) {
    pipeline.push({
      $match: {
        cancelledDate: { $gte: options.cancelledEndDate },
      },
    });
  }
  if (options.courierId) {
    pipeline.push({
      $match: {
        courierId: options.courierId,
      },
    });
  }
  if (options.invoiceNumber) {
    pipeline.push({
      $match: {
        invoiceNumber: options.invoiceNumber,
      },
    });
  }
  if (options.vendorId) {
    pipeline.push({
      $match: {
        vendorId: options.vendorId,
      },
    });
  }
  switch (options.sort) {
    case "Ship":
      pipeline.push({
        $sort: { shippedDate: 1, _id: 1 },
      });
      break;
    case "Delivery":
      pipeline.push({
        $sort: { deliveryDate: 1, _id: 1 },
      });
      break;
    case "Cancel":
      pipeline.push({
        $sort: { cancelledDate: 1, _id: 1 },
      });
      break;
    default:
      pipeline.push({
        $sort: { orderDate: 1, _id: 1 },
      });
      break;
  }

  pipeline.push(
    {
      $lookup: {
        from: collections.USERS,
        let: { userId: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$userId"],
              },
            },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              _id: 0,
              firstName: 1,
              lastName: 1,
            },
          },
        ],
        as: "userInfo",
      },
    },
    {
      $unwind: {
        path: "$userInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: collections.VENDORS,
        let: { vendorId: "$vendorId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$vendorId"],
              },
            },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              _id: 1,
              fullName: 1,
            },
          },
        ],
        as: "vendorInfo",
      },
    },
    {
      $unwind: {
        path: "$vendorInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: collections.ORDERS,
        let: { orderId: "$orderId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$orderId", "$$orderId"],
              },
            },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              _id: 0,
              shippingAddress: 1,
            },
          },
        ],
        as: "shippingInfo",
      },
    },
    {
      $unwind: {
        path: "$shippingInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        orderId: 1,
        userId: 1,
        productId: 1,
        itemId: 1,
        vendorId: "$vendorInfo._id",
        vendorName: "$vendorInfo.fullName",
        username: {
          $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"],
        },
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
        shippingAddress: "$shippingInfo.shippingAddress",
      },
    }
  );

  let orders = await orderProductModel.aggregate(pipeline);

  let filename = "";

  if (orders && orders.length) {
    orders = orders.map((order: IOrderExportProductDetails) => {
      return {
        ...order,
        userId: order.userId?.toString(),
        productId: order.productId?.toString(),
        shippingAddress: JSON.stringify(order.shippingAddress),
      };
    });

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Orders");
    worksheet.columns = [
      { header: "Order Date", key: "orderDate", width: 20 },
      { header: "Order ID", key: "orderId", width: 25 },
      { header: "Item ID", key: "itemId", width: 25 },
      { header: "SKU ID", key: "skuId", width: 25 },
      { header: "Product ID", key: "productId", width: 25 },
      { header: "Product Name", key: "productName", width: 25 },
      { header: "Vendor ID", key: "vendorId", width: 25 },
      { header: "Vendor Name", key: "vendorName", width: 25 },
      { header: "User ID", key: "userId", width: 25 },
      { header: "User Name", key: "username", width: 25 },
      { header: "Selling Price ", key: "sellingPrice", width: 20 },
      { header: "Shipping Charge ", key: "shippingCharge", width: 20 },
      { header: "Shipping Status", key: "shippingStatus", width: 20 },
      { header: "Payment Mode", key: "paymentMode", width: 20 },
      { header: "Payment Status", key: "paymentStatus", width: 20 },
      { header: "Shipped Date", key: "shippedDate", width: 20 },
      { header: "Cancelled Date", key: "cancelledDate", width: 20 },
      { header: "Delivery Date", key: "deliveryDate", width: 20 },
      { header: "Courier ID", key: "courierId", width: 25 },
      { header: "Invoice number", key: "invoiceNumber", width: 25 },
      { header: "Shipping Address", key: "shippingAddress", width: 200 },
    ];
    let firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell) => {
      cell.font = { bold: true };
    });

    worksheet.addRows(orders);

    filename = `order-shipping-${Date.now()}.xlsx`;
    let filePath = path.join(exportFolder, filename);
    await workbook.xlsx.writeFile(filePath).then(() => {
      console.log("FILE SAVED!");
    });
  }

  return filename;
};

export const getBestSellingProducts = async (): Promise<
  IBestSellingProduct[]
> => {
  let pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $group: {
        _id: "$productId",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 100,
    },
    {
      $project: {
        _id: 1,
        count: 1,
      },
    }
  );
  return await orderProductModel.aggregate(pipeline);
};
