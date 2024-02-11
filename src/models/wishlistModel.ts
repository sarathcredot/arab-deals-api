import { Schema, model, Types } from "mongoose";
import { collections } from "../configs";


const productSchema = new Schema(
    {
        productId: {
            type: Types.ObjectId,
            required: true,
            ref: collections.PRODUCTS,
        },
    },
);

const wishListSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            ref: collections.USERS,
            unique: true
        },
        products: {
            type: [productSchema],
        },
    },

    {
        _id: true,
        timestamps: true
    }
)


const wishListModel = model(collections.WISHLISTS, wishListSchema);

export { wishListModel };
