import { Schema, model } from "mongoose";
import { collections } from "../configs";

const roleSchema=new Schema({
    name:{
        type:String,
        required:true,
        unique: true,
     },
     description:{
        type:String,
     },
     permissions:{
        type:[String]
     }

},{
    timestamps:true
})


const roleModel=model(collections.ROLES,roleSchema);

export {roleModel}