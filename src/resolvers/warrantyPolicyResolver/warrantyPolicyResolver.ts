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
            //to create of warranty policies by admin
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
        },
        // Query: {
        
        
        //     }

    
}