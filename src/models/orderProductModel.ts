import { Schema, model } from "mongoose";
import { collections } from "../configs";



const fileSchema = new Schema(
    {
        fileType: {
            type: String,
            enum: ["PRIVATE", "PUBLIC"],
            default: "PRIVATE",
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



const returnAddressSchema = new Schema(
    {
        firstname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
        },
        mobile: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
            default: "India", //TODO default need to change
        },
        houseNumber: {
            type: String,
            required: true,
        },
        streetName: {
            type: String,
            required: true,
        },
        apartment: {
            type: String,
        },
        suite: {
            type: String,
        },
        unit: {
            type: String,
        },
        city: {
            type: String,
            required: true,
        },
        postCode: {
            type: String,
            required: true,
        },
    },
    { _id: false, timestamps: true }
);


const orderProductSchema = new Schema(
    {
        orderId: {
            type: String,
            index: true,
            uppercase: true,
            trim: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: collections.USERS,
            required: true,
            index: true,
        },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: collections.VENDORS,
            required: true,
            index: true,
        },
        productId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: collections.PRODUCTS
        },
        itemId: {  // uniquely identify a product in an order
            type: String,
            index: true,
            uppercase: true,
            trim: true,
        },
        productName: {
            type: String
        },
        shortDescription: {
            type: String
        },
        skuId: {
            type: String
        },
        warehouseSkuId: {
            type: String,
        },
        image: {
            type: fileSchema,
        },
        returnPeriod: {
            type: Number,
        },
        mrp: {
            type: Number,
            required: true,
            min: 0,
        },
        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        shippingCharge: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        paymentMode: {
            type: String,
            enum: ["COD", "ONLINE"],
            required: true,
            default: "COD",
            index: true,
        },
        paymentStatus: {
            type: String,
            enum: ["PENDING", "COMPLETED"],
            default: "PENDING",
            required: true,
        },
        paymentRemark: {
            type: String,
        },
        orderDate: {
            type: Date,
            required: true,
            default: Date.now()
        },
        shippingStatus: {
            type: String,
            enum: ["NA", "PENDING", "PACKAGE_IN_PROGRESS", "SHIPPED", "DELIVERED", "CANCELED"],
            default: "NA",
            required: true,
        },
        shippedDate: {
            type: Date,
        },
        deliveryDate: {
            type: Date,
        },
        returnStatus: {
            type: String,
            enum: ["NA", "PENDING", "APPROVED", "REJECTED","COLLECTED","RETURNED TO WAREHOUSE"],
            required: true,
            default: "NA",
        },
        // returnCollectionStatus: {
        //     type: String,
        //     enum: ["NA", "COLLECTED", "RETURNED TO WAREHOUSE", "REJECTED"],
        //     required: true,
        //     default: "NA",
        // },
        returnUserReason: {
            type: String,
        },
        returnProductImage: {
            type: fileSchema,
        },
        returnProductImageUploadByAgent:{
            type: fileSchema,
        },
        returnAddress:{
            type: returnAddressSchema
        },
        returnAdminComment: {
            type: String,
        },
        returnRequestDate: {
            type: Date,
        },
        returnDate: {
            type: Date,      // Date when the product was actually returned
        },
        returnRejectedDate: {
            type: Date,
        },
        refundStatus: {
            type: String,
            enum: ["NA", "PENDING", "PAID"],
            required: true,
            default: "NA",
        },
        refundAmount: {
            type: Number,
            default: 0,
        },
        refundRequestDate: {
            type: Date,
        },
        refundDate: {
            type: Date,
        },
        refundComment: {
            type: String,
        },
        cancelUserReason: {
            type: String,
        },
        cancelAdminComment: {
            type: String,
        },
        cancelledDate: {
            type: Date,
        },
        courierId: {
            type: String,
            index: true,
            trim: true,
        },
        invoiceNumber: {
            type: String,
        },
        invoice: {
            type: fileSchema
        },
        deliveryAssignedOn: Date,
        deliveryAgentId: {

            type: Schema.Types.ObjectId,
            ref: collections.DELIVERYAGENT
        },

        deliveryAgentName: {

            type:String
        },
        returnOrderAssignedOn: Date,
        returndeliveryAgentId: {
            type: Schema.Types.ObjectId,
            ref: collections.DELIVERYAGENT
        },

        returndeliveryAgentName: String,
        refundBankDetails: {
            accountHolderName: {
                type: String,
            },
            accountNumber: {
                type: String,
            },
            ifscCode: {
                type: String,
            },
            bankName: {
                type: String,
            },
            branchName: {
                type: String,
            },
        },
        deliveredMapLocation:{
            type: String
        }

    },
    {
        _id: true,
        timestamps: true
    }
);


const orderProductModel = model(collections.ORDER_PRODUCTS, orderProductSchema);

export { orderProductModel };
