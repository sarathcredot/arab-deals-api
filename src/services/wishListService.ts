import { Types, Document, FilterQuery, UpdateQuery, ObjectId, Model } from "mongoose";
import { cartModel, wishListModel } from "../models";

export const createWishlist = async (productId: Types.ObjectId, userId: string): Promise<any> => {
    return await wishListModel.create({
        userId: userId,
        products: [
            {
                productId: productId,
            },
        ],
    });
}
export const checkWishlistExist = async (userId: String): Promise<any> => {
    return await wishListModel.findOne({ userId: userId });
}
export const checkItemExists = async (productId: Types.ObjectId): Promise<any> => {
    return await wishListModel.exists({ "products.productId": productId });
}

export const addItem = async (productId: Types.ObjectId, userId: string): Promise<any> => {
    return await wishListModel.findOneAndUpdate(
        { userId: userId },
        {
            $push: {
                products: {
                    productId: productId,
                },
            },
        },
        { new: true }
    );
}
export const removeItem = async (productId: Types.ObjectId, userId: string): Promise<any> => {
    return await wishListModel.findOneAndUpdate(
        { userId: userId },
        {
            $pull: {
                products: {
                    productId: productId,
                },
            },
        },
        { new: true }
    );
}

