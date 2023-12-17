import { FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { adminModel, vendorModel, tempVendorAuthModel } from '../models';

export interface IOtpFile {
  code?: string,
  expiresAt?: string
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

export const verifyOtp = async function (options: QueryOptions): Promise<boolean> {
  try {
    const tempVendor = await tempVendorAuthModel.findOne({
      _id: options._id,
      'temporaryMobileOtp.code': options.code,
    });
    console.log("tempVendor: ", tempVendor)
    if (tempVendor) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Invaild otp`);
    throw error;
  }
};










