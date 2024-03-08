import { cmsModel } from "../models";
import { Types, PipelineStage, QueryOptions, Document, FilterQuery, ProjectionFields, UpdateQuery } from "mongoose";



export interface FileData {
    _id?: string,
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string,
    createdAt?: string
}


export interface ICmsRecord {
    _id?: string,
    pageName?: string,
    sectionName?: string,
    images?: FileData[] | [],
    isBlocked?: boolean,
    buttons?: {
        buttonText?: string,
        redirectionURL?: string,
        _id?: string,
        createdAt?: string
    }[] | [],
    createdAt?: string
}

export interface ICmsRecordsProjection {
    _id?: 1,
    pageName?: 1,
    sectionName?: 1,
    "images._id"?: 1,
    "images.fileType"?: 1,
    "images.fileURL"?: 1,
    "images.mimeType"?: 1,
    "images.originalName"?: 1,
    "images.createdAt"?: 1,
    "buttons._id"?: 1,
    "buttons.buttonText"?: 1,
    "buttons.redirectionURL"?: 1,
    isBlocked?: 1,
    createdAt?: 1,
    updatedAt?: 1,
}

export interface ICmsRecordsOptions {
    page: number,
    size: number,
    projection: ICmsRecordsProjection,
    pageName?: string;
}



export interface ICmsRecordsResponse {
    records: Array<ICmsRecord>,
    maxRecords: number
}



export const createCmsRecord = async (record: ICmsRecord = {}): Promise<Document | null> => {
    return await cmsModel.create(record);
}


export const getCmsRecordsWithFilters = async (options: ICmsRecordsOptions): Promise<ICmsRecordsResponse> => {


    let pipeline: PipelineStage[] = [];

    if (options.pageName) {
        pipeline.push(
            {
                $match: {
                    pageName: options.pageName
                }
            }
        )
    }
    pipeline.push(
        {
            $match: {
                isBlocked: false
            }
        },
        {
            $sort: { pageName: 1, _id: 1 }
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

    const result = await cmsModel.aggregate(pipeline);
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

export const getLatestSection = async (pageName: string): Promise<number> => {

    let count = 0;
    const pipeline: PipelineStage[] = [
        {
            $match: {
                pageName: pageName
            }
        },
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
    const result = await cmsModel.aggregate(pipeline);

    if (result && result.length) {
        count = result[0].count;
    }

    return count;
}

export const getCmsRecordWithSectionName = async (sectionNameField: string, pageName: string): Promise<Document | null> => {
    const query = { sectionName: sectionNameField, pageName: pageName };
    const result = await cmsModel.findOne(query);
    return result;
}


export const getCmsRecordWithId = async (id: string): Promise<Document | null> => {
    const result = await cmsModel.findById(id);
    return result;
}


export const findOneAndUpdateCms = async (filters: FilterQuery<ICmsRecord>, update: UpdateQuery<ICmsRecord>, options: QueryOptions): Promise<ICmsRecord | null> => {
    return await cmsModel.findOneAndUpdate(filters, update, options);
}


export const deleteCmsRecord = async (filter: FilterQuery<ICmsRecord>): Promise<ICmsRecord | null> => {
    return await cmsModel.findOneAndDelete(filter);
};

export const getAllCmsRecordsWithFilters = async (options: ICmsRecordsOptions): Promise<ICmsRecordsResponse> => {


    let pipeline: PipelineStage[] = [];


    if (options.pageName) {
        pipeline.push(
            {
                $match: {
                    pageName: options.pageName
                }
            }
        )
    }

    pipeline.push(
        {
            $sort: { pageName: 1, _id: 1 }
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

    const result = await cmsModel.aggregate(pipeline);
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

export const getCmsRecordByAdminWithId = async (id: Types.ObjectId): Promise<Document | null> => {
    const result = await cmsModel.findById(id)
        ;
    return result;
}