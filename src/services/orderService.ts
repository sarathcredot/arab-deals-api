import { orderModel, deliveryAgentModel, brandModel, categoryModel, returnPolicyModel, warrantyPolicyModel } from "../models";
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
import { productModel } from "../models";

export interface IShippingAddress {
  _id?: Types.ObjectId;
  userId?: Types.ObjectId;
  vendorId?: Types.ObjectId;
  firstname?: string;
  email?: string;
  mobile?: string;
  country?: string;
  houseNumber?: string;
  streetName?: string;
  apartment?: string;
  suite?: string;
  unit?: string;
  city?: string;
  postCode?: string;
}

export interface IOrder {
    _id?: Types.ObjectId;
    userId?: Types.ObjectId;
    orderId?: string;
    paymentMode?: string;
    orderDate?: Date;
    shippingAddress?: IShippingAddress;
    orderStatus?: string;
    vendorIds?: Types.ObjectId[];
    grandTotal: number | null | undefined;
    shippingCharge:  number | null | undefined;
    subTotal: number | null | undefined;
    discount: number | null | undefined;
}

export interface IOrderDocument extends Document {
  _id?: Types.ObjectId;
  userId?: Types.ObjectId;
  orderId?: string;
  paymentMode?: string;
  orderDate?: Date;
  shippingAddress?: IShippingAddress;
  orderStatus?: string;
}

export interface IOrdersOptions {
  _id?: Types.ObjectId;
  userId?: Types.ObjectId;
  orderId?: string;
  paymentMode?: string;
  orderStatus?: string;
  postCode?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  size: number;
  vendorId?: Types.ObjectId;
}

export interface IOrderDetails {
  _id: Types.ObjectId;
  orderId: string;
  userId: Types.ObjectId;
  paymentMode: string;
  orderDate: Date;
  orderStatus: string;
  username: string;
  shippingAddress: IShippingAddress;
  orderPriceInfo: {
    totalMRP: number;
    totalSellingPrice: number;
    totalShippingCharge: number;
    totalRefundAmount: number;
  };
}

export interface IOrders {
  maxRecords: number;
  records: IOrderDetails[];
}

export const createOrder = async (
  record: IOrder
): Promise<IOrderDocument | null> => {
  return await orderModel.create(record);
};

export const getOrderWithFilters = async (
  filters: FilterQuery<IOrder> = {},
  projection: ProjectionFields<IOrder> = {},
  options: QueryOptions = {}
): Promise<IOrderDocument | null> => {
  return await orderModel.findOne(filters, projection, options);
};

export const getOrderWithId = async (
  _id: Types.ObjectId,
  projection: ProjectionFields<IOrder> = {},
  options: QueryOptions = {}
): Promise<IOrderDocument | null> => {
  return await orderModel.findById(_id, projection, options);
};

export const getAdminOrdersWithFilters = async (
  options: IOrdersOptions
): Promise<IOrders> => {
  let pipeline: PipelineStage[] = [];

  if (options.orderStatus) {
    pipeline.push({
      $match: {
        orderStatus: options.orderStatus,
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
  if (options.userId) {
    pipeline.push({
      $match: {
        userId: options.userId,
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
  if (options.paymentMode) {
    pipeline.push({
      $match: {
        paymentMode: options.paymentMode,
      },
    });
  }
  if (options.postCode) {
    pipeline.push({
      $match: {
        "shippingAddress.postCode": options.postCode,
      },
    });
  }
  if (options.startDate) {
    pipeline.push({
      $match: {
        orderDate: { $gte: options.startDate },
      },
    });
  }
  if (options.endDate) {
    pipeline.push({
      $match: {
        orderDate: { $lte: options.endDate },
      },
    });
  }

  pipeline.push(
    {
      $sort: { orderDate: -1, _id: -1 },
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
              from: collections.ORDER_PRODUCTS,
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
                  $project: {
                    _id: 1,
                    sellingPrice: 1,
                    shippingCharge: 1,
                    mrp: 1,
                    refundAmount: 1,
                    paidAmount: {
                      $cond: [
                        { $eq: ["$paymentStatus", "COMPLETED"] },
                        { $add: ["$sellingPrice", "$shippingCharge"] },
                        0,
                      ],
                    },
                  },
                },
                {
                  $group: {
                    _id: null,
                    totalSellingPrice: { $sum: "$sellingPrice" },
                    totalShippingCharge: { $sum: "$shippingCharge" },
                    totalMRP: { $sum: "$mrp" },
                    totalRefundAmount: { $sum: "$refundAmount" },
                    totalPaidAmount: { $sum: "$paidAmount" },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    totalMRP: 1,
                    totalSellingPrice: 1,
                    totalShippingCharge: 1,
                    totalRefundAmount: 1,
                    totalPaidAmount: 1,
                  },
                },
              ],
              as: "orderPriceInfo",
            },
          },
          {
            $unwind: {
              path: "$orderPriceInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              orderId: 1,
              userId: 1,
              paymentMode: 1,
              orderDate: 1,
              orderStatus: 1,
              username: {
                $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"],
              },
              orderPriceInfo: 1,
              shippingAddress: 1,
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

  const result = await orderModel.aggregate(pipeline);
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

export const getVendorOrdersWithFilters = async (
  options: IOrdersOptions
): Promise<IOrders> => {
  let pipeline: PipelineStage[] = [];

  if (options.vendorId) {
    pipeline.push({
      $match: {
        vendorIds: { $in: [options.vendorId] },
      },
    });
  }

  if (options.orderStatus) {
    pipeline.push({
      $match: {
        orderStatus: options.orderStatus,
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
  if (options.userId) {
    pipeline.push({
      $match: {
        userId: options.userId,
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
  if (options.paymentMode) {
    pipeline.push({
      $match: {
        paymentMode: options.paymentMode,
      },
    });
  }
  if (options.postCode) {
    pipeline.push({
      $match: {
        "shippingAddress.postCode": options.postCode,
      },
    });
  }
  if (options.startDate) {
    pipeline.push({
      $match: {
        orderDate: { $gte: options.startDate },
      },
    });
  }
  if (options.endDate) {
    pipeline.push({
      $match: {
        orderDate: { $lte: options.endDate },
      },
    });
  }

  pipeline.push(
    {
      $sort: { orderDate: -1, _id: -1 },
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
              from: collections.ORDER_PRODUCTS,
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
                  $project: {
                    _id: 1,
                    sellingPrice: 1,
                    shippingCharge: 1,
                    mrp: 1,
                    refundAmount: 1,
                    paidAmount: {
                      $cond: [
                        { $eq: ["$paymentStatus", "COMPLETED"] },
                        { $add: ["$sellingPrice", "$shippingCharge"] },
                        0,
                      ],
                    },
                  },
                },
                {
                  $group: {
                    _id: null,
                    totalSellingPrice: { $sum: "$sellingPrice" },
                    totalShippingCharge: { $sum: "$shippingCharge" },
                    totalMRP: { $sum: "$mrp" },
                    totalRefundAmount: { $sum: "$refundAmount" },
                    totalPaidAmount: { $sum: "$paidAmount" },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    totalMRP: 1,
                    totalSellingPrice: 1,
                    totalShippingCharge: 1,
                    totalRefundAmount: 1,
                    totalPaidAmount: 1,
                  },
                },
              ],
              as: "orderPriceInfo",
            },
          },
          {
            $unwind: {
              path: "$orderPriceInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              orderId: 1,
              userId: 1,
              paymentMode: 1,
              orderDate: 1,
              orderStatus: 1,
              username: {
                $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"],
              },
              orderPriceInfo: 1,
              shippingAddress: 1,
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

  const result = await orderModel.aggregate(pipeline);
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

export const getAdminOrderDetails = async (
  orderId: string
): Promise<IOrderDetails> => {
  let pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $match: {
        orderId: orderId,
      },
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
              displayName:1,

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
        from: collections.ORDER_PRODUCTS,
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
            $group: {
              _id: null,
              totalSellingPrice: { $sum: "$sellingPrice" },
              totalShippingCharge: { $sum: "$shippingCharge" },
              totalMRP: { $sum: "$mrp" },
              totalRefundAmount: { $sum: "$refundAmount" },
            },
          },
          {
            $project: {
              _id: 0,
              totalMRP: 1,
              totalSellingPrice: 1,
              totalShippingCharge: 1,
              totalRefundAmount: 1,
            },
          },
        ],
        as: "orderPriceInfo",
      },
    },
    {
      $unwind: {
        path: "$orderPriceInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        orderId: 1,
        userId: 1,
        paymentMode: 1,
        orderDate: 1,
        orderStatus: 1,
        username: "$userInfo.displayName",
        orderPriceInfo: 1,
        shippingAddress: 1,
        
      },
    }
  );

  const result = await orderModel.aggregate(pipeline);
  let response;
  if (result.length) {
    response = result[0];
  }

  return response;
};

export const getVendorOrderDetails = async (
  orderId: string,
  vendorId: Types.ObjectId
): Promise<IOrderDetails> => {
  let pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $match: {
        orderId: orderId,
        vendorIds: { $in: [vendorId] },
      },
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
        from: collections.ORDER_PRODUCTS,
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
            $group: {
              _id: null,
              totalSellingPrice: { $sum: "$sellingPrice" },
              totalShippingCharge: { $sum: "$shippingCharge" },
              totalMRP: { $sum: "$mrp" },
              totalRefundAmount: { $sum: "$refundAmount" },
            },
          },
          {
            $project: {
              _id: 0,
              totalMRP: 1,
              totalSellingPrice: 1,
              totalShippingCharge: 1,
              totalRefundAmount: 1,
            },
          },
        ],
        as: "orderPriceInfo",
      },
    },
    {
      $unwind: {
        path: "$orderPriceInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        orderId: 1,
        userId: 1,
        paymentMode: 1,
        orderDate: 1,
        orderStatus: 1,
        username: {
          $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"],
        },
        orderPriceInfo: 1,
        shippingAddress: 1,
      },
    }
  );

  const result = await orderModel.aggregate(pipeline);
  let response;
  if (result.length) {
    response = result[0];
  }

  return response;
};

export const updateOrderStatus = async (
  orderId: string,
  status: String
): Promise<IOrderDocument | null> => {
  return await orderModel.findOneAndUpdate(
    { orderId: orderId },
    { orderStatus: status }
  );
};

export const exportAdminOrdersWithFilters = async (
  options: IOrdersOptions,
  exportFolder: string
): Promise<string> => {
  let pipeline: PipelineStage[] = [];

  if (options.orderStatus) {
    pipeline.push({
      $match: {
        orderStatus: options.orderStatus,
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
  if (options.userId) {
    pipeline.push({
      $match: {
        userId: options.userId,
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
  if (options.paymentMode) {
    pipeline.push({
      $match: {
        paymentMode: options.paymentMode,
      },
    });
  }
  if (options.postCode) {
    pipeline.push({
      $match: {
        "shippingAddress.postCode": options.postCode,
      },
    });
  }
  if (options.startDate) {
    pipeline.push({
      $match: {
        orderDate: { $gte: options.startDate },
      },
    });
  }
  if (options.endDate) {
    pipeline.push({
      $match: {
        orderDate: { $lte: options.endDate },
      },
    });
  }

  pipeline.push(
    {
      $sort: { orderDate: 1, _id: 1 },
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
        from: collections.ORDER_PRODUCTS,
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
            $project: {
              _id: 1,
              sellingPrice: 1,
              shippingCharge: 1,
              mrp: 1,
              refundAmount: 1,
              paidAmount: {
                $cond: [
                  { $eq: ["$paymentStatus", "COMPLETED"] },
                  { $add: ["$sellingPrice", "$shippingCharge"] },
                  0,
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalSellingPrice: { $sum: "$sellingPrice" },
              totalShippingCharge: { $sum: "$shippingCharge" },
              totalMRP: { $sum: "$mrp" },
              totalRefundAmount: { $sum: "$refundAmount" },
              totalPaidAmount: { $sum: "$paidAmount" },
            },
          },
          {
            $project: {
              _id: 0,
              totalMRP: 1,
              totalSellingPrice: 1,
              totalShippingCharge: 1,
              totalRefundAmount: 1,
              totalPaidAmount: 1,
            },
          },
        ],
        as: "orderPriceInfo",
      },
    },
    {
      $unwind: {
        path: "$orderPriceInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        orderId: 1,
        userId: 1,
        paymentMode: 1,
        orderDate: 1,
        orderStatus: 1,
        username: {
          $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"],
        },
        orderPriceInfo: 1,
        shippingAddress: 1,
      },
    }
  );

  let orders = await orderModel.aggregate(pipeline);

  let filename = "";

  if (orders && orders.length) {
    orders = orders.map((order) => {
      return {
        ...order,
        userId: order.userId.toString(),
        orderPriceInfo: JSON.stringify(order.orderPriceInfo),
        shippingAddress: JSON.stringify(order.shippingAddress),
      };
    });

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Orders");
    worksheet.columns = [
      { header: "Order Date", key: "orderDate", width: 20 },
      { header: "Order ID", key: "orderId", width: 25 },
      { header: "User ID", key: "userId", width: 25 },
      { header: "User Name", key: "username", width: 25 },
      { header: "Order Status", key: "orderStatus", width: 20 },
      { header: "Order Price ", key: "orderPriceInfo", width: 50 },
      { header: "Shipping Address ", key: "shippingAddress", width: 200 },
    ];
    let firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell: any) => {
      cell.font = { bold: true };
    });

    worksheet.addRows(orders);

    filename = `order-${Date.now()}.xlsx`;
    let filePath = path.join(exportFolder, filename);
    await workbook.xlsx.writeFile(filePath).then(() => {
      console.log("FILE SAVED!");
    });
  }

  return filename;
};
export const exportVendorOrdersWithFilters = async (
  options: IOrdersOptions,
  exportFolder: string
): Promise<string> => {
  let pipeline: PipelineStage[] = [];

  if (options.vendorId) {
    pipeline.push({
      $match: {
        vendorIds: { $in: [options.vendorId] },
      },
    });
  }

  if (options.orderStatus) {
    pipeline.push({
      $match: {
        orderStatus: options.orderStatus,
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
  if (options.userId) {
    pipeline.push({
      $match: {
        userId: options.userId,
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
  if (options.paymentMode) {
    pipeline.push({
      $match: {
        paymentMode: options.paymentMode,
      },
    });
  }
  if (options.postCode) {
    pipeline.push({
      $match: {
        "shippingAddress.postCode": options.postCode,
      },
    });
  }
  if (options.startDate) {
    pipeline.push({
      $match: {
        orderDate: { $gte: options.startDate },
      },
    });
  }
  if (options.endDate) {
    pipeline.push({
      $match: {
        orderDate: { $lte: options.endDate },
      },
    });
  }

  pipeline.push(
    {
      $sort: { orderDate: 1, _id: 1 },
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
        from: collections.ORDER_PRODUCTS,
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
            $project: {
              _id: 1,
              sellingPrice: 1,
              shippingCharge: 1,
              mrp: 1,
              refundAmount: 1,
              paidAmount: {
                $cond: [
                  { $eq: ["$paymentStatus", "COMPLETED"] },
                  { $add: ["$sellingPrice", "$shippingCharge"] },
                  0,
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalSellingPrice: { $sum: "$sellingPrice" },
              totalShippingCharge: { $sum: "$shippingCharge" },
              totalMRP: { $sum: "$mrp" },
              totalRefundAmount: { $sum: "$refundAmount" },
              totalPaidAmount: { $sum: "$paidAmount" },
            },
          },
          {
            $project: {
              _id: 0,
              totalMRP: 1,
              totalSellingPrice: 1,
              totalShippingCharge: 1,
              totalRefundAmount: 1,
              totalPaidAmount: 1,
            },
          },
        ],
        as: "orderPriceInfo",
      },
    },
    {
      $unwind: {
        path: "$orderPriceInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        orderId: 1,
        userId: 1,
        paymentMode: 1,
        orderDate: 1,
        orderStatus: 1,
        username: {
          $concat: ["$userInfo.firstName", " ", "$userInfo.lastName"],
        },
        orderPriceInfo: 1,
        shippingAddress: 1,
      },
    }
  );

  let orders = await orderModel.aggregate(pipeline);

  let filename = "";

  if (orders && orders.length) {
    orders = orders.map((order) => {
      return {
        ...order,
        userId: order.userId.toString(),
        orderPriceInfo: JSON.stringify(order.orderPriceInfo),
        shippingAddress: JSON.stringify(order.shippingAddress),
      };
    });

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Orders");
    worksheet.columns = [
      { header: "Order Date", key: "orderDate", width: 20 },
      { header: "Order ID", key: "orderId", width: 25 },
      { header: "User ID", key: "userId", width: 25 },
      { header: "User Name", key: "username", width: 25 },
      { header: "Order Status", key: "orderStatus", width: 20 },
      { header: "Order Price ", key: "orderPriceInfo", width: 50 },
      { header: "Shipping Address ", key: "shippingAddress", width: 200 },
    ];
    let firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell: any) => {
      cell.font = { bold: true };
    });

    worksheet.addRows(orders);

    filename = `order-${Date.now()}.xlsx`;
    let filePath = path.join(exportFolder, filename);
    await workbook.xlsx.writeFile(filePath).then(() => {
      console.log("FILE SAVED!");
    });
  }

  return filename;
};

export const getUserOrderDetails = async (
  orderId: string,
  userId: Types.ObjectId
): Promise<IOrderDetails | null> => {
  let pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $match: {
        orderId: orderId,
        userId: userId,
      },
    },
    {
      $lookup: {
        from: collections.ORDER_PRODUCTS,
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
            $group: {
              _id: null,
              totalSellingPrice: { $sum: "$sellingPrice" },
              totalShippingCharge: { $sum: "$shippingCharge" },
              totalMRP: { $sum: "$mrp" },
              totalRefundAmount: { $sum: "$refundAmount" },
            },
          },
          {
            $project: {
              _id: 0,
              totalMRP: 1,
              totalSellingPrice: 1,
              totalShippingCharge: 1,
              totalRefundAmount: 1,
            },
          },
        ],
        as: "orderPriceInfo",
      },
    },
    {
      $unwind: {
        path: "$orderPriceInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        orderId: 1,
        userId: 1,
        paymentMode: 1,
        orderDate: 1,
        orderStatus: 1,
        orderPriceInfo: 1,
        shippingAddress: 1,
      },
    }
  );

  const result = await orderModel.aggregate(pipeline);
  let response;
  if (result.length) {
    response = result[0];
  }

  return response;
};

export const getProductDeliveryTypeDeliveryAgents = async (data: {
  proid: Types.ObjectId;
  villageID: string;
  governorateID: string;
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // find product details
      const productData: any = await productModel.findById({ _id: data.proid });

      // find product delivery type

      const deliveryType = productData.delivery_type;

      if (deliveryType === "ArabDeals") {
        // find all Arabdeals under deliveryagents
        let matchObj: any = {
          agentType: "ArabDeals",
          isActive: true,
          isAvailable: true,
        };

        if (data?.villageID) {
          matchObj.villageID = data?.villageID;
        }
        if (data?.governorateID) {
          matchObj.governorateID = data?.governorateID;
        }

        const deliveryAgents = await deliveryAgentModel.find(matchObj);

        const obj = {
          deliveryType: "ArabDeals",
          deliveryAgents: deliveryAgents,
        };

        resolve(obj);
      } else if (deliveryType === "Vendor") {
        // find all Vendor  under deliveryagents
        let matchObj: any = {
          vendorID: productData?.vendorId,
          agentType: "Vendor",
          isActive: true,
          isAvailable: true,
        };

        if (data?.villageID) {
          matchObj.villageID = data?.villageID;
        }
        if (data?.governorateID) {
          matchObj.governorateID = data?.governorateID;
        }

        const deliveryAgents = await deliveryAgentModel.find(matchObj);

        const obj = {
          deliveryType: "Vendor",
          deliveryAgents: deliveryAgents,
        };

        resolve(obj);
      } else {
        // find all ThirdParty  under deliveryagents
        let matchObj: any = {
            agentType: "ThirdParty",
            isActive: true,
            isAvailable: true,
          };
  
          if (data?.villageID) {
            matchObj.villageID = data?.villageID;
          }
          if (data?.governorateID) {
            matchObj.governorateID = data?.governorateID;
          }

          
        const deliveryAgents = await deliveryAgentModel.find(matchObj);
        console.log("matchObj = ",matchObj, " deliveryAgents = ",deliveryAgents)

        const obj = {
          deliveryType: "ThirdParty",
          deliveryAgents: deliveryAgents,
        };

        resolve(obj);
      }
    } catch (error) {
      reject();
    }
  });
};


export const getReturnPolicyForProduct = async (productID: Types.ObjectId, defaultReturnPolicyId?: Types.ObjectId):Promise<any> => {
     const product=await productModel.findById(productID);
     const brand=await brandModel.findById(product?.brandId);
     const category=await categoryModel.findById(product?.categoryId);
    //  console.log("product",product)
      if(product?.returnPolicy)
       {
       return product.returnPolicy;
       }
      else if(brand?.returnPolicy)
       {
              return brand.returnPolicy;
       }
      else if(category?.returnPolicy){
          if(category?.returnPolicy){
            return category.returnPolicy;
          }else{
          const allCategories:any = category?.path?.split("#")

          for (let i = allCategories.length - 1; i >= 0; i--) {

            if (allCategories[i]) {

            const Parentcategory: any = await categoryModel.findOne({ _id: allCategories[i] })

            if (Parentcategory.returnPolicy) {
                return Parentcategory.returnPolicy
            }
            }
          }
          }  
      }
      else{
         return defaultReturnPolicyId;
       }
}


export const getWarrantyPolicyForProduct=async(productID: Types.ObjectId):Promise<any> =>{
  const product=await productModel.findById(productID);
  const brand=await brandModel.findById(product?.brandId);
  const category=await categoryModel.findById(product?.categoryId);

  if(product?.warrantyPolicy)
    {
    return product.warrantyPolicy;
    }
   else if(brand?.warrantyPolicy)
    {
           return brand.warrantyPolicy;
    }
   else if(category?.warrantyPolicy){
       if(category?.warrantyPolicy){
         return category.warrantyPolicy;
       }else{
       const allCategories:any = category?.path?.split("#")

       for (let i = allCategories.length - 1; i >= 0; i--) {

         if (allCategories[i]) {

         const Parentcategory: any = await categoryModel.findOne({ _id: allCategories[i] })

         if (Parentcategory.warrantyPolicy) {

            //  const returnPolicy: any = await returnPolicyModel.findOne({ _id: Parentcategory.returnPolicy })
             return Parentcategory.warrantyPolicy

         }
         }
       }
       }  
   }
}

export const getReturnPolicy=async (returnPolicyId:Types.ObjectId)=>{
  return await returnPolicyModel.findById(returnPolicyId); 
}

export const getWarrantyPolicy=async(warrantyPolicyId:Types.ObjectId) =>{
  return await warrantyPolicyModel.findById(warrantyPolicyId)
}