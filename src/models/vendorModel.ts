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
                ref: collections.BRANDS,
                unique: true
            }]
        },
        categories: {   // Approved categories
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: collections.CATEGORIES,
                    unique: true,
                }
            ]
        }
    },
    {
        timestamps: true,
    }
);

vendorSchema.methods.setHash = async function (password: string): Promise<void> {
    try {
        this.hash = await argon2.hash(password);
    } catch (error) {
        return Promise.reject(error);
    }
};

vendorSchema.methods.verifyHash = async function (password: string): Promise<boolean> {
    try {
        return await argon2.verify(this.hash, password);
    } catch (error) {
        return Promise.reject(error);
    }
};


const vendorModel = model(collections.VENDORS, vendorSchema);

export { vendorModel };
