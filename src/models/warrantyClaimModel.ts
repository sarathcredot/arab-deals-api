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

const warrantyAddressSchema = new Schema(
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
        // houseNumber: {
        //     type: String,
        //     // required: true,
        //     default:""
        // },
        // streetName: {
        //     type: String,
        //     // required: true,
        //     default:""
        // },
        // apartment: {
        //     type: String,
        //     default:""
        // },
        // suite: {
        //     type: String,
        //     default:""
        // },
        // unit: {
        //     type: String,
        //     default:""
        // },
        // city: {
        //     type: String,
        //     // required: true,
        //     default:""
        // },
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
            required:true
        },
        
    },
    { _id: false, timestamps: true }
);


const warrantyClaimSchema = new Schema(
    {
        user: { 
            type: Schema.Types.ObjectId, 
            ref:collections.USERS ,
            required: true 
            },
        product: { 
            type: Schema.Types.ObjectId, 
            ref: collections.ORDER_PRODUCTS, 
            required: true 
        },
        order: { 
           type:String,
           required: true
        },
        warrantyId:{
             type:String
        },
        claimStatus: { 
            type: String, 
            enum: ["PENDING", "APPROVED", "REJECTED","PACKAGE_IN_PROGRESS","REPLACEMENT_SHIPPED","OUT_FOR_DELIVERY","REPLACEMENT_COMPLETED ","RETURNED_TO_WAREHOUSE","POSTPONED"], 
            default: "PENDING" 
        },
         issueDescription: { 
            type: String,
             required: true
             },
        claimDate: { 
            type: Date, 
        },
        claimType: { 
            type: String, 
            enum: ["REPLACEMENT","REPAIR"],
            required: true 
        },
        rejectedReason: {
            type: String,
        },
        rejectedDate: {
            type: Date,
        },
        replacementDate: {
            type: Date,
        },
        replacementReason: {
            type: String,
        },
        postponedDate: {
            type: Date,
        },
        postponedReason: {
            type: String,
        }, 
        returnDate: {
            type: Date,
        },
        productImage: {
            type: [fileSchema],
        },
        warrantyAddress:{
            type:warrantyAddressSchema
        },
        deliveryAgentId: {

            type: Schema.Types.ObjectId,
            ref: collections.DELIVERYAGENT
        },

        deliveryAgentName: {

            type:String
        },
        productImageUploadByAgent:{
            type: [fileSchema],
        },
        replacementDeliveredLocation:{
            type: String
        },
        otp:{
            code:{
               type:String
            },
            expiresAt:{
               type:String
            }
        },
        deliveryAgentAssignedOn:Date
    },
    { timestamps: true }
  );
  
  
const warrantyClaimModel=model(collections.WARRANTY_CLAIM,warrantyClaimSchema);

export {warrantyClaimModel}