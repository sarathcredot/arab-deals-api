import { Schema, model, Types } from "mongoose";
import { collections } from "../configs";

const colorSchema = new Schema(
    {
        colorCode: {
            type: String,
            required: true,
        },
        colorName: {
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

colorSchema.index({ colorName: 1, categoryId: 1 }, { unique: true });


const colorModel = model(collections.COLORS, colorSchema);


export {
    colorModel
}