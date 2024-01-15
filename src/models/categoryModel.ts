import { Schema, model } from "mongoose";
import { collections } from "../configs";


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
        isLeaf: {   // Terminal node
            type: Boolean,
            default: false
        },
        isDefault: {
            type: Boolean,
            default: false
        },
        attibutes: {   // Approved attibutes
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: collections.CATEGORIES
                }
            ]
        },
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