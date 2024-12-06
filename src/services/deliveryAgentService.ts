import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import {deliveryAgentModel} from '../models'
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



  export const findDeliveryAgentWithFilters = async (filters: object, projection: object, options: object): Promise<IDeliveryAgent | null> => {
    return await deliveryAgentModel.findOne(filters, projection, options);
  };