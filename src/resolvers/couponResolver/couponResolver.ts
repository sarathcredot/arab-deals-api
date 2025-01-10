import { jwtService, spaceService, otpService, deliveryAgentService, orderProductService,couponService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor, verifyDeliveryAgent } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";
import { deliveryAgentModel } from "../../models/deliveryAgentModel";
import { error } from "console";
import { couponsModel } from ".././../models/couponsModel";





export const couponResolver: Resolvers = {
     Upload: GraphQLUpload,
     Mutation:{
        createCouponsByAdmin: async (parent, { input }, { req }, info) => {
            // await verifyAdmin(req);
            try {
              let name: string = input.name
              let code: string = input.code 
              let description: string |null |undefined = input?.description ;
              // let couponType: string = input.couponType 
              let discountType: string = input.discountType 
              let couponApplicableType: string |null |undefined = input?.couponApplicableType
              let discountValue: number | null | undefined = input?.discountValue 
              let orderCount: number | null | undefined  = input?.orderCount 
              let max_discount: number | null | undefined = input?.max_discount;
              let minOrderAmount: number | null | undefined = input?.minOrderAmount ;
              let validCategories: couponService.ICategory[] | null | undefined = input?.validCategories as couponService.ICategory[] | null | undefined;
              let validProducts: couponService.IProduct[] | null | undefined = input?.validProducts as couponService.IProduct[] | null | undefined;
              let validUsers: couponService.IUser[] | null | undefined = input?.validUsers as couponService.IUser[] | null | undefined;
              let validBrands: couponService.IBrand[] | null | undefined = input?.validBrands as couponService.IBrand[] | null | undefined;
              let usageLimit: number| null | undefined = input?.usageLimit ;
              let usagePerUserLimit: number|  null | undefined = input?.usagePerUserLimit ;
              let startDate: Date = input?.startDate 
              let expiryDate: Date = input?.expiryDate 
              

            const existingCoupon = await couponsModel.findOne({ code: code });  
            
            if(existingCoupon){
                throw new GraphQLError("Coupon code already exists,Try another code", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Coupon code already exists"] },
                  });
            }


            // Validate discountType and max_discount
            
            if (discountType === "PERCENTAGE" && !max_discount) {
                throw new GraphQLError("max_discount is required for percentage-based discounts.", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["max_discount is required for percentage-based discounts."] },
                });
            }
                

             // Validate dates
            if (startDate && expiryDate && new Date(startDate) >= new Date(expiryDate)) {
                throw new GraphQLError("expiryDate must be after startDate.", {
                    extensions: { code: "INTERNAL_SERVER_ERROR" },
                  });
            }

            
            let newCouponData = {
                    name,
                    code,
                    description,
                    // couponType,
                    orderCount,
                    discountType,
                    couponApplicableType,
                    discountValue,
                    max_discount,
                    minOrderAmount,
                    validCategories,
                    validProducts,
                    validBrands,
                    validUsers,
                    usageLimit,
                    usagePerUserLimit,
                    startDate,
                    expiryDate
              };
      
              const result = await couponService.createCouponsByAdmin(newCouponData);
              console.log(result)
      
              if (!result) {
                throw new GraphQLError("Unable to create coupons!!Try again", {
                  extensions: { code: "INTERNAL_SERVER_ERROR" },
                });
              }
   
              return {
                success: true,
                message: "Coupon created successfully.",
              };

            } catch (error:any) {
                console.error("Error in createCouponsByAdmin:", error);
                throw new GraphQLError(error, {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
              });
            }
        },
        
     },

    }