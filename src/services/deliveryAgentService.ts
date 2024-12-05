<<<<<<< HEAD
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import {deliveryAgentModel} from '../models'
import { collections } from "../configs";

export interface IDeliveryAgent {
    _id?: string;
    fullName?: string;
    email?: string;
    countryCode?: string;
    mobileNumber?: string;
    profilePic?: {
      fileType?: string;
      fileURL?: string;
      mimeType?: string;
      originalName?: string;
    };
    isBlocked?: boolean;
    agentType: "ArabDeals" | "Vendor" | "ThirdParty";
    vendorID?: string;
  }
  
=======

>>>>>>> dd293773de34ec175246cc6db8bbc21b292c9a48
