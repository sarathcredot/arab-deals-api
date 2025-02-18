import { Schema, model } from "mongoose";
import { collections } from "../configs";


const shippingConfigSchema = new Schema(
    {
        shippingCharge: {
            type: Number,
            required: true,
            default: 0
        },
        freeShippingThreshold: {
            type: Number,
            required: true,
            default: 0
        },
        returnPeriod: {
            type: Number,
            required: true,
            default: 0
        },
        defaultReturnPolicy:{
            type: Schema.Types.ObjectId,
            ref: collections.RETURN_POLICY
        }
    },
    {
        _id: true,
        timestamps: true
    }
);


const shippingConfigModel = model(collections.SHIPPING_CONFIGS, shippingConfigSchema);

export { shippingConfigModel };
