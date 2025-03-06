
import { warrantyPolicyModel } from "../models/warrantyPolicyModel";
import { categoryModel, brandModel, orderProductModel, warrantyClaimModel, activityLogModel } from "../models"
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, Number, } from "mongoose";
import { collections } from "../configs";

export const findOrderProductWithFilters = async (productId: Types.ObjectId, userId: Types.ObjectId): Promise<any> => {
    return await orderProductModel.findOne({
        _id: productId,
    });
};


export const createWarrantyClaimRequest = async (newClaimData: any): Promise<any> => {
    try {
        const result = new warrantyClaimModel(newClaimData)
        const savedResult = await result.save()
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
                    "product._id": 1,
                    "product.itemId": 1,
                    _id: 1,
                    productImage: 1,
                    createdAt: 1,
                    issueDescription: 1,
                    order: 1,
                    warrantyId: 1,
                    claimStatus: 1,
                    claimType: 1
                }
            },
            {
                $skip: options.page * options.size
            },
            {
                $limit: options.size
            }
        ])
        console.log("result", result)
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


export const getClaimRequestDetailsByAdmin = async (claimRequestId: Types.ObjectId): Promise<any> => {
    try {

        const result = await warrantyClaimModel.aggregate([
            {
                $match: {
                    _id: claimRequestId
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
                $lookup: {
                    from: collections.DELIVERYAGENT,
                    localField: "deliveryAgentId",
                    foreignField: "_id",
                    as: "agent"
                }
            },
            {
                $unwind: { path: "$agent", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: collections.PRODUCTS,
                    localField: "product.productId",
                    foreignField: "_id",
                    as: "products"
                }
            },
            {
                $unwind: { path: "$products", preserveNullAndEmptyArrays: true }
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
                    "product.productId": 1,
                    "vendor.fullName": 1,
                    "products.images": 1,
                    "agent.contactNumber": 1,
                    "agent.agentType": 1,
                    _id: 1,
                    createdAt: 1,
                    issueDescription: 1,
                    order: 1,
                    warrantyId: 1,
                    claimStatus: 1,
                    claimType: 1,
                    claimDate: 1,
                    rejectedReason: 1,
                    rejectedDate: 1,
                    productImage: 1,
                    warrantyAddress: 1,
                    replacementDate: 1,
                    replacementReason: 1,
                    replacementShippedDate: 1,
                    replacementCompletedDate: 1,
                    returnedWarehouseDate: 1,
                    postponedDate: 1,
                    postponedReason: 1,
                    deliveryAgentId: 1,
                    deliveryAgentName: 1,
                    deliveryAgentAssignedOn: 1,
                    productImageUploadByAgent: 1,
                }
            },

        ])
        console.log("result", result)
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


export const getPendingWarrantyPickupsByAgent = async (options: any, claimFilter: any): Promise<any> => {
    try {
        //  console.log(matchQuery,options)
        let count = await warrantyClaimModel.aggregate([
            {
                $match: claimFilter
            },
            {
                $count: "count"
            }
        ])
        console.log("count", count)
        const result = await warrantyClaimModel.aggregate([
            {
                $sort: {
                    deliveryAgentAssignedOn: -1
                }
            },
            {
                $match: claimFilter
            },
            {
                $skip: options.page * options.size
            },
            {
                $limit: options.size
            }
        ])
        console.log("result", result)
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




export const getDetailsOfWarrantyPickupsByAgent = async (claimRequestId: Types.ObjectId): Promise<any> => {
    try {

        const result = await warrantyClaimModel.aggregate([
            {
                $match: {
                    _id: claimRequestId
                }
            },
            // {
            //     $lookup: {
            //         from: collections.USERS,
            //         localField: "user",
            //         foreignField: "_id",
            //         as: "user"
            //     },
            // },
            // {
            //     $unwind: {
            //         path: "$user",
            //         preserveNullAndEmptyArrays: true
            //     }
            // },
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
                    "product.paymentMode": 1,
                    "product.itemId": 1,
                    "product.productId": 1,
                    _id: 1,
                    createdAt: 1,
                    issueDescription: 1,
                    order: 1,
                    warrantyId: 1,
                    claimStatus: 1,
                    claimType: 1,
                    claimDate: 1,
                    productImage: 1,
                    warrantyAddress: 1,
                    replacementDeliveredLocation: 1,
                    deliveryAgentAssignedOn: 1
                }
            },

        ])
        console.log("result", result)
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



export const createActivityLogByWarranty = async (data: { actionType: string, action: string, performedBy: string, performedByRole: string, referenceId: Types.ObjectId, details: string }): Promise<any> => {


    return new Promise(async (resolve, reject) => {

        try {


            const final = new activityLogModel(data)

            await final.save()

            resolve(true)

        } catch (error) {

            reject(error)
        }
    })

}




export const getWarrantyActivityLogByAdmin = async (warrantyId: Types.ObjectId): Promise<any> => {
    return await activityLogModel.aggregate([
        {
            $match: { referenceId: warrantyId }
        },
        { $sort: { createdAt: 1 } },
        {
            $facet: {
                admins: [
                    { $match: { performedByRole: "ADMINS" } },
                    {
                        $lookup: {
                            from: collections.ADMINS,
                            localField: "performedBy",
                            foreignField: "_id",
                            as: "performedByDetails",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        name: "$fullName" // Standardizing as "name"
                                    }
                                }
                            ]
                        }
                    }
                ],
                users: [
                    { $match: { performedByRole: "USERS" } },
                    {
                        $lookup: {
                            from: collections.USERS,
                            localField: "performedBy",
                            foreignField: "_id",
                            as: "performedByDetails",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        name: "$displayName" // Standardizing as "name"
                                    }
                                }
                            ]
                        }
                    }
                ],
                vendors: [
                    { $match: { performedByRole: "VENDORS" } },
                    {
                        $lookup: {
                            from: collections.VENDORS,
                            localField: "performedBy",
                            foreignField: "_id",
                            as: "performedByDetails",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        name: "$fullName" // Standardizing as "name"
                                    }
                                }
                            ]
                        }
                    }
                ],
                deliveryAgents: [
                    { $match: { performedByRole: "DELIVERYAGENT" } },
                    {
                        $lookup: {
                            from: collections.DELIVERYAGENT,
                            localField: "performedBy",
                            foreignField: "_id",
                            as: "performedByDetails",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        name: "$fullName" // Standardizing as "name"
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            $project: {
                mergedResults: {
                    $concatArrays: ["$admins", "$users", "$vendors", "$deliveryAgents"]
                }
            }
        },
        { $unwind: "$mergedResults" },
        { $replaceRoot: { newRoot: "$mergedResults" } },
        // Calculate time difference between current and previous document using $shift
        {
            $setWindowFields: {
                sortBy: { createdAt: 1 },
                output: {
                    prevCreatedAt: {
                        $shift: { output: "$createdAt", by: -1 }
                    }
                }
            }
        },

        // Compute time difference in milliseconds
        {
            $addFields: {
                timeDifference: {
                    $cond: {
                        if: { $eq: ["$prevCreatedAt", null] },
                        then: null,
                        else: {
                            $toInt: { $divide: [{ $subtract: ["$createdAt", "$prevCreatedAt"] }, 1000] } // in seconds
                        }
                    }
                }
            }
        },
    ]);
};


export const getOrderProductWarrantyClaim = async (orderProductId: Types.ObjectId): Promise<any> => {

     return new Promise(async(resolve,reject)=>{

       
            try {

             

                const result=await warrantyClaimModel.findOne({product:orderProductId}).select("_id claimStatus")
                console.log("result",result)

             resolve(result)
                
            } catch (error) {
                 
                reject(error)
            }
     })
}

