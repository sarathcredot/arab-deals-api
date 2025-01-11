
import { Schema, model, Types } from "mongoose";
import { collections } from "../configs";


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
           discountType: {
            type: String,
            enum: ["PERCENTAGE", "FLAT","FREE_SHIPPING"],                  //flat for fixed amount
            required: true,
           },
           couponApplicableType:{
            type: String,
            enum: ["BRAND","PRODUCT","CATEGORY"],         
           },
           discountValue: {
            type: Number,
           },
           max_discount: {                            //Optional, for percentage coupons
            type: Number,
           },
           minOrderAmount: {
            type: Number,
           },
           validCategories: [
            {
              category: {
                type: Types.ObjectId,
                ref: "categories",
              },
              _id: false, 
            }
          ],
          
          validProducts: [
            {
              product: {
                type: Types.ObjectId,
                ref: "products",
              },
              _id: false, 
            }
          ],
          validBrands: [
            {
              brand: {
                type: Types.ObjectId,
                ref: "brands",
              },
              _id: false, 
            }
          ],
          validUsers: [
            {
              user: {
                type: Types.ObjectId,
                ref: "users",
              },
              _id: false, 
            }
          ],
           usageLimit: {
            type: Number,                        //maximum number of times a coupon can be used
           },
           orderCount: {
             type: Number,
           },
           usagePerUserLimit: {
            type: Number,                       //maximum number of times a coupon can be used by a user  
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
  
  


 //  couponType: {
          //   type: String,
          //   enum: ["PRIVATE","GLOBAL","FIRST_ORDER","FESTIVE_SALE"],   //flat for fixed amount
          //   required: true,
          //  },