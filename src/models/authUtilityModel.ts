import { Schema, model } from "mongoose";
import argon2 from "argon2";
import { collections } from "../configs";
// import axios from "axios";

const authUtilitySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            index: true,
            enum: ["VENDOR_SIGNUP_MOBILE_OTP", "VENDOR_LOGIN_MOBILE_OTP"]
        },
        userId: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false
        },
        metadata: {
        },

    },
    {
        _id: true,
        timestamps: true,
    }
);



const authUtilityModel = model(collections.AUTH_UTILITIES, authUtilitySchema);

export { authUtilityModel };
