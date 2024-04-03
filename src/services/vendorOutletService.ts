import { vendorOutletModel } from "../models";
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


export interface IVendorOutlet {
  _id?: string;
  vendorId?: Types.ObjectId;
  outletName?: string;
  country?: string;
  district?: string;
  village?: string;
  address?: string;
  outletLicense?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  interiorImage?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  exteriorImage?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  contactPersonName?: string,
  contactPersonDesignation?: string,
  contactPersonNumber?: string,
  status?: string;
  remarks?: string[];
}

export interface IVendorOutletDocument extends Document {
  _id?: string;
  vendorId?: Types.ObjectId;
  outletName?: string;
  country?: string;
  district?: string;
  village?: string;
  address?: string;
  outletLicense?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  interiorImage?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  exteriorImage?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  contactPersonName?: string,
  contactPersonDesignation?: string,
  contactPersonNumber?: string,
  status?: string;
  remarks?: string[];
}

export interface IVendorOutletRecordsProjection {
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

export interface IVendorOutletWithKycData {
  vendorId?: string;
  fullName?: string;
  isKycCompleted?: string;
  _id?: string;
  outletName?: string;
  status?: string;
  country?: string;
  district?: string;
  village?: string;
  address?: string;
  contactPersonName?: string;
  contactPersonNumber?: string;
  contactPersonDesignation?: string;
  remarks?: string[];
}

export interface IVendorOutletRecordsResponse {
  records: Array<IVendorOutletWithKycData>,
  maxRecords: number
}
export interface IVendorOutletOptions {
  page: number,
  size: number,
  status: string,
  fullName: string,
  vendorId: Types.ObjectId,
  outletName: string,
}

export const createVendorOutletRecord = async (record: IVendorOutlet): Promise<Document> => {
  return await vendorOutletModel.create(record);
}


export const getVendorOutletRecordWithId = async (id: Types.ObjectId): Promise<IVendorOutletDocument | null> => {
  return await vendorOutletModel.findById(id);
}

export const getVendorOutletRecordWithFilters = async (filters = {}, projection: ProjectionFields<IVendorOutlet>, options = {}): Promise<IVendorOutletDocument | null> => {
  return await vendorOutletModel.findOne(filters, projection, options);
}


export const getVendorOutletRecordWithFilter = async (filters = {}, projection: string = "", options: QueryOptions = {}) => {
  return await vendorOutletModel.find(filters, projection, options);
}

export const getVendorOutletRecordsWithFilters = async (options: IVendorOutletOptions): Promise<IVendorOutletRecordsResponse> => {
  let pipeline: PipelineStage[] = [];

  if (options.status) {
    pipeline.push({
      $match: {
        status: options.status  // filter with status
      }
    });
  }


  if (options.outletName !== "") {
    let query = options.outletName || '';
    const regexQuery = new RegExp(query, 'i');
    pipeline.push(
      { $match: { outletName: { $regex: regexQuery } } }
    );
  }

  if (options.vendorId !== null) {
    pipeline.push(
      { $match: { vendorId: options.vendorId } }
    );
  }

  if (options.fullName !== "") {
    let query = options.fullName || '';
    const regexQuery = new RegExp(query, 'i');
    pipeline.push(
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
        $match: { 'vendor.fullName': { $regex: regexQuery } }
      }
    );
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
              outletName: 1,
              country: 1,
              district: 1,
              village: 1,
              address: 1,
              contactPersonName: 1,
              contactPersonNumber: 1,
              contactPersonDesignation: 1,
              remarks: 1,
              status: 1
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

  const result = await vendorOutletModel.aggregate(pipeline);
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

export const deleteOutletRecord = async (filter: FilterQuery<IVendorOutlet>): Promise<IVendorOutletDocument | null> => {
  return await vendorOutletModel.findOneAndDelete(filter);
};