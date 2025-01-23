import { Schema, model, Types } from "mongoose";
import { collections } from "../configs";


const productSchema = new Schema(
    {
        productId: {
            type: Types.ObjectId,
            required: true,
            ref: collections.PRODUCTS,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    },
);

const cartSchema = new Schema( 
    {
        products: {
            type: [productSchema],
        },
        userId: {
            type: Types.ObjectId,
            ref: collections.USERS,
            unique: true
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
        isCouponApplied: {
            type: Boolean,
            default: false
        },
        appliedCoupon: {
            type: Schema.Types.ObjectId,
            ref: collections.COUPONS
        },
        appliedProducts:[
            {
                type: Schema.Types.ObjectId,
                ref: collections.PRODUCTS
            }
        ]
    },

    {
        _id: true,
        timestamps: true
    }
)


const cartModel = model(collections.CARTS, cartSchema);

export { cartModel }; 
