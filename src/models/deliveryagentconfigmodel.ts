

import { Schema, model } from "mongoose";
import { collections } from "../configs";


const deliveryAgentConfigSchema = new Schema(
    {
        orderAssignLimit:{
            type:Number,
            default:0
        },
        returnOrderAssignLimit:{
            type:Number,
            default:0
        },
        warrantyCallAssignLimit:{
            type:Number,
            default:0
        }

    },
    {
        _id: true,
        timestamps: true
    }
);


const deliveryAgentConfigModel = model(collections.DELIVERY_AGENT_CONFIGS,deliveryAgentConfigSchema);

export { deliveryAgentConfigModel };
