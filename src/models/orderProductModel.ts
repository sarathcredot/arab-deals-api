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
            // required: true,
            default:""
        },
        streetName: {
            type: String,
            // required: true,
            default:""
        },
        apartment: {
            type: String,
            default:""
        },
        suite: {
            type: String,
            default:""
        },
        unit: {
            type: String,
            default:""
        },
        city: {
            type: String,
            // required: true,
            default:""
        },
        postCode: {
            type: String,
            required: true,
        },
        governorate: {
            type: String, 
            required: true
            },
         village: {
            type: String,
            required: true
           }, 
           governorateID: {
            type: String, 
            required: true
            },
         villageID: {
            type: String,
            required: true
           },
           address:{
       
            type:String,
            require:true
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
            enum: ["COD", "ONLINE","CARD"],
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
        /**
         * Order create = "PENDING"
         * Order Processing = "PACKAGE_IN_PROGRESS"
         * Assigned to delivery agent = "SHIPPED"
         * Order Delivered = "DELIVERED"
         * Order Cancelled = "CANCELED"
         * Order Delivery Postponded (by delivery agent or admin) = "POSTPONED"
         */
        shippingStatus: {
            type: String,
            enum: ["NA", "PENDING", "PACKAGE_IN_PROGRESS","OUT_FOR_DELIVERY" ,"SHIPPED", "DELIVERED", "CANCELED","POSTPONED"],
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
            enum: ["NA", "PENDING", "APPROVED", "REJECTED","COLLECTED","RETURNED TO WAREHOUSE","POSTPONED"],
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
            type: [fileSchema],
        },
        returnProductImageUploadByAgent:{
            type: [fileSchema],
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
        returnRejectedRemarks:{
            type:String
        },
        returnPostponedDate: {
            type: Date,
        },
        returnPostponedRemarks:{
            type:String
        },
        returnCollectedDate: {
            type: Date,
        },
        returnCollectedRemarks:{
            type:String
        },
        returnPolicyName:{
            type:String,
         },
         returnPolicyDescription:{
            type:String,
         },
         returnPeriod: {
            type: Number,
        },
        returnCharge  : { 
            type: Number
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
        deliveyremark:{
             type:String
        },
        cancelremark:{
            
            type:String
        },
        postponedremark:{
             type:String
        },
        postponeddate:{

              type:Date
        },
        canceldate:{
              
             type:Date
        },
        otp:{

            code:{type:String},
            expiresAt:{type:String}

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
