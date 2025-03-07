import { couponsModel } from "../models/couponsModel";
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, Number, } from "mongoose";
import { collections } from "../configs";
import { startOfDay, endOfDay } from "date-fns"
import { orderModel } from "../models/orderModel";
import { cartModel } from "../models/cartModel";
import { GraphQLError } from "graphql";
import { getBestSellingProducts } from "./orderProductService";
import { quartersInYear } from "date-fns/constants";



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
  description?: string | null;
  // couponType: string;
  orderCount?: number | null;
  discountType: string;
  couponApplicableType?: string | null;
  discountValue?: number | null;
  max_discount?: number | null;
  minOrderAmount?: number | null;
  validCategories?: ICategory[] | null; // Array of categories with their references
  validProducts?: IProduct[] | null; // Array of products with their references
  validUsers?: IUser[] | null; // Array of users with their references
  validBrands?: IBrand[] | null;
  usageLimit?: number | null;
  usagePerUserLimit?: number | null;
  startDate?: Date;
  expiryDate?: Date;
}


export interface ICouponsDocument extends Document {
  name: string;
  code: string;
  description?: string;
  // couponType: string;
  orderCount?: number | null;
  discountType: string;
  couponApplicableType?: string | null;
  discountValue?: number | null;
  max_discount?: number;
  minOrderAmount?: number;
  validCategories?: ICategory[]; // Array of categories with their references
  validProducts?: IProduct[]; // Array of products with their references
  validUsers?: IUser[]; // Array of users with their references
  validBrands?: IBrand[] | null;
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

export const editCouponsByAdmin = async (couponId: Types.ObjectId, updateData: any): Promise<any> => {
  try {

    console.log("couponId", couponId)
    const result = await couponsModel.findByIdAndUpdate(
      couponId,
      { $set: updateData },
      { new: true }
    );
    console.log("result", result)
    return result;
  } catch (error) {
    console.error("Error in editCouponsByAdmin service:", error);
    throw new Error("Failed to update coupon.");
  }
}

//to find usagelimit
export const findusageLimit = async (couponId: Types.ObjectId): Promise<any> => {
  const result = await couponsModel.aggregate([
    { $match: { _id: couponId } }, // Match the specific coupon by ID
    { $unwind: "$userUsage" }, // Deconstruct the userUsage array
    {
      $group: {
        _id: null, // No grouping key needed, just sum the usageCount
        totalUsage: { $sum: "$userUsage.usageCount" },
      },
    },
  ]);

  return result[0]?.totalUsage || 0;
}

export const findusagePerUserLimit = async (couponId: Types.ObjectId, userId: Types.ObjectId): Promise<any> => {
  const result = await couponsModel.aggregate([
    { $match: { _id: couponId } }, // Match coupon by ID
    { $unwind: "$userUsage" },      // Unwind userUsage array
    { $match: { "userUsage.userId": userId } },  // Match the specific userId
    { $project: { usageCount: "$userUsage.usageCount" } } // Get usageCount field
  ]);


  console.log("$userUsage.usageCount", result)

  return result[0] ? result[0].usageCount : 0;
}

//find ordercount of user

export const findOrderCount = async (userId: Types.ObjectId): Promise<any> => {
  const result = await orderModel.find({ userId })
  return result ? result.length : 0;
}

//find validbrands

 export const findValidBrands=async(userId:Types.ObjectId,couponId:Types.ObjectId,grandTotal:number,subTotal:number,shippingCharge?:number | null):Promise<any> =>{
     const result=await cartModel.aggregate([
        {
              $match:{
                userId:userId
              }
            },
            {
              $unwind:"$products"
            },
            {
              $lookup: {
                from: 'products',
                localField: 'products.productId',
                foreignField: '_id',
                as: 'productDetails',
              },
            },
        {
          $unwind: "$productDetails"
        },
        {
          $project: {
            brandId: "$productDetails.brandId",
            categoryId: "$productDetails.categoryId",
            categoryIdPath: {
              $split: ["$productDetails.categoryIdPath", "#"] // Splitting categoryIdPath into an array
            },
             productId:"$productDetails._id",
             price:"$productDetails.sellingPrice",
             quantity:"$products.quantity",
             sellingprice: {
              $multiply: ["$productDetails.sellingPrice", "$products.quantity"],
            },
          }
        }
     ])

  return result
}

//update useruage

export const updateUserUsage = async (userId: Types.ObjectId, couponId: Types.ObjectId,): Promise<any> => {

  try {

    const result = await couponsModel.findOneAndUpdate(
      { _id: couponId, "userUsage.userId": userId },
      { $inc: { "userUsage.$.usageCount": 1 } },
      { new: true }
    );

    if (!result) {

      const addResult = await couponsModel.findOneAndUpdate(
        { _id: couponId },
        { $push: { userUsage: { userId, usageCount: 1 } } },
        { new: true }
      );

    }

  } catch (error: any) {
    console.error("Error updating user usage:", error.message);
    throw new Error("Failed to update user usage.");
  }

}

export const deleteCouponFromCart=async(userId:Types.ObjectId,couponId:Types.ObjectId):Promise<any>=>{
  return await cartModel.findOneAndUpdate({userId:userId}, { isCouponApplied: false,discount:0 ,appliedCoupon:null,appliedProducts:null},{new:true})
}


 export const findSubTotal = async (userId: Types.ObjectId): Promise<any> => {
  const result = await cartModel.aggregate([
    {
      $match: {
        userId: userId,
      },
    },
    {
      $unwind: "$products",
    },
    {
      $lookup: {
        from: "products",
        localField: "products.productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: "$productDetails",
    },
    {
      $project: {
        brandId: "$productDetails.brandId",
        categoryId: "$productDetails.categoryId",
        productId: "$productDetails._id",
        sellingprice: {
          $multiply: ["$productDetails.sellingprice", "$products.quantity"],
        },
      },
    },
  ]);

  return result;
};


// get all coupon list in admin port
export const getAllCoupenToAdmin = (data: { page: number, size: number, search: string, isActive: string, startDate: any, expiryDate: any }): Promise<any> => {

  return new Promise(async (resolve, reject) => {

    try {


      let pipeline: any[] = []
      let matchObj: any = {}

      if (data.isActive) matchObj.isActive = JSON.parse(data.isActive)
      if (data.startDate) {
        matchObj.startDate = { $gte: new Date(data.startDate) };
      }

      if (data.search) {

        matchObj.code = { $regex: data.search, $options: "i" }
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
          $project: {

            _id: 1,
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
      const dataSize = await couponsModel.find(matchObj)

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


export const adminSuspendTheCupone = (data: { _id: Types.ObjectId, isActive: any }): Promise<any> => {

  return new Promise(async (resolve, reject) => {

    try {
      console.log(data)

      await couponsModel.findByIdAndUpdate({ _id: data._id }, {

        $set: {
          isActive: data.isActive
        }
      })

      resolve({ flag: true })

    } catch (error) {


      console.log("error", error)
      reject()
    }
  })
}

// delete coupon by admin

export const adminDeleteTheCoupon = (_id: Types.ObjectId): Promise<any> => {

  return new Promise(async (resolve, reject) => {

    try {

      await couponsModel.findOneAndDelete({ _id: _id })

      resolve({ flag: true })

    } catch (error) {

      reject()
    }
  })
}


export const getCouponsByUser = (data: { userid: Types.ObjectId, page: number, size: number }): Promise<any> => {

  return new Promise(async (resolve, reject) => {



    try {

      const todayDate = new Date()
      const userIdObj = new Types.ObjectId(data.userid)
      console.log("data", data)

      const result = await couponsModel.aggregate(

        [
          {
            $match: {
              isActive: true,
              $and: [
                {
                  startDate: { $lte: todayDate }
                },
                {
                  $expr:{
                    $cond:{
                      if:{
                        $eq:["$expiryDate",null]
                      },
                      then:true,
                      else: {
                         $gte: ["$expiryDate", todayDate] 
                      }
                    }
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              totalUsageCount: {
                $sum: "$userUsage.usageCount"
              },
              userSpecificUsage: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$userUsage",
                      as: "usage",
                      cond: { $eq: ["$$usage.userId", userIdObj] }
                    }
                  },
                  0
                ]
              }
            },

          },

          {
            $match: {
              $expr: {
                $cond: {
                  if: {
                    $gt: [
                      { $size: "$validUsers" },
                      0
                    ]
                  },
                  then: { $in: [userIdObj, "$validUsers.user"] },
                  else: true
                }
              }
            }
          },
          {
            $match: {
              $expr: {
                $cond: {
                  if: {
                    $gte: ["$totalUsageCount", "$usageLimit"]
                  },
                  then: false,
                  else: true
                }
              }
            }
          },
          {
            $match: {

              $expr: {
                $cond: {
                  if: {
                    $gte: ["$userSpecificUsage.usageCount", "$usagePerUserLimit"]
                  },
                  then: false,
                  else: true
                }
              }
            }
          },
          {
            $skip: data.page * data.size,
          },
          {
            $limit: data.size
          }

        ]
      )

      const resultCount = await couponsModel.aggregate([
        {
          $match: {
            isActive: true,
            $and: [
              {
                startDate: { $lte: todayDate }
              },
              {
                expiryDate: { $gte: todayDate }
              }
            ]
          }
        },
        {
          $addFields: {
            totalUsageCount: {
              $sum: "$userUsage.usageCount"
            },
            userSpecificUsage: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$userUsage",
                    as: "usage",
                    cond: { $eq: ["$$usage.userId", userIdObj] }
                  }
                },
                0
              ]
            }
          },

        },

        {
          $match: {
            $expr: {
              $cond: {
                if: {
                  $gt: [
                    { $size: "$validUsers" },
                    0
                  ]
                },
                then: { $in: [userIdObj, "$validUsers.user"] },
                else: true
              }
            }
          }
        },
        {
          $match: {
            $expr: {
              $cond: {
                if: {
                  $gte: ["$totalUsageCount", "$usageLimit"]
                },
                then: false,
                else: true
              }
            }
          }
        },
        {
          $match: {

            $expr: {
              $cond: {
                if: {
                  $gte: ["$userSpecificUsage.usageCount", "$usagePerUserLimit"]
                },
                then: false,
                else: true
              }
            }
          }
        }

      ]


      )

      let response: any = {
        records: [],
        maxRecords: 0
      };

      if (result.length) {

        response.records = result || [];
        response.maxRecords = resultCount?.length || 0;

      }

      console.log("res",result)


      resolve(response)



    } catch (error) {
      console.log("err", error)
      reject()
    }
  })


}

export const getCouponsByUserMobile = (userid: Types.ObjectId): Promise<any> => {

  return new Promise(async (resolve, reject) => {



    try {

      const todayDate = new Date()
      const userIdObj = new Types.ObjectId(userid)

      const result = await couponsModel.aggregate(

        [
          {
            $match: {
              isActive: true,
              $and: [
                {
                  startDate: { $lte: todayDate }
                },
                {
                  expiryDate: { $gte: todayDate }
                }
              ]
            }
          },
          {
            $addFields: {
              totalUsageCount: {
                $sum: "$userUsage.usageCount"
              },
              userSpecificUsage: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$userUsage",
                      as: "usage",
                      cond: { $eq: ["$$usage.userId", userIdObj] }
                    }
                  },
                  0
                ]
              }
            },

          },

          {
            $match: {
              $expr: {
                $cond: {
                  if: {
                    $gt: [
                      { $size: "$validUsers" },
                      0
                    ]
                  },
                  then: { $in: [userIdObj, "$validUsers.user"] },
                  else: true
                }
              }
            }
          },
          {
            $match: {
              $expr: {
                $cond: {
                  if: {
                    $gte: ["$totalUsageCount", "$usageLimit"]
                  },
                  then: false,
                  else: true
                }
              }
            }
          },
          {
            $match: {

              $expr: {
                $cond: {
                  if: {
                    $gte: ["$userSpecificUsage.usageCount", "$usagePerUserLimit"]
                  },
                  then: false,
                  else: true
                }
              }
            }
          }

        ]


      )


      resolve(result)



    } catch (error) {

      reject()
    }
  })


}



export const getOneCouponDetails = (couponID: Types.ObjectId): Promise<any> => {


  return new Promise(async (resolve, reject) => {

    try {

      const result = await couponsModel.aggregate([

        {
          $match: {
            _id:couponID
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "validUsers.user",
            foreignField: "_id",
            as: "userDetails",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  firstName: 1
                }
              }
            ]
          }
        },
        {
          $unwind: {
            path: "$userUsage",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userUsage.userId",
            foreignField: "_id",
            as: "usedUsers",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  firstName: 1,
                  mobileNumber: 1,
                  displayName: 1
                }
              }
            ]
          }
        },
        {
          $addFields: {
            "usedUsers": {
              $map: {
                input: "$usedUsers",
                as: "user",
                in: {
                  _id: "$$user._id",
                  firstName: "$$user.firstName",
                  mobileNumber: "$$user.mobileNumber",
                  displayName: "$$user.displayName",
                  usageCount: "$userUsage.usageCount"
                }
              }
            }
          }
        },
        
        {
          $lookup: {
            from: "products",
            localField: "validProducts.product",
            foreignField: "_id",
            as: "productDetails",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  productName: 1
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "categories",
            localField: "validCategories.category",
            foreignField: "_id",
            as: "categoriesDetails",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  categoryName: 1
                }
              }
            ]
          }
        },
        {
          $lookup: {
            from: "brands",
            localField: "validBrands.brand",
            foreignField: "_id",
            as: "brandsDetails",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  brandName: 1
                }
              }
            ]
          }
        },
        {
          $group: {
            _id: "$_id",
            code: { $first: "$code" },
            name: { $first: "$name" },
            description: { $first: "$description" },
            discountType: { $first: "$discountType" },
            couponApplicableType: { $first: "$couponApplicableType" },
            discountValue: { $first: "$discountValue" },
            max_discount: { $first: "$max_discount" },
            minOrderAmount: { $first: "$minOrderAmount" },
            usagePerUserLimit: { $first: "$usagePerUserLimit" },
            usageLimit: { $first: "$usageLimit" },
            orderCount: { $first: "$orderCount" },
            startDate: { $first: "$startDate" },
            expiryDate: { $first: "$expiryDate" },
            isActive: { $first: "$isActive" },
            userDetailsArrya: { $first: "$userDetails" },
            productDetailsArrya: { $first: "$productDetails" },
            categoriesDetailsArrya: { $first: "$categoriesDetails" },
            brandDeatailsArrya: { $first: "$brandsDetails" },
            usedUsers: { $push: { $arrayElemAt: ["$usedUsers", 0] } } // Consolidate usedUsers
          }
        },
        {
          $project: {
            code: 1,
            name: 1,
            description: 1,
            discountType: 1,
            couponApplicableType: 1,
            discountValue: 1,
            max_discount: 1,
            minOrderAmount: 1,
            usagePerUserLimit: 1,
            usageLimit: 1,
            orderCount: 1,
            startDate: 1,
            expiryDate: 1,
            isActive: 1,
            userDetailsArrya: 1,
            productDetailsArrya: 1,
            categoriesDetailsArrya: 1,
            brandDeatailsArrya: 1,
            usedUsers: 1
          }
        }
      
      
       
      ])

      const final = result[0]

      resolve(final)


    } catch (error) {

      reject()
    }
  })


}


