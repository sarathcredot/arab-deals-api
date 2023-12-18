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
            default: "OTP",
            enum: ["OTP", "SIGNUP", "EMAIL", "LOGIN", "RESET_PASSWORD"]
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
        timestamps: true,
    }
);



const authUtilityModel = model(collections.AUTH_UTILITies, authUtilitySchema);

export { authUtilityModel };
