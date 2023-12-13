import { Schema, model, Types } from "mongoose";
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
)

const productSchema = new Schema(
    {
        productName: {
            type: String,
            required: true,
            trim: true
        },
        shortDescription: {
            type: String,
            required: true,
            trim: true
        },
        skuId: {
            type: String,
        },
        description: {
            type: String,
        },
        productInfo: {
            type: [String],
            default: []
        },
        productShortInfo: {
            type: String
        },
        color: {
            type: String,
        },
        size: {
            type: String,
        },
        material: {
            type: String
        },
        images: {
            type: [fileSchema],
            default: []
        },
        rating: {
            type: Number,
            default: 5,
            min: 1,
            max: 5,
        },
        sellingPrice: {  // actual selling price
            type: Number,
            min: 0,
            required: true
        },
        price: {  // default selling price
            type: Number,
            min: 0,
            required: true
        },
        mrp: {
            type: Number,
            min: 0,
            required: true
        },
        isBlocked: {
            type: Boolean,
            required: true,
            default: false,
        },
        tags: {
            type: [String],
            default: []
        },
        productCode: {
            type: Number,
            required: true,
            index: true
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        categoryNamePath: {  // Eg: MEN/VESTS/SLEEVELESS 
            type: String,
        },
        categoryIdPath: {  // category ID path including its own ID
            type: String,
        },
        categoryId: {   // Exact ID of the category
            type: Types.ObjectId,
            ref: collections.CATEGORIES
        }
    },
    {
        timestamps: true
    }
);

productSchema.index(
    {
        color: "text",
        size: "text",
        material: 'text',
        tags: 'text',
        productName: 'text',
        shortDescription: 'text',
        description: 'text',
        categoryNamePath: 'text'
    },
    {
        weights: {
            color: 15,
            size: 15,
            material: 10,
            tags: 10,
            productName: 7,
            shortDescription: 5,
            categoryNamePath: 5,
            description: 3,
        }
    }
);



const productModel = model(collections.PRODUCTS, productSchema);



export {
    productModel
}
