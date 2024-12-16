import { jobQueueModel, orderModel } from "../models";
import { Types, Document, QueryOptions, FilterQuery, ProjectionFields, PipelineStage } from "mongoose";




export interface IJob {
    _id?: Types.ObjectId;
    name?: string;
    status?: string;
    isExpired?: boolean;
    metadata?: {
        filePath?: string
    };
}

export interface IJobDocument extends Document {
    _id?: Types.ObjectId;
    name?: string;
    status?: string;
    isExpired?: boolean;
    metadata?: {
        filePath?: string
    };
    createdAt?: Date;
}


export interface IGetJobsResponse {
    maxRecords: number;
    records: IJobDocument[];
}


export interface IGetJobsOptions {
    page: number;
    size: number;
    name?: string;
    agentId?:Types.ObjectId
}



export const createJob = async (record: IJob = {}): Promise<IJobDocument> => {
    return await jobQueueModel.create(record);
}

export const getJob = async (filters: FilterQuery<IJob>, projection: ProjectionFields<IJob>, options: QueryOptions): Promise<IJobDocument | null> => {
    return await jobQueueModel.findOne(filters, projection, options);
}


export const getJobs = async (options: IGetJobsOptions): Promise<IGetJobsResponse> => {

    let pipeline: PipelineStage[] = [];


    if (options.name) {
        pipeline.push(
            {
                $match: {
                    name: options.name
                }
            },
            {
                $match: {
                    agentId: options.agentId
                }
            },
        )
    }

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
                        $project: {
                            _id: 1,
                            name: 1,
                            status: 1,
                            isExpired: 1,
                            createdAt: 1
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

    const result = await jobQueueModel.aggregate(pipeline);
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