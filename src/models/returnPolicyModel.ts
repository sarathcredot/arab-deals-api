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
    },
      //  conditions: { 
    //     type: [String], 
    //     default: [] 
    // },

},{
    timestamps:true
})


const returnPolicyModel=model(collections.RETURN_POLICY,returnPolicySchema);

export {returnPolicyModel}