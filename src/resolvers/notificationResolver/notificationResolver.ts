

import { jwtService, spaceService, otpService, deliveryAgentService, orderProductService, roleService ,notificationService} from "../../services";

import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor, verifyDeliveryAgent, verifySuperAdmin ,verifyUser} from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";
import { error } from "console";
import moment from "moment";
import { finished } from "stream/promises";
import { startOfDay, endOfDay, max } from "date-fns"
import path from "path";
import fs from "fs";
import { notificationModel } from "../../models/notificationModel"






export const notificationResolver: Resolvers = {


    Mutation: {

        addNotificationViewPersonId:async(parent,{input},{req},info)=>{

            
             await verifyAdmin(req)

                   try {

                    const options={
                        id:input.id,
                        notificationId:input.notificationId

                    }

                      notificationService.addNotificationViewPersonId(options)

                      return{
                        
                           status:true,
                           msg:""

                      }
                    
                   } catch (error:any){
                    
                    throw new GraphQLError(error, {
                        extensions: {
                          code: "INTERNAL_SERVER_ERROR",
                          errors: []
                        },
                      });
                         
                   }
        } 
    },

    
    Query:{

      getAllNotification:async(parent,{},{req},info)=>{

          await verifyAdmin(req)
          
           try {


            const token=await jwtService.getAuthTokenFromHeaders(req)
            const decodeToken= await jwtService.verifyAdminJWT(token)

            console.log("decode token",decodeToken)
 
               const result=await notificationService.getAllNotification()

               return result
              
            } catch (error:any) {
            
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






