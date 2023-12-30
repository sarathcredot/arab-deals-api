import { Schema, model } from "mongoose";
import { collections } from "../configs";



const attributeValueSchema = new Schema(
    {
        attributeId: {
            type: Schema.Types.ObjectId,
            ref: collections.ATTRIBUTES,
            required: true
        },
        value: {
            type: Schema.Types.Mixed,
            required: true,
        },
        colorCode: {
            type: String
        },
        priority: {
            type: Number,
            min: 1,
            required: true,
            default: 1
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


const attributeValueModel = model(collections.ATTRIBUTE_VALUES, attributeValueSchema);


export {
    attributeValueModel
}