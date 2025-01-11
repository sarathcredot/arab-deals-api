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


// get all coupon list in admin port
export const getAllCoupenToAdmin = (data: { page: number, size: number, isActive: boolean, startDate: any, expiryDate: any }): Promise<any> => {

    return new Promise(async (resolve, reject) => {

        try {


            let pipeline: any[] = []
            let matchObj: any = {}

            if (data.isActive) matchObj.isActive = data.isActive
            if (data.startDate) {
                matchObj.startDate = { $gte: new Date(data.startDate) }; 
            }
            
            if (data.expiryDate) {
                matchObj.expiryDate = {
                    ...matchObj.expiryDate, 
                    $lte: new Date(data.expiryDate), 
                };
            }
            pipeline = [

                {
                    $sort: { createdAt: -1 }
                },
                {
                    $match: matchObj
                },
                {
                    $skip: data.page * data.size,
                },
                {
                    $limit: data.size,
                },
                {
                    $project:{

                            _id:1,
                            name: 1,
                            code: 1,
                            description: 1,
                            couponType: 1,
                            discountType: 1,
                            couponApplicableType: 1,
                            discountValue: 1,
                            max_discount: 1,
                            minOrderAmount: 1,
                            validCatogories: 1,
                            validProducts: 1,
                            validUsers: 1,
                            usageLimit: 1,
                            usagePerUserLimit: 1,
                            startDate: 1,
                            expiryDate: 1,
                            isActive: 1,
                            userUsage: 1,
                            
                        
                    }
                }

            ]


            const result = await couponsModel.aggregate(pipeline)
            const dataSize =await couponsModel.find(matchObj)

            let response: any = {
                records: [],
                maxRecords: 0
              };

              if (result.length) {
                response.records = result || [];
                response.maxRecords = dataSize?.length || 0;
              }
        
              resolve(response);


                 
           

        } catch (error) {


            reject()
        }
    })
}


export const adminSuspendTheCupone=(data:{_id:Types.ObjectId,isActive:any}):Promise<any>=>{

        return new Promise(async(resolve,reject)=>{

                 try {
                  console.log(data)

                     await couponsModel.findByIdAndUpdate({_id:data._id},{

                           $set:{
                              isActive:data.isActive
                           }
                     })

                      resolve({flag:true})
                    
                 } catch (error) {

                 
                    console.log("error",error)
                      reject()
                 }
        })
}

// delete coupon by admin

export const adminDeleteTheCoupon=(_id:Types.ObjectId):Promise<any>=>{

      return new Promise(async(resolve,reject)=>{

            try {

              await couponsModel.findOneAndDelete({_id:_id})
              
              resolve({flag:true})
              
            } catch (error) {
              
                reject()
            }
      })
}
