import { Schema, model } from "mongoose";
import argon2 from "argon2";
import { collections } from "../configs";


const deliveryAgentSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
          },
          contactNumber: {
            type: String,
            required: true,
          },
          userID: {
            type: String,
            unique: true,
            required: true,
          },
          password: {
            type: String,
            required: true,
          },
          agentType: {
            type: String,
            enum: ['ArabDeals', 'Vendor', 'ThirdParty'],
            required: true,
          },
          isActive: {
            type: Boolean,
            default: true, // true = active, false = suspended
          },
          vendorID: {
            type: Schema.Types.ObjectId,
            ref: collections.VENDORS, 
            default: null
          },
    },
    {
        timestamps: true,
    }
); 


const deliveryAgentModel = model(collections.DELIVERYAGENT, deliveryAgentSchema);

export { deliveryAgentModel };
