import { otpService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./otpValidator";
import { GraphQLError } from "graphql";
import { validateInput } from "../../middlewares";
import { Types } from "mongoose";

export const otpResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {
    //Vendor Send OTP to mobile number
    sendVendorMobileOtp: async (parent, { input }, { req }, info) => {

      await validateInput(validators.VendorMobileOtpVerification, req);

      const fullName: string = input?.fullName || "";
      const mobileNumber: String = input.mobileNumber;

      const mobileOtp = await otpService.generateOtp();
      if (!mobileOtp) {
        throw new GraphQLError('OTP generation failed', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let options = {
        name: "VENDOR_SIGNUP_MOBILE_OTP",
        metadata: {
          code: mobileOtp.code,
          expiresAt: mobileOtp.expiresAt,
          mobileNumber,
          fullName,
        },
        isVerified: false
      };

      const result = await otpService.createOtp(options);
      if (!result) {
        throw new GraphQLError('OTP Db creation failed', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let response = {
        _id: result?._id.toString(),
        message: " OTP send successfully"
      }

      return response;
    },

    // Verify the OTP 
    verifyVendorOtp: async (parent, { input }, { req }, info) => {
      await validateInput(validators.otpVerificationValidator, req);

      const code: String = input.code;
      let otpVerification = await otpService.findOtpRecordWithFilters({ 'metadata.code': code }, {}, {});

      if (!otpVerification) {
        throw new GraphQLError('Verification failed. Invalid OTP.', {
          extensions: {
            code: "",
            errors: [],
          },
        });
      }

      if (!otpVerification.metadata || !otpVerification.metadata.expiresAt) {
        throw new Error('Invalid OTP metadata');
      }

       let expirationTime: Date = new Date(otpVerification?.metadata.expiresAt);

        let checkOtpExpired = await otpService.isOtpExpired(expirationTime)
  
        if (checkOtpExpired) {
          throw new Error("Expired OTP");
        }
  
        otpVerification.isVerified = true;

        const result = await otpVerification.save();

      let response = {
        _id: result?._id?.toString(),
        mobileNumber: result?.metadata?.mobileNumber,
        fullName: result?.metadata?.fullName,
        message: "OTP verified successfully"
      }
      return response;

    },


    // Resend the OTP
    reSendVendorMobileOtp: async (parent, { input }, { req }, info) => {

      await validateInput(validators.reSendMobileOtpVerification, req);

      const fullName: string = input?.fullName || "";
      const mobileNumber: String = input.mobileNumber;

      const mobileOtp = await otpService.generateOtp();
      if (!mobileOtp) {
        throw new GraphQLError('OTP generation failed', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let options = {
        name: "VENDOR_SIGNUP_MOBILE_OTP",
        metadata: {
          code: mobileOtp.code,
          expiresAt: mobileOtp.expiresAt,
          mobileNumber,
          fullName,
        },
        isVerified: false
      };

      const result = await otpService.createOtp(options);
      if (!result) {
        throw new GraphQLError('OTP Db creation failed', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let response = {
        _id: result?._id.toString(),
        message: " OTP send successfully"
      }

      return response;
    },
  },

}

