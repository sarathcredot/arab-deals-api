import { brandModel, vendorModel } from "../models";
import { Types, Document, QueryOptions, FilterQuery, ProjectionFields, PipelineStage } from "mongoose";
import { collections } from "../configs";


export interface IBrandRecord {
    _id?: string,
    brandId?: Types.ObjectId,
    brandName?: string,
    isBlocked?: boolean,
    isPopular?: boolean,
    priority?: number,
    logo?: {
        fileType?: string,
        fileURL?: string,
        mimeType?: string,
        originalName?: string
    }
}

export interface IBrandDocument extends Document {
    _id?: string,
    brandName?: string,
    isBlocked?: boolean,
    isPopular: boolean,
    priority: number,
    logo?: {
        fileType?: string,
        fileURL?: string,
        mimeType?: string,
        originalName?: string
    }
}

export interface IBrandRecordsProjection {
    _id?: 1,
    brandName?: 1,
    "logo._id"?: 1,
    "logo.fileType"?: 1,
    "logo.fileURL"?: 1,
    "logo.mimeType"?: 1,
    "logo.originalName"?: 1,
    "logo.createdAt"?: 1,
    isBlocked?: 1,
    isPopular?: 1,
    priority?: 1,
    createdAt?: 1,
    updatedAt?: 1,
}

export interface IBrandRecordsOptions {
    page: number,
    size: number,
    isBlocked: boolean,
    projection: IBrandRecordsProjection
}

export interface IBrandRecordsWithVendorOptions {
    page: number,
    size: number,
    vendorId: Types.ObjectId,
}

export interface IBrandRecordsResponse {
    records: Array<IBrandRecord>,
    maxRecords: number
}

export interface IBrandRecordsWithVendorResponse {
    records: Array<IBrandRecord>,
    maxRecords: number
}

export const createBrandRecord = async (record: IBrandRecord = {}): Promise<Document | null> => {
    return await brandModel.create(record);
}


export const getBrandWithId = async (id: Types.ObjectId): Promise<IBrandDocument | null> => {
    return await brandModel.findById(id);
}

export const getBrandWithFilters = async (filters = {}, projection: ProjectionFields<IBrandRecord>, options = {}): Promise<IBrandRecord | null> => {
    return await brandModel.findOne(filters, projection, options);
}


export const getBrandsWithFilter = async (filters = {}, projection: string = "", options: QueryOptions = {}) => {
    return await brandModel.find(filters, projection, options);
}

export const getBrandRecordsWithFilters = async (options: IBrandRecordsOptions): Promise<IBrandRecordsResponse> => {


    let pipeline: PipelineStage[] = [];

    pipeline.push(
        {
            $match: {
                isBlocked: options.isBlocked
            }
        },
        {
            $sort: {
                priority: -1,
            }
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

    const result = await brandModel.aggregate(pipeline);
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

export const getBrandRecordsWithVendorFilters = async (options: IBrandRecordsWithVendorOptions): Promise<IBrandRecordsWithVendorResponse> => {


    let pipeline: PipelineStage[] = [];

    pipeline.push(
        {
            $match: {
                _id: options.vendorId
            }
        },
        {
            $lookup: {
                from: collections.BRANDS,
                localField: "brands",
                foreignField: "_id",
                as: "brandDetails"
            }
        },
        {
            $unwind: "$brandDetails"
        },
        {
            $sort: {
                "brandDetails.priority": -1,
            }
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
                        $project: {
                            "_id": "$brandDetails._id",
                            "brandName": "$brandDetails.brandName",
                            "logo._id": "$brandDetails.logo._id",
                            "logo.fileType": "$brandDetails.logo.fileType",
                            "logo.fileURL": "$brandDetails.logo.fileURL",
                            "logo.mimeType": "$brandDetails.logo.mimeType",
                            "logo.originalName": "$brandDetails.logo.originalName",
                            "isBlocked": "$brandDetails.isBlocked",
                            "isPopular": "$brandDetails.isPopular",
                            "priority": "$brandDetails.priority",
                            "createdAt": "$brandDetails.createdAt",
                            "updatedAt": "$brandDetails.updatedAt",
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

    const result = await vendorModel.aggregate(pipeline);
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


export const deleteBrandRecord = async (filter: FilterQuery<IBrandRecord>): Promise<IBrandDocument | null> => {
    return await brandModel.findOneAndDelete(filter);
};