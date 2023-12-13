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

const itemSchema = new Schema({
    title: {
        type: String
    },
    subTitle: {
        type: String
    },
    image: {
        type: fileSchema,
    },
    button: {
        type: buttonSchema
    }
}, {
    timestamps: true
})

const cms2Schema = new Schema(
    {
        pageName: {
            type: String
        },
        sectionName: {
            type: String,
            required: true,
            unique: true
        },
        title: {
            type: String
        },
        subTitle: {
            type: String
        },
        items: {
            type: [itemSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);


const cms2Model = model(collections.CMS2, cms2Schema);


export {
    cms2Model
}