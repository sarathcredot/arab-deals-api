
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { deliveryAgentModel } from '../models'
import { collections } from "../configs";

export interface IDeliveryAgent {
    _id?: Types.ObjectId;
    fullName: string;
    contactNumber:string;
    userID:string;
    password:string;
    agentType: string;
    vendorID?: Types.ObjectId;
  }
  

  export interface IDeliveryAgentFilter {
    _id: Types.ObjectId;
    fullName: string;
    contactNumber:string;
    userID:string;
    password:string;
    agentType: string;
    vendorID?: Types.ObjectId;
    isActive:boolean;
  }

  export interface IDeliveryAgentDocument extends Document {
    _id?: Types.ObjectId;
    fullName: string;
    contactNumber:string;
    userID:string;
    password:string;
    agentType: string;
    vendorID?: Types.ObjectId;
    setHash(password: string): Promise<void>;
    verifyHash(password: string): Promise<boolean>;
  }

  export const createDeliveryAgent = async (deliveryAgentData: IDeliveryAgent ,password: string): Promise<IDeliveryAgentDocument> => {
    let deliveryAgent :IDeliveryAgentDocument = new deliveryAgentModel(deliveryAgentData);
    await deliveryAgent.setHash!(password);
    return await deliveryAgent.save();
  };

  
  export const suspendDeliveryAgent = async (agentId: Types.ObjectId): Promise<IDeliveryAgent | null> => {
    return await deliveryAgentModel.findByIdAndUpdate(
      agentId,
      { isActive: false },
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
