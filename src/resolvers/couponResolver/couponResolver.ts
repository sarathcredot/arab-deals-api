import { jwtService, spaceService, otpService, deliveryAgentService, orderProductService ,coupenService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor, verifyDeliveryAgent } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";
import { deliveryAgentModel } from "../../models/deliveryAgentModel";
import { error } from "console";





export const couponResolver: Resolvers = {
     Upload: GraphQLUpload,
     Mutation:{

          // admin edit coupen 

          adminSuspendTheCupone:async(parent, {input}, { req }, info)=>{

                   try {

                       const options={

                          _id:input?._id,
                          isActive:input?.isActive || undefined
                       }

                       await coupenService.adminSuspendTheCupone(options)

                       return {
                          status:true,
                          msg:"Coupen successfully suspended "
                       }

                    
                   } catch (error:any) {

                    throw new GraphQLError("Coupen suspended Failed " ,{
                         extensions: {
                           code: "INTERNAL_SERVER_ERROR",
                           errors: [],
                         },
                       });
                     
                   }
          }


          
     }, 
     Query:{

          // get all coupens in admin portl 
        
          getAllCoupenToAdmin:async(parent, {input }, { req }, info)=>{

               // admin verfy

               await verifyAdmin(req)

                try {
                   
                    const page: number = input?.page || 0;
                    const size: number = input?.size || 10;
                       const options:any={
                         page:page ,
                         size:size,
                        
                       }

                       if(input.isActive)options.isActive=input.isActive
                       if(input.startDate)options.startDate=input.startDate
                       if(input.expiryDate)options.expiryDate=input.expiryDate

                    const result= await coupenService.getAllCoupenToAdmin(options)
                    return result

                          
                    
                } catch (error) {
                    
                   
                      
                }
                 
                  
          }       
     }
}