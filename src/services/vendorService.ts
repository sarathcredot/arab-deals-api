import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { vendorModel, kycModel } from '../models';
import { collections } from "../configs";

export interface FileData {
  _id?: string,
  fileType?: string,
  fileURL?: string,
  mimeType?: string,
  originalName?: string,
  createdAt?: string
}

export interface MobileOtpData {
  code?: string
  expiresAt?: string
}

export interface IVendor {
  _id?: string;
  email?: string;
  companyName?: string
  hash?: string,
  mobileNumber?: string;
  isBlocked?: boolean;
  fullName?: string;
  token?: string;
  isApproved?: boolean;
  profilePic?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
}

export interface IVendorDocument extends Document {
  _id?: Types.ObjectId;
  email?: string;
  hash?: string,
  mobileNumber?: string;
  isBlocked?: boolean;
  fullName?: string;
  token?: string;
  companyName?: string;
  isApproved?: boolean;
  brand?: string;
  country?: string;
  profilePic?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };

  verifyHash?(password: string): Promise<boolean>;
  setHash?(password: string): Promise<void>;

}

export interface IVendorLoginResponse {
  _id: string;
  token: string;
}

export interface IVendorProjection {
  _id?: 1;
  email?: 1;
  hash?: 1;
  isBlocked?: 1;
  fullName?: 1;
  token?: 1;
  mobileNumber?: 1;
  companyName?: 1;
  "image._id"?: 1;
  "image.fileType"?: 1;
  "image.fileURL"?: 1;
  "image.mimeType"?: 1;
  "image.originalName"?: 1;
  "image.createdAt"?: 1;
  isVerified?: 1;
  isApproved?: 1;
}


export interface IVendorsRecordsOptions {
  status: string,
  page: number,
  size: number,
  projection: IVendorProjection
}

export interface IVendorsRecordsWithKycOptions {
  status: string,
  page: number,
  size: number,
}

export interface IVendorsRecordsResponse {
  records: Array<IVendor>,
  maxRecords: number
}

export interface IVendorsWithKycRecordsResponse {
  records: Array<IVendorKYCData>,
  maxRecords: number
}

interface IVendorKYCData {
  _id: string;
  vendorId: string;
  email: string;
  fullName: string;
  mobileNumber: string;
  country: string;
  brand: string;
  isBlocked: boolean;
  companyName: string;
  companyStatus: string;
  businessOutletStatus: string;
  sellingProductStatus: string;
  kycStatus: string;
}

export const createVendor = async (vendorData: IVendor, password: string): Promise<IVendorDocument | null> => {
  let vendor: IVendorDocument = new vendorModel(vendorData);
  await vendor.setHash!(password);
  return await vendor.save();
};


export const findOneAndUpdatevendor = async (filters: FilterQuery<IVendor>, update: UpdateQuery<IVendor>, options: QueryOptions): Promise<Document | null> => {
  return await vendorModel.findOneAndUpdate(filters, update, options);
}

export const findVendorWithFilters = async (filters: FilterQuery<IVendor>, projection: ProjectionFields<IVendor>, options: QueryOptions): Promise<IVendorDocument | null> => {
  return await vendorModel.findOne(filters, projection, options);
}


export const loginVendor = (vendor: IVendorDocument): IVendorLoginResponse => {
  return {
    _id: vendor._id?.toString() || "",
    token: vendor.token || "",
  }
}

export const getVendorsRecordsWithFilters = async (options: IVendorsRecordsOptions): Promise<IVendorsRecordsResponse> => {

  console.log("options: ", options)
  let pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $match: {
        isBlocked: false
      }
    },
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

  const result = await vendorModel.aggregate(pipeline);
  console.log(result)
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

export const getvendorRecordWithId = async (id: Types.ObjectId): Promise<Document | null> => {
  const result = await vendorModel.findById(id);
  return result;
}


export const getCategorizedKYCs = async (options: QueryOptions): Promise<IVendorsWithKycRecordsResponse> => {

  let inputStatus = options.status;
  let checkStatus = {};
  if (inputStatus === "DEFAULT") {
    checkStatus = {}
  } else if (inputStatus === "COMPLETED") {
    checkStatus = {
      $and: [
        { 'companyDetails.status': inputStatus },
        { 'businessOutlet.status': inputStatus },
        { 'sellingProduct.status': inputStatus }
      ]
    }
  } else {
    checkStatus = {
      $or: [
        { 'companyDetails.status': inputStatus },
        { 'businessOutlet.status': inputStatus },
        { 'sellingProduct.status': inputStatus }
      ]
    }
  }

  let pipeline: PipelineStage[] = [];

  pipeline.push(
    {
      $match: checkStatus,
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
      $project: {
        _id: 1,
        vendorId: '$vendor._id',
        email: '$vendor.email',
        fullName: '$vendor.fullName',
        mobileNumber: '$vendor.mobileNumber',
        country: '$vendor.country',
        brand: '$vendor.brand',
        isBlocked: '$vendor.isBlocked',
        companyName: '$vendor.companyName',
        kycStatus: {
          $cond: {
            if: '$isKycCompleted',
            then: 'COMPLETED',
            else: 'PENDING'
          }
        },
        companyStatus: '$companyDetails.status',
        businessOutletStatus: '$businessOutlet.status',
        sellingProductStatus: '$sellingProduct.status'
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

  const result = await kycModel.aggregate(pipeline);

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








