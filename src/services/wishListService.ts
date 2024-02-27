import { Types, Document, FilterQuery, UpdateQuery, ObjectId, Model, PipelineStage } from "mongoose";
import { cartModel, wishListModel } from "../models";
import { collections } from "../configs";


export interface IWishListProduct {
    productId: Types.ObjectId;
}

export interface IWishList {
    _id?: Types.ObjectId;
    userId?: Types.ObjectId;
    products?: IWishListProduct[];
}



export interface IWishListDoc extends Document {
    _id?: Types.ObjectId;
    userId?: Types.ObjectId;
    products?: IWishListProduct[];
}


export interface IWishListProductDetail {
    productId: Types.ObjectId;
    productName: string;
    shortDescription: string;
    sellingPrice: number;
    image: string;
    isBlocked: boolean;
}




export const createWishlist = async (productId: Types.ObjectId, userId: Types.ObjectId): Promise<any> => {
    return await wishListModel.create({
        userId: userId,
        products: [
            {
                productId: productId,
            },
        ],
    });
}
export const getWishList = async (userId: Types.ObjectId): Promise<IWishListDoc | null> => {
    return await wishListModel.findOne({ userId: userId });
}
export const checkItemExists = async (productId: Types.ObjectId): Promise<IWishListDoc | null> => {
    return await wishListModel.findOne({ "products.productId": productId }, { _id: 1 });
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
export const removeItemFromWishList = async (productId: Types.ObjectId, userId: Types.ObjectId): Promise<IWishListDoc | null> => {
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


export const getWishListProducts = async (userId: Types.ObjectId): Promise<IWishListProductDetail[]> => {


    let pipeline: PipelineStage[] = [];
    pipeline.push(
        {
            $match: {
                userId: userId
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
                                $eq: ["$_id", "$$productId"]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            productName: 1,
                            shortDescription: 1,
                            sellingPrice: 1,
                            isBlocked: 1,
                            image: { $arrayElemAt: ["$images.fileURL", 0] }
                        }
                    }
                ],
                as: "productData"
            }
        },
        {
            $unwind: {
                path: "$productData",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                userId: 1,
                productId: "$products.productId",
                productName: "$productData.productName",
                shortDescription: "$productData.shortDescription",
                sellingPrice: "$productData.sellingPrice",
                isBlocked: "$productData.isBlocked",
                image: "$productData.image",
            }
        }
    );

    return await wishListModel.aggregate(pipeline);
}