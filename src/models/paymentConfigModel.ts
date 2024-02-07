import { Schema, model } from "mongoose";
import { collections } from "../configs";


const paymentConfigSchema = new Schema(
    {
        onlinePayment: {
            type: Boolean,
            required: true,
            default: false
        },
        cod: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        _id: true,
        timestamps: true
    }
);


const paymentConfigModel = model(collections.PAYMENT_CONFIGS, paymentConfigSchema);

export { paymentConfigModel };
