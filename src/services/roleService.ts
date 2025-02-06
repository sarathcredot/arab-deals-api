import { roleModel } from "../models/roleModel";
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, Number, } from "mongoose";

export interface IRole {
    name: string;
    description?: string |undefined|null;
    permissions?: string[];
}



export const createRoleBySuperAdmin = async (newRoleData: IRole): Promise<any> => {
    let Role= new roleModel(newRoleData);
    return await Role.save();
};

export const updateRoleBySuperAdmin=async (roleId:Types.ObjectId,newRoleData: IRole): Promise<any> => {
    const updateRole=await roleModel.findByIdAndUpdate(roleId,newRoleData,{new:true});
    return updateRole;
}

export const deleteRoleBySuperAdmin=async (roleId:Types.ObjectId): Promise<any> => {
    const deleteRole=await roleModel.findByIdAndDelete(roleId);
    return deleteRole;
}


export const updateStatusRoleBySuperAdmin=async (roleId:Types.ObjectId,isEnable:boolean): Promise<any> => {
    const updateRole=await roleModel.findByIdAndUpdate(roleId,{isEnable:isEnable},{new:true});
    return updateRole;
}


export const getAllRolesBySuperAdmin=async(options:any,matchQuery:any): Promise<any> => {
   try {

    // console.log(matchQuery.isEnable)

    let count=await roleModel.aggregate([
        {
            $match:matchQuery
        },
        {
            $count:"count"
        }
    ])

    console.log("count",count)

    const result=await roleModel.aggregate([
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

    console.log("result",result)

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
   }
}