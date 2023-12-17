import { tempVendorAuthService, jwtService, spaceService, otpService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./tempVendorAuthValidator";
import { GraphQLError } from "graphql";
import { validateInput } from "../../middlewares";
import { filePaths } from "../../configs";

export const tempVendorAuthResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {

    // Vendor registration
    createTempVendor: async (parent, { input, image }, { req }, info) => {
      await validateInput(validators.tempVendorCreateValidator, req);

      let email: string = input.email.toLowerCase();

      const existingVendor = await tempVendorAuthService.findTempVendorWithFilters({ email: email }, { _id: 1, email: 1 }, { lean: true });
      if (existingVendor) {
        throw new GraphQLError('Vender with this email already exists', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let fullName: string = input.fullName;
      let password: string = input.password;
      let mobileNumber: string = input.mobileNumber;
      let country: string = input.country;
      let profilePic: tempVendorAuthService.FileData | null = null;

      if (image) {
        const { createReadStream, filename, mimetype, encoding } = await image;
        const key = spaceService.getFileKey(filePaths.vendorProfile, filename, []);
        const stream = createReadStream();
        const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

        profilePic = {
          fileType: "PUBLIC",
          fileURL: file.location,
          mimeType: mimetype,
          originalName: filename
        }
      }

      const temporaryMobileOtp: any = await otpService.generateOtp();
      if (!temporaryMobileOtp) {
        throw new GraphQLError('OTP generation failed', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let newVendorData: tempVendorAuthService.ITempVendor = {
        email,
        fullName,
        mobileNumber,
        country,
        temporaryMobileOtp,
      }


      if (profilePic) {
        newVendorData.profilePic = profilePic;
      }

      const result = await tempVendorAuthService.createTempVendor(newVendorData, password);

      if (!result) {
        throw new GraphQLError("Unable to create vendor", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let token = await jwtService.createVendorJWT(result._id!.toString());

      result.temporaryVendorAuthToken = token;
      await result.save();
      let response = {
        _id: result._id!.toString(),
        token: result.temporaryVendorAuthToken
      };

      return response;
    },


  }
}