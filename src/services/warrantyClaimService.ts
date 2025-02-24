
import { warrantyPolicyModel } from "../models/warrantyPolicyModel";
import { categoryModel, brandModel, orderProductModel, warrantyClaimModel } from "../models"
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, Number, } from "mongoose";

export const findOrderProductWithFilters = async (productId: Types.ObjectId, userId: Types.ObjectId): Promise<any> => {
    return await orderProductModel.findOne({
        productId: productId,
        userId: userId 
    });
};


export const createWarrantyClaimRequest= async(newClaimData:any):Promise<any>=>{
    try {
         const result= new warrantyClaimModel(newClaimData)
         const savedResult=await result.save()
         return savedResult
    } catch (error) {
        console.error("Error saving claim request:", error);
        throw new Error("Failed to save claim request ");
    }
}