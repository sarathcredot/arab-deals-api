import { sizeModel } from "../models";
import { Types, Document, QueryOptions, PipelineStage, ProjectionFields } from "mongoose";




export interface ISizeRecord {
    _id?: string,
    categoryId?: Types.ObjectId
    size?: string,
    isBlocked?: boolean,
    categoryIdPath?: string
}



export const createSizeRecord = async (record: ISizeRecord = {}): Promise<Document | null> => {
    return await sizeModel.create(record);
}


export const getSizeWithId = async (id: Types.ObjectId): Promise<Document | null> => {
    const result = await sizeModel.findById(id);
    return result;
}


export const getSizesWithFilter = async (filters = {}, projection: string = "", options: QueryOptions = {}) => {
    return await sizeModel.find(filters, projection, options);
}

export const getSizeWithFilter = async (filters = {}, projection: ProjectionFields<ISizeRecord>, options: QueryOptions = {}): Promise<ISizeRecord | null> => {
    return await sizeModel.findOne(filters, projection, options);
}

export const getActiveSizes = async (categoryId?: string): Promise<ISizeRecord[]> => {
    let pipeline: PipelineStage[] = [];
    if (categoryId) {
        pipeline.push(
            {
                $match: {
                    categoryIdPath: { $regex: new RegExp(categoryId) }
                }
            }
        );
    }
    pipeline.push(
        {
            $match: {
                isBlocked: false
            }
        },
        {
            $group: {
                _id: "$size",
                size: { $first: "$$ROOT" }
            }
        },
        {
            $replaceRoot: { newRoot: "$size" }
        },
        {
            $sort: {
                size: 1
            }
        },
        {
            $project: {
                _id: 1,
                size: 1,
            }
        }
    );
    return await sizeModel.aggregate(pipeline);
}

export const getAllSizes = async (categoryId?: string): Promise<ISizeRecord[]> => {
    let pipeline: PipelineStage[] = [];
    if (categoryId) {
        pipeline.push(
            {
                $match: {
                    categoryId: new Types.ObjectId(categoryId)
                }
            }
        );
    }
    pipeline.push(
        {
            $group: {
                _id: "$size",
                size: { $first: "$$ROOT" }
            }
        },
        {
            $replaceRoot: { newRoot: "$size" }
        },
        {
            $sort: {
                size: 1
            }
        },
        {
            $project: {
                _id: 1,
                size: 1,
                isBlocked: 1,
                categoryIdPath: 1,
            }
        }
    );
    return await sizeModel.aggregate(pipeline);
}