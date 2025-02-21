import { jwtService, spaceService, otpService, deliveryAgentService, orderProductService, roleService, returnPolicyService, warrantyPolicyService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor, verifyDeliveryAgent, verifySuperAdmin } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";
import { error } from "console";
import moment from "moment";
import { finished } from "stream/promises";
import { startOfDay, endOfDay, max } from "date-fns"
import path from "path";
import fs from "fs";
import { returnPolicyModel } from "../../models/returnPolicyModel";
import { shippingConfigModel } from "../../models/shippingConfigModel";
import { warrantyPolicyModel } from "../../models/warrantyPolicyModel";


export const warrantyPolicyResolver: Resolvers = {

    Upload: GraphQLUpload,

        Mutation: {
            //to create  warranty policies by admin
            createWarrantyPolicyBySuperAdmin: async (parent, { input }, { req }, info) => {
                //   await verifySuperAdmin(req);
                try {
                    const name: string = input.name;
                    const description: string | undefined | null = input?.description;
                    const warrantyType: string[] = input.warrantyType ?? [];
                    const duration = input.duration
                    if (!name) {
                        throw new GraphQLError("name is required", {
                            extensions: { code: "BAD_REQUEST", errors: ["name is required"] },
                        });
                    }
                    
                    const existingwarrantyPolicy = await warrantyPolicyModel.findOne({ name })
                    if (existingwarrantyPolicy) {
                        throw new GraphQLError("policy with this name already exists", {
                            extensions: { code: "BAD_REQUEST", errors: ["policy with this name already exists!!Try another name"] },
                        });
                    }
                    let newWarrantyPolicyData: warrantyPolicyService.IWarrantyPolicy = {
                        name,
                        description,
                        warrantyType,
                        duration,
                        
                    }
                    console.log(" Creating  policy with data:", newWarrantyPolicyData);
                    const newWarrantyPolicy = await warrantyPolicyService.createWarrantyPolicyBySuperAdmin(newWarrantyPolicyData)
                    if (!newWarrantyPolicy) {
                        console.log(" Failed to save warranty policy to DB");
                        throw new GraphQLError("unable to create warranty policy", {
                            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to create warranty policy"] },
                        });
                    }
                    return {
                        success: true,
                        message: "Warranty policy created succesfully",
                    }
                } catch (error: any) {
                    console.error(" Error in createWarrantyPolicyBySuperAdmin resolver:", error);
                    throw new GraphQLError(error, {
                        extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                    });
                }
            } ,

            //to edit warranty policies by admin

            updateWarrantyPolicyByAdmin: async (parent, { input }, { req }, info) => {
                //   await verifySuperAdmin(req);
                try {
                    const warrantyPolicyId: Types.ObjectId = input?.warrantyPolicyId;
                    const name: string | undefined | null = input?.name;
                    const description: string | undefined | null = input?.description;
                    const warrantyType = (input?.warrantyType) as string[];
                    const duration: number | undefined | null = input?.duration;
                   
                    if (!warrantyPolicyId) {
                        throw new GraphQLError("policy id is required", {
                            extensions: { code: "BAD_REQUEST", errors: ["policy id is required"] },
                        });
                    }
                    const existingPolicy = await warrantyPolicyModel.findById(warrantyPolicyId)
                    if (!existingPolicy) {
                        throw new GraphQLError("policy not found", {
                            extensions: { code: "BAD_REQUEST", errors: ["policy not found"] },
                        });
                    }
                    let updatePolicyData: any = {}
                    if (name) {
                        updatePolicyData.name = name
                    }
                    if (description) {
                        updatePolicyData.description = description
                    }
                    if (duration) {
                        updatePolicyData.duration = duration
                    }
                    if (warrantyType) {
                        updatePolicyData.warrantyType = warrantyType
                    }
                    const result = await warrantyPolicyService.updateWarrantyPolicyByAdmin(warrantyPolicyId, updatePolicyData)
                    if (!result) {
                        throw new GraphQLError("Unable to update policy", {
                            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Unable to update policy"] },
                        });
                    }
                    return {
                        success: true,
                        message: "Warranty policy updated succesfully",
                    }
                } catch (error: any) {
                    throw new GraphQLError(error, {
                        extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                    })
                }
            },
            
            //to delete warranty policies by admin

            deleteWarrantyPolicyByAdmin: async (parent, { input }, { req }, info) => {
                //   await verifySuperAdmin(req);
                try {
                    const warrantyPolicyId: Types.ObjectId = input.warrantyPolicyId;
                    if (!warrantyPolicyId) {
                        throw new GraphQLError("Policy id is required", {
                            extensions: { code: "BAD_REQUEST", errors: ["Policy id is required"] },
                        });
                    }
                    const existingPolicy = await warrantyPolicyModel.findById(warrantyPolicyId)
                    if (!existingPolicy) {
                        throw new GraphQLError("Warranty Policy not found", {
                            extensions: { code: "BAD_REQUEST", errors: ["Warranty Policy not found"] },
                        });
                    }
                    
                    const result = await warrantyPolicyService.deleteWarrantyPolicyByAdmin(warrantyPolicyId)
                    if (!result) {
                        throw new GraphQLError("unable to delete warranty policy", {
                            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to delete warranty policy"] },
                        });
                    }
                    return {
                        success: true,
                        message: "warranty policy deleted succesfully",
                    }
                } catch (error: any) {
                    throw new GraphQLError(error, {
                        extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                    })
                }
            },


            //to change status of warranty policy

            updateStatusWarrantyPolicyByAdmin: async (parent, { input }, { req }, info) => {
                //   await verifySuperAdmin(req);
                try {
                    const warrantyPolicyId: Types.ObjectId = input.warrantyPolicyId;
                    const isEnable: boolean = input.isEnable
                    if (!warrantyPolicyId) {
                        throw new GraphQLError("Policy id is required", {
                            extensions: { code: "BAD_REQUEST", errors: ["Policy id is required"] },
                        });
                    }
                    const existingPolicy = await warrantyPolicyModel.findById(warrantyPolicyId)
                    if (!existingPolicy) {
                        throw new GraphQLError("Warranty Policy not found", {
                            extensions: { code: "BAD_REQUEST", errors: ["Warranty Policy not found"] },
                        });
                    }
                    const result = await warrantyPolicyService.updateStatusWarrantyPolicyByAdmin(warrantyPolicyId, isEnable)
                    if (!result) {
                        throw new GraphQLError("unable to update warranty policy status", {
                            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to update warranty policy status"] },
                        });
                    }
                    return {
                        success: true,
                        message: "Warranty policy status updated successfully"
                    }
                } catch (error: any) {
                    throw new GraphQLError(error, {
                        extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                    })
                }
            }
           
        },



    Query: {


        //to get all warranty policies by admin
        getAllWarrantyPoliciesBySuperAdmin: async (parent, { input }, { req }, info) => {
            //   await verifySuperAdmin(req);
            try {
                const page: number = input?.page || 0;
                const size: number = input?.size || 100;
                const options: any = {
                    page: page,
                    size: size
                }
                const matchQuery: any = {};
                if (input?.search) {
                    matchQuery.name = { $regex: input.search, $options: "i" };
                }
                if (input?.isEnable !== undefined) {
                    matchQuery.isEnable = input?.isEnable
                }
                matchQuery.isDeleted = false
                const response = await warrantyPolicyService.getAllWarrantyPoliciesBySuperAdmin(options, matchQuery);
                // console.log("response",response)
                if (!response) {
                    throw new GraphQLError("unable to fetch warranty policies", {
                        extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to fetch warranty policies"] },
                    });
                }
                return {
                    success: true,
                    data: response.records,
                    maxRecords: response.maxRecords
                }
            } catch (error: any) {
                throw new GraphQLError(error, {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                })
            }
        },
        //to get one specific warranty policy

        getWarrantyPolicyByAdmin: async (parent, { input }, { req }, info) => {
            // await verifySuperAdmin(req);
            try {
                const warrantyPolicyId: Types.ObjectId = input.warrantyPolicyId;
                if (!warrantyPolicyId) {
                    throw new GraphQLError("policy id is required", {
                        extensions: { code: "BAD_REQUEST", errors: ["policy id is required"] },
                    });
                }
                const existingPolicy = await warrantyPolicyModel.findById(warrantyPolicyId)
                if (!existingPolicy) {
                    throw new GraphQLError("policy not found", {
                        extensions: { code: "BAD_REQUEST", errors: ["policy not found"] },
                    });
                }
                return existingPolicy;
            } catch (error: any) {
                throw new GraphQLError(error, {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                })
            }
        },

        getDefaultWarrantyPolicyInCategory: async (parent, { input }, { req }, info) => {
            try {

                const result = await warrantyPolicyService.getDefaultWarrantyPolicyInCategory(input?.id)

                return result


            } catch (error: any) {

                throw new GraphQLError(error, {
                    extensions: {
                        code: "INTERNAL_SERVER_ERROR",
                        errors: []
                    },
                });
            }
        },


        getDefaultWarrantyPolicyInProduct: async (parent, { input }, { req }, info) => {


            try {

                const result = await warrantyPolicyService.getDefaultWarrantyPolicyInProduct(input?.brandId, input?.categoryId)

                return result;

            } catch (error: any) {


                throw new GraphQLError(error, {
                    extensions: {
                        code: "INTERNAL_SERVER_ERROR",
                        errors: []
                    },
                });

            }
        }


       }



}