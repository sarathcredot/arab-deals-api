import { Schema, model } from "mongoose";
import { collections } from "../configs";


const shippingAddressSchema = new Schema(
    {
        fullname: {
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
            default: "india",
        },
        state: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        address2: {
            type: String,
        },
        postCode: {
            type: String,
            required: true,
        },
        landmark: {
            type: String,
        },
        alternateMobile: {
            type: String,
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
        }
    },
    {
        _id: true,
        timestamps: true
    }
);


const orderModel = model(collections.ORDERS, orderSchema);

export { orderModel };
