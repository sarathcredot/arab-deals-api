import { brandModel, countriesModel } from "../models";
import { Types, Document, QueryOptions, FilterQuery, ProjectionFields, PipelineStage } from "mongoose";
import { collections } from "../configs";


export interface ICountryRecord {
    _id?: string,
    name?: string,
    countryCode?: string,
    isBlocked?: boolean,
    countryLogo?: {
        fileType?: string,
        fileURL?: string,
        mimeType?: string,
        originalName?: string
    }
}

export interface ICountryDocument extends Document {
    _id?: string,
    name?: string,
    countryCode?: string,
    isBlocked?: boolean,
    countryLogo?: {
        fileType?: string,
        fileURL?: string,
        mimeType?: string,
        originalName?: string
    }
}

export interface ICountryRecordsProjection {
    _id?: 1,
    brandName?: 1,
    "countryLogo._id"?: 1,
    "countryLogo.fileType"?: 1,
    "countryLogo.fileURL"?: 1,
    "countryLogo.mimeType"?: 1,
    "countryLogo.originalName"?: 1,
    "countryLogo.createdAt"?: 1,
    name?: 1,
    countryCode?: 1,
    isBlocked?: 1,
}

export interface ICountryRecordsOptions {
    page: number,
    size: number,
    isBlocked: boolean,
    projection: ICountryRecordsProjection
}

export interface ICountryRecordsOptions {
    page: number,
    size: number,
    isBlocked: boolean,
    projection: ICountryRecordsProjection
}

export interface ICountryRecordsResponse {
    records: Array<ICountryRecord>,
    maxRecords: number
}


export const createCountryRecord = async (record: ICountryRecord = {}): Promise<any> => {
    return await countriesModel.create(record);
}


export const getCountryWithId = async (id: Types.ObjectId): Promise<ICountryDocument | null> => {
    return await brandModel.findById(id);
}

export const getCountryWithFilters = async (filters = {}, projection: ProjectionFields<ICountryRecord>, options = {}): Promise<ICountryRecord | null> => {
    return await brandModel.findOne(filters, projection, options);
}


export const getCountriesWithFilter = async (filters = {}, projection: string = "", options: QueryOptions = {}): Promise<any> => {
    return await brandModel.find(filters, projection, options);
}

export const getCountryRecordsWithFilters = async (options: ICountryRecordsOptions): Promise<ICountryRecordsResponse> => {


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

// export const getCountryRecordsWithFilters = async (options: ICountryRecordsOptions): Promise<ICountryRecordsResponse> => {


//     let pipeline: PipelineStage[] = [];

//     pipeline.push(
//         {
//             $match: {
//                 isBlocked: options.isBlocked
//             }
//         },
//         {
//             $sort: {
//                 priority: -1,
//             }
//         },
//         {
//             $facet: {
//                 metadata: [
//                     {
//                         $group: {
//                             _id: null,
//                             total: { $sum: 1 }
//                         }
//                     }
//                 ],
//                 data: [
//                     {
//                         $skip: options.page * options.size
//                     },
//                     {
//                         $limit: options.size
//                     },
//                     {
//                         $project: options.projection
//                     }
//                 ]
//             }
//         },
//         {
//             $project: {
//                 maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
//                 data: 1
//             }
//         }
//     );

//     const result = await brandModel.aggregate(pipeline);
//     let response = {
//         records: [],
//         maxRecords: 0
//     };
//     if (result.length) {
//         response.records = result[0].data || [];
//         response.maxRecords = result[0].maxRecords || 0;
//     }

//     return response;
// }



export const deleteCountryRecord = async (filter: FilterQuery<ICountryRecord>): Promise<ICountryDocument | null> => {
    return await brandModel.findOneAndDelete(filter);
};   
