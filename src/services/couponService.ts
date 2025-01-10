


import { deliveryAgentModel, settlementModel, couponsModel } from '../models'
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, } from "mongoose";







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
                            userUsage: 1
                        
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


export const adminSuspendTheCupone=(data:{_id:Types.ObjectId,isActive:boolean | undefined}):Promise<any>=>{

        return new Promise(async(resolve,reject)=>{

                 try {

                     await couponsModel.findByIdAndUpdate({_id:data.isActive},{

                           $set:{
                              isActive:data.isActive
                           }
                     })

                      resolve({flag:true})
                    
                 } catch (error) {
                    
                      reject()
                 }
        })
}