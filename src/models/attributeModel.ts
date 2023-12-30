import { Schema, model } from "mongoose";
import { collections } from "../configs";



const attributeSchema = new Schema(
    {
        attributeType: {
            type: String,
            enum: ["COLOR", "NORMAL"],
            default: "NORMAL"
        },
        name: {
            type: String,
            required: true,
            unique: true
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


const attributeModel = model(collections.ATTRIBUTES, attributeSchema);


export {
    attributeModel
}