import { jwtService, spaceService, otpService, deliveryAgentService, orderProductService, couponService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor, verifyDeliveryAgent, verifyUser } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";
import { deliveryAgentModel } from "../../models/deliveryAgentModel";
import { error } from "console";
import { couponsModel } from ".././../models/couponsModel";





export const couponResolver: Resolvers = {


  Upload: GraphQLUpload,

  Mutation: {
    createCouponsByAdmin: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);
      try {
        let name: string = input.name
        let code: string = input.code
        let description: string | null | undefined = input?.description;
        // let couponType: string = input.couponType 
        let discountType: string = input.discountType
        let couponApplicableType: string | null | undefined = input?.couponApplicableType
        let discountValue: number | null | undefined = input?.discountValue
        let orderCount: number | null | undefined = input?.orderCount
        let max_discount: number | null | undefined = input?.max_discount;
        let minOrderAmount: number | null | undefined = input?.minOrderAmount;
        let validCategories: couponService.ICategory[] | null | undefined = input?.validCategories as couponService.ICategory[] | null | undefined;
        let validProducts: couponService.IProduct[] | null | undefined = input?.validProducts as couponService.IProduct[] | null | undefined;
        let validUsers: couponService.IUser[] | null | undefined = input?.validUsers as couponService.IUser[] | null | undefined;
        let validBrands: couponService.IBrand[] | null | undefined = input?.validBrands as couponService.IBrand[] | null | undefined;
        let usageLimit: number | null | undefined = input?.usageLimit;
        let usagePerUserLimit: number | null | undefined = input?.usagePerUserLimit;
        let startDate: Date = input?.startDate
        let expiryDate: Date = input?.expiryDate


        const existingCoupon = await couponsModel.findOne({ code: code });

        if (existingCoupon) {
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

      } catch (error: any) {
        console.error("Error in createCouponsByAdmin:", error);
        throw new GraphQLError(error, {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },

    // admin edit coupen 

    adminSuspendTheCupone: async (parent, { input }, { req }, info) => {

      try {

        console.log(input)

        const options = {

          _id: input?._id,
          isActive: input?.isActive
        }

        await couponService.adminSuspendTheCupone(options)

        return {
          status: true,
          msg: "Coupen status updated successfully"
        }


      } catch (error: any) {

        throw new GraphQLError("Coupen suspended Failed ", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });

      }
    },

    // delete coupon by admin

    adminDeleteTheCoupon: async (parent, { input }, { req }, info) => {

      try {

        await couponService.adminDeleteTheCoupon(input?._id)

        return {
          status: true,
          msg: "Coupon deleted successfully "
        }

      } catch (error) {

        throw new GraphQLError("Coupen delete Failed ", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });

      }
    }




  },

  Query: {

    // get all coupens in admin portl 

    getAllCoupenToAdmin: async (parent, { input }, { req }, info) => {

      // console.log("error")
      console.log("input",input)

      // admin verfy

      //  await verifyAdmin(req)

      try {

        const page: number = input?.page || 0;
        const size: number = input?.size || 10;
        const options: any = {
          page: page,
          size: size,

        }

        if (input.isActive) options.isActive = input.isActive
        if (input.startDate) options.startDate = input.startDate
        if (input.expiryDate) options.expiryDate = input.expiryDate
        if(input.search) options.search=input.search

        const result = await couponService.getAllCoupenToAdmin(options)


        return result


      } catch (error: any) {


        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });
      }


    },

    getOneCouponDetails:async(parent, { input }, { req }, info)=>{

         
              try {

               const result = await couponService.getOneCouponDetails(input?._id)

               console.log(result)
               
               return result
                
              } catch (error:any) {
                
                throw new GraphQLError(error, {
                  extensions: {
                    code: "INTERNAL_SERVER_ERROR",
                    errors: [],
                  },
                });
                    
              }
    },

    
    
    // get coupons by user in web 
    getCouponsByUser: async (parent, {  }, { req }, info) => {

      // user verfy

      await verifyUser(req)


      try {


        const result = await couponService.getCouponsByUser(req.authAccount._id)

        console.log("user coupons",result)

        return result;

      } catch (error:any) {

        throw new GraphQLError(error,{
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });


      }
    },


    // get coupons by user in mobile

    getCouponsByUserMobile: async (parent, {  }, { req }, info) => {

      // user verfy

      await verifyUser(req)


      try {


        const result = await couponService.getCouponsByUser(req.authAccount._id)

        console.log("user coupons",result)

        return result;

      } catch (error:any) {

        throw new GraphQLError(error,{
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });


      }
    },





  },

 



}








