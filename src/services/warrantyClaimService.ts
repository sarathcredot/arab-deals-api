
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
                    "product._id":1,
                    "product.itemId":1,
                    _id:1,
                    productImage:1,
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


export const getClaimRequestDetailsByAdmin = async (claimRequestId:Types.ObjectId): Promise<any> => {
    try {
      
        const result = await warrantyClaimModel.aggregate([
            {
                $match: {
                    _id:claimRequestId
                }
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
                $lookup: {
                    from: collections.VENDORS, 
                    localField: "product.vendorId", 
                    foreignField: "_id",
                    as: "vendor"
                }
            },
            {
                $unwind: { path: "$vendor", preserveNullAndEmptyArrays: true }
            },
            { 
                $project: { 
                    "user.displayName": 1, 
                    "user._id": 1, 
                    "product.productName": 1, 
                    "product.warranty.name": 1, 
                    "product.warranty.description": 1, 
                    "product.warranty.duration": 1, 
                    "product.warranty.warrantyType": 1, 
                    "product.deliveryDate": 1, 
                    "product.shippingStatus": 1, 
                    "product.orderDate": 1, 
                    "product.paymentStatus": 1, 
                    "product.shippingCharge": 1, 
                    "product.sellingPrice": 1, 
                    "product.shortDescription": 1, 
                    "product.paymentMode": 1, 
                    "product.vendorId": 1, 
                    "product.itemId": 1, 
                    "product.courierId": 1, 
                    "product.invoiceNumber": 1, 
                    "product.warehouseSkuId": 1, 
                    "vendor.fullName":1,
                    createdAt: 1,   
                    issueDescription: 1,
                    order:1,
                    warrantyId:1,
                    claimStatus:1,
                    claimType:1,
                    claimDate:1,
                    rejectedReason:1,
                    rejectedDate:1,
                    productImage:1,
                    warrantyAddress:1
                } 
            },
           
        ])
         console.log("result",result)
        let response: any = {
            records: [],
        };
        if (result.length) {
            response.records = result || [];
        }
        return response
    } catch (error) {
        throw error
    }
}