import { Schema, model } from "mongoose";
import { collections } from "../configs";



const settlementSchema = new Schema(
    {
        type:{
            type: String,
            enum: ['SETTLED', 'COLLECTED'],
            required: true,
        },
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
         },
        remarks:{
            type:String,
            trim:true
        },
        totalAmount:{       //total amount  before settlement
            type:Number
        },
        balance:{
            type:Number    //balance amount after settlement
        },
        orderId:{
            type: Schema.Types.ObjectId,
            ref: collections.ORDERS, 
        }

    },
    {
        timestamps: true,
    }
); 



const settlementModel = model(collections.SETTLEMENTS, settlementSchema);


export { settlementModel };
