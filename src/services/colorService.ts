import { colorModel, productModel } from "../models";
import { Types, Document, QueryOptions, FilterQuery, ProjectionFields, PipelineStage } from "mongoose";




export interface IColorRecord {
    _id?: string,
    categoryId?: Types.ObjectId,
    colorName?: string,
    colorCode?: string,
    isBlocked?: boolean,
    categoryIdPath?: string,
}

export interface IColorDocument extends Document {
    _id?: string,
    categoryId?: Types.ObjectId,
    colorName?: string,
    colorCode?: string,
    isBlocked?: boolean,
    categoryIdPath?: string,
}



export const createColorRecord = async (record: IColorRecord = {}): Promise<Document | null> => {
    return await colorModel.create(record);
}


export const getColorWithId = async (id: Types.ObjectId): Promise<IColorDocument | null> => {
    return await colorModel.findById(id);
}

export const getColorWithFilters = async (filters = {}, projection: ProjectionFields<IColorRecord>, options = {}): Promise<IColorRecord | null> => {
    return await colorModel.findOne(filters, projection, options);
}


export const getColorsWithFilter = async (filters = {}, projection: string = "", options: QueryOptions = {}) => {
    return await colorModel.find(filters, projection, options);
}



export const getActiveColors = async (categoryId?: string): Promise<IColorRecord[]> => {
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
                _id: "$colorName",
                color: { $first: "$$ROOT" }
            }
        },
        {
            $replaceRoot: { newRoot: "$color" }
        },
        {
            $sort: {
                colorName: 1
            }
        },
        {
            $project: {
                _id: 1,
                colorName: 1,
                colorCode: 1,
            }
        }
    );
    return await colorModel.aggregate(pipeline);
}

export const getAllColors = async (categoryId?: string): Promise<IColorRecord[] | null> => {
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
                _id: "$colorName",
                color: { $first: "$$ROOT" }
            }
        },
        {
            $replaceRoot: { newRoot: "$color" }
        },
        {
            $sort: {
                colorName: 1
            }
        },
        {
            $project: {
                _id: 1,
                colorName: 1,
                colorCode: 1,
                isBlocked: 1,
                categoryIdPath: 1,
            }
        }
    );
    return await colorModel.aggregate(pipeline);
}


// Find and update products color in the category
export const updateColoNameForProducts = async (options: QueryOptions = {}): Promise<boolean> => {
    try {
        await productModel.updateMany(
            { categoryId: options.categoryId, color: options.originalColorName},
            { $set: { color: options.newColorName } }
        )
        return true;
    } catch (error) {
        throw new Error("Failed to update products color");
    }

};