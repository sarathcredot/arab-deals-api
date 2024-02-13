import { Schema, model } from "mongoose";
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

const countriesSchema = new Schema(
    {
        name: {
            type: String,
            unique: true,
            trim: true,
        },
        countryLogo: {
            type: fileSchema,
        },
        countryCode: {
            type: String,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
    },
    {
        _id: true,
        timestamps: true
    }
);


const countriesModel = model(collections.COUNTRIES, countriesSchema);

export { countriesModel };
