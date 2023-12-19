import {PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { vendorModel, tempVendorAuthModel } from '../models';

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
  hash?: string,
  mobileNumber?: string;
  country?: string
  brand?: string
  isBlocked?: boolean;
  fullName?: string;
  token?: string;
  profilePic?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  companyName?: string
  businessOutletName?: string
  crNumber?: string
  crLicence?: string
  businessLicence?: string
  chamberOfCommerceCertificate?: string
  companyType?: string
  businessAddress?: string
  contactPerson?:{
    name?: string,
    phoneNumber?: string,
    designation?: string
  }
  exteriorImage?: {
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
  sellingProductDetails?: string
  sellingProductBrands? : string
  isApproved?: boolean
}

export interface IVendorDocument extends Document {
  _id?: Types.ObjectId;
  email?: string;
  hash?: string,
  mobileNumber?: string;
  country?: string;
  brand?: string;
  isBlocked?: boolean;
  fullName?: string;
  token?: string;
  profilePic?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  companyName?: string
  businessOutletName?: string
  crNumber?: string
  crLicence?: string
  businessLicence?: string
  chamberOfCommerceCertificate?: string
  companyType?: string
  businessAddress?: string
  contactPerson?:{
    name?: string,
    phoneNumber?: string,
    designation?: string
  }
  exteriorImage?: {
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
  sellingProductDetails?: string
  sellingProductBrands? : string
  isApproved?: boolean;

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
  country?: 1;
  brand?: 1;
  companyName?: 1;
  businessOutletName?: 1;
  crNumber?: 1;
  crLicence?: 1;
  businessLicence?: 1;
  chamberOfCommerceCertificate?: 1;
  companyType?: 1;
  businessAddress?: 1;
  "contactPerson.name"?: 1;
  "contactPerson.phoneNumber"?: 1;
  "contactPerson.designation"?: 1;
  "profilePic.fileType"?: 1;
  "profilePic.fileURL"?: 1;
  "profilePic.mimeType"?: 1;
  "profilePic.originalName"?: 1;
  "exteriorImage.fileType"?: 1;
  "exteriorImage.fileURL"?: 1;
  "exteriorImage.mimeType"?: 1;
  "exteriorImage.originalName"?: 1;
  "interiorImage.fileType"?: 1;
  "interiorImage.fileURL"?: 1;
  "interiorImage.mimeType"?: 1;
  "interiorImage.originalName"?: 1;
  sellingProductDetails?: 1;
  sellingProductBrands?: 1;
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
  page: number,
  size: number,
  projection: IVendorProjection
}

export interface IVendorsRecordsResponse {
  records: Array<IVendor>,
  maxRecords: number
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






