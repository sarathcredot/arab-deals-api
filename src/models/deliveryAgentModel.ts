import { Schema, model } from "mongoose";
import argon2 from "argon2";
import { collections } from "../configs";
import { IDeliveryAgentDocument } from "src/services/deliveryAgentService";


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

deliveryAgentSchema.methods.setHash = async function (password: string): Promise<void> {
  try {
    this.password = await argon2.hash(password);
  } catch (error) {
    return Promise.reject(error);
  }
}

deliveryAgentSchema.methods.verifyHash = async function (password: string): Promise<boolean> {
  try {
    return await argon2.verify(this.password, password);
  } catch (error) {
    return Promise.reject(error);
  }
}


const deliveryAgentModel = model<IDeliveryAgentDocument>(collections.DELIVERYAGENT, deliveryAgentSchema);


export { deliveryAgentModel };
