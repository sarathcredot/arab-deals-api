
import { activityLogModel } from "../models/activityLogModel";
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, Number, } from "mongoose";


export interface IActivityLog {
    actionType: string;
    action: string;
    performedBy: Types.ObjectId;
    performedByRole: string;
    referenceId?: Types.ObjectId;
    referenceType: string;
    details: string;  
}


export const createActivityLog = async (record: IActivityLog) => {
  try {
    // Validate required fields
    if (!record.actionType || !record.action || !record.performedBy || !record.performedByRole || !record.referenceId) {
      throw new Error("Missing required fields for activity log");
    }
    // Create log entry
    const activityLog = new activityLogModel(record);
    const savedLog = await activityLog.save();
    
    return activityLog;
  } catch (error: any) {
    console.error("Error creating activity log:", error.message);
    throw new Error("Failed to create activity log");
  }
};
