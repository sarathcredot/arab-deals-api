import { returnPolicyModel } from "../models/returnPolicyModel";
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, Number, } from "mongoose";


export interface IReturnPolicy {
    name: string;
    description?: string |undefined|null;
    // conditions?: string[];
    duration:number;
    refundDeduction?:number |undefined|null
}


export const createReturnPolicyBySuperAdmin = async(newReturnPolicyData:IReturnPolicy):Promise<any> =>{
    try {
        console.log("🔍 Saving policy to DB:", newReturnPolicyData);

        let returnPolicy = new returnPolicyModel(newReturnPolicyData);
        const savedPolicy = await returnPolicy.save();  // Ensure 'await' is used
    
        console.log("✅ Saved policy:", savedPolicy);
        return savedPolicy;
    } catch (error) {
        console.error("Error saving return policy:", error);
        throw new Error("Failed to save return policy");
    }
}


export const getAllPoliciesBySuperAdmin=async(options:any,matchQuery:any): Promise<any> => {
    try {
 
    //  console.log(matchQuery,options)
 
     let count=await returnPolicyModel.aggregate([
         {
             $match:matchQuery
         },
         {
             $count:"count"
         }
     ])
 
     console.log("count",count)
 
     const result=await returnPolicyModel.aggregate([
         {
             $sort:{
                 createdAt:-1
             }
         },
         {
             $match:matchQuery
         },
         {
             $skip:options.page*options.size
         },
         {
             $limit:options.size
         }
     ])
 
    //  console.log("result",result)
 
     let response: any = {
         records: [],
         maxRecords: 0,
       };
 
       if(result.length){
         response.records=result||[];
         response.maxRecords=count[0].count || 0
       }
      return response
     
    } catch (error) {
       throw error
    } }

export const updateReturnPolicyByAdmin=async (returnPolicyId:Types.ObjectId,updatePolicyData: IReturnPolicy): Promise<any> => {
    const updateRole=await returnPolicyModel.findByIdAndUpdate(returnPolicyId,updatePolicyData,{new:true});
    return updateRole;
}


export const deleteReturnPolicyByAdmin=async (returnPolicyId:Types.ObjectId): Promise<any> => {
    const deletePolicy=await returnPolicyModel.findByIdAndUpdate(returnPolicyId,{isDeleted:true},{new:true});
    return deletePolicy;
}


export const updateStatusReturnPolicyByAdmin=async (returnPolicyId:Types.ObjectId,isEnable:boolean): Promise<any> => {
    const updateRole=await returnPolicyModel.findByIdAndUpdate(returnPolicyId,{isEnable:isEnable},{new:true});
    return updateRole;
}
