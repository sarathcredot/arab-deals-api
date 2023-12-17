import { vendorService, jwtService, spaceService, otpService, tempVendorAuthService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./vendorValidator";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifySuperAdmin, verifyAdmin, verifyTempVendor } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";

export const vendorResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {

    verifyTempVendor: async (parent, { input }, { req }, info) => {
      await validateInput(validators.tempVendorVerificationValidator, req);
      await verifyTempVendor(req);

      const _id: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

      const tempVendor = await tempVendorAuthService.findTempVendorWithFilters({ _id: _id }, {}, {});

      if (!tempVendor) {
        throw new GraphQLError('Verification failed. Invalid temporary token', {
          extensions: {
            code: "",
            errors: [],
          },
        });
      }

      let inputOTP = input.temporaryMobileOtp?.code;
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

      let newVendorData: tempVendorAuthService.ITempVendor = {};

      if (tempVendor) {
        newVendorData.email = tempVendor.email
        newVendorData.fullName = tempVendor.fullName
        newVendorData.mobileNumber = tempVendor.mobileNumber
        newVendorData.country = tempVendor.country
        newVendorData.temporaryMobileOtp = tempVendor.temporaryMobileOtp
        newVendorData.hash = tempVendor.hash
      }

      try {
        newVendorData.isVerified = true;
        const result = await vendorService.createVendor(newVendorData);

        // Delete from tempVendorAuthCollection
        await tempVendorAuthService.deleteTempVendor(_id);

        let response = {
          _id: result?._id?.toString(),
          message: "Newly created"
        }
        return response;

      } catch (error) {
        throw new GraphQLError('Verification failed. Unable to create the vendor.');
      }
    },

    loginVendor: async (parent, { input }, { req }, info) => {

      await validateInput(validators.vendorLoginValidator, req);

      const email: string = input.email.toLowerCase();
      const password: string = input.password;

      const vendor = await vendorService.findVendorWithFilters({ email: email }, {}, {});
      if (!vendor) {
        throw new GraphQLError("Invalid Account", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }
      else if (!vendor.isVerified) {
        throw new GraphQLError("Vendor not verified by admin", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }
      else if (vendor.isBlocked) {
        throw new GraphQLError("Vendor Blocked", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }
      else if (! await vendor.verifyHash?.(password)) {
        throw new GraphQLError("Invalid Account", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }

      let token = await jwtService.createVendorJWT(vendor._id!.toString());

      vendor.token = token;

      await vendor.save();

      const response = vendorService.loginVendor(vendor);

      return response;
    },

  },

  Query: {
 
  },
};

