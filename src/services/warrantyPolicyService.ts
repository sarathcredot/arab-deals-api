import { warrantyPolicyModel } from "../models/warrantyPolicyModel";
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, Number, } from "mongoose";

export interface IWarrantyPolicy {
    name: string;
    description?: string | undefined | null;
    warrantyType: string[];
    duration: number;
}


export const createWarrantyPolicyBySuperAdmin = async (newWarrantyPolicyData: IWarrantyPolicy): Promise<any> => {
    try {
        console.log(":mag: Saving policy to DB:", newWarrantyPolicyData);
        let warrantyPolicy = new warrantyPolicyModel(newWarrantyPolicyData);
        const savedPolicy = await warrantyPolicy.save();
        console.log(":white_check_mark: Saved policy:", savedPolicy);
        return savedPolicy;
    } catch (error) {
        console.error("Error saving return policy:", error);
        throw new Error("Failed to save return policy");
    }
}







export const updateWarrantyPolicyByAdmin = async (warrantyPolicyId: Types.ObjectId, updatePolicyData: IWarrantyPolicy): Promise<any> => {
    const updatePolicy = await warrantyPolicyModel.findByIdAndUpdate(warrantyPolicyId, updatePolicyData, { new: true });
    return updatePolicy;
}

export const getAllWarrantyPoliciesBySuperAdmin = async (options: any, matchQuery: any): Promise<any> => {
    try {
        //  console.log(matchQuery,options)
        let count = await warrantyPolicyModel.aggregate([
            {
                $match: matchQuery
            },
            {
                $count: "count"
            }
        ])
        console.log("count", count)
        const result = await warrantyPolicyModel.aggregate([
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $match: matchQuery
            },
            {
                $skip: options.page * options.size
            },
            {
                $limit: options.size
            }
        ])
        //  console.log("result",result)
        let response: any = {
            records: [],
            maxRecords: 0,
        };
        if (result.length) {
            response.records = result || [];
            response.maxRecords = count[0].count || 0
        }
        return response
    } catch (error) {
        throw error
    }
}



export const getDefaultWarrantyPolicyInCategory = async () => {
    try {
    } catch (error) {
    }
}