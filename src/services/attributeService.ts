import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { attributeModel, categoryModel } from '../models';
import { collections } from "../configs";
import { attributeResolver } from "src/resolvers/attributeResolver/attributeResolver";
import { response } from "express";

export interface FileData {
  _id?: string,
  fileType?: string,
  fileURL?: string,
  mimeType?: string,
  originalName?: string,
  createdAt?: string
}


export interface IAttribute {
  _id?: string;
  attributeType?: string;
  name?: string;
  description?: string;
  isBlocked?: boolean;
}

export interface IAttributeValue {
  _id?: string;
  attributeId: Types.ObjectId
  value?: string;
  colorCode?: string;
  priority?: number;
  isBlocked?: boolean;
}

export interface IAttributeWithValues {
  _id?: string;
  attributeType?: string;
  name?: string;
  description?: string;
  attributeValues?: IAttributeValue[]
  isBlocked?: boolean;
}

interface ICategoryWithAttributes {
  _id: string;
  categoryName: string;
  attributes: IAttribute[];
}

export interface ICategoryWithAttributesResponse {
  record: ICategoryWithAttributes;
}

export interface IAttributeDocument extends Document {
  _id?: Types.ObjectId;
  attributeType?: string;
  name?: string;
  description?: string;
  isBlocked?: boolean;
}

export interface IAttributeProjection {
  _id?: 1;
  attributeType?: 1;
  name?: 1;
  isBlocked?: 1;
}

export interface IAttributeRecordsResponse {
  records: Array<IAttribute>,
  maxRecords: number
}

export interface IAttributeRecordResponse {
  record: IAttributeWithValues,
}


export interface IAttributeRecordsOptions {
  page: number,
  size: number,
  isBlocked: boolean | null,
  projection: IAttributeProjection,
}

export interface IAttributeRecordOptions {
  attributeId: Types.ObjectId;
}

export interface ICategoryWithAttributesOptions {
  categoryId: Types.ObjectId;
}


export const createAttribute = async (attributeData: IAttribute): Promise<IAttributeDocument | null> => {
  let attribute: IAttributeDocument = new attributeModel(attributeData);
  return await attribute.save();
};


export const findAttributeWithFilters = async (filters: FilterQuery<IAttribute>, projection: ProjectionFields<IAttribute>, options: QueryOptions): Promise<IAttributeDocument | null> => {
  return await attributeModel.findOne(filters, projection, options);
}


export const getvendorRecordWithId = async (id: Types.ObjectId): Promise<IAttributeDocument | null> => {
  const result = await attributeModel.findById(id);
  return result;
}


export const getAttributeRecordsWithFilters = async (options: IAttributeRecordsOptions): Promise<IAttributeRecordsResponse> => {


  let pipeline: PipelineStage[] = [];

  if (options.isBlocked != null) {
    pipeline.push({
      $match: {
        isBlocked: options.isBlocked
      }
    });
  }

  pipeline.push(
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

  const result = await attributeModel.aggregate(pipeline);
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

export const getAttributeRecordByAdminWithAttributeId = async (options: IAttributeRecordOptions): Promise<IAttributeRecordResponse> => {


  let pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $match: {
        _id: options.attributeId,
      },
    },
    {
      $lookup: {
        from: collections.ATTRIBUTE_VALUES,
        localField: "_id",
        foreignField: "attributeId",
        as: "attributeValues",
      },
    },
    {
      $project: {
        _id: 1,
        attributeType: 1,
        name: 1,
        description: 1,
        isBlocked: 1,
        attributeValues: {
          $map: {
            input: "$attributeValues",
            as: "value",
            in: {
              _id: "$$value._id",
              value: "$$value.value",
              colorCode: "$$value.colorCode",
              priority: "$$value.priority",
              isBlocked: "$$value.isBlocked",
            },
          },
        },
      },
    },
  );

  const result = await attributeModel.aggregate(pipeline);
  let response = {
    record: {},
  };
  if (result.length) {
    response.record = result[0] || {};
  }

  return response;
}

export const getAttributeRecordByVendorWithAttributeId = async (options: IAttributeRecordOptions): Promise<IAttributeRecordResponse> => {


  let pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $match: {
        _id: options.attributeId,
      },
    },
    {
      $lookup: {
        from: collections.ATTRIBUTE_VALUES,
        localField: "_id",
        foreignField: "attributeId",
        as: "attributeValues",
      },
    },
    {
      $project: {
        _id: 1,
        attributeType: 1,
        name: 1,
        description: 1,
        isBlocked: 1,
        attributeValues: {
          $map: {
            input: "$attributeValues",
            as: "value",
            in: {
              _id: "$$value._id",
              value: "$$value.value",
              colorCode: "$$value.colorCode",
              priority: "$$value.priority",
              isBlocked: "$$value.isBlocked",
            },
          },
        },
      },
    },
  );

  const result = await attributeModel.aggregate(pipeline);
  let response = {
    record: {},
  };
  if (result.length) {
    response.record = result[0] || {};
  }

  return response;
}

// get attributes by passing category id
export const getCategoryWithAttributesBycategoryId = async (options: ICategoryWithAttributesOptions): Promise<ICategoryWithAttributesResponse> => {
  let pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $match: {
        _id: options.categoryId,
      },
    },
    {
      $lookup: {
        from: collections.CATEGORIES,
        localField: "_id",
        foreignField: "_id",
        as: "categoryAttributes",
      },
    },
    {
      $unwind: "$categoryAttributes",
    },
    {
      $lookup: {
        from: collections.ATTRIBUTES,
        localField: "categoryAttributes.attributes",
        foreignField: "_id",
        as: "attributeDetails",
      },
    },
    {
      $unwind: "$attributeDetails",
    },
    {
      $lookup: {
        from: collections.ATTRIBUTE_VALUES,
        localField: "attributeDetails._id",
        foreignField: "attributeId",
        as: "attributeValues",
      },
    },
    {
      $group: {
        _id: "$_id",
        categoryName: { $first: "$categoryName" },
        attributes: {
          $push: {
            _id: "$attributeDetails._id",
            attributeType: "$attributeDetails.attributeType",
            name: "$attributeDetails.name",
            description: "$attributeDetails.description",
            isBlocked: "$attributeDetails.isBlocked",
            attributeValues: "$attributeValues",
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        categoryName: 1,
        attributes: 1,
      },
    },
  );

  const result = await categoryModel.aggregate(pipeline);
  let response = {
    record: {
      _id: '',
      categoryName: '',
      attributes: [],
    },
  };
  if (result.length) {
    response.record = result[0] || {};
  }

  return response;
};

// // get attributes and its values by passing category id
// export const getAllAttributesBycategoryId = async (options: ICategoryWithAttributesOptions): Promise<ICategoryWithAttributesResponse> => {
//   let pipeline: PipelineStage[] = [];

//   pipeline.push(
//     {
//       $match: {
//         _id: options.categoryId,
//       },
//     },
//     {
//       $lookup: {
//         from: collections.CATEGORIES,
//         localField: "_id",
//         foreignField: "_id",
//         as: "categoryAttributes",
//       },
//     },
//     {
//       $unwind: "$categoryAttributes",
//     },
//     {
//       $lookup: {
//         from: collections.ATTRIBUTES,
//         localField: "categoryAttributes.attributes",
//         foreignField: "_id",
//         as: "attributeDetails",
//       },
//     },
//     {
//       $unwind: "$attributeDetails",
//     },
//     {
//       $lookup: {
//         from: collections.ATTRIBUTE_VALUES,
//         localField: "attributeDetails._id",
//         foreignField: "attributeId",
//         as: "attributeValues",
//       },
//     },
//     {
//       $group: {
//         _id: "$_id",
//         categoryName: { $first: "$categoryName" },
//         attributes: {
//           $push: {
//             _id: "$attributeDetails._id",
//             attributeType: "$attributeDetails.attributeType",
//             name: "$attributeDetails.name",
//             description: "$attributeDetails.description",
//             isBlocked: "$attributeDetails.isBlocked",
//             attributeValues: "$attributeValues",
//           },
//         },
//       },
//     },
//     {
//       $project: {
//         _id: 1,
//         categoryName: 1,
//         attributes: 1,
//       },
//     },
//   );

//   const result = await categoryModel.aggregate(pipeline);
//   let response = {
//     record: {
//       _id: '',
//       categoryName: '',
//       attributes: [],
//     },
//   };
//   if (result.length) {
//     response.record = result[0] || {};
//   }

//   return response;
// };
