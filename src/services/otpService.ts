import { FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { adminModel, vendorModel, authUtilityModel } from '../models';
import moment from 'moment';

export interface IOtpFile {
  code?: string,
  expiresAt?: string,
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
  "metadata.mobileNumber"?: 1,
  "metadata.fullName"?: 1,
  isVerified?: 1,
  createdAt?: 1,
  updatedAt?: 1,
}

export const generateOtp = async function (): Promise<IOtpFile | null> {
  try {
    const otpLength = 6;
    const minOtpValue = Math.pow(10, otpLength - 1);
    const maxOtpValue = Math.pow(10, otpLength) - 1;
    const otp = Math.floor(Math.random() * (maxOtpValue - minOtpValue + 1)) + minOtpValue;

    // Get the current timestamp and set OTP expiration (e.g., 5 minutes)
    const currentTime = new Date();
    const expirationTime = new Date(currentTime.getTime() + 5 * 60 * 1000); // 5 minutes

    let response = {
      code: otp.toString(),
      expiresAt: expirationTime.toISOString(),
    };

    return response;

  } catch (error) {
    throw new Error("Error sending OTP");
  }
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


export const isOtpExpired = async function (expiryTimestamp: Date): Promise<boolean> {
  const currentTimestamp = moment();
  const expiryMoment = moment(expiryTimestamp);
  return currentTimestamp.isAfter(expiryMoment);
};



export const findOtpRecordWithFilters = async (filters: FilterQuery<IAuthUtility>, projection: IAuthUtilityProjection = {}, options: QueryOptions): Promise<IAuthUtility | null> => {
  return await authUtilityModel.findOne(filters, projection, options);
}






