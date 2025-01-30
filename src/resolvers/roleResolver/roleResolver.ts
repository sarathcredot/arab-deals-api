import { jwtService, spaceService, otpService, deliveryAgentService, orderProductService, roleService } from "../../services";

import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor, verifyDeliveryAgent, verifySuperAdmin } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";
import { error } from "console";
import moment from "moment";
import { finished } from "stream/promises";
import { startOfDay, endOfDay } from "date-fns"
import path from "path";
import fs from "fs";
import { roleModel } from "../../models/roleModel";

export const roleResolver: Resolvers = {

    Upload: GraphQLUpload,
    Mutation:{
       createRoleBySuperAdmin:async(parent,{input},{req},info)=>{
        //   await verifySuperAdmin(req);
          try {
            const name:string=input.name;
            const description:string |undefined|null=input?.description;
            const permissions = (input?.permissions || []) as string[];


            if(!name){
                throw new GraphQLError("name is required", {
                    extensions: { code: "BAD_REQUEST", errors: ["name is required"] },
                });
            }


            const existingRole = await roleModel.findOne({ name }).select("name");

            if(existingRole){
                throw new GraphQLError("role already exists", {
                    extensions: { code: "BAD_REQUEST", errors: ["role already exists"] },
                });
            }


            let newRoleData:roleService.IRole={
                name,
                description,
                permissions
            }


            const result=await roleService.createRoleBySuperAdmin(newRoleData)

            if(!result){
                throw new GraphQLError("unable to create role", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to create role"] },
                });
            }

            return {
                success: true,
                message: "admin role created succesfully",
            }
            
          } catch (error:any) {
            console.error("Error in create role resolver:", error);
            throw new GraphQLError(error, {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
          }
       }
   
  }
}