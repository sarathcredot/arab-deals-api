import { cms2Model } from "../models";
import { Types, PipelineStage, QueryOptions, Document, FilterQuery, ProjectionFields, UpdateQuery } from "mongoose";



export interface FileData {
    _id?: string,
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string,
    createdAt?: string
}

export interface ICm2Item {
    title?: string,
    subTitle?: string,
    image?: FileData,
    button?: {
        buttonText?: string,
        redirectionURL?: string
    }
}

export interface ICms2Record {
    _id?: string,
    pageName?: string,
    sectionName?: string,
    title?: string,
    subTitle?: string,
    items?: ICm2Item[]
    createdAt?: string
}

export interface ICms2RecordsProjection {
    _id?: 1,
    pageName?: 1,
    sectionName?: 1,
    title?: 1,
    subTitle?: 1,
    "items._id"?: 1,
    "items.title"?: 1,
    "items.subTitle"?: 1,
    "items.image.fileType"?: 1,
    "items.image.fileURL"?: 1,
    "items.image.mimeType"?: 1,
    "items.image.originalName"?: 1,
    "items.button._id"?: 1,
    "items.button.buttonText"?: 1,
    "items.button.redirectionURL"?: 1,
    createdAt?: 1,
    updatedAt?: 1,
}

export interface ICms2RecordsOptions {
    page: number,
    size: number,
    projection: ICms2RecordsProjection
}



export interface ICms2RecordsResponse {
    records: Array<ICms2Record>,
    maxRecords: number
}

export interface ICms2RecordUpdate extends Document{
    _id?: string,
    pageName?: string,
    sectionName?: string,
    title?: string,
    subTitle?: string,
    items?: ICm2Item[]
    createdAt?: string
}





export const createCms2Record = async (record: ICms2Record = {}): Promise<Document | null> => {
    return await cms2Model.create(record);
}


export const getCms2RecordsWithFilters = async (options: ICms2RecordsOptions): Promise<ICms2RecordsResponse> => {


    let pipeline: PipelineStage[] = [];

    pipeline.push(
        // {
        //     $match: {
        //         isBlocked: false
        //     }
        // },
        {
            $sort: { _id: -1 }
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

    const result = await cms2Model.aggregate(pipeline);
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

export const getLatestSection = async (): Promise<number> => {
    let count = 0;
    const pipeline: PipelineStage[] = [
        {
            $project: {
                count: {
                    $toInt: {
                        $last: {
                            $split: ["$sectionName", "-"]
                        }
                    }
                }
            }
        },
        {
            $sort: {
                count: -1
            }
        },
        {
            $limit: 1
        },
        {
            $project: {
                _id: 0,
                count: 1
            }
        }
    ];
    const result = await cms2Model.aggregate(pipeline);

    if (result && result.length) {
        count = result[0].count;
    }

    return count;
}

export const getCms2RecordWithSectionName = async (sectionNameField: string): Promise<ICms2Record | null> => {
    const query = { sectionName: sectionNameField };
    return await cms2Model.findOne(query);
}


export const getCms2RecordWithId = async (id: string): Promise<Document | null> => {
    const result = await cms2Model.findById(id);
    return result;
}


export const findOneAndUpdateCms2 = async (filters: FilterQuery<ICms2Record>, update: UpdateQuery<ICms2Record>, options: QueryOptions): Promise<ICms2Record | null> => {
    return await cms2Model.findOneAndUpdate(filters, update, options);
}


export const deleteCms2Record = async (filter: FilterQuery<ICms2Record>): Promise<ICms2Record | null> => {
    return await cms2Model.findOneAndDelete(filter);
};

export const getAllCms2RecordsWithFilters = async (options: ICms2RecordsOptions): Promise<ICms2RecordsResponse> => {


    let pipeline: PipelineStage[] = [];

    pipeline.push(
        {
            $sort: { _id: -1 }
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

    const result = await cms2Model.aggregate(pipeline);
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

export const getCms2RecordByAdminWithId = async (id: Types.ObjectId): Promise<Document | null> => {
    const result = await cms2Model.findById(id);
    return result;
}