import { FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { adminModel, vendorModel, authUtilityModel } from '../models';
import moment, { MomentInput } from 'moment';
import otpGenerator from 'otp-generator';

export interface IOtpFile {
  code?: string,
  expiresAt?: string,
  countryCode?: string,
  mobileNumber?: string,
  fullName?: string
}

export interface IAuthUtility extends Document {
  name: string,
  userId: Types.ObjectId,
  metadata: IOtpFile,
  isVerified: boolean
}

export interface IAuthUtilityProjection {
  _id?: 1,
  name?: 1,
  "metadata.code"?: 1,
  "metadata.expiresAt"?: 1,
  "metadata.countryCode"?: 1,
  "metadata.mobileNumber"?: 1,
  "metadata.fullName"?: 1,
  isVerified?: 1,
  createdAt?: 1,
  updatedAt?: 1,
}

export const generateOtp = async function (): Promise<IOtpFile> {

  const otp = otpGenerator.generate(5, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const expiresAt = moment().add(5, "minutes");

  let response = {
    code: otp.toString(),
    expiresAt: expiresAt.toISOString()
  };

  return response;
};

export const createOtp = async (options: QueryOptions): Promise<Document | null> => {
  let otpData = new authUtilityModel(options);
  return await otpData.save();
};


// export const verifyOtp = async function (options: QueryOptions): Promise<IAuthUtility> {
//   try {
//     const otpData = await authUtilityModel.findOne({
//       'metadata.code': options.code,
//     });

//     return otpData;

//   } catch (error) {
//     throw new Error("Invaild otp");
//   }
// };

// export const findOtpRecord = async (options: QueryOptions): Promise<IAuthUtility | null> => {
//   const result = await authUtilityModel.findOne({'metadata.code': options.code}, "fullName mobileNumber expiresAt", { lean: true });
//   return result;
// }


export const isOtpExpired = async function (expiryTimestamp: MomentInput): Promise<boolean> {
  return moment().isAfter(moment(expiryTimestamp));
};


export const findOtpRecordWithFilters = async (filters: FilterQuery<IAuthUtility>, projection: IAuthUtilityProjection = {}, options: QueryOptions): Promise<IAuthUtility | null> => {
  return await authUtilityModel.findOne(filters, projection, options);
}

export const deleteOtpRecord = async (_id: Types.ObjectId): Promise<void> => {
  await authUtilityModel.findByIdAndDelete(_id);
}






