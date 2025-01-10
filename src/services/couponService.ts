import { couponsModel } from "../models/couponsModel";
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, } from "mongoose";
import { collections } from "../configs";
import { startOfDay, endOfDay } from "date-fns"



  export interface ICategory {
    category?: Types.ObjectId;
  }
  
  export interface IProduct {
    product?: Types.ObjectId;
  }
  
  export interface IUser {
    user?: Types.ObjectId;
  }

  export interface IBrand {
    brand?: Types.ObjectId;
  }

  export interface ICoupons {
    name: string;
    code: string;
    description?: string |null;
    // couponType: string;
    orderCount?: number | null;
    discountType:string;
    couponApplicableType?: string | null;
    discountValue?: number | null;
    max_discount?: number | null;
    minOrderAmount?: number |null;
    validCategories?: ICategory[] | null; // Array of categories with their references
    validProducts?: IProduct[] |null; // Array of products with their references
    validUsers?: IUser[] |null; // Array of users with their references
    validBrands?:IBrand[] |null;
    usageLimit?: number |null;
    usagePerUserLimit?: number |null;
    startDate?: Date;
    expiryDate?: Date;
  }


  export interface ICouponsDocument extends Document{
    name: string;
    code: string;
    description?: string;
    // couponType: string;
    orderCount?: number | null;
    discountType:string;
    couponApplicableType?: string | null;
    discountValue?: number |null;
    max_discount?: number;
    minOrderAmount?: number;
    validCategories?: ICategory[]; // Array of categories with their references
    validProducts?: IProduct[]; // Array of products with their references
    validUsers?: IUser[]; // Array of users with their references
    validBrands?:IBrand[] |null;
    usageLimit?: number;
    usagePerUserLimit?: number;
    startDate?: Date;
    expiryDate?: Date;
    isActive?: boolean;
  }



export const createCouponsByAdmin = async (newCouponData: ICoupons): Promise<ICouponsDocument> => {
    let coupon = new couponsModel(newCouponData) as ICouponsDocument;
    return await coupon.save();
  };