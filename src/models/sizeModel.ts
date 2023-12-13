import { Schema, model, Types } from "mongoose";
import { collections } from "../configs";

const sizeSchema = new Schema(
    {
        size: {
            type: String,
            required: true,
        },
        isBlocked: {
            type: Boolean,
            required: true,
            default: false,
        },
        categoryId: {
            type: Types.ObjectId,
            ref: collections.CATEGORIES,
            index: true
        },
        categoryIdPath: {  // category ID path including its own ID
            type: String,
        },
    },
    {
        timestamps: true
    }
);

sizeSchema.index({ size: 1, categoryId: 1 }, { unique: true })


const sizeModel = model(collections.SIZES, sizeSchema);


export {
    sizeModel
}