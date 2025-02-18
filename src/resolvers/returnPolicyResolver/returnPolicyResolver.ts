import { jwtService, spaceService, otpService, deliveryAgentService, orderProductService, roleService, returnPolicyService } from "../../services";
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


export const returnPolicyResolver: Resolvers = {

    Upload: GraphQLUpload,

    // Mutation: {

    //     //to create of return policies by admin
    //     createReturnPolicyBySuperAdmin: async (parent, { input }, { req }, info) => {
    //         //   await verifySuperAdmin(req);
    //         try {

    //             console.log("🚀 createReturnPolicyBySuperAdmin called with input:", input);
    //             const name: string = input.name;
    //             const description: string | undefined | null = input?.description;
    //             const conditions = (input?.conditions || []) as string[];
    //             const duration = input.duration

    //             if (!name) {
    //                 console.log("❌ Missing name");
    //                 throw new GraphQLError("name is required", {
    //                     extensions: { code: "BAD_REQUEST", errors: ["name is required"] },
    //                 });
    //             }

    //             if (!duration || duration <= 0) {
    //                 console.log("❌ Invalid duration:", duration);
    //                 throw new GraphQLError("Return period must be a positive number", {
    //                     extensions: { code: "BAD_REQUEST", errors: ["Return period must be valid"] },
    //                 });
    //             }

    //             const existingReturnPolicy = await returnPolicyModel.findOne({ name })

    //             if (existingReturnPolicy) {
    //                 console.log("❌ Policy with this name already exists:", name);
    //                 throw new GraphQLError("policy with this name already exists", {
    //                     extensions: { code: "BAD_REQUEST", errors: ["policy with this name already exists!!Try another name"] },
    //                 });
    //             }

    //             let newReturnPolicyData: returnPolicyService.IReturnPolicy = {
    //                 name,
    //                 description,
    //                 conditions,
    //                 duration
    //             }

    //             console.log("✅ Creating return policy with data:", newReturnPolicyData);


    //             const newReturnPolicy = await returnPolicyService.createReturnPolicyBySuperAdmin(newReturnPolicyData)

    //             if (!newReturnPolicy) {
    //                 console.log("❌ Failed to save return policy to DB");
    //                 throw new GraphQLError("unable to create return policy", {
    //                     extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to create return policy"] },
    //                 });
    //             }

    //             return {
    //                 success: true,
    //                 message: "return policy created succesfully",
    //             }

    //         } catch (error: any) {
    //             console.error("🔥 Error in createReturnPolicyBySuperAdmin resolver:", error);
    //             throw new GraphQLError(error, {
    //                 extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
    //             });
    //         }
    //     },

    //     // to update return policy

    //     updateReturnPolicyByAdmin: async (parent, { input }, { req }, info) => {
    //         //   await verifySuperAdmin(req);
    //         try {
    //             const returnPolicyId: Types.ObjectId = input?.returnPolicyId;
    //             const name: string | undefined | null = input?.name;
    //             const description: string | undefined | null = input?.description;
    //             const conditions = (input?.conditions) as string[];
    //             const duration: number | undefined | null = input?.duration

    //             if (!returnPolicyId) {
    //                 throw new GraphQLError("policy id is required", {
    //                     extensions: { code: "BAD_REQUEST", errors: ["policy id is required"] },
    //                 });
    //             }

    //             const existingPolicy = await returnPolicyModel.findById(returnPolicyId)

    //             if (!existingPolicy) {
    //                 throw new GraphQLError("policy not found", {
    //                     extensions: { code: "BAD_REQUEST", errors: ["policy not found"] },
    //                 });
    //             }


    //             let updatePolicyData: any = {}
    //             if (name) {
    //                 updatePolicyData.name = name
    //             }

    //             if (description) {
    //                 updatePolicyData.description = description
    //             }

    //             if (conditions) {
    //                 updatePolicyData.conditions = conditions
    //             }

    //             if (duration) {
    //                 updatePolicyData.duration = duration
    //             }


    //             const result = await returnPolicyService.updateReturnPolicyByAdmin(returnPolicyId, updatePolicyData)

    //             if (!result) {
    //                 throw new GraphQLError("Unable to update policy", {
    //                     extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Unable to update policy"] },
    //                 });
    //             }

    //             return {
    //                 success: true,
    //                 message: "Return policy updated succesfully",
    //             }


    //         } catch (error: any) {
    //             throw new GraphQLError(error, {
    //                 extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
    //             })
    //         }
    //     },


    //     //delete return policy by admin

    //     deleteReturnPolicyByAdmin: async (parent, { input }, { req }, info) => {
    //         //   await verifySuperAdmin(req);
    //         try {
    //             const returnPolicyId: Types.ObjectId = input.returnPolicyId;

    //             if (!returnPolicyId) {
    //                 throw new GraphQLError("Policy id is required", {
    //                     extensions: { code: "BAD_REQUEST", errors: ["Policy id is required"] },
    //                 });
    //             }

    //             const existingPolicy = await returnPolicyModel.findById(returnPolicyId)

    //             if (!existingPolicy) {
    //                 throw new GraphQLError("Return Policy not found", {
    //                     extensions: { code: "BAD_REQUEST", errors: ["Return Policy not found"] },
    //                 });
    //             }


    //             const result = await returnPolicyService.deleteReturnPolicyByAdmin(returnPolicyId)

    //             if (!result) {
    //                 throw new GraphQLError("unable to delete return policy", {
    //                     extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to delete return policy"] },
    //                 });
    //             }


    //             return {
    //                 success: true,
    //                 message: "return policy deleted succesfully",
    //             }

    //         } catch (error: any) {
    //             throw new GraphQLError(error, {
    //                 extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
    //             })
    //         }
    //     },

    //     //to change status of return policy


    //     updateStatusReturnPolicyByAdmin: async (parent, { input }, { req }, info) => {
    //         //   await verifySuperAdmin(req);
    //         try {

    //             const returnPolicyId: Types.ObjectId = input.returnPolicyId;
    //             const isEnable: boolean = input.isEnable

    //             if (!returnPolicyId) {
    //                 throw new GraphQLError("Policy id is required", {
    //                     extensions: { code: "BAD_REQUEST", errors: ["Policy id is required"] },
    //                 });
    //             }

    //             const existingPolicy = await returnPolicyModel.findById(returnPolicyId)

    //             if (!existingPolicy) {
    //                 throw new GraphQLError("Return Policy not found", {
    //                     extensions: { code: "BAD_REQUEST", errors: ["Return Policy not found"] },
    //                 });
    //             }
    //             const result = await returnPolicyService.updateStatusReturnPolicyByAdmin(returnPolicyId, isEnable)
    //             if (!result) {
    //                 throw new GraphQLError("unable to update return policy status", {
    //                     extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to update return policy status"] },
    //                 });
    //             }

    //             return {
    //                 success: true,
    //                 message: "Return policy status updated successfully"
    //             }

    //         } catch (error: any) {
    //             throw new GraphQLError(error, {
    //                 extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
    //             })
    //         }
    //     },



    // },

    Mutation: {
        //to create of return policies by admin
        createReturnPolicyBySuperAdmin: async (parent, { input }, { req }, info) => {
            //   await verifySuperAdmin(req);
            try {
                console.log(":rocket: createReturnPolicyBySuperAdmin called with input:", input);
                const name: string = input.name;
                const description: string | undefined | null = input?.description;
                // const conditions = (input?.conditions || []) as string[];
                const duration = input.duration
                const returnCharge: number | undefined | null = input?.returnCharge
                if (!name) {
                    throw new GraphQLError("name is required", {
                        extensions: { code: "BAD_REQUEST", errors: ["name is required"] },
                    });
                }
                if (!duration || duration <= 0) {
                    throw new GraphQLError("Return period must be a positive number", {
                        extensions: { code: "BAD_REQUEST", errors: ["Return period must be valid"] },
                    });
                }
                const existingReturnPolicy = await returnPolicyModel.findOne({ name })
                if (existingReturnPolicy) {
                    throw new GraphQLError("policy with this name already exists", {
                        extensions: { code: "BAD_REQUEST", errors: ["policy with this name already exists!!Try another name"] },
                    });
                }
                let newReturnPolicyData: returnPolicyService.IReturnPolicy = {
                    name,
                    description,
                    // conditions,
                    duration,
                    returnCharge
                }
                console.log(":white_check_mark: Creating return policy with data:", newReturnPolicyData);
                const newReturnPolicy = await returnPolicyService.createReturnPolicyBySuperAdmin(newReturnPolicyData)
                if (!newReturnPolicy) {
                    console.log(":x: Failed to save return policy to DB");
                    throw new GraphQLError("unable to create return policy", {
                        extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to create return policy"] },
                    });
                }
                return {
                    success: true,
                    message: "return policy created succesfully",
                }
            } catch (error: any) {
                console.error(":fire: Error in createReturnPolicyBySuperAdmin resolver:", error);
                throw new GraphQLError(error, {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                });
            }
        },
        // to update return policy
        updateReturnPolicyByAdmin: async (parent, { input }, { req }, info) => {
            //   await verifySuperAdmin(req);
            try {
                const returnPolicyId: Types.ObjectId = input?.returnPolicyId;
                const name: string | undefined | null = input?.name;
                const description: string | undefined | null = input?.description;
                // const conditions = (input?.conditions) as string[];
                const duration: number | undefined | null = input?.duration;
                const returnCharge: number | undefined | null = input?.returnCharge;
                if (!returnPolicyId) {
                    throw new GraphQLError("policy id is required", {
                        extensions: { code: "BAD_REQUEST", errors: ["policy id is required"] },
                    });
                }
                const existingPolicy = await returnPolicyModel.findById(returnPolicyId)
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
                //  if(conditions){
                //     updatePolicyData.conditions=conditions
                //  }
                if (duration) {
                    updatePolicyData.duration = duration
                }
                if (returnCharge) {
                    updatePolicyData.returnCharge = returnCharge
                }
                const result = await returnPolicyService.updateReturnPolicyByAdmin(returnPolicyId, updatePolicyData)
                if (!result) {
                    throw new GraphQLError("Unable to update policy", {
                        extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Unable to update policy"] },
                    });
                }
                return {
                    success: true,
                    message: "Return policy updated succesfully",
                }
            } catch (error: any) {
                throw new GraphQLError(error, {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                })
            }
        },
        //delete return policy by admin
        deleteReturnPolicyByAdmin: async (parent, { input }, { req }, info) => {
            //   await verifySuperAdmin(req);
            try {
                const returnPolicyId: Types.ObjectId = input.returnPolicyId;
                if (!returnPolicyId) {
                    throw new GraphQLError("Policy id is required", {
                        extensions: { code: "BAD_REQUEST", errors: ["Policy id is required"] },
                    });
                }
                const existingPolicy = await returnPolicyModel.findById(returnPolicyId)
                if (!existingPolicy) {
                    throw new GraphQLError("Return Policy not found", {
                        extensions: { code: "BAD_REQUEST", errors: ["Return Policy not found"] },
                    });
                }
                const defaultReturnPolicy = await shippingConfigModel.find({ defaultReturnPolicy: returnPolicyId })
                if (defaultReturnPolicy.length > 0) {
                    throw new GraphQLError("unable to delete default return policy", {
                        extensions: { code: "BAD_REQUEST", errors: ["unable to delete default return policy"] },
                    });
                }
                const result = await returnPolicyService.deleteReturnPolicyByAdmin(returnPolicyId)
                if (!result) {
                    throw new GraphQLError("unable to delete return policy", {
                        extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to delete return policy"] },
                    });
                }
                return {
                    success: true,
                    message: "return policy deleted succesfully",
                }
            } catch (error: any) {
                throw new GraphQLError(error, {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                })
            }
        },
        //to change status of return policy
        updateStatusReturnPolicyByAdmin: async (parent, { input }, { req }, info) => {
            //   await verifySuperAdmin(req);
            try {
                const returnPolicyId: Types.ObjectId = input.returnPolicyId;
                const isEnable: boolean = input.isEnable
                if (!returnPolicyId) {
                    throw new GraphQLError("Policy id is required", {
                        extensions: { code: "BAD_REQUEST", errors: ["Policy id is required"] },
                    });
                }
                const existingPolicy = await returnPolicyModel.findById(returnPolicyId)
                if (!existingPolicy) {
                    throw new GraphQLError("Return Policy not found", {
                        extensions: { code: "BAD_REQUEST", errors: ["Return Policy not found"] },
                    });
                }
                const result = await returnPolicyService.updateStatusReturnPolicyByAdmin(returnPolicyId, isEnable)
                if (!result) {
                    throw new GraphQLError("unable to update return policy status", {
                        extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to update return policy status"] },
                    });
                }
                return {
                    success: true,
                    message: "Return policy status updated successfully"
                }
            } catch (error: any) {
                throw new GraphQLError(error, {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                })
            }
        }
    },






    Query: {

        //to get one specific policy
        getReturnPolicyByAdmin: async (parent, { input }, { req }, info) => {
            // await verifySuperAdmin(req);
            try {
                const returnPolicyId: Types.ObjectId = input.returnPolicyId;
                if (!returnPolicyId) {
                    throw new GraphQLError("policy id is required", {
                        extensions: { code: "BAD_REQUEST", errors: ["policy id is required"] },
                    });
                }
                const existingPolicy = await returnPolicyModel.findById(returnPolicyId)
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
        //to get all return policies
        getAllPoliciesBySuperAdmin: async (parent, { input }, { req }, info) => {
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
                const response = await returnPolicyService.getAllPoliciesBySuperAdmin(options, matchQuery);
                // console.log("response",response)
                if (!response) {
                    throw new GraphQLError("unable to fetch return policies", {
                        extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to fetch return policies"] },
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

        getDefaultReturnPolicyInCategory: async (parent, { input }, { req }, info) => {


            try {

                //   await verifyAdmin(req)

                await returnPolicyService.getDefaultReturnPolicyInCategory(input?.id)

                return true


            } catch (error: any) {

                throw new GraphQLError(error, {
                    extensions: {
                        code: "INTERNAL_SERVER_ERROR",
                        errors: []
                    },
                });
            }
        },


        getDefaultReturnPolicyInProduct: async (parent, { input }, { req }, info) => {

            try {



                return true

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