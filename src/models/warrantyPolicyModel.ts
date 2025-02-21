import { Schema, model } from "mongoose";
import { collections } from "../configs";

const warrantyPolicySchema = new Schema(
    {
        name: {
        type: String,
        required: true,
        unique: true,
      },
      description: {
        type: String,
      },
      duration: {
        type: Number, 
        required: true,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      isEnable:{
        type:Boolean,
        default:true
       },
      warrantyType: [
        {
          type: String,
        },
      ],
    },
    {
      timestamps: true,
    }
  );
  
const warrantyPolicyModel=model(collections.WARRANTY_POLICY,warrantyPolicySchema);

export {warrantyPolicyModel}