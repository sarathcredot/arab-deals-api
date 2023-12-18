import { FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { tempVendorAuthModel } from '../models';

export interface FileData {
  _id?: string,
  fileType?: string,
  fileURL?: string,
  mimeType?: string,
  originalName?: string,
  createdAt?: string
}

export interface IMobileOtpData {
  code?: string
  expiresAt?: string
}

export interface ITempVendor {
  _id?: string;
  email?: string;
  hash?: string;
  mobileNumber?: string;
  country?: string
  brand?: string
  isBlocked?: boolean;
  temporaryMobileOtp?: {
    code?: string
    expiresAt?: string
  }

  fullName?: string;
  temporaryVendorAuthToken?: string;
  profilePic?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  isVerified?: boolean;

}

export interface ITempVendorAuthDocument extends Document {
  _id?: Types.ObjectId;
  email?: string;
  hash?: string,
  mobileNumber?: string;
  country?: string;
  brand?: string;
  temporaryMobileOtp?: {
    code?: string
    expiresAt?: string
  }
  isBlocked?: boolean;
  fullName?: string;
  temporaryVendorAuthToken?: string;
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

export interface ITempVendorAuthProjection {
  _id?: 1,
  email?: 1,
  hash?: 1,
  isBlocked?: 1,
  fullName?: 1,
  token?: 1,
  mobileNumber?: 1,
  country?: 1,
  brand?: 1,
  "temporaryMobileOtp.code"?: 1,
  "temporaryMobileOtp.expiresAt"?: 1,
  "image._id"?: 1,
  "image.fileType"?: 1,
  "image.fileURL"?: 1,
  "image.mimeType"?: 1,
  "image.originalName"?: 1,
  "image.createdAt"?: 1,
  isVerified?: 1,
  temporaryVendorAuthToken?: 1,
}




export const createTempVendor = async (vendorData: ITempVendor): Promise<ITempVendorAuthDocument | null> => {
  let vendor: ITempVendorAuthDocument = new tempVendorAuthModel(vendorData);
  return await vendor.save();
};


export const findTempVendorWithFilters = async (filters: FilterQuery<ITempVendor>, projection: ProjectionFields<ITempVendor>, options: QueryOptions): Promise<ITempVendorAuthDocument | null> => {
  return await tempVendorAuthModel.findOne(filters, projection, options);
}

export const deleteTempVendor = async (id: Types.ObjectId): Promise<boolean> => {
  try {
    await tempVendorAuthModel.deleteOne({ _id: id });
    return true;
  } catch (error) {
    console.error(`Error deleting temporary vendor with ID ${id}`);
    throw error;
  }
};
// export const getvendorWithId = async (id: Types.ObjectId, projection: IVendorProjection = {}, options: QueryOptions = {}): Promise<IVendorDocument | null> => {
//   const result = await tempVendorAuthModel.findById(id, projection, options);
//   return result;
// }

// export const getvendorRecordWithId = async (id: Types.ObjectId, projection: IVendorProjection = {}, options: QueryOptions = {}): Promise<IVendor | null> => {
//   return await tempVendorAuthModel.findById(id, projection, options);
// }





