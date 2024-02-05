import { Types, PipelineStage, QueryOptions, Document, FilterQuery, UpdateQuery, ObjectId, Model } from "mongoose";
import mongoose from 'mongoose';
import { collections } from "../configs";
import { attributeValueModel, productModel } from "../models";
import { attributeService } from ".";




export interface FileData {
    _id?: string,
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string,
    createdAt?: string
}

export interface IProduct {
    _id?: string,
    vendorId?: string,
    brandId?: string,
    brandName?: string,
    productName?: string,
    shortDescription?: string,
    skuId?: string,
    description?: string,
    productInfo?: string[],
    productShortInfo?: string,
    color?: string,
    size?: string,
    material?: string,
    images?: FileData[],
    rating?: number,
    sellingPrice?: number,
    price?: number,
    mrp?: number,
    isBlocked?: boolean,
    tags?: string[],
    productCode?: number,
    stock?: number,
    createdAt?: string,
    updatedAt?: string,
    categoryId?: string,
    categoryNamePath?: string,
    categoryIdPath?: string,
    status?: string,
    attributes?: {
        attributeId: Types.ObjectId;
        attributeName: string;
        attributeValueId: Types.ObjectId;
        attributeValue: string;
        attributeDescription: string;
    }[];
    offerPrice?: number,
    remarks?: string
}


export interface IProductAttribute {
    attributeId: Types.ObjectId;
    attributeName: string;
    attributeValueId: Types.ObjectId;
    attributeValue: string;
    attributeDescription: string;
}

export interface IProductDocument extends Document {
    _id?: Types.ObjectId,
    vendorId?: string,
    brandId?: string,
    brandName?: string,
    productName?: string,
    shortDescription?: string,
    skuId?: string,
    description?: string,
    productShortInfo?: string
    productInfo?: string[],
    color?: string,
    size?: string,
    material?: string,
    images?: FileData[],
    rating?: number,
    sellingPrice?: number,
    price?: number,
    mrp?: number,
    isBlocked?: boolean,
    tags?: string[],
    productCode?: number,
    stock?: number,
    createdAt?: string,
    updatedAt?: string,
    categoryId?: string,
    categoryNamePath?: string,
    categoryIdPath?: string,
    status?: string,
    attributes?: [IProductAttribute];
    remarks?: string[];
}

export interface IProductsProjection {
    _id?: 1,
    productName?: 1,
    shortDescription?: 1,
    skuId?: 1,
    description?: 1,
    productShortInfo?: 1
    productInfo?: 1,
    color?: 1,
    size?: 1,
    material?: 1,
    "images._id"?: 1,
    "images.fileType"?: 1,
    "images.fileURL"?: 1,
    "images.mimeType"?: 1,
    "images.originalName"?: 1,
    "images.createdAt"?: 1,
    rating?: 1,
    sellingPrice?: 1,
    price?: 1,
    mrp?: 1,
    tags?: 1,
    productCode?: 1,
    stock?: 1,
    createdAt?: 1,
    updatedAt?: 1,
    categoryId?: 1
    status?: 1,
    attributes?: 1,
    remarks?: 1
}


export interface IProductProjection {
    _id?: 1,
    productName?: 1,
    shortDescription?: 1,
    productShortInfo?: 1,
    productInfo?: 1,
    skuId?: 1,
    description?: 1,
    color?: 1,
    size?: 1,
    material?: 1,
    "images._id"?: 1,
    "images.fileType"?: 1,
    "images.fileURL"?: 1,
    "images.mimeType"?: 1,
    "images.originalName"?: 1,
    "images.createdAt"?: 1,
    rating?: 1,
    sellingPrice?: 1,
    price?: 1,
    mrp?: 1,
    tags?: 1,
    productCode?: 1,
    stock?: 1,
    createdAt?: 1,
    updatedAt?: 1,
    status?: 1,
    attributes?: 1,
    remarks?: 1
}

export interface IProductsOptions {
    page: number,
    size: number,
    projection: IProductsProjection,
    color?: string[],
    productSize?: string[],
    minPrice?: number | null,
    maxPrice?: number | null,
    newest?: boolean,
    priceLowToHigh?: boolean,
    priceHighToLow?: boolean,
    query?: string,
    categories?: string[],
    parentCategory?: string,
    brands?: string[],
    attributes?: Array<{ id: string, values: string[] }>,
}

export interface IProductsPriceRangeOptions {
    categories?: string[]
}

export interface IProductsByVendorOptions {
    vendorId: Types.ObjectId,
    page: number,
    size: number,
    projection: IProductsProjection,
    color?: string[],
    productSize?: string[],
    minPrice?: number | null,
    maxPrice?: number | null,
    newest?: boolean,
    priceLowToHigh?: boolean,
    priceHighToLow?: boolean,
    query?: string,
    categories?: string[],
    parentCategory?: string
}

export interface IProductsResponse {
    records: Array<IProduct>,
    maxRecords: number
}

export interface IVariant {
    _id: string,
    color: string,
    size: string,
    stock: number,
    colorCode: string,
    categoryId: string,
    productCode: number,
}

export interface IVariantTablesByAdmin {
    _id: string,
    productName: string,
    attributes: {
        attributeId: Types.ObjectId;
        attributeName: string;
        attributeValueId: Types.ObjectId;
        attributeValue: string;
        attributeDescription: string;
    }[],
    stock: number,
    status: string,
    images?: FileData[]
}

export interface IVariantTablesByAdminOptions {
    page: number,
    size: number,
    productCode: number,
}


export interface IProductSuggestion {
    productName: string,
    color: string
}

export const findOneAndUpdateProduct = async (filters: FilterQuery<IProduct>, update: UpdateQuery<IProduct>, options: QueryOptions): Promise<IProduct | null> => {
    return await productModel.findOneAndUpdate(filters, update, options);
}

export const getLatestProductCode = async (): Promise<number> => {
    const product = await productModel.findOne({}, "_id productCode", { lean: true }).sort({ productCode: -1 });
    return product?.productCode || 0;
}



export const createProduct = async (productData: IProduct): Promise<Document> => {
    const newProduct = await productModel.create(productData);
    return newProduct;
}


export const getProductWithId = async (id: Types.ObjectId, projection: IProductsProjection = {}, options: QueryOptions = {}): Promise<any> => {
    const result = await productModel.findById(id, projection, options);
    return result;
}

export const getProductWithFilters = async (filters: FilterQuery<IProduct>, projection: IProductsProjection = {}, options: QueryOptions = {}): Promise<IProductDocument | null> => {
    return await productModel.findOne(filters, projection, options);
}

export const deleteProduct = async (filter: FilterQuery<IProduct>): Promise<IProduct | null> => {
    return await productModel.findOneAndDelete(filter);
};

export const getProductsWithFilters = async (options: IProductsOptions): Promise<any> => {


    let pipeline: PipelineStage[] = [];

    let sort: { [key: string]: 1 | -1 } = {};


    if (options?.attributes?.length) {
        options.attributes.forEach((attribute) => {
            pipeline.push({
                $match: {
                    'attributes.attributeId': new Types.ObjectId(attribute.id),
                    'attributes.attributeValueId': { $in: attribute.values.map(value => new Types.ObjectId(value)) }
                }
            });
        });
    }

    if (options.query || options.color?.length || options.productSize?.length) {
        let query = options.query || '';
        if (options.productSize?.length) {
            query = query.concat(" ", options.productSize.join(" "));
        }
        if (options.color?.length) {
            query = query.concat(" ", options.color.join(" "));
        }
        query = query.trim();
        pipeline.push(
            { $match: { $text: { $search: query } } },
            {
                $addFields: {
                    score: { $meta: "textScore" }
                }
            }
        );
        sort = { score: -1 }
    }

    if (options.minPrice) {
        pipeline.push({
            $match: {
                sellingPrice: { $gte: options.minPrice }
            }
        });
    }

    if (options.maxPrice) {
        pipeline.push({
            $match: {
                sellingPrice: { $lte: options.maxPrice }
            }
        });
    }

    if (options.categories?.length) {
        const regexExpressions = options.categories.map((item) => ({
            categoryIdPath: { $regex: new RegExp(`${item}`) }
        }));
        pipeline.push({
            $match: {
                $or: regexExpressions
            }
        });
    } else if (options.parentCategory) {
        let regex = new RegExp(`${options.parentCategory}`)
        pipeline.push({
            $match: {
                categoryIdPath: { $regex: regex }
            }
        });
    }

    if (options.brands?.length) {
        const regexExpressions = options.brands.map((item) => ({
            brandId: new Types.ObjectId(item)
        }));
        pipeline.push({
            $match: {
                $or: regexExpressions
            }
        });
    }


    if (options.newest) {
        sort = { createdAt: -1 }
    }

    else if (options.priceLowToHigh) {
        sort = { sellingPrice: 1 }

    }

    else if (options.priceHighToLow) {
        sort = { sellingPrice: -1 }
    }

    sort["_id"] = -1;


    pipeline.push(
        {
            $match: {
                isBlocked: false,
                status: "APPROVED"
            }
        },
        {
            $sort: sort
        },
        {
            $group: {
                _id: "$productCode",
                product: { $first: "$$ROOT" }
            }
        },
        {
            $replaceRoot: { newRoot: "$product" }
        },
        {
            $sort: sort
        },
        {
            $facet: {
                metadata: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 }
                        }
                    }
                ],
                data: [
                    {
                        $skip: options.page * options.size
                    },
                    {
                        $limit: options.size
                    },
                    {
                        $project: options.projection
                    }
                ]
            }
        },
        {
            $project: {
                maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
                data: 1
            }
        }
    );

    const result = await productModel.aggregate(pipeline);
    let response = {
        records: [],
        maxRecords: 0
    };
    if (result.length) {
        response.records = result[0].data || [];
        response.maxRecords = result[0].maxRecords || 0;
    }

    return response;
}

export const getProductsMaxPriceRangeWithCategories = async (options: IProductsPriceRangeOptions): Promise<any> => {
    let pipeline: PipelineStage[] = [];
    let sort: { [key: string]: 1 | -1 } = {};

    if (options.categories?.length) {
        const regexExpressions = options.categories.map((item) => ({
            categoryIdPath: { $regex: new RegExp(`${item}`) }
        }));
        pipeline.push({
            $match: {
                $or: regexExpressions
            }
        });
    }

    // Add a new stage to group all products and get the max sellingPrice
    pipeline.push(
        {
            $group: {
                _id: null,
                maxSellingPrice: { $max: "$sellingPrice" }
            }
        }
    );

    sort["_id"] = -1;

    pipeline.push(
        {
            $sort: sort
        },
        {
            $project: {
                _id: 0,
                maxSellingPrice: 1
            }
        }
    );

    const result = await productModel.aggregate(pipeline);

    return result[0] ? result[0].maxSellingPrice : null;
}

export const getProductsByAdminWithFilters = async (options: IProductsOptions): Promise<any> => {


    let pipeline: PipelineStage[] = [];

    let sort: { [key: string]: 1 | -1 } = {};




    if (options.query || options.color?.length || options.productSize?.length) {
        let query = options.query || '';
        if (options.productSize?.length) {
            query = query.concat(" ", options.productSize.join(" "));
        }
        if (options.color?.length) {
            query = query.concat(" ", options.color.join(" "));
        }
        query = query.trim();
        pipeline.push(
            { $match: { $text: { $search: query } } },
            {
                $addFields: {
                    score: { $meta: "textScore" }
                }
            }
        );
        sort = { score: -1 }
    }

    if (options.minPrice) {
        pipeline.push({
            $match: {
                sellingPrice: { $gte: options.minPrice }
            }
        });
    }

    if (options.maxPrice) {
        pipeline.push({
            $match: {
                sellingPrice: { $lte: options.maxPrice }
            }
        });
    }

    if (options.categories?.length) {
        const regexExpressions = options.categories.map((item) => ({
            categoryIdPath: { $regex: new RegExp(`${item}`) }
        }));
        pipeline.push({
            $match: {
                $or: regexExpressions
            }
        });
    } else if (options.parentCategory) {
        let regex = new RegExp(`${options.parentCategory}`)
        pipeline.push({
            $match: {
                categoryIdPath: { $regex: regex }
            }
        });
    }


    if (options.newest) {
        sort = { createdAt: -1 }
    }

    else if (options.priceLowToHigh) {
        sort = { sellingPrice: 1 }

    }

    else if (options.priceHighToLow) {
        sort = { sellingPrice: -1 }
    }

    sort["_id"] = 1;


    pipeline.push(
        {
            $group: {
                _id: "$productCode",
                product: { $first: "$$ROOT" }
            }
        },
        {
            $sort: sort
        },
        {
            $replaceRoot: { newRoot: "$product" }
        },
        {
            $sort: sort
        },
        {
            $facet: {
                metadata: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 }
                        }
                    }
                ],
                data: [
                    {
                        $skip: options.page * options.size
                    },
                    {
                        $limit: options.size
                    },
                    {
                        $project: options.projection
                    }
                ]
            }
        },
        {
            $project: {
                maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
                data: 1
            }
        }
    );

    const result = await productModel.aggregate(pipeline);
    let response = {
        records: [],
        maxRecords: 0
    };
    if (result.length) {
        response.records = result[0].data || [];
        response.maxRecords = result[0].maxRecords || 0;
    }

    return response;
}


export const getProductsByVendorWithFilters = async (options: IProductsByVendorOptions): Promise<any> => {


    let pipeline: PipelineStage[] = [];

    let sort: { [key: string]: 1 | -1 } = {};


    if (options.vendorId) {
        pipeline.push({
            $match: {
                vendorId: options.vendorId
            }
        });
    }

    if (options.query || options.color?.length || options.productSize?.length) {
        let query = options.query || '';
        if (options.productSize?.length) {
            query = query.concat(" ", options.productSize.join(" "));
        }
        if (options.color?.length) {
            query = query.concat(" ", options.color.join(" "));
        }
        query = query.trim();
        pipeline.push(
            { $match: { $text: { $search: query } } },
            {
                $addFields: {
                    score: { $meta: "textScore" }
                }
            }
        );
        sort = { score: -1 }
    }

    if (options.minPrice) {
        pipeline.push({
            $match: {
                sellingPrice: { $gte: options.minPrice }
            }
        });
    }

    if (options.maxPrice) {
        pipeline.push({
            $match: {
                sellingPrice: { $lte: options.maxPrice }
            }
        });
    }

    if (options.categories?.length) {
        const regexExpressions = options.categories.map((item) => ({
            categoryIdPath: { $regex: new RegExp(`${item}`) }
        }));
        pipeline.push({
            $match: {
                $or: regexExpressions
            }
        });
    } else if (options.parentCategory) {
        let regex = new RegExp(`${options.parentCategory}`)
        pipeline.push({
            $match: {
                categoryIdPath: { $regex: regex }
            }
        });
    }


    if (options.newest) {
        sort = { createdAt: -1 }
    }

    else if (options.priceLowToHigh) {
        sort = { sellingPrice: 1 }

    }

    else if (options.priceHighToLow) {
        sort = { sellingPrice: -1 }
    }

    sort["_id"] = 1;


    pipeline.push(
        {
            $group: {
                _id: "$productCode",
                product: { $first: "$$ROOT" }
            }
        },
        {
            $sort: sort
        },
        {
            $replaceRoot: { newRoot: "$product" }
        },
        {
            $sort: sort
        },
        {
            $facet: {
                metadata: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 }
                        }
                    }
                ],
                data: [
                    {
                        $skip: options.page * options.size
                    },
                    {
                        $limit: options.size
                    },
                    {
                        $project: options.projection
                    }
                ]
            }
        },
        {
            $project: {
                maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
                data: 1
            }
        }
    );

    const result = await productModel.aggregate(pipeline);
    let response = {
        records: [],
        maxRecords: 0
    };
    if (result.length) {
        response.records = result[0].data || [];
        response.maxRecords = result[0].maxRecords || 0;
    }

    return response;
}

// export const getProductVariants = async (productCode: number): Promise<IVariant[]> => {
//     let pipeline: PipelineStage[] = [];
//     pipeline.push(
//         {
//             $match: {
//                 isBlocked: false,
//                 productCode: productCode
//             }
//         },
//         {
//             $lookup: {
//                 from: collections.COLORS,
//                 let: { color: "$color", categoryId: "$categoryId" },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: {
//                                 $and: [
//                                     {
//                                         $eq: ["$colorName", "$$color"]
//                                     },
//                                     {
//                                         $eq: ["$categoryId", "$$categoryId"]
//                                     }
//                                 ]
//                             }
//                         }
//                     },
//                     {
//                         $limit: 1
//                     },
//                     {
//                         $project: {
//                             _id: 0,
//                             colorCode: 1
//                         }
//                     }
//                 ],
//                 as: "colorData"
//             }
//         },
//         {
//             $unwind: "$colorData"
//         },
//         {
//             $project: {
//                 _id: 1,
//                 color: 1,
//                 size: 1,
//                 colorCode: "$colorData.colorCode",
//                 stock: 1,
//                 isBlocked: 1,
//             }
//         }
//     );
//     let result: IVariant[] = await productModel.aggregate(pipeline);
//     return result;
// }

// GET ALL PRODUCTS MATCHING THAT PRODUCT AND PROJECT ALL ITS ATTRIBUTES IDS AND VALUES
export const getProductVariants = async (productCode: number): Promise<any> => {
    const pipeline: PipelineStage[] = [
        {
            $match: {
                productCode: productCode
            }
        },
        {
            $unwind: '$attributes' // Assuming 'attributes' is the array containing attribute information
        },
        {
            $lookup: {
                from: collections.ATTRIBUTES,
                localField: 'attributes.attributeId',
                foreignField: '_id',
                as: 'attribute'
            }
        },
        {
            $unwind: '$attribute'
        },
        {
            $lookup: {
                from: collections.ATTRIBUTE_VALUES, // Assuming 'ATTRIBUTE_VALUES' is the collection for attribute values
                localField: 'attributes.attributeValueId',
                foreignField: '_id',
                as: 'attributeValue'
            }
        },
        {
            $unwind: '$attributeValue'
        },
        {
            $project: {
                _id: 0,
                productId: '$_id',
                attributeId: '$attribute._id',
                attributeName: '$attribute.name',
                attributeDescription: {
                    $ifNull: ['$attribute.description', null]
                },
                attributeValueId: '$attributes.attributeValueId',
                attributeValue: '$attributes.attributeValue',
                colorCode: '$attributes.colorCode'
            }
        }
    ];

    const result = await productModel.aggregate(pipeline); // Assuming 'productModel' is the model for products
    return result;
};


export const getProductVariantsByAdminTable = async (options: QueryOptions): Promise<any> => {
    let pipeline: PipelineStage[] = [];
    pipeline.push(
        {
            $match: {
                productCode: options.productCode,
                status: { $ne: "PENDING" }
            }
        },
        // Lookup related products with the same categoryId (excluding the current product)
        {
            $lookup: {
                from: collections.PRODUCTS,
                let: { categoryId: "$categoryId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $ne: ["$_id", "$$categoryId"] }, // Exclude the current product
                                    { $eq: ["$categoryId", "$$categoryId"] } // Match products with the same categoryId
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            productName: 1,
                            _id: 1,
                            images: 1,
                            attributes: 1,
                            stock: 1,
                            status: 1,
                            isBlocked: 1
                        }
                    }
                ],
                as: "relatedProducts"
            }
        },
        // Project specific fields from the result
        // {
        //     $project: {
        //         _id: 1,
        //         productName: 1,
        //         images: 1,
        //         attributes: 1,
        //         stock: 1,
        //         status: 1,
        //         isBlocked: 1,
        //         relatedProducts: 1
        //     }
        // },
        // Pagination
        {
            $facet: {
                metadata: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 }
                        }
                    }
                ],
                data: [
                    {
                        $skip: options.page * options.size
                    },
                    {
                        $limit: options.size
                    },
                    {
                        $project: {
                            _id: 1,
                            productName: 1,
                            images: 1,
                            attributes: 1,
                            stock: 1,
                            status: 1,
                            isBlocked: 1,
                            relatedProducts: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
                data: 1
            }
        }
    );

    const result: any[] = await productModel.aggregate(pipeline);
    let response = {
        records: [],
        maxRecords: 0
    };

    if (result.length) {
        response.records = result[0].data || [];
        response.maxRecords = result[0].maxRecords || 0;
    }

    return response;
};

export const getProductVariantsByVendorTable = async (options: QueryOptions): Promise<any> => {
    let pipeline: PipelineStage[] = [];
    pipeline.push(
        {
            $match: {
                productCode: options.productCode
            }
        },
        // Lookup related products with the same categoryId (excluding the current product)
        {
            $lookup: {
                from: collections.PRODUCTS,
                let: { categoryId: "$categoryId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $ne: ["$_id", "$$categoryId"] }, // Exclude the current product
                                    { $eq: ["$categoryId", "$$categoryId"] } // Match products with the same categoryId
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            productName: 1,
                            _id: 0,
                            images: 1,
                            attributes: 1,
                            stock: 1,
                            status: 1,
                            isBlocked: 1
                        }
                    }
                ],
                as: "relatedProducts"
            }
        },
        // Project specific fields from the result
        // {
        //     $project: {
        //         _id: 1,
        //         productName: 1,
        //         images: 1,
        //         attributes: 1,
        //         stock: 1,
        //         status: 1,
        //         isBlocked: 1,
        //         relatedProducts: 1
        //     }
        // },
        // Pagination
        {
            $facet: {
                metadata: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 }
                        }
                    }
                ],
                data: [
                    {
                        $skip: options.page * options.size
                    },
                    {
                        $limit: options.size
                    },
                    {
                        $project: {
                            _id: 1,
                            productName: 1,
                            images: 1,
                            attributes: 1,
                            stock: 1,
                            status: 1,
                            isBlocked: 1,
                            relatedProducts: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
                data: 1
            }
        }
    );

    const result: any[] = await productModel.aggregate(pipeline);
    let response = {
        records: [],
        maxRecords: 0
    };

    if (result.length) {
        response.records = result[0].data || [];
        response.maxRecords = result[0].maxRecords || 0;
    }

    return response;
};



export const getProductsAutoComplete = async (query: string): Promise<IProductSuggestion[]> => {


    let pipeline: PipelineStage[] = [];

    pipeline.push(
        {
            $search: {
                index: "productNameSearchIndex",
                'compound': {
                    'should': [
                        {
                            autocomplete: {
                                query: query,
                                path: "shortDescription",
                                fuzzy: { "maxEdits": 1, "prefixLength": 3, "maxExpansions": 256 },
                            }
                        },
                        {
                            autocomplete: {
                                query: query,
                                path: "productName",
                                fuzzy: { "maxEdits": 1, "prefixLength": 3, "maxExpansions": 256 },
                            }
                        },
                        {
                            autocomplete: {
                                query: query,
                                path: "color",
                                fuzzy: { "maxEdits": 1, "prefixLength": 3, "maxExpansions": 256 },
                            }
                        },
                        {
                            autocomplete: {
                                query: query,
                                path: "size",
                                fuzzy: { "maxEdits": 1, "prefixLength": 3, "maxExpansions": 256 },
                            }
                        }
                    ],
                    'minimumShouldMatch': 1
                }
            }
        },
        {
            $group: {
                _id: "$productCode",
                product: { $first: "$$ROOT" }
            }
        },
        {
            $replaceRoot: { newRoot: "$product" }
        },
        {
            $match: {
                isBlocked: false,
            }
        },
        {
            $project: {
                _id: 0,
                productName: 1,
                color: 1,
                score: { $meta: "searchScore" }
            }
        },
        {
            $sort: {
                score: -1
            }
        },
        {
            $limit: 3
        },
        {
            $project: {
                productName: 1,
                color: 1,
            }
        },
    );

    return await productModel.aggregate(pipeline);
}

// function for admin to fetch all variants with blocked and unblocked variants
// export const getAllProductVariants = async (productCode: number): Promise<IVariant[]> => {
//     let pipeline: PipelineStage[] = [];
//     pipeline.push(
//         {
//             $match: {
//                 productCode: productCode
//             }
//         },
//         {
//             $lookup: {
//                 from: collections.COLORS,
//                 let: { color: "$color", categoryId: "$categoryId" },
//                 pipeline: [
//                     {
//                         $match: {
//                             $expr: {
//                                 $and: [
//                                     {
//                                         $eq: ["$colorName", "$$color"]
//                                     },
//                                     {
//                                         $eq: ["$categoryId", "$$categoryId"]
//                                     }
//                                 ]
//                             }
//                         }
//                     },
//                     {
//                         $limit: 1
//                     },
//                     {
//                         $project: {
//                             _id: 0,
//                             colorCode: 1
//                         }
//                     }
//                 ],
//                 as: "colorData"
//             }
//         },
//         {
//             $unwind: "$colorData"
//         },
//         {
//             $project: {
//                 _id: 1,
//                 color: 1,
//                 size: 1,
//                 colorCode: "$colorData.colorCode",
//                 stock: 1,
//                 isBlocked: 1,
//             }
//         }
//     );
//     let result: IVariant[] = await productModel.aggregate(pipeline);
//     return result;
// }
export const getAllProductVariantsByAdminWithProductCode = async (options: QueryOptions): Promise<any> => {
    let pipeline: PipelineStage[] = [];
    pipeline.push(
        {
            $match: {
                productCode: options.productCode
            }
        },
        // Pagination
        {
            $facet: {
                metadata: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 }
                        }
                    }
                ],
                data: [
                    {
                        $skip: options.page * options.size
                    },
                    {
                        $limit: options.size
                    },
                    {
                        $project: {
                            _id: 1,
                            productName: 1,
                            images: 1,
                            attributes: 1,
                            stock: 1,
                            status: 1,
                            isBlocked: 1,
                        }
                    }
                ]
            }
        },
        {
            $project: {
                maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
                data: 1
            }
        }
    );
    const result = await productModel.aggregate(pipeline);

    let response = {
        records: [],
        maxRecords: 0
    };

    if (result.length) {
        response.records = result[0].data || [];
        response.maxRecords = result[0].maxRecords || 0;
    }

    return response;
}



export const getProductVariantsByProductCode = async (productCode: number): Promise<IVariant[]> => {
    let pipeline: PipelineStage[] = [];
    pipeline.push(
        {
            $match: {
                productCode: productCode
            }
        },
        {
            $limit: 1
        },
        {
            $project: {
                _id: 0,
                categoryId: 1,
            }
        },

    );
    let result: IVariant[] = await productModel.aggregate(pipeline);
    return result;
}

export const getProductsByCategory = async (options: QueryOptions): Promise<IProduct[] | []> => {
    const limit = options.limit ? Math.min(options.limit, 100) : 12;
    let pipeline: PipelineStage[] = [];
    pipeline.push(
        {
            $match: {
                categoryIdPath: { $regex: new RegExp(`${options.categoryId}`) },
                productCode: { $ne: options.productCode },
                isBlocked: false,
            },
        },
        {
            $group: {
                _id: "$productCode",
                product: { $first: "$$ROOT" },
            },
        },
        {
            $replaceRoot: { newRoot: "$product" },
        },
        {
            $limit: limit,
        },
        {
            $project: {
                _id: 1,
                productName: 1,
                shortDescription: 1,
                skuId: 1,
                description: 1,
                // color: 1,
                // size: 1,
                material: 1,
                images: 1,
                rating: 1,
                sellingPrice: 1,
                price: 1,
                mrp: 1,
                isBlocked: 1,
                tags: 1,
                productCode: 1,
                stock: 1,
                brandId: 1,
                brandName: 1,
                vendorId: 1,
                offerPrice: 1,
                remarks: 1,
                status: 1,
            },
        },
    );

    const result: IProduct[] = await productModel.aggregate(pipeline);
    return result;
};

export const getVariantsWithFilters = async (filters: FilterQuery<IProduct>, projection: IProductsProjection = {}, options: QueryOptions = {}): Promise<IProductDocument[] | []> => {
    return await productModel.find(filters, projection, options);
}

// Find with attributes ids in product attruibutes and take each ids attribute value, is and its main attribute
export const getProductsAttributesData = async (attributeValueIds: Types.ObjectId[]): Promise<any> => {
    const pipeline: PipelineStage[] = [
        {
            $match: {
                _id: { $in: attributeValueIds }
            }
        },
        {
            $lookup: {
                from: collections.ATTRIBUTES,
                localField: 'attributeId',
                foreignField: '_id',
                as: 'attribute'
            }
        },
        {
            $unwind: '$attribute'
        },
        {
            $project: {
                _id: 0,
                attributeId: '$attribute._id',
                attributeName: '$attribute.name',
                attributeDescription: {
                    $ifNull: ['$attribute.description', null]
                },
                attributeValueId: '$_id',
                attributeValue: '$value',

            }
        }
    ];

    const result = await attributeValueModel.aggregate(pipeline);
    return result;
};


export const findAllProducts = async (filters: FilterQuery<IProduct>, projection: IProductsProjection = {}, options: QueryOptions = {}): Promise<any[]> => {
    return await productModel.find(filters, projection, options);
};


// check repeated ids of attribute value ids
export const getProductsVairantsIds = async (productCode: number): Promise<any> => {
    const pipeline: PipelineStage[] = [
        { $match: { productCode: productCode } },
        { $project: { attributes: 1 } }, // Only retrieve the 'attributes' field
        { $unwind: "$attributes" }, // Flatten the 'attributes' array
        { $group: { _id: null, existAttrIds: { $addToSet: { $toString: "$attributes.attributeValueId" } } } },
        { $project: { _id: 0, existAttrIds: 1 } }
    ];

    const result = await productModel.aggregate(pipeline);
    return result;
};