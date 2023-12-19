import { FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { adminModel, vendorModel, tempVendorAuthModel, authUtilityModel } from '../models';
import moment from 'moment';

export interface IOtpFile {
  code?: string,
  expiresAt?: string,
  mobileNumber?: string
}

export interface otpDocument extends Document {
  name: string,
  userId: Types.ObjectId,
  metadata: IOtpFile,
  isVerified: boolean
}

export const generateOtp = async function (): Promise<IOtpFile | null> {
  try {
    // Generate a random 6-digit OTP
    const otpLength = 6;
    const minOtpValue = Math.pow(10, otpLength - 1);
    const maxOtpValue = Math.pow(10, otpLength) - 1;
    const otp = Math.floor(Math.random() * (maxOtpValue - minOtpValue + 1)) + minOtpValue;

    // Get the current timestamp and set OTP expiration (e.g., 5 minutes)
    const currentTime = new Date();
    const expirationTime = new Date(currentTime.getTime() + 5 * 60 * 1000); // 5 minutes

    // Return OTP and expiration time
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


export const verifyOtp = async function (options: QueryOptions): Promise<boolean> {
  try {
    const tempVendor = await authUtilityModel.findOne({
      userId: options._id,
      'metadata.code': options.code,
    });

    if (tempVendor) {

      let checkOtpExpired = await isOtpExpired(tempVendor.metadata.expiresAt)

      if (checkOtpExpired) {
        throw new Error("Expired OTP");
        return false;
      }

      tempVendor.isVerified = true;
      tempVendor.save();
      return true;
    }

    return false;
  } catch (error) {
    throw new Error("Invaild otp");
  }
};


export const isOtpExpired = async function (expiryTimestamp: Date): Promise<boolean> {
  const currentTimestamp = moment();
  const expiryMoment = moment(expiryTimestamp);
  return currentTimestamp.isAfter(expiryMoment);
};



export const findOtpRecordWithFilters = async (filters: FilterQuery<otpDocument>, projection: ProjectionFields<otpDocument>, options: QueryOptions): Promise<otpDocument | null> => {
  return await authUtilityModel.findOne(filters, projection, options);
}






