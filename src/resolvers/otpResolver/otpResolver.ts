import { otpService, tempVendorAuthService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./otpValidator";
import { GraphQLError } from "graphql";
import { validateInput } from "../../middlewares";
import { Types } from "mongoose";

export const otpResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {
    // Send OTP to mobile number
    sendMobileOtp: async (parent, { input }, { req }, info) => {

      await validateInput(validators.mobileOtpVerification, req);

      const _id: Types.ObjectId = new Types.ObjectId(input._id);
      const otpType: String = input.otpType;

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
        name: otpType,
        userId: _id,
        metadata: mobileOtp,
        isVerified: false
      };

      options.metadata.mobileNumber = input.mobileNumber;

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
        _id: _id.toString(),
        message: " OTP send successfully"
      }

      return response;
    },

    // Verify the OTP 
    verifyOtp: async (parent, { input }, { req }, info) => {
      await validateInput(validators.otpVerificationValidator, req);

      const _id: Types.ObjectId = new Types.ObjectId(input._id);

      const otpRecord = await otpService.findOtpRecordWithFilters({ userId: _id }, {}, {});
      if (!otpRecord) {
        throw new GraphQLError('Record not find in this id', {
          extensions: {
            code: "",
            errors: [],
          },
        });
      }

      let inputOTP = input.mobileOtp;
      let options = { _id: _id, code: inputOTP };
      let otpVerfication = await otpService.verifyOtp(options);

      if (!otpVerfication) {
        throw new GraphQLError('Verification failed. Invalid OTP.', {
          extensions: {
            code: "",
            errors: [],
          },
        });
      }

      // TODO:  we can use this verifyOTP api commonly for all type of otp verification if we can remove this deletion part
      const result = await tempVendorAuthService.deleteTempVendor(_id);
      if (!result) {
        throw new GraphQLError('Temp record deletion failed.', {
          extensions: {
            code: "",
            errors: [],
          },
        });
      }

      let response = {
        _id: _id?.toString(),
        mobileNumber: otpRecord?.metadata?.mobileNumber?.toString(),
        message: "OTP verified successfully"
      }
      return response;

    },


    // Resend the OTP
    reSendMobileOtp: async (parent, { input }, { req }, info) => {

      await validateInput(validators.reSendMobileOtpVerification, req);

      const _id: Types.ObjectId = new Types.ObjectId(input._id);
      const otpType: String = input.otpType;

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
        name: otpType,
        userId: _id,
        metadata: mobileOtp,
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

