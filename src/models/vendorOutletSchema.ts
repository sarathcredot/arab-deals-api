import { Schema, model } from "mongoose";
import { collections } from "../configs";

const fileSchema = new Schema(
    {
        fileType: {
            type: String,
            enum: ["PRIVATE"],
            default: "PRIVATE",
            required: true
        },
        fileURL: {
            type: String,
            required: true
        },
        mimeType: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        }
    },
    {
        _id: true,
        timestamps: true
    }
);

const outletSchema = new Schema(
    {
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: collections.VENDORS,
            index: true
        },
        outletName: {
            type: String,
        },
        address: {
            type: String,
        },
        outletLicense: {
            type: fileSchema
        },
        interiorImage: {
            type: fileSchema
        },
        exteriorImage: {
            type: fileSchema
        },
        contactPersonName: {
            type: String,
        },
        contactPersonNumber: {
            type: String,
        },
        contactPersonDesignation: {
            type: String,
        },
        status: {
            type: String,
            required: true,
            index: true,
            enum: ["PENDING", "UNDER_VERIFICATION", "COMPLETED", "REJECTED"],
            default: "PENDING"
        },
        remarks: {
            type: [String],
            default: []
        }
    },
    {
        _id: true,
        timestamps: true
    }
)


const vendorOutletModel = model(collections.VENDOR_OUTLETS, outletSchema);

export { vendorOutletModel };


