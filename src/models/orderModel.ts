import { Schema, model } from "mongoose";
import { collections } from "../configs";


const shippingAddressSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
            ref: collections.USERS
        },
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
    },
    { _id: false, timestamps: true }
);



const orderSchema = new Schema(
    {
        orderId: {
            type: String,
            unique: true,
            uppercase: true,
            trim: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: collections.USERS,
            required: true,
            index: true,
        },
        paymentMode: {
            type: String,
            enum: ["COD", "ONLINE"],
            index: true,
        },
        shippingAddress: shippingAddressSchema,
        orderDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        orderStatus: {
            type: String,
            enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
            default: "PENDING",
            index: true,
            required: true
        },
        vendorIds: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: collections.VENDORS
                }
            ],
            default: []
        },
        grandTotal:{
            type: Number
        },
        subTotal: {
            type: Number
        },
        shippingCharge: {
            type: Number
        },
        discount: {
            type: Number
        },
    },
    {
        _id: true,
        timestamps: true
    }
);


const orderModel = model(collections.ORDERS, orderSchema);

export { orderModel };
