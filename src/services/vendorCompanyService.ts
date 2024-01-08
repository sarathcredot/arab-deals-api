import { vendorCompanyModel } from "../models";
import { collections } from "../configs/collections";
import { Types, Document, QueryOptions, FilterQuery, ProjectionFields, PipelineStage } from "mongoose";

export interface FileData {
  _id?: string,
  fileType?: string,
  fileURL?: string,
  mimeType?: string,
  originalName?: string,
  createdAt?: string
}


// export interface IVendorCompany {
//     _id?: string;
//     vendorId?: Types.ObjectId;
//     companyName?: string;
//     companyType?: string;
//     crLicense?: {
//       fileType?: string,
//       fileURL?: string,
//       mimeType?: string,
//       originalName?: string
//     };
//     cooCertificate?: {
//       fileType?: string,
//       fileURL?: string,
//       mimeType?: string,
//       originalName?: string
//     };
//     crNumber?: string,
//     status?: string;
//     remarks?: string[];
// }

export interface IVendorCompany {
  _id?: string;
  vendorId?: Types.ObjectId;
  companyName?: string;
  companyType?: string;
  crLicense?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  cooCertificate?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  crNumber?: string,
  status?: string;
  remarks?: string[];
}

export interface IVendorCompanyWithKycData {
  vendorId?: string;
  fullName?: string;
  isKycCompleted?: string;
  _id?: string;
  companyName?: string;
  status?: string;
  outletId?: string;
  outletName?: string;
  outletStatus?: string
}

export interface IVendorCompanyDocument extends Document {
  _id?: string,
  vendorId?: Types.ObjectId;
  companyName?: string;
  companyType?: string;
  crLicense?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  cooCertificate?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  crNumber?: string,
  status?: string;
  remarks?: string[];
}

export interface IVendorCompanyRecordsProjection {
  _id?: 1;
  vendorId?: 1;
  companyName?: 1;
  companyType?: 1;
  crNumber?: 1,
  status?: 1;
  remarks?: 1;
  "crLicense._id"?: 1,
  "crLicense.fileType"?: 1,
  "crLicense.fileURL"?: 1,
  "crLicense.mimeType"?: 1,
  "crLicense.originalName"?: 1,
  "crLicense.createdAt"?: 1,
  "cooCertificate._id"?: 1,
  "cooCertificate.fileType"?: 1,
  "cooCertificate.fileURL"?: 1,
  "cooCertificate.mimeType"?: 1,
  "cooCertificate.originalName"?: 1,
  "cooCertificate.createdAt"?: 1,
  createdAt?: 1,
  updatedAt?: 1,
}

export interface IVendorCompanyOptions {
  page: number,
  size: number,
  status: string,
}

export interface IVendorCompanyRecordsResponse {
  records: Array<IVendorCompanyWithKycData>,
  maxRecords: number
}

export const createVendorCompanyRecord = async (record: IVendorCompany): Promise<Document | null> => {
  return await vendorCompanyModel.create(record);
}


export const getVendorCompanyRecordWithId = async (id: Types.ObjectId): Promise<IVendorCompanyDocument | null> => {
  return await vendorCompanyModel.findById(id);
}

export const getVendorCompanyRecordWithFilters = async (filters = {}, projection: ProjectionFields<IVendorCompany>, options = {}): Promise<IVendorCompanyDocument | null> => {
  return await vendorCompanyModel.findOne(filters, projection, options);
}


export const getVendorCompanyRecordWithFilter = async (filters = {}, projection: string = "", options: QueryOptions = {}) => {
  return await vendorCompanyModel.find(filters, projection, options);
}

export const getVendorCompanyRecordsWithFilters = async (options: IVendorCompanyOptions): Promise<IVendorCompanyRecordsResponse> => {
  let pipeline: PipelineStage[] = [];

  if (options.status) {
    pipeline.push({
      $match: {
        status: options.status  // filter with status
      }
    });
  }

  pipeline.push(
    {
      $sort: { _id: -1 }
    },
    {
      $lookup: {
        from: collections.VENDORS,
        localField: 'vendorId',
        foreignField: '_id',
        as: 'vendor'
      }
    },
    {
      $unwind: '$vendor'
    },
    {
      $lookup: {
        from: collections.VENDOR_OUTLETS,
        localField: 'vendor._id',
        foreignField: 'vendorId',
        as: 'outlet'
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
            $project: {
              vendorId: '$vendor._id',
              fullName: '$vendor.fullName',
              isKycCompleted: '$vendor.isKycCompleted',
              companyName: 1,
              status: 1,
              outletId: { $arrayElemAt: ['$outlet._id', 0] },
              outletName: { $arrayElemAt: ['$outlet.outletName', 0] },
              outletStatus: { $arrayElemAt: ['$outlet.status', 0] }
            }
          }
        ]
      }
    },
    {
      $project: {
        maxRecords: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
        data: 1
      }
    }
  );

  const result = await vendorCompanyModel.aggregate(pipeline);
  let response = {
    records: [],
    maxRecords: 0
  };
  if (result.length) {
    response.records = result[0].data || [];
    response.maxRecords = result[0].maxRecords || 0;
  }

  return response;
};

export const deleteVendorCompanyRecord = async (filter: FilterQuery<IVendorCompany>): Promise<IVendorCompanyDocument | null> => {
  return await vendorCompanyModel.findOneAndDelete(filter);
};