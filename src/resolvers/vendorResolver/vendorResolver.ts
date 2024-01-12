import { vendorService, jwtService, spaceService, vendorCompanyService, vendorOutletService, vendorJwtService, otpService } from "../../services";
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
      await verifyVendor(req);
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
          fileType: "PUBLIC",
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

      const createVendorCompanyRecord = await vendorCompanyService.createVendorCompanyRecord({ vendorId: result.id });

      if (!createVendorCompanyRecord) {
        throw new GraphQLError("Unable to create vendor company record", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      const createVendorOutletRecord = await vendorOutletService.createVendorOutletRecord({ vendorId: result.id });

      if (!createVendorOutletRecord) {
        throw new GraphQLError("Unable to create vendor outlet record", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }


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

      const createVendorCompanyRecord = await vendorCompanyService.createVendorCompanyRecord({ vendorId: result.id });

      if (!createVendorCompanyRecord) {
        throw new GraphQLError("Unable to create vendor company record", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      const createVendorOutletRecord = await vendorOutletService.createVendorOutletRecord({ vendorId: result.id });

      if (!createVendorOutletRecord) {
        throw new GraphQLError("Unable to create vendor outlet record", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let response = {
        _id: result._id!.toString(),
        token: result.token,
        message: "Vendor created successfully and logined",
      };

      return response;
    },

    // Vendor login 
    loginVendorWithOtp: async (parent, { input }, { req }, info) => {

      await validateInput(validators.vendorLoginValidator, req);

      const mobileNumber: string = input.mobileNumber;

      const vendor = await vendorService.findVendorWithFilters({ mobileNumber: mobileNumber }, {mobileNumber: 1}, {lean: true});
      if (!vendor) {
        throw new GraphQLError("The vendor does not have an account with this number. Please sign up", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }

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
        name: "VENDOR_LOGIN_MOBILE_OTP",
        metadata: {
          code: mobileOtp.code,
          expiresAt: mobileOtp.expiresAt,
          mobileNumber,
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
        message: "Login OTP send successfully"
      }

      return response;
    },


    // Vendor verfiy login 
    verifyVendorLoginOtp: async (parent, { input }, { req }, info) => {
      await validateInput(validators.loginOtpVerificationValidator, req);

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

      const vendor = await vendorService.findVendorWithFilters({ mobileNumber: result?.metadata?.mobileNumber }, {}, {});
      if (!vendor) {
        throw new GraphQLError("Invalid Account", {
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

      let token = await jwtService.createVendorJWT(vendor._id!.toString());

      vendor.token = token;

      await vendor.save();

      const loginResponse = vendorService.loginVendor(vendor);

      const response = {
        _id: loginResponse?._id?.toString(),
        token: loginResponse?.token,
        message: 'Vendor otp verifed and logined successfully',
      };

      return response;
    },

    // Vendor re send login otp
    reSendloginVendorWithOtp: async (parent, { input }, { req }, info) => {

      await validateInput(validators.vendorLoginValidator, req);

      const mobileNumber: string = input.mobileNumber;


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
        name: "VENDOR_LOGIN_MOBILE_OTP",
        metadata: {
          code: mobileOtp.code,
          expiresAt: mobileOtp.expiresAt,
          mobileNumber,
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
        message: "Login OTP send successfully"
      }

      return response;
    },

    // Edit vendor profile
    updateVendorProfile: async (parent, { input, image }, { req }, info) => {
      try {
        await verifyVendor(req);
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

    // Edit vendor profile by admin
    updateVendorProfileByAdmin: async (parent, { input, image }, { req }, info) => {
      try {
        // await verifyAdmin(req);
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

        // Ensure that brands and categories are always arrays of ObjectId
        vendor.brands = vendor.brands ? vendor.brands.filter(Boolean) as Types.ObjectId[] : [];
        vendor.categories = vendor.categories ? vendor.categories.filter(Boolean) as Types.ObjectId[] : [];

        if (input.brands) {
          // Append new brands to the existing array
          vendor.brands = [...vendor.brands, ...(input.brands || [])].filter(Boolean) as [];
        }

        if (input.categories) {
          // Append new categories to the existing array
          vendor.categories = [...vendor.categories, ...(input.categories || [])].filter(Boolean) as [];;
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


    // Vendor Kyc approval
    vendorKycApproval: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);
      await validateInput(validators.vendorKycStatusValidator, req);

      const _id: Types.ObjectId = new Types.ObjectId(input._id);
      const approvalStatus: boolean = input?.status;
      const vendor: vendorService.IVendorDocument | null = await vendorService.getvendorRecordWithId(_id);

      if (!vendor) {
        throw new GraphQLError("Record not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }

      if (approvalStatus !== undefined) {
        vendor.isKycCompleted = approvalStatus;
      }

      await vendor.save();

      const response = {
        _id: vendor._id?.toString(),
        message: "Vendor kyc status updated successfully"
      }

      return response;
    },

  },

  Query: {
    // Fetch all vendors records by admin
    async getAllVendorsRecordsByAdmin(parent, { input }, { req }, info) {
      try {
        await validateInput(validators.getAllVendorsRecordsByAdminValidator, req);
        // await verifyAdmin(req);

        const page: number = input?.page || 0;
        const size: number = input?.size || 10;
        const isKycCompleted: boolean | null = input?.isKycCompleted ?? null;

        const options: vendorService.IVendorsRecordsByAdminOptions = {
          page,
          size,
          isKycCompleted,
        }

        // Fetch all vendors records
        const result = await vendorService.getVendorRecordsByAdminWithFilters(options);
        const response = {
          records: result.records,
          maxRecords: result.maxRecords,
          message: "Vendors records fetched successfully",
        };
        return response;
      } catch (error) {
        throw error;
      }
    },

    // Fetch each vendor record by admin
    async getVendorRecordByAdmin(parent, { input }, { req }, info) {
      // await verifyAdmin(req);

      try {
        await validateInput(validators.getVendorRecordValidator, req);

        const _id: Types.ObjectId = new Types.ObjectId(input._id);

        const result = await vendorService.getVendorRecordByAdminWithId(_id);

        if (!result) {
          throw new GraphQLError("Record not found", {
            extensions: {
              code: "BAD_REQUEST",
              errors: []
            }
          });
        }

        const response = {
          record: {
            ...result,
            brands: (result?.brands || []).map(brandId => brandId.toString()),
            categories: (result?.categories || []).map(categoryId => categoryId.toString()),
            vendorId: result?._id?.toString(),
          },
          message: "Vendor record fetched successfully",
        }

        return response;

      } catch (error) {
        throw error;
      }

    },

    // Fetch all vendors records by vendor
    async getAllVendorsRecordsByVendor(parent, { input }, { req }, info) {
      try {
        await validateInput(validators.getAllVendorsRecordsByVendorValidator, req);
        // await verifyAdmin(req);

        const page: number = input?.page || 0;
        const size: number = input?.size || 10;
        const isKycCompleted: boolean | null = input?.isKycCompleted ?? null;

        const options: vendorService.IVendorsRecordsByVendorOptions = {
          page,
          size,
          isKycCompleted,
        }

        // Fetch all vendors records
        const result = await vendorService.getVendorRecordsByVendorWithFilters(options);
        const response = {
          records: result.records,
          maxRecords: result.maxRecords,
          message: "Vendors records fetched successfully",
        };
        return response;
      } catch (error) {
        throw error;
      }
    },

    // Fetch each vendor record by vendor
    async getVendorRecordByVendor(parent, { input }, { req }, info) {
      // await verifyVendor(req);

      try {
        await validateInput(validators.getVendorRecordValidator, req);

        const _id: Types.ObjectId = new Types.ObjectId(input._id);

        const result = await vendorService.getVendorRecordByVendorWithId(_id);

        if (!result) {
          throw new GraphQLError("Record not found", {
            extensions: {
              code: "BAD_REQUEST",
              errors: []
            }
          });
        }


        const response = {
          record: {
            ...result,
            brands: (result?.brands || []).map(brandId => brandId.toString()),
            categories: (result?.categories || []).map(categoryId => categoryId.toString()),
            vendorId: result?._id?.toString(),
          },
          message: "Vendor record fetched successfully",
        }
        console.log("response ", response)

        return response;

      } catch (error) {
        throw error;
      }

    },

     // Fetch each vendor all kycrecord by vendor
     async getVendorAllKycRecordByVendor(parent, { input }, { req }, info) {
      // await verifyVendor(req);

      try {
        await validateInput(validators.getVendorRecordValidator, req);

        const _id: Types.ObjectId = new Types.ObjectId(input._id);

        const result = await vendorService.getVendorAllKycRecordByVendorWithId(_id);

        if (!result) {
          throw new GraphQLError("Record not found", {
            extensions: {
              code: "BAD_REQUEST",
              errors: []
            }
          });
        }


        const response = {
          record: {
            ...result,
            brands: (result?.brands || []).map(brandId => brandId.toString()),
            categories: (result?.categories || []).map(categoryId => categoryId.toString()),
            vendorId: result?._id?.toString(),
          },
          message: "Vendor all kyc record details fetched successfully",
        }

        return response;

      } catch (error) {
        throw error;
      }

    },

    // Fetch each vendor record KYC status
    async getKycStatus(parent, { input }, { req }, info) {
      await verifyVendor(req);

      try {
        await validateInput(validators.getVendorRecordValidator, req);

        const _id: Types.ObjectId = new Types.ObjectId(input._id);

        const result = await vendorService.getVendorRecordKycStatusById(_id);

        if (!result) {
          throw new GraphQLError("Record not found", {
            extensions: {
              code: "BAD_REQUEST",
              errors: []
            }
          });
        }

        const response = {
          record: {
            ...result,
            vendorId: result?._id?.toString()
          },
          message: "Vendor record fetched successfully",
        }

        return response;

      } catch (error) {
        throw error;
      }

    },
  },
};

