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

const categorySchema = new Schema(
    {
        categoryName: {
            type: String,
            required: true,
        },
        path: {    // Separated by #
            type: String,
            required: true,
            index: true
        },
        description: {
            type: String
        },
        categoryImage: {
            type: fileSchema
        },
        isLeaf: {   // Terminal node
            type: Boolean,
            default: false
        },
        isDefault: {
            type: Boolean,
            default: false
        },
        attributes: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: collections.CATEGORIES,
                }
            ],
        },
        // brands: {
        //     type: [
        //         {
        //             type: Schema.Types.ObjectId,
        //             ref: collections.CATEGORIES,
        //         }
        //     ],
        // },
        isBlocked: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);

categorySchema.index({ categoryName: 1, path: 1 }, { unique: true });


const categoryModel = model(collections.CATEGORIES, categorySchema);


export {
    categoryModel
}