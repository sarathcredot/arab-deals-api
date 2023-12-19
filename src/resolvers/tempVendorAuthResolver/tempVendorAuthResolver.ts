import { tempVendorAuthService, vendorService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./tempVendorAuthValidator";
import { GraphQLError } from "graphql";
import { validateInput } from "../../middlewares";

export const tempVendorAuthResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {

    // Vendor temp registration

    createTempVendor: async (parent, { input }, { req }, info) => {
      await validateInput(validators.tempVendorCreateValidator, req);

      // TODO:  remove if emailis not include in temp vendor creation
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
        // email,  // TODO:  remove if emailis not include in temp vendor creation
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