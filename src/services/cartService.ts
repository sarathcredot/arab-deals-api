import { Types, Document, FilterQuery, UpdateQuery, ObjectId, Model, Collection } from "mongoose";
import { cartModel } from "../models";
import { collections } from "../configs";

export interface Icart {
    productId: string,
    quantity: number,
    userId: string
}
export interface IaddItem {
    productId: Types.ObjectId,
    quantity: number,
    userId: Types.ObjectId
}
export interface ICartDocument extends Document {
    _id?: Types.ObjectId,
    quantity: number,
    // userId?: Types.ObjectId
}

export const createCart = async (productId: string, userId: string, quantity: number): Promise<any> => {
    return await cartModel.create({
        userId: userId,
        products: [
            {
                productId: productId,
                quantity: quantity,
            },
        ],
    });
}
export const checkCartExist = async (userId: String): Promise<any> => {
    return await cartModel.findOne({ userId: userId });
}
export const checkItemExists = async (productId: Types.ObjectId): Promise<any> => {
    return await cartModel.exists({ "products.productId": productId });
}
export const editQuantityOfItem = async (productId: Types.ObjectId, userId: string, quantity: number): Promise<any> => {
    const filter = { "products.productId": productId, userId };
    const update: UpdateQuery<any> = { $inc: { "products.$.quantity": quantity } };
    return await cartModel.updateOne(filter, update);
}
export const removeItem = async (productId: Types.ObjectId, userId: string): Promise<any> => {
    return await cartModel.findOneAndUpdate(
        { userId: userId },
        { $pull: { products: { productId: productId } } },
        { new: true }
    );
}
export const updateQuantity = async (productId: Types.ObjectId, userId: string, newQuantity: number): Promise<any> => {
    return await cartModel.findOneAndUpdate(
        { userId: userId, "products.productId": productId },
        { $set: { "products.$.quantity": newQuantity } },
        { new: true }
    );
}
export const addItem = async (productId: Types.ObjectId, userId: string, quantity: number): Promise<any> => {
    return await cartModel.findOneAndUpdate(
        { userId: userId },
        {
            $push: {
                products: {
                    productId: productId,
                    quantity: quantity,
                },
            },
        },
        { new: true }
    );
}

export const getCart = async (userId: Types.ObjectId) => {
    let pipeline: any = []
    pipeline.push(
        {
            $match: {
                userId: userId
            }
        },
        {
            $project: {
                // _id: 1,
                userId: 1,
                "products.productId": 1,
                "products.quantity": 1,
            }
        },
        {
            $unwind: "$products"

        },
        {
            $lookup: {
                from: collections.PRODUCTS,
                let: { productId: "$products.productId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$productId"],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            productName: 1,
                            stock: 1,
                            isBlocked: 1,
                            attributes: 1,
                            price: 1,
                            images: 1
                        }
                    }
                ],
                as: "productData"
            }
        },
        {
            $unwind: {
                path: "$productData",
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $project: {
                _id: 0,
                productId: "$productData._id",
                quantity: "$products.quantity",
                name: "$productData.productName",
                stock: "$productData.stock",
                isBlocked: "$productData.isBlocked",
                attributes: "$productData.attributes",
                price: "$productData.price",
                image: "$productData.images"
            }
        }

    )

    return await cartModel.aggregate(pipeline)


}