import { Schema, model } from "mongoose";
import { collections } from "../configs";

const returnPolicySchema=new Schema({
    name:{
        type:String,
        required:true,
        unique: true,
     },
     description:{
        type:String,
     },
     duration: { 
        type: Number, 
        required: true 
    }, 
    //  conditions: { 
    //     type: [String], 
    //     default: [] 
    // }, 
     isEnable:{
      type:Boolean,
      default:true
     },
     returnCharge  : { 
        type: Number,
        default: 0 
    },
    isDeleted:{
        type:Boolean,
        default:false
    }

},{
    timestamps:true
})


const returnPolicyModel=model(collections.RETURN_POLICY,returnPolicySchema);

export {returnPolicyModel}