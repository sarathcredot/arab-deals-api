import { Schema, model } from "mongoose";
import { collections } from "../configs";



const settlementSchema = new Schema(
    {
        agentId: { 
                type: Schema.Types.ObjectId,
                 ref: collections.DELIVERYAGENT, 
                 required: true, 
              },
        amount: { 
                type: Number, 
                required: true,
                min: [0, "Settlement amount must be positive"],
             },
        date: { 
            type: Date,
             required: true
         },
        remarks:{
            type:String,
            trim:true
        }  
      
    },
    {
        timestamps: true,
    }
); 



const settlementModel = model(collections.SETTLEMENTS, settlementSchema);


export { settlementModel };
