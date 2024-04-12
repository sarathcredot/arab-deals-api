import { Types, Document, FilterQuery, UpdateQuery, ObjectId, Model, Collection } from "mongoose";
import { cartModel } from "../models";
import { collections } from "../configs";

export interface Icart {
    productId: Types.ObjectId,
    quantity: number,
    userId: Types.ObjectId
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

export interface IUserCartProduct {
    productId: Types.ObjectId;
    quantity: number;
}

export interface IUserCartDocument extends Document {
    _id?: Types.ObjectId;
    products: IUserCartProduct[];
    userId: Types.ObjectId;
}


export interface FileData {
    _id?: Types.ObjectId,
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string,
    createdAt?: string
}


export interface ICartProduct {
    productId: Types.ObjectId;
    vendorId: Types.ObjectId;
    quantity: number;
    name: string;
    shortDescription: string;
    stock: number;
    isBlocked?: boolean;
    color: string;
    size: string;
    price: number;
    image: FileData;
    skuId: string;
    warehouseSkuId: string;
    sellingPrice: number;
    mrp: number;
}


export const createCart = async (productId: Types.ObjectId, userId: Types.ObjectId, quantity: number): Promise<any> => {
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

export const createBulkCart = async (userId: Types.ObjectId, products: IUserCartProduct[]): Promise<any> => {
    return await cartModel.create({
        userId: userId,
        products: products
    });
}
export const checkCartExist = async (userId: Types.ObjectId): Promise<IUserCartDocument | null> => {
    return await cartModel.findOne({ userId: userId });
}
export const checkItemExists = async (productId: Types.ObjectId): Promise<any> => {
    return await cartModel.exists({ "products.productId": productId });
}
export const editQuantityOfItem = async (productId: Types.ObjectId, userId: Types.ObjectId, quantity: number): Promise<any> => {
    const filter = { "products.productId": productId, userId };
    const update: UpdateQuery<any> = { $inc: { "products.$.quantity": quantity } };
    return await cartModel.updateOne(filter, update);
}
export const removeItem = async (productId: Types.ObjectId, userId: Types.ObjectId): Promise<any> => {
    return await cartModel.findOneAndUpdate(
        { userId: userId },
        { $pull: { products: { productId: productId } } },
        { new: true }
    );
}
export const updateQuantity = async (productId: Types.ObjectId, userId: Types.ObjectId, newQuantity: number): Promise<any> => {
    return await cartModel.findOneAndUpdate(
        { userId: userId, "products.productId": productId },
        { $set: { "products.$.quantity": newQuantity } },
        { new: true }
    );
}
export const addItem = async (productId: Types.ObjectId, userId: Types.ObjectId, quantity: number): Promise<any> => {
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

export const getCart = async (userId: Types.ObjectId): Promise<ICartProduct[]> => {
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
                            color: 1,
                            size: 1,
                            price: 1,
                            images: { $arrayElemAt: ["$images", 0] },
                            skuId: 1,
                            shortDescription: 1,
                            sellingPrice: 1,
                            mrp: 1
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
                color: "$productData.color",
                size: "$productData.size",
                price: "$productData.price",
                image: "$productData.images",
                skuId: "$productData.skuId",
                shortDescription: "$productData.shortDescription",
                sellingPrice: "$productData.sellingPrice",
                mrp: "$productData.mrp",
            }
        }

    )

    return await cartModel.aggregate(pipeline);


}



export const getOrderCart = async (userId: Types.ObjectId): Promise<ICartProduct[]> => {
    let pipeline: any = []
    pipeline.push(
        {
            $match: {
                userId: new Types.ObjectId(userId)
            }
        },
        {
            $project: {
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
                            vendorId: 1,
                            productName: 1,
                            stock: 1,
                            isBlocked: 1,
                            color: 1,
                            size: 1,
                            price: 1,
                            images: { $arrayElemAt: ["$images", 0] },
                            skuId: 1,
                            warehouseSkuId: 1,
                            shortDescription: 1,
                            sellingPrice: 1,
                            mrp: 1
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
                vendorId: "$productData.vendorId",
                productId: "$productData._id",
                quantity: "$products.quantity",
                name: "$productData.productName",
                stock: "$productData.stock",
                isBlocked: "$productData.isBlocked",
                color: "$productData.color",
                size: "$productData.size",
                price: "$productData.price",
                image: "$productData.images",
                skuId: "$productData.skuId",
                warehouseSkuId: "$productData.warehouseSkuId",
                shortDescription: "$productData.shortDescription",
                sellingPrice: "$productData.sellingPrice",
                mrp: "$productData.mrp",
            }
        }

    )

    return await cartModel.aggregate(pipeline);


}

export const emptyUserCart = async (userId: Types.ObjectId) => {
    return await cartModel.findOneAndUpdate({ userId: userId }, { products: [] })
}