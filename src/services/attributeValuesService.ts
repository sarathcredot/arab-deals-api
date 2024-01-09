import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { attributeModel } from '../models';
import { collections } from "../configs";
import { attributeResolver } from "src/resolvers/attributeResolver/attributeResolver";

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


export interface IAttributeRecordsOptions {
  page: number,
  size: number,
  isBlocked: boolean | null,
  projection: IAttributeProjection,
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

// export const geAttributeRecordByAdmin = async (vendorId: Types.ObjectId): Promise<IVendorWithKycDetails> => {
//   let pipeline: PipelineStage[] = [
//     {
//       $match: {
//         _id: new Types.ObjectId(vendorId)
//       }
//     },
//     {
//       $lookup: {
//         from: collections.VENDOR_OUTLETS,
//         localField: '_id',
//         foreignField: 'vendorId',
//         as: 'outlet'
//       }
//     },
//     {
//       $unwind: {
//         path: '$outlet',
//         preserveNullAndEmptyArrays: true
//       }
//     },
//     {
//       $lookup: {
//         from: collections.VENDOR_COMPANIES,
//         localField: '_id',
//         foreignField: 'vendorId',
//         as: 'company'
//       }
//     },
//     {
//       $unwind: {
//         path: '$company',
//         preserveNullAndEmptyArrays: true
//       }
//     },
//     {
//       $project: {
//         _id: 1,
//         fullName: 1,
//         email: 1,
//         mobileNumber: 1,
//         isBlocked: 1,
//         isKycCompleted: 1,
//         companyId: '$company._id',
//         companyName: '$company.companyName',
//         companyStatus: '$company.status',
//         outletId: '$outlet._id',
//         outletName: '$outlet.outletName',
//         outletStatus: '$outlet.status'
//       }
//     }
//   ];

//   const result = await vendorModel.aggregate(pipeline);
//   return result[0];
// };







