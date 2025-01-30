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
import { startOfDay, endOfDay, max } from "date-fns"
import path from "path";
import fs from "fs";
import { roleModel } from "../../models/roleModel";

export const roleResolver: Resolvers = {

    Upload: GraphQLUpload,
    Mutation:{

        //to create different sub admin roles by super admin
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
       },

       //to update different sub admin roles by super admin
       updateRoleBySuperAdmin:async(parent,{input},{req},info)=>{
        //   await verifySuperAdmin(req);
        try {
            const roleId:Types.ObjectId=input.roleId;
            const name:string |undefined |null=input?.name;
            const description:string |undefined|null=input?.description;
            const permissions = (input?.permissions) as string[];

            if(!roleId){
                throw new GraphQLError("role id is required", {
                    extensions: { code: "BAD_REQUEST", errors: ["role id is required"] },
                });
            }

            const existingRole = await roleModel.findById(roleId)

            if(!existingRole){
                throw new GraphQLError("role not found", {
                    extensions: { code: "BAD_REQUEST", errors: ["role not found"] },
                });
             }


             let updateRoleData :any={}
             if(name){
                updateRoleData.name=name
             }

             if(description){
                updateRoleData.description=description
             }

             if(permissions){
                updateRoleData.permissions=permissions
             }


             const result=await roleService.updateRoleBySuperAdmin(roleId,updateRoleData)

            if(!result){
                throw new GraphQLError("unable to update role", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to update role"] },
                });
            }

            return {
                success: true,
                message: "admin role updated succesfully",
            }
        

        } catch (error:any) {
            throw new GraphQLError(error, {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
            })
        }
       },
       
       //to delete sub admin roles by super admin
       deleteRoleBySuperAdmin:async(parent,{input},{req},info)=>{
        //   await verifySuperAdmin(req);
        try {
            const roleId:Types.ObjectId=input.roleId;

            if(!roleId){
                throw new GraphQLError("role id is required", {
                    extensions: { code: "BAD_REQUEST", errors: ["role id is required"] },
                });
            }

            const existingRole = await roleModel.findById(roleId)

            if(!existingRole){
                throw new GraphQLError("role not found", {
                    extensions: { code: "BAD_REQUEST", errors: ["role not found"] },
                });
             }


             const result=await roleService.deleteRoleBySuperAdmin(roleId)

            if(!result){
                throw new GraphQLError("unable to delete role", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to delete role"] },
                });
            }


            return {
                success: true,
                message: "admin role deleted succesfully",
            }

        } catch (error:any) {
            throw new GraphQLError(error, {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
            })
        }
       },

       //toggle status of sub admin roles by super admin

       updateStatusRoleBySuperAdmin:async(parent,{input},{req},info)=>{
        //   await verifySuperAdmin(req);
        try {

            const roleId:Types.ObjectId=input.roleId;
            const isEnable:boolean=input.isEnable

            if(!roleId){
                throw new GraphQLError("role id is required", { 
                    extensions: { code: "BAD_REQUEST", errors: ["role id is required"] },
                });
            }

            const existingRole = await roleModel.findById(roleId)

            if(!existingRole){
                throw new GraphQLError("role not found", {
                    extensions: { code: "BAD_REQUEST", errors: ["role not found"] },
                });
             }

             const result =await roleService.updateStatusRoleBySuperAdmin(roleId,isEnable)
             if(!result){
                throw new GraphQLError("unable to update role status", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to update role status"] },
                });
             }

             return {
                success:true,
                message:"role status updated successfully"
             }

        } catch (error:any) {
            throw new GraphQLError(error, {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
            })
        }
       }

    },
    Query:{

        //to get one specific role by super admin
        getRoleBySuperAdmin:async(parent,{input},{req},info)=>{
            // await verifySuperAdmin(req);
            try {

                const roleId:Types.ObjectId=input.roleId;

                if(!roleId){
                    throw new GraphQLError("role id is required", {
                        extensions: { code: "BAD_REQUEST", errors: ["role id is required"] },
                    });
                }

                const existingRole = await roleModel.findById(roleId)

                if(!existingRole){
                    throw new GraphQLError("role not found", {
                        extensions: { code: "BAD_REQUEST", errors: ["role not found"] },
                    });
                }

              return existingRole;
            } catch (error:any) {
                throw new GraphQLError(error, {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                })
            }
        },

        //to get all roles by super admin

        getAllRolesBySuperAdmin:async(parent,{input},{req},info)=>{
            // await verifySuperAdmin(req);
            try {

            const page:number=input?.page || 0;
            const size:number=input?.size || 100;

            const options:any={
                page:page,
                size:size
            }
            
            const matchQuery:any={};

            if (input?.search) {
                matchQuery.name = { $regex: input.search, $options: "i" };
            }

            if(input?.isEnable !== undefined){
                matchQuery.isEnable=input?.isEnable
            }


             const response =await roleService.getAllRolesBySuperAdmin(options,matchQuery);

             if(!response){
                throw new GraphQLError("unable to fetch roles", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to fetch roles"] },    
                });
             }


             return {
                success:true,
                data:response.records,
                maxRecords:response.maxRecords
             }

            } catch (error:any) {
                throw new GraphQLError(error, {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                })
            }
        }


    }
}