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

const buttonSchema = new Schema(
    {
        buttonText: {
            type: String,
            required: true
        },
        redirectionURL: {
            type: String,
            required: true
        }
    },
    {
        _id: true,
        timestamps: true
    }
);

const cmsSchema = new Schema(
    {
        pageName: {
            type: String
        },
        sectionName: {
            type: String,
            required: true,
            unique: true
        },
        // title: {
        //     type: String
        // },
        // subTitle: {
        //     type: String
        // },
        // description: {
        //     type: [String]
        // },
        images: {
            type: [fileSchema],
            deafult: []
        },
        buttons: {
            type: [buttonSchema],
            default: []
        },
        isBlocked: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true
    }
);

cmsSchema.index({ pageName: 1, sectionName: 1 }, { unique: true });

const cmsModel = model(collections.CMS, cmsSchema);


export {
    cmsModel
}