
import { warrantyPolicyModel } from "../models/warrantyPolicyModel";
import { categoryModel, brandModel, orderProductModel, warrantyClaimModel } from "../models"
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, Number, } from "mongoose";
import { collections } from "../configs";

export const findOrderProductWithFilters = async (productId: Types.ObjectId, userId: Types.ObjectId): Promise<any> => {
    return await orderProductModel.findOne({
        _id: productId,
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



export const getAllWarrantyClaimsBySuperAdmin = async (options: any, matchQuery: any): Promise<any> => {
    try {
        //  console.log(matchQuery,options)
        let count = await warrantyClaimModel.aggregate([
            {
                $match: matchQuery
            },
            {
                $count: "count"
            }
        ])
        console.log("count", count)
        const result = await warrantyClaimModel.aggregate([
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $match: matchQuery
            },
            {
                $lookup: {
                    from: collections.USERS,
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                },
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: collections.ORDER_PRODUCTS,
                    localField: "product",
                    foreignField: "_id",
                    as: "product"
                },
            },
            {
                $unwind: {
                    path: "$product",
                    preserveNullAndEmptyArrays: true
                }
            },
            { 
                $project: { 
                    "user.displayName": 1, 
                    "product.productName": 1, 
                    createdAt: 1,   
                    issueDescription: 1,
                    order:1,
                    warrantyId:1,
                    claimStatus:1,
                    claimType:1
                } 
            },
            {
                $skip: options.page * options.size
            },
            {
                $limit: options.size
            }
        ])
         console.log("result",result)
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