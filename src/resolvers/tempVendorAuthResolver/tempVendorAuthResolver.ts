import { tempVendorAuthService, jwtService, spaceService, otpService, vendorService, tempVendorJwtService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./tempVendorAuthValidator";
import { GraphQLError } from "graphql";
import { validateInput, verifyTempVendor } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";

export const tempVendorAuthResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {

    // Vendor registration

    createTempVendor: async (parent, { input }, { req }, info) => {
      await validateInput(validators.tempVendorCreateValidator, req);

      // let email: string = input.email.toLowerCase();

      // const existingVendor = await tempVendorAuthService.findTempVendorWithFilters({ email: email }, { _id: 1, email: 1 }, { lean: true });
      // if (existingVendor) {
      //   throw new GraphQLError('Vender with this email already exists', {
      //     extensions: {
      //       code: "INTERNAL_SERVER_ERROR",
      //       errors: []
      //     }
      //   });
      // }

      let mobileNumber: string = input.mobileNumber;

      const existingMobile = await vendorService.findVendorWithFilters({ mobileNumber: mobileNumber }, {}, { lean: true });
      if (existingMobile) {
        throw new GraphQLError('Vendor with this mobile already exists', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let fullName: string = input.fullName;

      let newVendorData: tempVendorAuthService.ITempVendor = {
        // email,
        mobileNumber,
        fullName,
      }

      const result = await tempVendorAuthService.createTempVendor(newVendorData);

      if (!result) {
        throw new GraphQLError("Unable to temp create vendor", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let response = {
        _id: result._id!.toString(),
        mobileNumber: result.mobileNumber!.toString()
      };

      return response;
    },
  }
}