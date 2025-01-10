
import { Schema, model, Types } from "mongoose";
import { collections } from "../configs";
import { dashboardResolver } from "src/resolvers/dashboardResolver/dashboardResolver";

const couponSchema = new Schema(
        {
          name:{
            type: String,
            required: true,
          },
          code:{
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
          },
           description: {
            type: String,
           },
           couponType: {
            type: String,
            enum: ["USER_SPECIFIC","GLOBAL","FIRST_ORDER","FESTIVE_SALE"],   //flat for fixed amount
            required: true,
           },
           discountType: {
            type: String,
            enum: ["PERCENTAGE", "FLAT"],                  //flat for fixed amount
            required: true,
           },
           couponApplicableType:{
            type: String,
            enum: ["ORDER","SHIPPING","CATOGORY"],
            required: true,
           },
           discountValue: {
            type: Number,
            required: true,
           },
           max_discount: {                            //Optional, for percentage coupons
            type: Number,
           },
           minOrderAmount: {
            type: Number,
           },
           validCatogories: [
            {
               catogory:{
                    type: [Types.ObjectId],
                    ref: "categories",
                },
            }
           ],
           validProducts: [
            {
                products:{
                    type: [Types.ObjectId],
                    ref: "products",
                }
            }
           ],
           validUsers:[
                {
                user:{
                    type: Types.ObjectId,
                    ref: "users",
                }
                }
           ],
           usageLimit: {
            type: Number,                        //maximum number of times a coupon can be used
            default: 0
           },
           usagePerUserLimit: {
            type: Number, 
            default:1                       //maximum number of times a coupon can be used by a user  
           },
           startDate: {
            type: Date,
           },
           expiryDate: {
            type: Date,
           },
           isActive: {
            type: Boolean,
            required: true,
            default: true
           },
           userUsage: [
            {
              userId: {
                type: Types.ObjectId,
                ref: "users",
              },
              usageCount: {
                type: Number,
                default: 0,
              },
            },
          ],   
    },
        {
            timestamps: true,
        }
); 




const couponsModel = model(collections.COUPONS, couponSchema);

export { couponsModel };
  
  