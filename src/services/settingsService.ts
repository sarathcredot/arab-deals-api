import { collections } from "../configs";
import { paymentConfigModel, shippingConfigModel } from "../models";
import { Types, Document, QueryOptions, PipelineStage, ProjectionFields, FilterQuery, UpdateQuery, AnyObject } from "mongoose";



export interface IPaymentConfig {
    _id?: Types.ObjectId;
    onlinePayment?: boolean;
    cod?: boolean;
}


export interface IPaymentConfigDocument extends Document {
    _id?: Types.ObjectId;
    onlinePayment?: boolean;
    cod?: boolean;
}



export interface IShippingConfig {
    _id?: Types.ObjectId;
    shippingCharge?: number;
    freeShippingThreshold?: number;
    returnPeriod?: number;
}


export interface IShippingConfigDocument extends Document {
    _id?: Types.ObjectId;
    shippingCharge?: number;
    freeShippingThreshold?: number;
    returnPeriod?: number;
    defaultReturnPolicy?:Types.ObjectId
}




export const createPaymentConfig = async (record: IPaymentConfig): Promise<IPaymentConfigDocument> => {
    return await paymentConfigModel.create(record);
}

export const getPaymentConfig = async (projection: ProjectionFields<IPaymentConfig> = {}, options: QueryOptions = {}): Promise<IPaymentConfigDocument | null> => {
    return await paymentConfigModel.findOne({}, projection, options);
}


export const updatePaymentConfig = async (updateQuery: UpdateQuery<IPaymentConfig>, options: QueryOptions = {}): Promise<IPaymentConfigDocument | null> => {
    return await paymentConfigModel.findOneAndUpdate({}, updateQuery, options);
}





export const createShippingConfig = async (record: IShippingConfig): Promise<IShippingConfigDocument> => {
    return await shippingConfigModel.create(record);
}

export const getShippingConfig = async (
    projection: ProjectionFields<IShippingConfig> = {},
    options: QueryOptions = {}
  ): Promise<IShippingConfigDocument | null> => {
    const result = await shippingConfigModel.aggregate([
      {
        $project: {
          shippingCharge: 1,
          freeShippingThreshold: 1,
          returnPeriod: 1,
          defaultReturnPolicy: 1,
        },
      },
    ]);
  
    return result.length > 0 ? result[0] : null;
  };
  


export const updateShipingConfig = async (updateQuery: UpdateQuery<IShippingConfig>, options: QueryOptions = {}): Promise<IShippingConfigDocument | null> => {
    return await shippingConfigModel.findOneAndUpdate({}, updateQuery, options);
}


