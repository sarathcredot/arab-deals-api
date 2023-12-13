import { Types, PipelineStage, QueryOptions, Document, FilterQuery, UpdateQuery, ObjectId, Model } from "mongoose";
import { collections } from "../configs";
import { productModel } from "../models";




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
}


export interface IProductDocument extends Document {
    _id?: Types.ObjectId,
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
    categoryId?: 1,
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


export const getProductWithId = async (id: Types.ObjectId, projection: IProductsProjection = {}, options: QueryOptions = {}): Promise<Document | null> => {
    const result = await productModel.findById(id, projection, options);
    return result;
}

export const getProductWithFilters = async (filters: FilterQuery<IProduct>, projection: IProductsProjection = {}, options: QueryOptions = {}): Promise<IProductDocument | null> => {
    return await productModel.findOne(filters, projection, options);
}

export const deleteProduct = async (filter: FilterQuery<IProduct>): Promise<IProduct | null> => {
    return await productModel.findOneAndDelete(filter);
};

export const getProductsWithFilters = async (options: IProductsOptions): Promise<IProductsResponse> => {


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

    sort["_id"] = -1;


    pipeline.push(
        {
            $match: {
                isBlocked: false,
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

export const getProductsByAdminWithFilters = async (options: IProductsOptions): Promise<IProductsResponse> => {


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


export const getProductVariants = async (productCode: number): Promise<IVariant[]> => {
    let pipeline: PipelineStage[] = [];
    pipeline.push(
        {
            $match: {
                isBlocked: false,
                productCode: productCode
            }
        },
        {
            $lookup: {
                from: collections.COLORS,
                let: { color: "$color", categoryId: "$categoryId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$colorName", "$$color"]
                                    },
                                    {
                                        $eq: ["$categoryId", "$$categoryId"]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $limit: 1
                    },
                    {
                        $project: {
                            _id: 0,
                            colorCode: 1
                        }
                    }
                ],
                as: "colorData"
            }
        },
        {
            $unwind: "$colorData"
        },
        {
            $project: {
                _id: 1,
                color: 1,
                size: 1,
                colorCode: "$colorData.colorCode",
                stock: 1,
                isBlocked: 1,
            }
        }
    );
    let result: IVariant[] = await productModel.aggregate(pipeline);
    return result;
}


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
export const getAllProductVariants = async (productCode: number): Promise<IVariant[]> => {
    let pipeline: PipelineStage[] = [];
    pipeline.push(
        {
            $match: {
                productCode: productCode
            }
        },
        {
            $lookup: {
                from: collections.COLORS,
                let: { color: "$color", categoryId: "$categoryId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$colorName", "$$color"]
                                    },
                                    {
                                        $eq: ["$categoryId", "$$categoryId"]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $limit: 1
                    },
                    {
                        $project: {
                            _id: 0,
                            colorCode: 1
                        }
                    }
                ],
                as: "colorData"
            }
        },
        {
            $unwind: "$colorData"
        },
        {
            $project: {
                _id: 1,
                color: 1,
                size: 1,
                colorCode: "$colorData.colorCode",
                stock: 1,
                isBlocked: 1,
            }
        }
    );
    let result: IVariant[] = await productModel.aggregate(pipeline);
    return result;
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
                color: 1,
                size: 1,
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
            },
        },
    );

    const result: IProduct[] = await productModel.aggregate(pipeline);
    return result;
};

export const getVariantsWithFilters = async (filters: FilterQuery<IProduct>, projection: IProductsProjection = {}, options: QueryOptions = {}): Promise<IProductDocument[] | []> => {
    return await productModel.find(filters, projection, options);
}
