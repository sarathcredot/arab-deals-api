
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, } from "mongoose";
import { deliveryAgentModel, settlementModel } from '../models'
import { orderProductModel, deliveryAgentConfigModel } from '../models'
import { collections } from "../configs";
import excel from 'exceljs';
import path from 'path';
import { transactionlogs, otpService } from "../services"
import { startOfDay, endOfDay } from "date-fns"



export interface FileData {
  _id?: string,
  fileType?: string,
  fileURL?: string,
  mimeType?: string,
  originalName?: string,
}

export interface IDeliveryAgent {
  _id?: Types.ObjectId;
  fullName: string;
  contactNumber: string;
  userID: string;
  password: string;
  agentType: string;
  vendorID?: Types.ObjectId;
  licence: FileData;
  ID: string;
}


export interface ISettlement {
  _id?: Types.ObjectId;
  type: string;
  agentId: Types.ObjectId;
  amount: number;
  date?: Date;
  remarks?: string;
  totalAmount?: number;
  balance?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdminSettlementHistoryOptions {
  type?: string;
  agentId?: Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  page: number;
  size: number;
}

export interface IAdminAssignOrdersOptions {
  shippingStatus?: string;
  agentId?: Types.ObjectId;
  page: number;
  size: number;
}

export interface IAllSettlementHistoryOptions {
  page: number;
  size: number;
}


export interface IDeliveryAgentFilter {
  _id: Types.ObjectId;
  fullName: string;
  contactNumber: string;
  userID: string;
  ID: string;
  password: string;
  agentType: string;
  vendorID?: Types.ObjectId;
  isActive: boolean;
  isAvailable: boolean;
  lastSettlementID: Types.ObjectId;
  wallet: {
    cashInHand: number;
    lastSettlementDate: Date;
    grandTotal: number;
    totalSettlement: number;
    numberOfOrderAssigned: number;
    numberOfOrderDelivered: number;
    numberOfReturnOrderAssigned: number;
    numberOfReturnOrderDelivered: number;
    numberOfPendingReturns: number;
  };
  settlementHistory: Types.ObjectId[] | ISettlement[];
}

export interface IDeliveryAgentDocument extends Document {
  _id?: Types.ObjectId;
  fullName: string;
  contactNumber: string;
  userID: string;
  password: string;
  ID: string;
  agentType: string;
  vendorID?: Types.ObjectId;
  licence: FileData;
  isActive: boolean;
  isAvailable: boolean;
  wallet: {
    cashInHand: number;
    lastSettlementDate: Date;
    grandTotal: number;
    totalSettlement: number;
    numberOfOrderAssigned: number;
    numberOfOrderDelivered: number;
    numberOfReturnOrderAssigned: number;
    numberOfReturnOrderDelivered: number;
    numberOfPendingReturns: number;
  };
  lastSettlementID: Types.ObjectId;
  settlementHistory: Types.ObjectId[];
  setHash(password: string): Promise<void>;
  verifyHash(password: string): Promise<boolean>;
}


type DeliveryLoginData = {
  userID: string;
  contactNumber: string;
  password: string;

}

export const createDeliveryAgent = async (deliveryAgentData: IDeliveryAgent, password: string): Promise<IDeliveryAgentDocument> => {
  let deliveryAgent: IDeliveryAgentDocument = new deliveryAgentModel(deliveryAgentData);
  await deliveryAgent.setHash!(password);
  return await deliveryAgent.save();
};



export const createSettlement = async (settlementData: ISettlement, agentId: Types.ObjectId): Promise<ISettlement> => {
  let settlement = new settlementModel(settlementData);
  const existingAgent = await deliveryAgentModel.findById(agentId)

  if (!existingAgent) {
    throw new Error("Delivery Agent not found");
  }

  existingAgent.wallet.cashInHand -= settlement.amount;
  existingAgent.wallet.totalSettlement += settlement.amount;
  existingAgent.wallet.lastSettlementDate = new Date(Date.now());
  existingAgent.lastSettlementID = settlement._id
  existingAgent.settlementHistory.push(settlement._id);

  await existingAgent.save();
  return await settlement.save();
};




export const editSettlement = async (
  settlementId: Types.ObjectId,
  updatedSettlementData: ISettlement,
  walletAdjustment: number,
  agentId: Types.ObjectId
) => {
  const settlement = await settlementModel.findById(settlementId);

  if (!settlement) {
    throw new Error("Settlement not found");
  }

  const existingAgent = await deliveryAgentModel.findById(agentId)

  if (!existingAgent) {
    throw new Error("Delivery Agent not found");
  }

  // Update the settlement fields
  settlement.amount = updatedSettlementData.amount;
  settlement.date = updatedSettlementData.date;
  settlement.remarks = updatedSettlementData.remarks;
  settlement.balance = updatedSettlementData.balance;

  // Update agent wallet
  existingAgent.wallet.cashInHand -= walletAdjustment;
  existingAgent.wallet.totalSettlement += walletAdjustment;
  existingAgent.wallet.lastSettlementDate = new Date(Date.now());

  await existingAgent.save();


  return await settlement.save();
};



export const getSettlementHistoryByAdmin = async (filters: FilterQuery<ISettlement>, projection: ProjectionFields<ISettlement> = {}, options: QueryOptions = {}): Promise<any[] | []> => {
  const result = await settlementModel.find(filters, projection, options).populate({ path: "agentId", select: "_id fullName wallet contactNumber" });
  console.log(result)
  return result
}

export const suspendDeliveryAgent = async (agentId: Types.ObjectId, isActive: boolean): Promise<IDeliveryAgent | null> => {
  return await deliveryAgentModel.findByIdAndUpdate(
    agentId,
    { isActive: isActive },
    { new: true }
  );
};

export const updateAvailableStatus = async (agentId: Types.ObjectId, isAvailable: boolean): Promise<IDeliveryAgent | null> => {
  return await deliveryAgentModel.findByIdAndUpdate(
    agentId,
    { isAvailable: isAvailable },
    { new: true }
  );
};


export const findSettlementtWithFilters = async (filters: object, projection: object, options: object): Promise<ISettlement | null> => {
  return await settlementModel.findOne(filters, projection, options);
};

export const findDeliveryAgentWithFilters = async (filters: object, projection: object, options: object, settlementHistoryFilter?: object): Promise<IDeliveryAgentFilter | null> => {
  const deliveryAgent = await deliveryAgentModel
    .findOne(filters, projection, options)
    .populate({
      path: "settlementHistory",
      select: "_id type amount remarks totalAmount balance createdAt updatedAt",
      options: { sort: { createdAt: -1 } }, // Sort first
      match: settlementHistoryFilter, // Apply filters next
    });

  // Apply pagination manually to the populated `settlementHistory`
  if (deliveryAgent && deliveryAgent.settlementHistory) {
    const startIndex = (options as any)?.page * (options as any)?.limit || 0;
    const endIndex = startIndex + (options as any)?.limit || deliveryAgent.settlementHistory.length;
    deliveryAgent.settlementHistory = deliveryAgent.settlementHistory.slice(startIndex, endIndex);
  }
  console.log("agent details", deliveryAgent)
  return deliveryAgent;
};

export const findAssignedDeliveryAgentWithFilters = async (filters: object, projection: object, options: object, settlementHistoryFilter?: object): Promise<IDeliveryAgentDocument | null> => {
  const deliveryAgent = await deliveryAgentModel
    .findOne(filters, projection, options)
    .populate({
      path: "settlementHistory",
      select: "_id type amount remarks totalAmount balance createdAt updatedAt",
      options: { sort: { createdAt: -1 } }, // Sort first
      match: settlementHistoryFilter, // Apply filters next
    });

  // Apply pagination manually to the populated `settlementHistory`
  if (deliveryAgent && deliveryAgent.settlementHistory) {
    const startIndex = (options as any)?.page * (options as any)?.limit || 0;
    const endIndex = startIndex + (options as any)?.limit || deliveryAgent.settlementHistory.length;
    deliveryAgent.settlementHistory = deliveryAgent.settlementHistory.slice(startIndex, endIndex);
  }

  return deliveryAgent;
};

export const countSettlementHistory = async (agentId: Types.ObjectId, settlementHistoryFilter?: object): Promise<number> => {
  const agent = await deliveryAgentModel.findOne(agentId).populate({
    path: "settlementHistory",
    match: settlementHistoryFilter,
  }).lean();
  return agent?.settlementHistory.length || 0;
};


export const exportAdminSettlementHistoryWithFilters = async (options: IAdminSettlementHistoryOptions, exportFolder: string): Promise<string> => {
  let pipeline: PipelineStage[] = [];

  if (options.agentId) {
    pipeline.push({ $match: { agentId: options.agentId } });
  }
  if (options.type) {
    pipeline.push({ $match: { type: options.type } });
  }
  if (options.startDate) {
    pipeline.push({ $match: { createdAt: { $gte: options.startDate } } });
  }
  if (options.endDate) {
    pipeline.push({ $match: { createdAt: { $lte: options.endDate } } });
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: collections.DELIVERYAGENT,
        localField: "agentId",
        foreignField: "_id",
        as: "agentInfo"
      }
    },
    {
      $unwind: {
        path: "$agentInfo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        type: 1,
        agentId: 1,
        amount: 1,
        balance: 1,
        createdAt: 1,
        remarks: 1,
        totalAmount: 1,
        "agentInfo.fullName": 1,
      }
    }
  );

  const settlements = await settlementModel.aggregate(pipeline);
  let filename = '';

  if (settlements && settlements.length) {
    let formattedData = settlements.map((settlement) => ({
      type: settlement.type || "",
      createdAt: settlement.createdAt ? settlement.createdAt.toISOString() : "",
      fullName: settlement.agentInfo?.fullName || "",
      amount: settlement.amount || 0,
      balance: settlement.balance || 0,
      totalAmount: settlement.totalAmount || 0,
      remarks: settlement.remarks || "",
    }));

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Settlement History");
    worksheet.columns = [
      { header: "Amount", key: "amount", width: 20 },
      { header: "Initial CIH", key: "totalAmount", width: 20 },
      { header: "Current CIH", key: "balance", width: 20 },
      { header: "Type", key: "type", width: 20 },
      { header: "Settlement Date", key: "createdAt", width: 20 },
      { header: "Remarks", key: "remarks", width: 50 }
    ];

    let firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell: any) => {
      cell.font = { bold: true };
    });

    worksheet.addRows(formattedData);

    console.log(formattedData)

    filename = `settlement-history-${Date.now()}.xlsx`;
    let filePath = path.join(exportFolder, filename);
    await workbook.xlsx.writeFile(filePath).then(() => {
      console.log("File saved!");
    });
  }

  return filename;
};


export const exportAssignOrdersWithFilters = async (options: IAdminAssignOrdersOptions, exportFolder: string): Promise<string> => {
  let pipeline: PipelineStage[] = [];

  if (options.agentId) {
    pipeline.push({ $match: { deliveryAgentId: options.agentId } });
  }
  if (options.shippingStatus) {
    pipeline.push({ $match: { shippingStatus: options.shippingStatus } });
  }


  console.log(await orderProductModel.aggregate(pipeline.slice(0, 2)));

  pipeline.push(
    { $sort: { orderDate: -1 } },
    {
      $lookup: {
        from: "users",
        let: { userId: { $toString: "$userId" } },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"] } } }
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
        productName: 1,
        sellingPrice: 1,
        orderDate: 1,
        shippingStatus: 1,
        paymentStatus: 1,
        "userInfo.firstName": 1,
      }
    }
  );

  const assignedOrders = await orderProductModel.aggregate(pipeline);
  let filename = '';

  if (assignedOrders && assignedOrders.length) {
    let formattedData = assignedOrders.map((assignedOrder) => ({
      orderId: assignedOrder.orderId || "",
      productName: assignedOrder.productName || "",
      sellingPrice: assignedOrder.sellingPrice || "",
      orderDate: assignedOrder.orderDate || "",
      shippingStatus: assignedOrder.shippingStatus || "",
      paymentStatus: assignedOrder.paymentStatus || "",
      firstName: assignedOrder.userInfo?.firstName || "",
    }));

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Assigned Orders");
    worksheet.columns = [
      { header: "OrderID", key: "orderId", width: 20 },
      { header: "User Name", key: "firstName", width: 20 },
      { header: "product Name", key: "productName", width: 25 },
      { header: "Price", key: "sellingPrice", width: 20 },
      { header: "Order Date", key: "orderDate", width: 20 },
      { header: "payment Status", key: "paymentStatus", width: 20 },
      { header: "shipping Status", key: "shippingStatus", width: 50 }
    ];

    let firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell: any) => {
      cell.font = { bold: true };
    });

    worksheet.addRows(formattedData);

    console.log(formattedData)

    filename = `assigned-order-${Date.now()}.xlsx`;
    let filePath = path.join(exportFolder, filename);
    await workbook.xlsx.writeFile(filePath).then(() => {
      console.log("File saved!");
    });
  }

  return filename;
};

export const exportAllSettlementHistoryWithFilters = async (options: IAllSettlementHistoryOptions, exportFolder: string): Promise<string> => {
  let pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $project: {
        wallet: 1,
        fullName: 1,
        contactNumber: 1
      }
    }
  );

  const wallet = await deliveryAgentModel.aggregate(pipeline);
  let filename = '';

  // if (wallet && wallet.length) {
  //     let formattedData = wallet.map((wallet) => ({
  //         ...wallet,
  //     }));

  if (wallet && wallet.length) {
    let formattedData = wallet.map(({ wallet, ...rest }) => ({
      ...rest,
      cashInHand: wallet?.cashInHand || 0,
      totalSettlement: wallet?.totalSettlement || 0,
      lastSettlementDate: wallet?.lastSettlementDate || null,
    }));


    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Settlement History");
    worksheet.columns = [
      { header: "Name", key: "fullName", width: 25 },
      { header: "Phone Number", key: "contactNumber", width: 20 },
      { header: "Last Settled Date ", key: "lastSettlementDate", width: 20 },
      { header: "Total Settlement", key: "totalSettlement", width: 20 },
      { header: "Balance", key: "cashInHand", width: 20 },
    ];

    let firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell: any) => {
      cell.font = { bold: true };
    });

    worksheet.addRows(formattedData);

    console.log(formattedData)

    filename = `wallet-history-${Date.now()}.xlsx`;
    let filePath = path.join(exportFolder, filename);
    await workbook.xlsx.writeFile(filePath).then(() => {
      console.log("File saved!");
    });
  }

  return filename;
};


export const returnAssignDeliveryAgent = async (data: { orderItemId: Types.ObjectId, deliveryAgentId: Types.ObjectId, deliveryAgentName: string }) => {
  try {
    const assignOrder = await orderProductModel.findById({ _id: data.orderItemId })
    if (assignOrder) {
      // check is this first assigning or reassigning
      if (assignOrder.returnStatus === "APPROVED") {
        if (!assignOrder.returndeliveryAgentId) {

          const limit: any = await deliveryAgentConfigModel.findOne()
          const todayDate = new Date()

          const matchObj = {

            returndeliveryAgentId: data.deliveryAgentId,

            $and: [
              {
                returnOrderAssignedOn: { $gte: startOfDay(todayDate) }
              },
              {
                returnOrderAssignedOn: { $lte: endOfDay(todayDate) }
              },
              {
                $or: [
                  {
                    returnStatus: "APPROVED",
                  },
                  {
                    returnStatus: "COLLECTED",
                  }

                ]
              }
            ]
          }

          const result: any = await orderProductModel.aggregate([
            {
              $match: matchObj
            },
          ])

          if (result.length >= limit.returnOrderAssignLimit) {
            throw new Error("Assign order limit reached");
          }

          // add order products model assign agent id and name
          await orderProductModel.findByIdAndUpdate({ _id: data.orderItemId }, {
            $set: {
              returnOrderAssignedOn: new Date(),
              returndeliveryAgentId: data.deliveryAgentId,
              returndeliveryAgentName: data.deliveryAgentName
            }
          })
          // update delivery agent total order count
          await deliveryAgentModel.findByIdAndUpdate({ _id: data.deliveryAgentId }, {
            $inc: {
              'wallet.numberOfReturnOrderAssigned': 1,
              'wallet.numberOfPendingReturns': 1
            }
          })
          return true
        } else {
          // reassign this oder to new delivery agent
          // find old delivery agent and update this agent numberOfOrderAssigned count

          await deliveryAgentModel.findByIdAndUpdate({ _id: assignOrder.returndeliveryAgentId }, {
            $inc: {
              'wallet.numberOfReturnOrderAssigned': -1,
              'wallet.numberOfPendingReturns': -1
            }
          })
          //  this order reassign to new delivery agent

          const limit: any = await deliveryAgentConfigModel.findOne()
          const todayDate = new Date()

          const matchObj = {

            returndeliveryAgentId: data.deliveryAgentId,

            $and: [
              {
                returnOrderAssignedOn: { $gte: startOfDay(todayDate) }
              },
              {
                returnOrderAssignedOn: { $lte: endOfDay(todayDate) }
              },
              {
                $or: [
                  {
                    returnStatus: "APPROVED",
                  },
                  {
                    returnStatus: "COLLECTED",
                  }

                ]
              }
            ]
          }

          const result: any = await orderProductModel.aggregate([
            {
              $match: matchObj
            },
          ])

          if (result.length >= limit.returnOrderAssignLimit) {
            throw new Error("Assign order limit reached");
          }


          await orderProductModel.findByIdAndUpdate({ _id: data.orderItemId }, {
            $set: {
              returnOrderAssignedOn: new Date(),
              returndeliveryAgentId: data.deliveryAgentId,
              returndeliveryAgentName: data.deliveryAgentName
            }
          })
          // update this new new agent numberOfOrderAssigned count

          await deliveryAgentModel.findByIdAndUpdate({ _id: data.deliveryAgentId }, {
            $inc: {
              'wallet.numberOfReturnOrderAssigned': 1,
              'wallet.numberOfPendingReturns': 1
            }
          })
        }
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  } catch (error) {
    return false
  }
}


type Editrespo = {
  flag?: boolean
  numberExit?: boolean
}


// all delivery agent details find 


// export const viewAllDeliveryAgents = async (options: { page: number, size: number,isActive?:any,agentType?:any,search?:any }): Promise<IDeliveryAgent[] | []> => {

//   return new Promise(async (resolve, reject) => {
//     let dataSize:any

//     try {

//       // const totalCount = await deliveryAgentModel.countDocuments();
//       let pipeline: any[]


//      if(options.isActive && options.agentType && options.search){

//        const active=JSON.parse(options.isActive)

//        dataSize=await deliveryAgentModel.find({isActive:active,agentType:options.agentType,search: options.search})


//          pipeline = [
//           { $sort: { createdAt: -1 } }, 
//           { $match: { fullName: { $regex: options.search, $options: 'i' } } },
//           {$match:{isActive:active}},
//           {$match:{agentType:options.agentType}},
//           { $skip: options.page * options.size }, 
//           { $limit: options.size }, 


//           {
//             $project: {
//               _id: 1, 
//               fullName: 1,
//               contactNumber: 1,
//               userID: 1, 
//               ID: 1,
//               password:1,
//               licence: 1, 
//               agentType: 1, 
//               isActive: 1, 
//               wallet: 1, 
//               settlementHistory: 1,
//               createdAt: 1, 
//               updatedAt: 1,

//             }
//           }
//         ];

//        }else if(options.isActive){

//         const active=JSON.parse(options.isActive)

//         dataSize=await deliveryAgentModel.find({isActive:active})

//         console.log("is active")
//          pipeline = [
//           { $sort: { createdAt: -1 } }, 
//           {$match:{isActive:active}},
//           { $skip: options.page * options.size }, 
//           { $limit: options.size }, 


//           {
//             $project: {
//               _id: 1, 
//               fullName: 1,
//               contactNumber: 1,
//               userID: 1, 
//               ID: 1,
//               password:1,
//               licence: 1, 
//               agentType: 1, 
//               isActive: 1, 
//               wallet: 1, 
//               settlementHistory: 1,
//               createdAt: 1, 
//               updatedAt: 1,

//             }
//           }
//         ];


//       }else if(options.agentType){

//         dataSize=await deliveryAgentModel.find({agentType:options.agentType})

//          pipeline = [
//           { $sort: { createdAt: -1 } }, 
//           {$match:{agentType:options.agentType}},
//           { $skip: options.page * options.size }, 
//           { $limit: options.size }, 


//           {
//             $project: {
//               _id: 1, 
//               fullName: 1,
//               contactNumber: 1,
//               userID: 1, 
//               ID: 1,
//               password:1,
//               licence: 1, 
//               agentType: 1, 
//               isActive: 1, 
//               wallet: 1, 
//               settlementHistory: 1,
//               createdAt: 1, 
//               updatedAt: 1,

//             }
//           }
//         ];


//       }else{


//         dataSize=await deliveryAgentModel.find()

//          pipeline = [
//           { $sort: { createdAt: -1 } }, 
//           { $skip: options.page * options.size }, 
//           { $limit: options.size }, 


//           {
//             $project: {
//               _id: 1, 
//               fullName: 1,
//               contactNumber: 1,
//               userID: 1, 
//               ID: 1,
//               password:1,
//               licence: 1, 
//               agentType: 1, 
//               isActive: 1, 
//               wallet: 1, 
//               settlementHistory: 1,
//               createdAt: 1, 
//               updatedAt: 1,

//             }
//           }
//         ];

//       }


//       console.log(options.agentType , options.isActive)

//       const result = await deliveryAgentModel.aggregate(pipeline);



//       let response:any = {
//         records: [],
//         maxRecords: 0
//       };


//       if (result.length) {
//         response.records = result || [];
//         response.maxRecords =dataSize?.length  || 0;
//       }

//       resolve(response);

//     } catch (error) {

//       reject()
//     }

//   })

// }


export const viewAllDeliveryAgents = async (options: { page: number; size: number; isActive?: any; agentType?: any; search?: any, settlement?: any }): Promise<IDeliveryAgent[] | []> => {
  return new Promise(async (resolve, reject) => {
    let dataSize: any;

    try {
      let pipeline: any[] = [];
      const active = options.isActive ? JSON.parse(options.isActive) : undefined;
      const search = options.search?.trim() || ''; // Ensure search is a trimmed string or empty
      const settlement = options.settlement
      console.log("try catch =", { active, search, settlement })
      // Building the base match query
      const matchQuery: any = {};
      if (active !== undefined) matchQuery.isActive = active;
      if (options.agentType) matchQuery.agentType = options.agentType;
      if (search) matchQuery.fullName = { $regex: search, $options: 'i' };
      console.log("match query = ", matchQuery);

      // Count the total number of documents matching the criteria
      dataSize = await deliveryAgentModel.find(matchQuery);

      console.log(dataSize?.length)

      const sortField = settlement ? { 'wallet.lastSettlementDate': -1 } : { createdAt: -1 };

      // Aggregation pipeline
      pipeline = [
        { $sort: sortField },
        { $match: matchQuery }, // Apply match query
        ...(settlement
          ? [
            { $match: { 'wallet.totalSettlement': { $gt: 0 } } }, // Filter out agents with zero total settlement
          ]
          : []),
        { $match: matchQuery }, // Apply match query
        ...(options.page !== null && options.size !== null
          ? [
            { $skip: options.page * options.size }, // Skip to the desired page
            { $limit: options.size }, // Limit to the desired size
          ]
          : []),
        {
          $project: {
            _id: 1,
            fullName: 1,
            contactNumber: 1,
            userID: 1,
            ID: 1,
            password: 1,
            licence: 1,
            agentType: 1,
            isActive: 1,
            wallet: 1,
            settlementHistory: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ];

      const result = await deliveryAgentModel.aggregate(pipeline);

      let response: any = {
        records: [],
        maxRecords: 0,
      };

      if (result.length) {
        response.records = result;
        response.maxRecords = dataSize?.length || 0;
      }

      resolve(response);
    } catch (error) {
      console.log("error  = ", error);

      reject(error);
    }
  });
};


export const editAgentData = async (data: any): Promise<Editrespo> => {


  return new Promise(async (resolve, reject) => {


    try {

      // new mobile number check 

      const result = await deliveryAgentModel.findOne({

        $or: [
          { contactNumber: data.contactNumber },
          { userID: data.userID }
        ]
      })

      console.log("res", result)
      console.log("input", data)

      if (result) {

        if (result._id.toString() !== data._id.toString()) {

          resolve({ numberExit: true })
          console.log("number exit promis")
          return;

        }



      }



      console.log("data edit")

      if (data.licence) {

        await deliveryAgentModel.findByIdAndUpdate({ _id: data._id }, {

          $set: {

            fullName: data.fullName,
            contactNumber: data.contactNumber,
            userID: data.userID,
            vendorID: data.vendorID,
            agentType: data.agentType,
            licence: data.licence
          }
        })
      } else {

        await deliveryAgentModel.findByIdAndUpdate({ _id: data._id }, {

          $set: {

            fullName: data.fullName,
            contactNumber: data.contactNumber,
            userID: data.userID,
            vendorID: data.vendorID,
            agentType: data.agentType,

          }
        })
      }

      console.log("edited")
      resolve({ flag: true })




    } catch (error: any) {

      console.log(error.message)

      console.log("edit error")
      reject()
    }
  })
}


export const loginDeliveryAgent = async (agentInput: DeliveryLoginData) => {

  return new Promise(async (resolve, reject) => {

    try {


      // verfy agent based on userID and password

      // const agentData = await deliveryAgentModel.findOne({ userID: agentInput.userID, isActive: true })

      const agentData = await deliveryAgentModel.findOne({
        $and: [
          {
            $or: [
              { userID: agentInput.userID },
              { contactNumber: agentInput.contactNumber }
            ]
          },
          { isActive: true }
        ]
      });


      // agent data not found

      if (!agentData) {

        const obj = {

          notfount: true,
          msg: "invalid userid"
        }

        resolve(obj)

      } else {

        // checking agent password

        const passwordStatus = await agentData.verifyHash(agentInput.password)

        if (!passwordStatus) {

          const obj = {
            mismatch: true,
            msg: "userid and password not matching"
          }

          resolve(obj)
        } else {

          // agent is  verfyed 

          const obj = {

            login: true,
            _id: agentData._id,
            fullname: agentData.fullName,
            userId: agentData.userID,
            msg: "agent credentials is matched"
          }

          resolve(obj)
        }

      }

    } catch (error: any) {

      console.log(error.message)

      reject()
    }

  })
}



// order assign to delivery agent

export const orderAssignDeliveryAgent = async (data: { orderItemId: Types.ObjectId, deliveryAgentId: Types.ObjectId, deliveryAgentName: string }) => {

  return new Promise(async (resolve, reject) => {

    try {

      // find assign order 

      const assignOrder = await orderProductModel.findById({ _id: data.orderItemId })

      console.log(data, 'ORDER RETURN ASSIGN DATA');

      if (assignOrder) {


        // check is this first assigning or reassigning

        if (!assignOrder.deliveryAgentId) {

          // check delivery agent order assign limit

          // get the admin added limit

          const limit: any = await deliveryAgentConfigModel.findOne()
          const todayDate = new Date()

          const matchObj = {

            deliveryAgentId: data.deliveryAgentId,

            $and: [
              {
                deliveryAssignedOn: { $gte: startOfDay(todayDate) }
              },
              {
                deliveryAssignedOn: { $lte: endOfDay(todayDate) }
              },
              {


                $or: [
                  {
                    shippingStatus: "SHIPPED",

                  },
                  {
                    shippingStatus: "DELIVERED",

                  }

                ]
              }

            ]


          }

          const result: any = await orderProductModel.aggregate([

            {
              $match: matchObj
            },

          ])

          if (result.length >= limit.orderAssignLimit) {

            reject("Assign order limit reached")
            return;
          }



         console.log("date",new Date())

          // add order products model assign agent id and name 
          await orderProductModel.findByIdAndUpdate({ _id: data.orderItemId }, {

            $set: {
              deliveryAssignedOn: new Date(),
              deliveryAgentId: data.deliveryAgentId,
              deliveryAgentName: data.deliveryAgentName
            }
          })

          // update delivery agent total order count

          await deliveryAgentModel.findByIdAndUpdate({ _id: data.deliveryAgentId }, {

            $inc: {

              'wallet.numberOfOrderAssigned': 1,
              'wallet.numberOfPendingOrdes': 1
            }
          })

          resolve({ flag: true })


        } else {

          // reassign this oder to new delivery agent

          // find old delivery agent and update this agent numberOfOrderAssigned count

          await deliveryAgentModel.findByIdAndUpdate({ _id: assignOrder.deliveryAgentId }, {

            $inc: {

              'wallet.numberOfOrderAssigned': -1,
              'wallet.numberOfPendingOrdes': -1
            }
          })

          //  this order reassign to new delivery agent 

          // check delivery agent order assign limit

          // get the admin added limit

          const limit: any = await deliveryAgentConfigModel.findOne()
          const todayDate = new Date()

          const matchObj = {

            deliveryAgentId: data.deliveryAgentId,

            $and: [
              {
                deliveryAssignedOn: { $gte: startOfDay(todayDate) }
              },
              {
                deliveryAssignedOn: { $lte: endOfDay(todayDate) }
              },
              {


                $or: [
                  {
                    shippingStatus: "SHIPPED",

                  },
                  {
                    shippingStatus: "DELIVERED",

                  }

                ]
              }

            ]


          }

          const result: any = await orderProductModel.aggregate([

            {
              $match: matchObj
            },

          ])

          if (result.length >= limit.orderAssignLimit) {

            reject("Assign order limit reached")
            return;
          }




          await orderProductModel.findByIdAndUpdate({ _id: data.orderItemId }, {

            $set: {
              deliveryAssignedOn: new Date(),
              deliveryAgentId: data.deliveryAgentId,
              deliveryAgentName: data.deliveryAgentName
            }
          })

          // update this new new agent numberOfOrderAssigned count

          await deliveryAgentModel.findByIdAndUpdate({ _id: data.deliveryAgentId }, {

            $inc: {

              'wallet.numberOfOrderAssigned': 1,
              'wallet.numberOfPendingOrdes': 1
            }
          })

          resolve({ flag: true })
        }

      } else {

        reject({ flag: false })
      }


    } catch (error) {

      reject({ flag: false })

    }
  })

}




export const orderDelivedbyAgent = async (data: { deliveryAgentId: Types.ObjectId, orderItemId: Types.ObjectId, pymentType?: string, deliveryStatus: string, remarks?: string }) => {


  return new Promise(async (resolve, reject) => {

    try {

      // change order product delivery status 

      await orderProductModel.findByIdAndUpdate({ _id: data.orderItemId }, {

        $set: {

          shippingStatus: data.deliveryStatus,
          postponedremark: data.remarks,
          postponeddate: new Date()
        }
      })

      // check this order status POSTPONED

      if (data.deliveryStatus === "POSTPONED") {

        resolve({ flag: true })
        return;
      }


      // check this order status DELIVERED

      if (data.deliveryStatus === "DELIVERED") {

        // uppdate this order product pymentmode

        await orderProductModel.findByIdAndUpdate({ _id: data.orderItemId }, {

          $set: {

            paymentMode: data.pymentType
          }
        })


        // add order product delivery data



        // update delivery agent numberOfOrderDelivered count

        await deliveryAgentModel.findByIdAndUpdate({ _id: data.deliveryAgentId }, {

          $inc: {

            'wallet.numberOfOrderDelivered': 1
          }
        })

        // check this order pyment type is COD

        if (data.pymentType === "COD") {

          // update this order product pyment status 

          await orderProductModel.findByIdAndUpdate({ _id: data.orderItemId }, {

            $set: {

              paymentStatus: "COMPLETED"
            }
          })


          // get this order product price 

          const orderProduct = await orderProductModel.findOne({ _id: data.orderItemId })
          let productPrice: any = orderProduct?.sellingPrice
          productPrice = parseFloat(productPrice)

          // genarat transaction logs 

          const obj = {

            agentId: data.deliveryAgentId,
            amount: productPrice,
            orderId: data.orderItemId,
            remarks: data.remarks


          }

          await transactionlogs.orderDeliverytimeTransactionLogs(obj)

          // update delivery agent wallet 

          await deliveryAgentModel.findByIdAndUpdate({ _id: data.deliveryAgentId }, {


            $inc: {

              'wallet.cashInHand': productPrice,

              'wallet.grandTotal': productPrice,

            }
          })

          resolve({ flag: true })
          return;

        } else {

          resolve({ flag: true })
          return;
        }

      } else {


      }


    } catch (error) {

      reject("Unable to update this order status")

    }
  })

}




// export const getAssignedOrderByDeliveryAgent = async (data: { _id: Types.ObjectId,page:number,size:number ,shippingStatus?:any}): Promise<any> => {

//   return new Promise(async (resolve, reject) => {


//     try {

//        let dataSize:any
//        let result:any

//        console.log("input ",data)

//      dataSize=await orderProductModel.find({deliveryAgentId:data._id})

//      if(data.shippingStatus){

//       dataSize=await orderProductModel.find({deliveryAgentId:data._id,shippingStatus:data.shippingStatus})

//       result = await orderProductModel.aggregate([
//         {

//           $match: {
//             deliveryAgentId: data._id,
//             shippingStatus:data.shippingStatus

//           },
//         },
//         {

//           $lookup: {
//             from: 'orders', 
//             localField: 'orderId',  
//             foreignField: 'orderId',  
//             as: 'userDetails',  
//           },
//         },
//         {

//           $unwind: {
//             path: '$userDetails',
//             preserveNullAndEmptyArrays: true,  
//           },
//         },
//         { 
//           $skip: data.page * data.size,
//         },
//         {
//           $limit: data.size,
//         },
//         {

//           $project: {
//             _id: 1,
//             orderId: 1,
//             userId: 1,
//             productName: 1,
//             sellingPrice: 1,
//             paymentStatus: 1,
//             orderDate: 1,
//             shippingStatus: 1,
//             deliveryAgentId: 1,

//             userName: "$userDetails.shippingAddress.firstname",
//             email: "$userDetails.shippingAddress.email",
//             mobileNumber: "$userDetails.shippingAddress.mobile",
//             country: "$userDetails.shippingAddress.country",
//             houseNumber: "$userDetails.shippingAddress.houseNumber",
//             streetName: "$userDetails.shippingAddress.streetName",
//             apartment: "$userDetails.shippingAddress.apartment",
//             suite: "$userDetails.shippingAddress.suite",
//             unit: "$userDetails.shippingAddress.unit",
//             city: "$userDetails.shippingAddress.city",
//             postCode: "$userDetails.shippingAddress.postCode"

//           },
//         },
//       ]);


//      }else{

//         console.log("w shipping")
//       result = await orderProductModel.aggregate([
//         {

//           $match: {
//             deliveryAgentId: data._id,
//           },
//         },
//         {

//           $lookup: {
//             from: 'orders', 
//             localField: 'orderId',  
//             foreignField: 'orderId',  
//             as: 'userDetails',  
//           },
//         },
//         {

//           $unwind: {
//             path: '$userDetails',
//             preserveNullAndEmptyArrays: true,  
//           },
//         },
//         { 
//           $skip: data.page * data.size,
//         },
//         {
//           $limit: data.size,
//         },
//         {

//           $project: {
//             _id: 1,
//             orderId: 1,
//             userId: 1,
//             productName: 1,
//             sellingPrice: 1,
//             paymentStatus: 1,
//             orderDate: 1,
//             shippingStatus: 1,
//             deliveryAgentId: 1,

//             userName: "$userDetails.shippingAddress.firstname",
//             email: "$userDetails.shippingAddress.email",
//             mobileNumber: "$userDetails.shippingAddress.mobile",
//             country: "$userDetails.shippingAddress.country",
//             houseNumber: "$userDetails.shippingAddress.houseNumber",
//             streetName: "$userDetails.shippingAddress.streetName",
//             apartment: "$userDetails.shippingAddress.apartment",
//             suite: "$userDetails.shippingAddress.suite",
//             unit: "$userDetails.shippingAddress.unit",
//             city: "$userDetails.shippingAddress.city",
//             postCode: "$userDetails.shippingAddress.postCode"

//           },
//         },
//       ]);

//      }



//       let response:any = {
//         records: [],
//         maxRecords: 0
//       };


//       if (result.length) {
//         response.records = result || [];
//         response.maxRecords =dataSize?.length  || 0;
//       }
//       console.log("res",response)
//       resolve(response);

//     } catch (error) {

//       reject(error);
//     }
//   })
// }

// updated

export const getAssignedOrderByDeliveryAgent = async (data: { _id: Types.ObjectId, page: number, size: number, shippingStatus?: any ,date?:any}): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      let dataSize: any
      let result: any
      let matchObj: any = { deliveryAgentId: data._id }
      console.log("input ", data)
      if (data.shippingStatus) {
        matchObj.shippingStatus = data.shippingStatus
      }

      if(data?.date){
        matchObj.$and = [{deliveryAssignedOn:{$gte:startOfDay(new Date(data?.date))}},{deliveryAssignedOn:{$lte:endOfDay(new Date(data?.date))}}]
      }
    

      //  if(data.shippingStatus){
      dataSize = await orderProductModel.find(matchObj)
      result = await orderProductModel.aggregate(
        [
          {
            $match: matchObj,
          },
          {
            $lookup: {
              from: 'orders',
              localField: 'orderId',
              foreignField: 'orderId',
              as: 'orderDetails',
            },
          },
          {
            $unwind: {
              path: '$orderDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "orderDetails.userId",
              foreignField: "_id",
              as: "userDetails"
            }
          },
          {
            $unwind: {
              path: "$userDetails",
              preserveNullAndEmptyArrays: true
            }
          },
          {

            $sort: {
              createdAt: -1
            }
          },
          {
            $skip: data.page * data.size,
          },
          {
            $limit: data.size,
          },
          {
            $project: {
              _id: 1,
              orderId: 1,
              userId: 1,
              itemId: 1,
              productName: 1,
              sellingPrice: 1,
              paymentStatus: 1,
              paymentMode: 1,
              orderDate: 1,
              shippingStatus: 1,
              deliveryAgentId: 1,
              userName:"$orderDetails.shippingAddress.firstname",

              email: "$orderDetails.shippingAddress.email",
              mobileNumber: "$orderDetails.shippingAddress.mobile",
              country: "$orderDetails.shippingAddress.country",
              houseNumber: "$orderDetails.shippingAddress.houseNumber",
              streetName: "$orderDetails.shippingAddress.streetName",
              apartment: "$orderDetails.shippingAddress.apartment",
              suite: "$orderDetails.shippingAddress.suite",
              unit: "$orderDetails.shippingAddress.unit",
              city: "$orderDetails.shippingAddress.city",
              postCode: "$orderDetails.shippingAddress.postCode"
            },
          },
        ]



      );


      console.log("result", result)


      let response: any = {
        records: [],
        maxRecords: 0
      };


      if (result.length) {
        response.records = result || [];
        response.maxRecords = dataSize?.length || 0;
      }

      resolve(response);
    } catch (error) {
      reject(error);
    }
  })
}


export const getAssignedReturnOrderBundleByDeliveryAgent = async (data:{_id: Types.ObjectId, page: number, size: number,search:string}):Promise<any>=>{
  return new Promise(async (resolve, reject) => {
    try {
      
    console.log("input ", data)
      
    let dataSize: any
    let result: any
    let matchObj: any = { returndeliveryAgentId: data._id}
    if(data?.search){
      matchObj.$and = [{returnOrderAssignedOn:{$gte:startOfDay(new Date(data?.search))}},{returnOrderAssignedOn:{$lte:endOfDay(new Date(data?.search))}}]
    }

 


    dataSize = await orderProductModel.aggregate([
      {
        $match: matchObj,
      },
      {
        $addFields:{
          assignedOn:{ $dateToString: {
            date: "$returnOrderAssignedOn",
            format: "%d-%m-%Y",
            timezone: 'Asia/Kolkata',
        } }
        }
      },
      {
        $group: {
          _id: "$assignedOn",
          count: {
            $sum: 1
          },
          date: {
            $first:"$returnOrderAssignedOn"
          }
        }
      },
    ])


    result = await orderProductModel.aggregate([
      {
        $match: matchObj,
      },
      {
        $addFields:{
          assignedOn:{ $dateToString: {
            date: "$returnOrderAssignedOn",
            format: "%d-%m-%Y",
            timezone: 'Asia/Kolkata',
        } }
        }
      },
      {
        $group: {
          _id: "$assignedOn",
          count: {
            $sum: 1
          },
          date: {
            $first:"$returnOrderAssignedOn"
          }
        }
      },
      {
        $sort: {
          _id: -1
        }
      },
      {
        $skip: data.page * data.size,
      },
      {
        $limit: data.size,
      },
    ])
    
    console.log("RESULT = ",result)
    
    let response: any = {
      records: [],
      maxRecords: 0
    };
    
    
    if (result.length) {
      response.records = result || [];
      response.maxRecords = dataSize?.length || 0;
    }
    
    resolve(response);
  } catch (error) {
    reject(error);
  }
    
  })
}


export const getAssignedOrderBundleByDeliveryAgent = async (data:{_id: Types.ObjectId, page: number, size: number,search:string}):Promise<any>=>{
  return new Promise(async (resolve, reject) => {
    try {
      
      console.log("input ", data)
      
    let dataSize: any
    let result: any
    let matchObj: any = { deliveryAgentId: data._id}
    if(data?.search){
      matchObj.$and = [{deliveryAssignedOn:{$gte:startOfDay(new Date(data?.search))}},{deliveryAssignedOn:{$lte:endOfDay(new Date(data?.search))}}]
    }

    dataSize = await orderProductModel.aggregate([
      {
        $match: matchObj,
      },
      {
        $addFields:{
          assignedOn:{ $dateToString: {
            date: "$deliveryAssignedOn",
            format: "%d-%m-%Y",
            timezone: 'Asia/Kolkata',
        } }
        }
      },
      {
        $group: {
          _id: "$assignedOn",
          count: {
            $sum: 1
          },
          date: {
            $first:"$deliveryAssignedOn"
          }
        }
      },
    ])


    result = await orderProductModel.aggregate([
      {
        $match: matchObj,
      },
      {
        $addFields:{
          assignedOn:{ $dateToString: {
            date: "$deliveryAssignedOn",
            format: "%d-%m-%Y",
            timezone: 'Asia/Kolkata',
        } }
        }
      },
      {
        $group: {
          _id: "$assignedOn",
          count: {
            $sum: 1
          },
          date: {
            $first:"$deliveryAssignedOn"
          }
        }
      },
      {
        $sort: {
          _id: -1
        }
      },
      {
        $skip: data.page * data.size,
      },
      {
        $limit: data.size,
      },
    ])
    
    console.log("RESULT = ",result)
    
    let response: any = {
      records: [],
      maxRecords: 0
    };
    
    
    if (result.length) {
      response.records = result || [];
      response.maxRecords = dataSize?.length || 0;
    }
    
    resolve(response);
  } catch (error) {
    reject(error);
  }
    
  })
}

export const getTodayAssignedOrderByDeliveryAgent = async (data: { _id: Types.ObjectId, page: number, size: number, shippingStatus?: any }): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      let dataSize: any
      let result: any
      const todayDate = new Date

      let matchObj: any = {

        deliveryAgentId: data._id,
        $and: [
          {
            deliveryAssignedOn: { $gte: startOfDay(todayDate) }
          },
          {
            deliveryAssignedOn: { $lte: endOfDay(todayDate) }
          },
        ]
      }


      console.log("input ", data)
      if (data.shippingStatus) {
        matchObj.shippingStatus = data.shippingStatus
      }


      //  if(data.shippingStatus){
      dataSize = await orderProductModel.find(matchObj)
      result = await orderProductModel.aggregate(

        [
          {
            $match: matchObj,
          },
          {
            $lookup: {
              from: 'orders',
              localField: 'orderId',
              foreignField: 'orderId',
              as: 'orderDetails',
            },
          },
          {
            $unwind: {
              path: '$orderDetails',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "orderDetails.userId",
              foreignField: "_id",
              as: "userDetails"
            }
          },
          {
            $unwind: {
              path: "$userDetails",
              preserveNullAndEmptyArrays: true
            }
          },
          {

            $sort: {
              createdAt: -1
            }
          },
          {
            $skip: data.page * data.size,
          },
          {
            $limit: data.size,
          },
          {
            $project: {
              _id: 1,
              orderId: 1,
              userId: 1,
              itemId: 1,
              productName: 1,
              sellingPrice: 1,
              paymentStatus: 1,
              paymentMode: 1,
              orderDate: 1,
              shippingStatus: 1,
              deliveryAgentId: 1,
              userName:"$orderDetails.shippingAddress.firstname",

              email: "$orderDetails.shippingAddress.email",
              mobileNumber: "$orderDetails.shippingAddress.mobile",
              country: "$orderDetails.shippingAddress.country",
              houseNumber: "$orderDetails.shippingAddress.houseNumber",
              streetName: "$orderDetails.shippingAddress.streetName",
              apartment: "$orderDetails.shippingAddress.apartment",
              suite: "$orderDetails.shippingAddress.suite",
              unit: "$orderDetails.shippingAddress.unit",
              city: "$orderDetails.shippingAddress.city",
              postCode: "$orderDetails.shippingAddress.postCode"
            },
          },
        ]



      );
      //  }else{
      //     console.log("w shipping")
      //   result = await orderProductModel.aggregate([
      //     {
      //       $match: {
      //         deliveryAgentId: data._id,
      //       },
      //     },
      //     {
      //       $lookup: {
      //         from: 'orders',
      //         localField: 'orderId',
      //         foreignField: 'orderId',
      //         as: 'userDetails',
      //       },
      //     },
      //     {
      //       $unwind: {
      //         path: '$userDetails',
      //         preserveNullAndEmptyArrays: true,
      //       },
      //     },
      //     {
      //       $skip: data.page * data.size,
      //     },
      //     {
      //       $limit: data.size,
      //     },
      //     {
      //       $project: {
      //         _id: 1,
      //         orderId: 1,
      //         userId: 1,
      //         productName: 1,
      //         sellingPrice: 1,
      //         paymentStatus: 1,
      //         orderDate: 1,
      //         shippingStatus: 1,
      //         deliveryAgentId: 1,
      //         userName: "$userDetails.shippingAddress.firstname",
      //         email: "$userDetails.shippingAddress.email",
      //         mobileNumber: "$userDetails.shippingAddress.mobile",
      //         country: "$userDetails.shippingAddress.country",
      //         houseNumber: "$userDetails.shippingAddress.houseNumber",
      //         streetName: "$userDetails.shippingAddress.streetName",
      //         apartment: "$userDetails.shippingAddress.apartment",
      //         suite: "$userDetails.shippingAddress.suite",
      //         unit: "$userDetails.shippingAddress.unit",
      //         city: "$userDetails.shippingAddress.city",
      //         postCode: "$userDetails.shippingAddress.postCode"
      //       },
      //     },
      //   ]);
      //  }


      console.log("result", result)


      let response: any = {
        records: [],
        maxRecords: 0
      };


      if (result.length) {
        response.records = result || [];
        response.maxRecords = dataSize?.length || 0;
      }

      resolve(response);
    } catch (error) {
      reject(error);
    }
  })
}



export const getAssignedeOrderDeatilsByAgentProfile = async (data: { _id: Types.ObjectId }): Promise<any> => {

  return new Promise(async (resolve, reject) => {


    try {

      // const result=await orderProductModel.find({deliveryAgentId:data._id})

      const final = await orderProductModel.aggregate([
        {
          // Match orders assigned to the specific delivery agent
          $match: {
            _id: data._id
          },
        },
        {
          // Lookup the user details by userId from orderProductSchema
          $lookup: {
            from: 'orders',  // 'users' is the collection name for User model
            localField: 'orderId',  // Field in orderProductSchema
            foreignField: 'orderId',  // Field in User model
            as: 'userDetails',  // The alias to store the matched user data
          },
        },
        {
          // Optionally, unwind userDetails to flatten the array into a single object
          $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true,  // If no matching user, the field will be empty
          },
        },
        {
          // Project only the required fields (order product data + user data)
          $project: {
            _id: 1,
            orderId: 1,
            userId: 1,
            productName: 1,
            sellingPrice: 1,
            paymentStatus: 1,
            paymentMode: 1,
            orderDate: 1,
            shippingStatus: 1,
            deliveryAgentId: 1,
            returnPeriod: 1,
            returnStatus: 1,
            returnUserReason: 1,
            returnProductImage: 1,
            returnAddress: 1,
            returnAdminComment: 1,
            returnRequestDate: 1,
            returnOrderAssignedOn: 1,
            deliveyremark: 1,
            cancelremark: 1,
            postponedremark: 1,
            deliveredMapLocation: 1,
            deliveryAssignedOn: 1,
            returnRejectedDate: 1,
            returnRejectedRemarks: 1,
            returnPostponedDate: 1,
            returnPostponedRemarks: 1,
            returnCollectedDate: 1,

            // User information from the aggregated userDetails
            userName: "$userDetails.shippingAddress.firstname",
            email: "$userDetails.shippingAddress.email",
            mobileNumber: "$userDetails.shippingAddress.mobile",
            country: "$userDetails.shippingAddress.country",
            houseNumber: "$userDetails.shippingAddress.houseNumber",
            streetName: "$userDetails.shippingAddress.streetName",
            apartment: "$userDetails.shippingAddress.apartment",
            suite: "$userDetails.shippingAddress.suite",
            unit: "$userDetails.shippingAddress.unit",
            city: "$userDetails.shippingAddress.city",
            postCode: "$userDetails.shippingAddress.postCode"

          },
        },
      ]);

      console.log("res", final)

      const result = final[0]

      resolve(result)

    } catch (error) {

      reject(error);
    }
  })



}



export const deliveryTimeOtpGenerate = async (orderItemId: Types.ObjectId): Promise<any> => {

  return new Promise(async (resolve, reject) => {

    try {

      // generate otp

      const otpResponse = await otpService.generateOtp()
      console.log("otp", otpResponse)

      // sent this otp to user number



      // save this otp to  database


      await orderProductModel.findByIdAndUpdate({ _id: orderItemId }, {
        $set: {

          'otp.code': otpResponse.code,
          'otp.expiresAt': otpResponse.expiresAt
        }
      })

      resolve({ flag: true })

    } catch (error) {


      reject("OTP generation failed")
    }
  })
}





export const deliveryTimeOtpverify = async (data: { orderItemId: Types.ObjectId, code: string, deliveryStatus?: string, paymentMode?: string, remarks?: string, returnStatus?: string, returnRemark?: string, agentId: Types.ObjectId }): Promise<any> => {
  try {
    // Fetch OTP data from the orderProduct collection
    const otpData = await orderProductModel.findOne({ _id: data.orderItemId, 'otp.code': data.code });
    // Check if the OTP data exists
    if (!otpData) {
      throw new Error('Invalid OTP');
    }
    // Validate OTP expiration
    const isExpired = await otpService.isOtpExpired(otpData?.otp?.expiresAt);
    if (isExpired) {
      throw new Error('Expired OTP');
    }
    const agent = await deliveryAgentModel.findOne({ _id: data.agentId })
    if (!agent) {
      throw new Error('Agent not found');
    }
    const result: any = {};
    if (data.returnStatus) {


      if (data.returnStatus === 'REJECTED') {
        agent.wallet.numberOfPendingReturns -= 1;  // Decrement the number of returns delivered
        result.returnStatus = data.returnStatus;
        result.returnRejectedDate = new Date();
        if (data.returnRemark) {
          result.returnRejectedRemarks = data.returnRemark;  // Only set returnRemark if provided
        }
        // Resolve with a success response
        return { flag: true };
      }
      if (data.returnStatus === 'COLLECTED') {
        agent.wallet.numberOfReturnOrderDelivered += 1;  // Decrement the number of returns delivered
        agent.wallet.numberOfPendingReturns -= 1;   // Decrement the number of returns  pending
        result.returnStatus = data.returnStatus;
        result.returnCollectedDate = new Date();
        if (data.returnRemark) {
          result.returnCollectedRemarks = data.returnRemark;  // Only set returnRemark if provided
        }
      }


      const updateFields: any = {
        'otp.code': '',
        'otp.expiresAt': ''
      };
      // Add return status and remarks to the update fields if they are provided
      if (result.returnStatus) {
        updateFields['returnStatus'] = result.returnStatus;
      }
      if (result.returnRejectedDate) {
        updateFields['returnRejectedDate'] = result.returnRejectedDate;
      }
      if (result.returnRejectedRemarks) {
        updateFields['returnRejectedRemarks'] = result.returnRejectedRemarks;
      }
      if (result.returnCollectedDate) {
        updateFields['returnCollectedDate'] = result.returnCollectedDate;
      }
      if (result.returnCollectedRemarks) {
        updateFields['returnCollectedRemarks'] = result.returnCollectedRemarks;
      }
      // Reset OTP fields in the order product document
      await orderProductModel.findByIdAndUpdate(data.orderItemId, { $set: updateFields });
      // Resolve with a success response
      return { flag: true };
    }


    if (data.deliveryStatus) {
      if (data.deliveryStatus === "DELIVERED") {
        // uppdate this order product delivery status , pymentmode,delivery remark
        await orderProductModel.findByIdAndUpdate({ _id: data.orderItemId }, {
          $set: {
            shippingStatus: data.deliveryStatus,
            paymentMode: data.paymentMode,
            deliveyremark: data.remarks,
            deliveryDate: new Date()
          }
        })
        // update delivery agent numberOfOrderDelivered count
        await deliveryAgentModel.findByIdAndUpdate({ _id: data.agentId }, {
          $inc: {
            'wallet.numberOfOrderDelivered': 1,
            'wallet.numberOfPendingOrdes': -1
          }
        })
        // check this order pyment type is COD
        if (data.paymentMode === "COD") {
          // update this order product pyment status
          await orderProductModel.findByIdAndUpdate({ _id: data.orderItemId }, {
            $set: {
              paymentStatus: "COMPLETED"
            }
          })
          // get this order product price
          const orderProduct = await orderProductModel.findOne({ _id: data.orderItemId })
          let productPrice: any = orderProduct?.sellingPrice
          productPrice = parseFloat(productPrice)
          // genarat transaction logs
          const obj = {
            agentId: data.agentId,
            amount: productPrice,
            orderId: data.orderItemId,
            remarks: data.remarks
          }
          await transactionlogs.orderDeliverytimeTransactionLogs(obj)
          // update delivery agent wallet
          await deliveryAgentModel.findByIdAndUpdate({ _id: data.agentId }, {
            $inc: {
              'wallet.cashInHand': productPrice,
              'wallet.grandTotal': productPrice,
            }
          })
          return ({ flag: true })
        } else {
          return ({ flag: true })
        }
      } else {

        // delivery status  CANCELED

        await orderProductModel.findByIdAndUpdate({ _id: data.orderItemId }, {
          $set: {
            shippingStatus: data.deliveryStatus,
            cancelremark: data.remarks,
            canceldate: new Date()
          }
        })

        // update delivery agent wallet details

        await deliveryAgentModel.findByIdAndUpdate({ _id: data.agentId }, {

          $inc: {

            'wallet.numberOfPendingOrdes': -1
          }
        })


      }
    };


    await agent.save();
    return ({ flag: false })
  } catch (error: any) {
    // Reject with a specific error message
    throw new Error(error.message || 'INTERNAL_SERVER_ERROR');
  }
};














