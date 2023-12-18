import { FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { adminModel, vendorModel, tempVendorAuthModel, authUtilityModel } from '../models';

export interface IOtpFile {
  code?: string,
  expiresAt?: string
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
    // Handle errors appropriately, for example:
    console.error(`Error sending OTP`);
    throw error;
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
      tempVendor.isVerified = true;
      tempVendor.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Invaild otp`);
    throw error;
  }
};


export const findOtpRecordWithFilters = async (filters: FilterQuery<otpDocument>, projection: ProjectionFields<otpDocument>, options: QueryOptions): Promise<otpDocument | null> => {
  return await authUtilityModel.findOne(filters, projection, options);
}






