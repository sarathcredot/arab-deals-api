import { Schema, model } from "mongoose";
import argon2 from "argon2";
import { collections } from "../configs";
// import axios from "axios";


const mobileOtp = new Schema(
    {
        code: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: String,
            required: true,
        },
    },
    {
        _id: true,
        timestamps: true
    }
);

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

const tempVendorSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            required: true,
            lowercase: true,
        },
        mobileNumber: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        brand: {
            type: String,
        },
        profilePic: fileSchema,
        hash: {
            type: String,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        temporaryVendorAuthToken: {
            type: String,
        },
        temporaryMobileOtp: mobileOtp,
    },
    {
        timestamps: true,
    }
);

tempVendorSchema.methods.setHash = async function (password: string): Promise<void> {
    try {
        this.hash = await argon2.hash(password);
    } catch (error) {
        return Promise.reject(error);
    }
};

tempVendorSchema.methods.verifyHash = async function (password: string): Promise<boolean> {
    try {
        return await argon2.verify(this.hash, password);
    } catch (error) {
        return Promise.reject(error);
    }
};


tempVendorSchema.methods.setMobileOtp = async function (password: string): Promise<void> {
    try {
        this.mobileOtp = await argon2.hash(password);
    } catch (error) {
        return Promise.reject(error);
    }
}


tempVendorSchema.methods.verifyMobileOtp = async function (otp: string): Promise<boolean> {
    try {
        return await argon2.verify(this.mobileOtp, otp);
    } catch (error) {
        return Promise.reject(error);
    }
}


const tempVendorAuthModel = model(collections.TEMP_VENDOR, tempVendorSchema);

export { tempVendorAuthModel };
