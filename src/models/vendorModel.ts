import { Schema, model } from "mongoose";
import argon2 from "argon2";
import { collections } from "../configs";


const fileSchema = new Schema(
    {
        fileType: {
            type: String,
            enum: ["PUBLIC"],
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

const vendorSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
            lowercase: true,
        },
        mobileNumber: {
            type: String,
            unique: true,
            required: true,
        },
        profilePic: fileSchema,
        token: {
            type: String,
        },
        isBlocked: {
            type: Boolean,
            default: false,
            required: true
        },
        isKycCompleted: {
            type: Boolean,
            default: false,
            required: true
        },
        brands: {   // Approved brands
            type: [{
                type: Schema.Types.ObjectId,
                ref: collections.BRANDS
            }],
            unique:true
        },
        categories: {   // Approved categories
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: collections.CATEGORIES,
                    unique: true,
                }
            ],
            unique:true
        }
    },
    {
        timestamps: true,
    }
);

// Create compound index on brands and categories
vendorSchema.index({ brands: 1, categories: 1 }, { unique: true });

const vendorModel = model(collections.VENDORS, vendorSchema);

export { vendorModel };
