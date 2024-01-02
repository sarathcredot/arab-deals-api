import { vendorService, jwtService, spaceService, otpService, vendorJwtService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./vendorValidator";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";

export const vendorResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {

    // Vendor creation from vendor side
    createVendor: async (parent, { input, image }, { req }, info) => {
      await validateInput(validators.VendorCreateValidator, req);
      let email: string = input?.email?.toLowerCase() || "";

      const isEmailExists = await vendorService.findVendorWithFilters({ email: email }, { _id: 1, email: 1 }, { lean: true });
      if (isEmailExists) {
        throw new GraphQLError('This email already exists', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let fullName: string = input.fullName;
      let mobileNumber: string = input.mobileNumber;
      let profilePic: vendorService.FileData | null = null;
      let brands: Types.ObjectId[] = (input.brands || []).filter(Boolean) as [];
      let categories: Types.ObjectId[] = (input.categories || []).filter(Boolean) as [];


      if (image) {
        const { createReadStream, filename, mimetype, encoding } = await image;
        const key = spaceService.getFileKey(filePaths.vendorProfilePic, filename, []);
        const stream = createReadStream();
        const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

        profilePic = {
          fileType: "PRIVATE",
          fileURL: file.location,
          mimeType: mimetype,
          originalName: filename
        }
      }


      let newVendorData: vendorService.IVendor = {
        fullName,
        email,
        mobileNumber,
        brands,
        categories,

      };

      if (profilePic) {
        newVendorData.profilePic = profilePic;
      }


      const result = await vendorService.createVendor(newVendorData);

      if (!result) {
        throw new GraphQLError("Unable to create vendor", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let token = await vendorJwtService.createVendorJWT(result._id!.toString());

      result.token = token;

      await result.save();

      const vendorId = result._id!.toString()

      let newDocument = { vendorId: vendorId }

      // await kycService.createKYC(newDocument);

      let response = {
        _id: result._id!.toString(),
        token: result.token,
        message: "Vendor created successfully and logined",
      };

      return response;
    },

    // Vendor creation from admin side
    createVendorByAdmin: async (parent, { input, image }, { req }, info) => {
      await verifyAdmin(req);
      await validateInput(validators.VendorCreateValidator, req);
      let email: string = input?.email?.toLowerCase() || "";

      const isEmailExists = await vendorService.findVendorWithFilters({ email: email }, { _id: 1, email: 1 }, { lean: true });
      if (isEmailExists) {
        throw new GraphQLError('This email already exists', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let fullName: string = input.fullName;
      let mobileNumber: string = input.mobileNumber;
      let profilePic: vendorService.FileData | null = null;
      let isBlocked: boolean = input?.isBlocked || false;
      let isKycCompleted: boolean = input?.isKycCompleted || false;
      let brands: Types.ObjectId[] = (input.brands || []).filter(Boolean) as [];
      let categories: Types.ObjectId[] = (input.categories || []).filter(Boolean) as [];


      if (image) {
        const { createReadStream, filename, mimetype, encoding } = await image;
        const key = spaceService.getFileKey(filePaths.vendorProfilePic, filename, []);
        const stream = createReadStream();
        const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

        profilePic = {
          fileType: "PRIVATE",
          fileURL: file.location,
          mimeType: mimetype,
          originalName: filename
        }
      }


      let newVendorData: vendorService.IVendor = {
        fullName,
        email,
        mobileNumber,
        isBlocked,
        isKycCompleted,
        brands,
        categories,
      };

      if (profilePic) {
        newVendorData.profilePic = profilePic;
      }


      const result = await vendorService.createVendor(newVendorData);

      if (!result) {
        throw new GraphQLError("Unable to create vendor", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let token = await vendorJwtService.createVendorJWT(result._id!.toString());

      result.token = token;

      await result.save();

      const vendorId = result._id!.toString()

      let newDocument = { vendorId: vendorId }

      // await kycService.createKYC(newDocument);

      let response = {
        _id: result._id!.toString(),
        token: result.token,
        message: "Vendor created successfully and logined",
      };

      return response;
    },

    vendorAccountApproval: async (parent, { input }, { req }, info) => {
      await verifyAdmin(req);
      await validateInput(validators.vendorProfileApprovalValidator, req);

      const _id: Types.ObjectId = new Types.ObjectId(input._id);
      const approvalStatus: boolean | undefined = input.approvalStatus?.valueOf();
      const vendor: vendorService.IVendorDocument | null = await vendorService.getvendorRecordWithId(_id);

      if (!vendor) {
        throw new GraphQLError("Record not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }

      // if (approvalStatus !== undefined) {
      //   vendor.isApproved = approvalStatus;
      // }

      await vendor.save();

      const response = {
        _id: vendor._id?.toString(),
        message: "Vendor profile approved successfully"
      }

      return response;
    },

    // Vendor login 
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
      // TODO: Need to remove after confirm isVerifies feild is not adding in vendor db
      // else if (!vendor.isVerified) {
      //   throw new GraphQLError("Vendor not verified by admin", {
      //     extensions: {
      //       code: "BAD_REQUEST",
      //       errors: []
      //     }
      //   });
      // }
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

    // Edit vendor profile
    updateVendorProfile: async (parent, { input, image }, { req }, info) => {
      try {
        // await verifyVendor(req);
        await validateInput(validators.VendorUpdateValidator, req);

        const vendorId: Types.ObjectId = new Types.ObjectId(input._id);

        const vendor = await vendorService.findVendorWithFilters({ _id: vendorId }, {}, {});
        if (!vendor) {
          throw new GraphQLError('Vendor not found', {
            extensions: {
              code: 'BAD_REQUEST',
              errors: [],
            },
          });
        }

        let profilePic: vendorService.FileData | null = null;

        if (image) {
          const { createReadStream, filename, mimetype, encoding } = await image;
          const key = spaceService.getFileKey(filePaths.vendorProfilePic, filename, []);
          const stream = createReadStream();
          const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

          profilePic = {
            fileType: "PRIVATE",
            fileURL: file.location,
            mimeType: mimetype,
            originalName: filename
          }
        }

        if (input.email) {
          vendor.email = input.email.toLowerCase();
        }

        if (input.fullName) {
          vendor.fullName = input.fullName;
        }

        if (input.mobileNumber) {
          vendor.mobileNumber = input.mobileNumber;
        }

        if (input.isKycCompleted) {
          vendor.isKycCompleted = input.isKycCompleted;
        }

        if (profilePic) {
          vendor.profilePic = profilePic;
        }


        await vendor.save();

        const response = {
          _id: vendor?._id?.toString(),
          message: 'Vendor successfully updated',
        };

        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

  },

  Query: {
    // Fetch all vendors records
    // async getAllVendorsRecordsByAdmin(parent, { input }, { req }, info) {
    //   try {
    //     await validateInput(validators.getAllVendorsRecordsValidator, req);
    //     await verifyAdmin(req);

    //     const page: number = input?.page || 0;
    //     const size: number = input?.size || 10;
    //     const status: string = input?.status || "DEFAULT";

    //     const options: vendorService.IVendorsRecordsWithKycOptions = {
    //       page,
    //       size,
    //       status,
    //     }

    //     // Fetch all vendors records
    //     const result = await vendorService.getCategorizedKYCs(options);
    //     const response = {
    //       records: result.records,
    //       maxRecords: result.maxRecords,
    //       message: "Vendors records fetched successfully",
    //     };
    //     return response;
    //   } catch (error) {
    //     throw error;
    //   }
    // },

    // Fetch each vendors records
    // async getVendorRecordByAdmin(parent, { input }, { req }, info) {
    //   await verifyAdmin(req);

    //   try {
    //     await validateInput(validators.getVendorRecordValidator, req);

    //     const _id: Types.ObjectId = new Types.ObjectId(input._id);

    //     const result = await vendorService.getvendorRecordWithId(_id);

    //     if (!result) {
    //       throw new GraphQLError("Record not found", {
    //         extensions: {
    //           code: "BAD_REQUEST",
    //           errors: []
    //         }
    //       });
    //     }

    //     const response = {
    //       record: result,
    //       message: "Vendor record fetched successfully",
    //     }

    //     return response;

    //   } catch (error) {
    //     throw error;
    //   }

    // },
  },
};

