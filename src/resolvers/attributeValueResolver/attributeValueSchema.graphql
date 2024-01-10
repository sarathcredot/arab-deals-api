import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { attributeValueModel } from '../models';
import { collections } from "../configs";

export interface FileData {
  _id?: string,
  fileType?: string,
  fileURL?: string,
  mimeType?: string,
  originalName?: string,
  createdAt?: string
}


export interface IAttributeValue {
  _id?: string;
  attributeId?: Types.ObjectId;
  value?: string;
  colorCode?: string;
  priority?: number;
  isBlocked?: boolean;
}

export interface IAttributeValueDocument extends Document {
  _id?: Types.ObjectId;
  attributeId?: Types.ObjectId;
  value?: string;
  colorCode?: string;
  priority?: number;
  isBlocked?: boolean;
}

export interface IAttributeValueProjection {
  _id?: 1;
  attributeId?: 1;
  value?: 1;
  colorCode?: 1;
  priority?: 1;
  isBlocked?: 1;
}

export interface IAttributeValueRecordsResponse {
  records: Array<IAttributeValue>,
  maxRecords: number
}


export interface IAttributeValueRecordsOptions {
  page: number,
  size: number,
  isBlocked: boolean | null,
  projection: IAttributeValueProjection,
}


export const createAttributeValue = async (attributeValueData: IAttributeValue): Promise<IAttributeValueDocument | null> => {
  let attributeValue: IAttributeValueDocument = new attributeValueModel(attributeValueData);
  return await attributeValue.save();
};


export const findAttributeValueWithFilters = async (filters: FilterQuery<IAttributeValue>, projection: ProjectionFields<IAttributeValue>, options: QueryOptions): Promise<IAttributeValueDocument | null> => {
  return await attributeValueModel.findOne(filters, projection, options);
}


export const getAttributeValueRecordWithId = async (id: Types.ObjectId): Promise<IAttributeValueDocument | null> => {
  const result = await attributeValueModel.findById(id);
  return result;
}


export const getAttributeValueRecordsWithFilters = async (options: IAttributeValueRecordsOptions): Promise<IAttributeValueRecordsResponse> => {


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

  const result = await attributeValueModel.aggregate(pipeline);
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







