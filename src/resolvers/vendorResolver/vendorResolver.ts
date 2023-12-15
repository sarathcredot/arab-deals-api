import { vendorService, jwtService, spaceService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./vendorValidator";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifySuperAdmin, verifyAdmin } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";

export const vendorResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {

    // Vendor registration
    
    createVendor: async (parent, { input, image }, { req }, info) => {

      await validateInput(validators.vendorCreateValidator, req);

      let email: string = input.email.toLowerCase();

      const existingVendor = await vendorService.findVendorWithFilters({ email: email }, { _id: 1, email: 1 }, { lean: true });
      if (existingVendor) {
        throw new GraphQLError('Vender with this email already exists', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }
      console.log(existingVendor)

      let fullName: string = input.fullName;
      let password: string = input.password;
      let mobileNumber: string = input.mobileNumber;
      // let mobileOtp: string = input?.mobileOtp;
      let country: string = input.country;
      let profilePic: vendorService.FileData | null = null;

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


      let newVendorData: vendorService.IVendor = {
        email,
        fullName,
        mobileNumber,
        country,
      }

      if (profilePic) {
        newVendorData.profilePic = profilePic;
      }
      const result = await vendorService.createVendor(newVendorData, password);
      console.log(result)

      if (!result) {
        throw new GraphQLError("Unable to create vendor", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let response = {
        _id: result._id!.toString()
      };
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

    // updateAdminProfile: async (parent, { input, image }, { req }, info) => {
    //   try {
    //     await validateInput(validators.AdminUpdateValidator, req);
    //     await verifyAdmin(req);

    //     const _id: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

    //     const admin = await adminService.getAdminWithId(_id);
    //     if (!admin) {
    //       throw new GraphQLError("INTERNAL_SERVER_ERROR", {
    //         extensions: {
    //           code: "",
    //           errors: [],
    //         },
    //       });
    //     }

    //     let adminPic: adminService.FileData | null = null;

    //     if (image) {
    //       const { createReadStream, filename, mimetype, encoding } = await image;
    //       const key = spaceService.getFileKey(filePaths.adminProfile, filename, []);
    //       const stream = createReadStream();
    //       const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

    //       adminPic = {
    //         fileType: "PUBLIC",
    //         fileURL: file.location,
    //         mimeType: mimetype,
    //         originalName: filename
    //       }
    //     }

    //     if (input.fullName) {
    //       const trimmedFullName = input.fullName.trim();
    //       if (admin.fullName !== trimmedFullName) {
    //         admin.fullName = trimmedFullName;
    //       }
    //     }

    //     if (input.email) {
    //       const trimmedEmail = input.email.trim().toLowerCase();

    //       if (admin.email !== trimmedEmail) {
    //         const isEmailExists = await adminService.findAdminWithFilters(
    //           { email: trimmedEmail },
    //           { _id: 1, email: 1 },
    //           { lean: true }
    //         );

    //         if (isEmailExists) {
    //           throw new GraphQLError('Admin with this email already exists', {
    //             extensions: {
    //               code: 'BAD_REQUEST',
    //               errors: [],
    //             },
    //           });
    //         }

    //         admin.email = trimmedEmail;
    //       }
    //     }

    //     if (input.password) {
    //       if (await admin.verifyHash?.(input.password)) {
    //         throw new GraphQLError("You entered same password", {
    //           extensions: {
    //             code: "BAD_REQUEST",
    //             errors: []
    //           }
    //         });
    //       }
    //       await admin.setHash!(input.password);
    //     }

    //     if (adminPic) {
    //       admin.profilePic = adminPic;
    //     }

    //     // Update admin
    //     const result = await admin.save();

    //     if (!result) {
    //       throw new GraphQLError("Admin profile updatation failed", {
    //         extensions: {
    //           code: "BAD_REQUEST",
    //           errors: [],
    //         },
    //       });
    //     }

    //     const response = {
    //       _id: result?._id?.toString() || "",
    //       message: "Admin profile updated successfully",
    //     };
    //     return response;
    //   } catch (error) {
    //     throw error;
    //   }
    // },

  },

  Query: {
    // async getAdminRecord(parent, { }, { req }, info) {
    //   await verifyAdmin(req);

    //   try {
    //     const _id: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

    //     const admin = await adminService.getAdminRecordWithId(_id);
    //     if (!admin) {
    //       throw new GraphQLError("INTERNAL_SERVER_ERROR", {
    //         extensions: {
    //           code: "",
    //           errors: [],
    //         },
    //       });
    //     }
    //     const response = {
    //       record: admin
    //     }

    //     return response;

    //   } catch (error) {
    //     console.log(error);
    //     throw error;
    //   }

    // }
  },
};

