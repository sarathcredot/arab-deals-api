import { Schema, model } from "mongoose";
import { collections } from "../configs";


const fileSchema = new Schema(
    {
        fileType: {
            type: String,
            enum: ["PRIVATE", "PUBLIC"],
            default: "PUBLIC",
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

const brandSchema = new Schema(
    {
        brandName: {
            type: String,
            required: true,
            unique: true
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        logo: {
            type: fileSchema,
        },
    },
    {
        timestamps: true
    }
);


const brandModel = model(collections.BRAND, brandSchema);


export {
    brandModel
}