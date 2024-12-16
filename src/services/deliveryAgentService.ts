
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { deliveryAgentModel, settlementModel } from '../models'
import { orderProductModel } from '../models'
import { collections } from "../configs";
import excel from 'exceljs';
import path from 'path';
import { transactionlogs } from "../services"



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
  type?:string;
  agentId?: Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
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
  ID:string;
  password: string;
  agentType: string;
  vendorID?: Types.ObjectId;
  isActive: boolean;
  wallet: {
    cashInHand: number;
    lastSettlementDate: Date;
    grandTotal: number;
    totalSettlement: number;
    numberOfOrderAssigned: number;
    numberOfOrderDelivered: number;
  };
  settlementHistory: Types.ObjectId[] | ISettlement[];
}

export interface IDeliveryAgentDocument extends Document {
  _id?: Types.ObjectId;
  fullName: string;
  contactNumber: string;
  userID: string;
  password: string;
  ID:string;
  agentType: string;
  vendorID?: Types.ObjectId;
  licence: FileData;
  wallet: {
    cashInHand: number;
    lastSettlementDate: Date;
    grandTotal: number;
    totalSettlement: number;
    numberOfOrderAssigned: number;
    numberOfOrderDelivered: number;
  };
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


export const findSettlementtWithFilters = async (filters: object, projection: object, options: object): Promise<ISettlement | null> => {
  return await settlementModel.findOne(filters, projection, options);
};

export const findDeliveryAgentWithFilters = async (filters: object, projection: object, options: object): Promise<IDeliveryAgentFilter | null> => {
  return await deliveryAgentModel.findOne(filters, projection, options) .populate({
    path: "settlementHistory", 
    select: "_id type amount remarks totalAmount balance createdAt", 
    options: { sort: { createdAt: -1 } },
  });
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
    pipeline.push({ $match: { date: { $gte: options.startDate } } });
  }
  if (options.endDate) {
    pipeline.push({ $match: { date: { $lte: options.endDate } } });
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
              type:1,
              agentId: 1,
              amount: 1,
              balance: 1,
              createdAt:1,
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
          { header: "Type", key: "type", width: 20 },
          { header: "Date", key: "createdAt", width: 20 }, 
          { header: "Agent Name", key: "fullName", width: 25 },
          { header: "Amount", key: "amount", width: 20 },
          { header: "Balance", key: "balance", width: 20 },
          { header: "Total Amount", key: "totalAmount", width: 20 },
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

export const exportAllSettlementHistoryWithFilters = async (options:IAllSettlementHistoryOptions, exportFolder: string): Promise<string> => {
  let pipeline: PipelineStage[] = [];

  pipeline.push(
      {
          $project: {
            wallet:1,
            fullName:1,
            contactNumber:1
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
          { header: "contact number", key: "contactNumber", width: 20 },
          { header: "Agent Name", key: "fullName", width: 25 },
          { header: "Last Settlement ", key: "lastSettlementDate", width: 20 },
          { header: "Balance", key: "cashInHand", width: 20 },
          { header: "Total Settlement", key: "totalSettlement", width: 20 },
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


type Editrespo = {
  flag?: boolean
  numberExit?: boolean
}


// all delivery agent details find 
export const viewAllDeliveryAgents = async (): Promise<IDeliveryAgent[] | []> => {

  return new Promise(async (resolve, reject) => {

    try {

      const allData = await deliveryAgentModel.find().sort({ createdAt: -1 })

      resolve(allData)

    } catch (error) {

      reject()
    }

  })

}

// delivery agent data edit 

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

// test edit 





// export const editAgentData = async (data: any): Promise<Editrespo> => {


//   return new Promise(async (resolve, reject) => {


//     try {

//       // new mobile number check 

//       const result = await deliveryAgentModel.findOne({ 

//         $or: [
//           { contactNumber: data.contactNumber },
//           { userID: data.userID }
//         ]
//        })


//          if(result){

//               if(result._id.toString()!==data._id.toString()){

//                   resolve({ numberExit: true })
//                   console.log("exit")
//                   return;
//               }

//           }

//           console.log("editnew")
//           resolve({flag:true})

//       // console.log("res", result)
//       // console.log("input", data)

//       // if (result) {

//       //   if (result._id.toString() !== data._id.toString()) {

//       //     resolve({ numberExit: true })
//       //     console.log("number exit promis")
//       //   }



//       // }

//       // console.log("data edit")

//       // if (data.licence) {

//       //   await deliveryAgentModel.findByIdAndUpdate({ _id: data._id }, {

//       //     $set: {

//       //       fullName: data.fullName,
//       //       contactNumber: data.contactNumber,
//       //       userID: data.userID,
//       //       vendorID: data.vendorID,
//       //       agentType: data.agentType,
//       //       licence: data.licence
//       //     }
//       //   })
//       // } else {

//       //   await deliveryAgentModel.findByIdAndUpdate({ _id: data._id }, {

//       //     $set: {

//       //       fullName: data.fullName,
//       //       contactNumber: data.contactNumber,
//       //       userID: data.userID,
//       //       vendorID: data.vendorID,
//       //       agentType: data.agentType,

//       //     }
//       //   })
//       // }

//       // console.log("edited")
//       // resolve({ flag: true })




//     } catch (error: any) {

//       console.log(error.message)

//       console.log("edit error")
//       reject()
//     }
//   })
// }









// delivery agent login

export const loginDeliveryAgent = async (agentInput: DeliveryLoginData) => {

  return new Promise(async (resolve, reject) => {

    try {


      // verfy agent based on userID and password

      const agentData = await deliveryAgentModel.findOne({ userID: agentInput.userID, isActive: true })

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

      if (assignOrder) {


        // check is this first assigning or reassigning

        if (!assignOrder.deliveryAgentId) {

          // add order products model assign agent id and name 
          await orderProductModel.findByIdAndUpdate({ _id: data.orderItemId }, {

            $set: {

              deliveryAgentId: data.deliveryAgentId,
              deliveryAgentName: data.deliveryAgentName
            }
          })

          // update delivery agent total order count

          await deliveryAgentModel.findByIdAndUpdate({ _id: data.deliveryAgentId }, {

            $inc: {

              'wallet.numberOfOrderAssigned': 1
            }
          })

          resolve({ flag: true })


        } else {

          // reassign this oder to new delivery agent

          // find old delivery agent and update this agent numberOfOrderAssigned count

          await deliveryAgentModel.findByIdAndUpdate({ _id: assignOrder.deliveryAgentId }, {

            $inc: {

              'wallet.numberOfOrderAssigned': -1
            }
          })

          //  this order reassign to new delivery agent 

          await orderProductModel.findByIdAndUpdate({ _id: data.orderItemId }, {

            $set: {

              deliveryAgentId: data.deliveryAgentId,
              deliveryAgentName: data.deliveryAgentName
            }
          })

          // update this new new agent numberOfOrderAssigned count

          await deliveryAgentModel.findByIdAndUpdate({ _id: data.deliveryAgentId }, {

            $inc: {

              'wallet.numberOfOrderAssigned': 1
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


export const orderDelivedbyAgent = async (data: { deliveryAgentId: Types.ObjectId, orderItemId: Types.ObjectId, pymentType: string, deliveryStatus: string, remarks?: string }) => {


  return new Promise(async (resolve, reject) => {

    try {

      // change order product delivery status 

      await orderProductModel.findByIdAndUpdate({ _id: data.orderItemId }, {

        $set: {

          shippingStatus: data.deliveryStatus
        }
      })

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

            'wallet.numberOfOrderAssigned': 1
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

        } else {

          resolve({ flag: true })
        }

      } else {

        // this part control to order status is  CANCELED
      }


    } catch (error) {

      reject()

    }
  })

}


export const getAssignedOrderByDeliveryAgent=async(data:{_id:Types.ObjectId})=>{

          return new Promise(async(resolve,reject)=>{

                  
                   try {

                      const result=await orderProductModel.find({deliveryAgentId:data._id})
                   
                   } catch (error) {
                    
                   }
          })
}




