import { FilterQuery, ProjectionFields, QueryOptions, Document, Types, PipelineStage, UpdateQuery } from "mongoose";
import { brandModel, categoryModel, productModel } from "../models";



export interface FileData {
    _id?: string,
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string,
    createdAt?: string
}

export interface ICategory {
    _id?: string;
    categoryName?: string;
    description?: string;
    path?: string;
    categoryImage?: {
        fileType?: string,
        fileURL?: string,
        mimeType?: string,
        originalName?: string
    };
    isBlocked?: boolean;
    categoryId?: string;
    isLeaf?: boolean;
    isDefault?: boolean;
    attributes?:Types.ObjectId[];
    brands?: Types.ObjectId[],
    returnPolicy?:string,
    warrantyPolicy?:Types.ObjectId

}

export interface CategoryDocument extends Document {
    _id: Types.ObjectId;
    categoryName: string;
    path: string;
    categoryImage: FileData;
    isBlocked: boolean;
    categoryId: Types.ObjectId;
    isLeaf?: boolean
    description: string
    isDefault: Boolean
    attributes: Types.ObjectId[]
    brands: Types.ObjectId[]
    returnPolicy?:string
    warrantyPolicy?:Types.ObjectId
}


export interface ICategorySuggestion {
    _id: Types.ObjectId;
    description: string;
}

export const findOneAndUpdateCategory = async (filters: FilterQuery<ICategory>, update: UpdateQuery<ICategory>, options: QueryOptions): Promise<ICategory | null> => {
    return await categoryModel.findOneAndUpdate(filters, update, options);
}

export const createCategory = async (category: ICategory) => {
    return await categoryModel.create(category);
}


export const findCategoryWithFilters = async (filters: FilterQuery<ICategory>, projection: ProjectionFields<ICategory>, options: QueryOptions): Promise<CategoryDocument | null> => {
    return await categoryModel.findOne(filters, projection, options);
}


export const findCategoriesWithFilters = async (filters: FilterQuery<ICategory>, projection: ProjectionFields<ICategory>, options: QueryOptions): Promise<CategoryDocument[] | []> => {
    return await categoryModel.find(filters, projection, options);
}

export const deleteCategoryRecord = async (filter: FilterQuery<ICategory>): Promise<ICategory | null> => {
    return await categoryModel.findOneAndDelete(filter);
};


export const getCategoriesAutoComplete = async (query: string): Promise<ICategorySuggestion[]> => {


    let pipeline: PipelineStage[] = [];

    pipeline.push(
        {
            $search: {
                index: "categorySearchIndex",
                autocomplete: {
                    query: query,
                    path: "description",
                    fuzzy: { "maxEdits": 1, "prefixLength": 3, "maxExpansions": 256 },
                }
            }
        },
        {
            $match: {
                isBlocked: false,
                isDefault: false
            }
        },
        {
            $project: {
                _id: 1,
                description: 1,
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
                _id: 1,
                description: 1,
            }
        },
    );

    return await categoryModel.aggregate(pipeline);
}


export const getLevelCategoriesByFilters = async (options: QueryOptions): Promise<CategoryDocument[] | []> => {
    let pipeline: PipelineStage[] = [];
    let regexExpressions;

    if (options.level === 0) {
        regexExpressions = '#';

    } else if (options.level === 1) {
        regexExpressions = /^#[A-Za-z0-9_]{24}#$/;
    }

    pipeline.push(
        {
            $match: {
                isDefault: false,
                path: regexExpressions,
                isBlocked: false
            },
        },
        {
            $sort: {
                path: 1,
                categoryName: 1,
            },
        },
        {
            $project: {
                _id: 1,
                categoryName: 1,
            },
        },
    );

    if (options.limit && typeof options.limit === 'number') {
        pipeline.push({
            $limit: options.limit,
        });
    }


    const result = await categoryModel.aggregate(pipeline);
    return result;
};

export const updateCategoryNameForProducts = async (options: QueryOptions): Promise<boolean> => {

    try {

        const categoryId = options.categoryRecord._id.toString();

        const searchCategoryId = `${options.categoryRecord.path}${categoryId}`;

        let searchCategoryIdArr: string[] = searchCategoryId.split('#').filter(f => f != '')

        const products = await productModel.find(
            {
                categoryIdPath: { $regex: new RegExp(`${categoryId}.*`) },
            }
        );

        const searchCatIndex = searchCategoryIdArr.findIndex(catFind => catFind == categoryId);

        products.map(async product => {
            let splitCats = (product as any).categoryNamePath.split(' ');
            splitCats[searchCatIndex] = options.newCategoryName;
            product.categoryNamePath = splitCats.join(' ')
            await product.save();
        })
        return true;
    } catch (error) {
        return false;
    }

}
export const getCategoriesByAdminForCoupon = async (data:any): Promise<any> => {

    if(!data?.brands?.length){
        const result = await categoryModel.find();

    if (result.length) {
      let response = {
        records:result||[],
      };
        return response;
    }
    }
    let matchObj:any={};

    if(data?.brands?.length){
        matchObj._id ={$in:data?.brands.map((item:any)=> new Types.ObjectId(item))} 
        console.log("brand id = ",matchObj._id)
    }

    let pipeline: PipelineStage[] = [
        {$match:matchObj},
        {
            $unwind:
              {
                path: "$categories",
                preserveNullAndEmptyArrays: true
              }
          },
          {
            $group:
              {
                _id: "$categories"
              }
          },
          {
            $lookup:
              {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "category"
              }
          },
          {
            $unwind:
              {
                path: "$category"
              }
          },
          {
            $replaceRoot:
              {
                newRoot: "$category"
              }
          },
        {
            $project:{
                _id:1,
                categoryName:1,
            }
        }
    ];
    console.log("pipeline = ",JSON.stringify(pipeline,null,2))
    const result = await brandModel.aggregate(pipeline);
    console.log("result = ",result)

    if (result.length) {
      let response = {
        records:result||[],
      };
        return response;
    }
}


