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


export const returnPolicyResolver: Resolvers = {

    Upload: GraphQLUpload,
    Mutation:{
        createReturnPolicyBySuperAdmin:async(parent,{input},{req},info)=>{
            //   await verifySuperAdmin(req);
              try {

                console.log("🚀 createReturnPolicyBySuperAdmin called with input:", input);
                const name:string=input.name;
                const description:string |undefined|null=input?.description;
                const conditions = (input?.conditions || []) as string[];
                const duration = input.duration

                if(!name){
                    console.log("❌ Missing name");
                    throw new GraphQLError("name is required", {
                        extensions: { code: "BAD_REQUEST", errors: ["name is required"] },
                    });
                }

                if (!duration || duration <= 0) {
                    console.log("❌ Invalid duration:", duration);
                    throw new GraphQLError("Return period must be a positive number", {
                        extensions: { code: "BAD_REQUEST", errors: ["Return period must be valid"] },
                    });
                }
            
                const existingReturnPolicy=await returnPolicyModel.findOne({name})

                if(existingReturnPolicy){
                    console.log("❌ Policy with this name already exists:", name);
                    throw new GraphQLError("policy with this name already exists", {
                        extensions: { code: "BAD_REQUEST", errors: ["policy with this name already exists!!Try another name"] },
                    });
                }

                let newReturnPolicyData:returnPolicyService.IReturnPolicy={
                     name,
                     description,
                     conditions,
                     duration 
                }

                console.log("✅ Creating return policy with data:", newReturnPolicyData);


                const newReturnPolicy=await returnPolicyService.createReturnPolicyBySuperAdmin(newReturnPolicyData)

                if(!newReturnPolicy){
                    console.log("❌ Failed to save return policy to DB");
                    throw new GraphQLError("unable to create return policy", {
                        extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to create return policy"] },
                    });
                }
    
                return {
                    success: true,
                    message: "return policy created succesfully",
                }
                
              } catch (error:any) {
                console.error("🔥 Error in createReturnPolicyBySuperAdmin resolver:", error);
                throw new GraphQLError(error, {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
            });
              }
        },
      
    }
}