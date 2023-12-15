import { FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { vendorModel } from '../models';

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
  // mobileOtp?: {
  //   code?: string,
  //   expiresAt?: string
  // }
  fullName?: string;
  token?: string;
  profilePic?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  isVerified?: boolean;
}

export interface IVendorDocument extends Document {
  _id?: Types.ObjectId;
  email?: string;
  hash?: string,
  mobileNumber?: string;
  country?: string;
  brand?: string;
  // mobileOtp?: {
  //   code?: string,
  //   expiresAt?: string
  // }
  isBlocked?: boolean;
  fullName?: string;
  token?: string;
  profilePic?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  isVerified?: boolean;

  verifyHash?(password: string): Promise<boolean>;
  setHash?(password: string): Promise<void>;

}

export interface IVendorLoginResponse {
  _id: string;
  token: string;
}

export interface IVendorProjection {
  _id?: 1,
  email?: 1,
  hash?: 1,
  isBlocked?: 1,
  fullName?: 1,
  token?: 1,
  mobileNumber?: 1,
  country?: 1,
  brand?: 1,
  // "mobileOtp.code": 1,
  // "mobileOtp.expiresAt": 1,
  "image._id"?: 1,
  "image.fileType"?: 1,
  "image.fileURL"?: 1,
  "image.mimeType"?: 1,
  "image.originalName"?: 1,
  "image.createdAt"?: 1,
  isVerified?: 1,
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

// export const getvendorWithId = async (id: Types.ObjectId, projection: IVendorProjection = {}, options: QueryOptions = {}): Promise<IVendorDocument | null> => {
//   const result = await vendorModel.findById(id, projection, options);
//   return result;
// }

// export const getvendorRecordWithId = async (id: Types.ObjectId, projection: IVendorProjection = {}, options: QueryOptions = {}): Promise<IVendor | null> => {
//   return await vendorModel.findById(id, projection, options);
// }







