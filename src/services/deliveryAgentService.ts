import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import {deliveryAgentModel} from '../models'
import { collections } from "../configs";

export interface IDeliveryAgent {
    _id?: string;
    fullName: string;
    contactNumber:string;
    userID:string;
    password:string;
    agentType: "ArabDeals" | "Vendor" | "ThirdParty";
    vendorID?: string;
  }
  
