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


const attributeSchema = new Schema(
    {
        attributeId: {
            type: Schema.Types.ObjectId,
            ref: collections.ATTRIBUTES,
            required: true
        },
        attributeName: {
            type: String,
            required: true
        },
        attributeValueId: {
            type: Schema.Types.ObjectId,
            ref: collections.ATTRIBUTE_VALUES, 
            required: true
        },
        attributeValue: {
            type: Schema.Types.Mixed,
            required: true
        },
        attributeDescription: {
            type: String
        }
    },
    {
        _id: true,
        timestamps: true
    }
)

const productSchema = new Schema(
    {
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: collections.VENDORS,
            required: true
        },
        brandId: {
            type: Schema.Types.ObjectId,
            ref: collections.BRANDS
        },
        brandName: {
            type: String,
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
        },
        productCode: {
            type: Number,
            required: true,
            index: true
        },
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
        images: {
            type: [fileSchema],
            default: []
        },
        attributes: {
            type: [attributeSchema],
            default: []
        },
        rating: {
            type: Number,
            default: 5,
            min: 1,
            max: 5,
        },
        mrp: {
            type: Number,
            min: 0,
            required: true
        },
        price: {  // default selling price
            type: Number,
            min: 0,
            required: true
        },
        offerPrice: {  // offer selling price
            type: Number,
            min: 0,
            required: true
        },
        sellingPrice: {  // actual selling price
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
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        status: {
            type: String,
            enum: ["PENDING" ,"UNDER_VERIFICATION", "APPROVED", "REJECTED"],
            default: "PENDING"
        },
    },
    {
        timestamps: true
    }
);

productSchema.index(
    {
        tags: 'text',
        productName: 'text',
        shortDescription: 'text',
        description: 'text',
        categoryNamePath: 'text'
    },
    {
        weights: {
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
