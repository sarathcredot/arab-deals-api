import { notificationModel } from "../models/notificationModel";
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, } from "mongoose";

export interface INotification {
    message: string;
    permissions: string[];
    orderId?: string;
    productId?: Types.ObjectId;
    type: string;
}


export const createNotification = async (record: INotification): Promise<any> => {
    return await notificationModel.create(record);
}