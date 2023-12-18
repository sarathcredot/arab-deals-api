import { vendorService, jwtService, spaceService, otpService, tempVendorAuthService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./otpValidator";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifySuperAdmin, verifyAdmin, verifyTempVendor } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";

export const otpResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {

    sendMobileOtp: async (parent, { input }, { req }, info) => {

      await validateInput(validators.mobileOtpVerification, req);

      const _id: Types.ObjectId = new Types.ObjectId(input._id);

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
        name: "SIGNUP",
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

  Query: {
    // Fetch all vendors records
    
  },
};

