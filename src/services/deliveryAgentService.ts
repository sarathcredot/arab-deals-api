
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { deliveryAgentModel, settlementModel } from '../models'
import { collections } from "../configs";



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
  licence:FileData;
}


export interface ISettlement {
  _id?: Types.ObjectId;
  agentId: Types.ObjectId;
  amount:number;
  date:Date;
  remarks?:string;
}


export interface IDeliveryAgentFilter {
  _id: Types.ObjectId;
  fullName: string;
  contactNumber: string;
  userID: string;
  password: string;
  agentType: string;
  vendorID?: Types.ObjectId;
  isActive: boolean;
  wallet: {
    cashInHand: number;
    lastSettlementDate: Date;
    grandTotal: number;
    totalSettlement: number;
  };
  settlementHistory:Types.ObjectId[];
}

export interface IDeliveryAgentDocument extends Document {
  _id?: Types.ObjectId;
  fullName: string;
  contactNumber: string;
  userID: string;
  password: string;
  agentType: string;
  vendorID?: Types.ObjectId;
  licence:FileData;
  wallet: {
    cashInHand: number;
    lastSettlementDate: Date;
    grandTotal: number;
    totalSettlement: number;
  };
  settlementHistory:Types.ObjectId[];
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


// export const createSettlement = async (settlementData:ISettlement ,existingAgent:IDeliveryAgentDocument): Promise<ISettlement> => {
//   let settlement = new settlementModel(settlementData);

//   existingAgent.cashInHand -= settlement.amount;
//   existingAgent.lastSettlementDate = new Date(settlement.date);
//   existingAgent.settlementHistory.push(settlement._id);

//   await existingAgent.save();
//   return await settlement.save();
// };

export const createSettlement = async (settlementData:ISettlement,agentId:Types.ObjectId): Promise<ISettlement> => {
  let settlement = new settlementModel(settlementData);
  const existingAgent=await deliveryAgentModel.findById(agentId)

  if (!existingAgent) {
    throw new Error("Delivery Agent not found");
  }
  
  existingAgent.wallet.cashInHand -= settlement.amount;
  existingAgent.wallet.totalSettlement += settlement.amount;
  existingAgent.wallet.lastSettlementDate = new Date(settlement.date);
  existingAgent.settlementHistory.push(settlement._id);

  await existingAgent.save();
  return await settlement.save();
};


export const suspendDeliveryAgent = async (agentId: Types.ObjectId, isActive: boolean): Promise<IDeliveryAgent | null> => {
  return await deliveryAgentModel.findByIdAndUpdate(
    agentId,
    { isActive: isActive },
    { new: true }
  );
};



export const findDeliveryAgentWithFilters = async (filters: object, projection: object, options: object): Promise<IDeliveryAgentFilter | null> => {
  return await deliveryAgentModel.findOne(filters, projection, options);
};

type Editrespo = {
  flag: boolean
}


// all delivery agent details find 
export const viewAllDeliveryAgents = async (): Promise<IDeliveryAgent[] | []> => {

  return new Promise(async (resolve, reject) => {

    try {

      const allData = await deliveryAgentModel.find()

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

      await deliveryAgentModel.findByIdAndUpdate({ _id: data._id }, {

        $set: {

          fullName: data.fullName,
          contactNumber: data.contactNumber,
          userID: data.userID,
          vendorID: data.vendorID,
          agentType: data.agentType,
        }
      })

      resolve({ flag: true })

    } catch (error) {


      reject({ flag: false })
    }
  })
}


// delivery agent login

export const loginDeliveryAgent = async (agentInput: DeliveryLoginData) => {

  return new Promise(async (resolve, reject) => {

    try {


      // verfy agent based on userID and password

      const agentData = await deliveryAgentModel.findOne({ userID: agentInput.userID })

      // agent data not found

      if (!agentData) {

        const obj = {

          notfount: true,
          msg: "invalid userid"
        }

        resolve(obj)

      } else {

        // checking agent password

        const passwordStatus=await agentData.verifyHash(agentInput.password)

         if(!passwordStatus){

          const obj = {
            mismatch: true,
            msg: "userid and password not matching"
          }

              resolve(obj)
         }else{

          // agent is  verfyed 

              const obj={

                  login:true,
                  _id:agentData._id,
                  fullname:agentData.fullName,
                  userId:agentData.userID,
                  msg:"agent credentials is matched"
              }

              resolve(obj)
         }
            
      }

    } catch (error) {

      reject()
    }

  })
}
