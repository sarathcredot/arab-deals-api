import { Schema, model, Types } from "mongoose";
import { collections } from "../configs";

const jobSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            enum: ["ORDER_EXPORT", "SHIPPING_EXPORT", "RETURN_EXPORT", "REFUND_EXPORT","SETTLEMENT_EXPORT"]
        },
        status: {
            type: String,
            required: true,
            enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED"],
        },
        isExpired: {
            type: Boolean,
            required: true,
            default: false,
        },
        vendorId: {
            type: Types.ObjectId,
        },
        userType: {
            type: String,
            enum: ["VENDOR", "ADMIN"],
            default: "ADMIN"
        },
        metadata: {
            filePath: String
        },
    },
    {
        timestamps: true
    }
);


const jobQueueModel = model(collections.JOBS, jobSchema);


export {
    jobQueueModel
}