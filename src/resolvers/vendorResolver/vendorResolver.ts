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

    // Vendor creation from admin side
    createVendorByAdmin: async (parent, { input, image }, { req }, info) => {
      await verifyAdmin(req);
      await validateInput(validators.VendorCreateByAdminValidator, req);
      let email: string = input?.email?.toLowerCase() || "";
      let fullName: string = input.fullName;
      let mobileNumber: string = input.mobileNumber;
      let countryCode: string = input.countryCode;
      let profilePic: vendorService.FileData | null = null;
      let isBlocked: boolean = input?.isBlocked || false;


      const isEmailExists = await vendorService.findVendorWithFilters({ email: email }, { _id: 1, email: 1 }, { lean: true });
      if (isEmailExists) {
        throw new GraphQLError('This email already exists', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      const existingUserPhoneNumber = await vendorService.findVendorWithFilters({ mobileNumber: mobileNumber, countryCode: countryCode }, {}, { lean: true });

      if (existingUserPhoneNumber) {
        throw new GraphQLError("Phone number already taken", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

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
        isBlocked,
        countryCode
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
        message: "Vendor successfully created",
      };

      return response;
    },

    // Vendor login 
    loginVendorWithOtp: async (parent, { input }, { req }, info) => {

      await validateInput(validators.vendorLoginValidator, req);

      const countryCode: string = input.countryCode;
      const mobileNumber: string = input.mobileNumber;

      const vendor = await vendorService.findVendorWithFilters({ mobileNumber: mobileNumber, countryCode: countryCode }, { mobileNumber: 1 }, { lean: true });
      if (vendor?.isBlocked) {
        throw new GraphQLError("Account blocked", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }

      let authname = vendor ? "VENDOR_LOGIN_MOBILE_OTP" : "VENDOR_SIGNUP_MOBILE_OTP"

      const mobileOtp = await otpService.generateOtp();

      let options = {
        name: authname,
        metadata: {
          code: mobileOtp.code,
          expiresAt: mobileOtp.expiresAt,
          mobileNumber,
          countryCode: countryCode
        },
        isVerified: false
      };

      const otpRecord = await otpService.createOtp(options);

      let response = {
        message: "OTP generated",
        phoneNumber: mobileNumber,
        countryCode: countryCode,
        _id: otpRecord._id
      }

      return response;
    },


    // Vendor verfiy login 
    verifyVendorLoginOtp: async (parent, { input }, { req }, info) => {
      await validateInput(validators.loginOtpVerificationValidator, req);

      const code: String = input.code;
      let otpVerification = await otpService.findOtpRecordWithFilters({ 'metadata.code': code, _id: input._id }, {}, {});

      if (!otpVerification) {
        throw new GraphQLError('Verification failed. Invalid OTP.', {
          extensions: {
            code: "",
            errors: [],
          },
        });
      }

      if (!otpVerification.metadata || !otpVerification.metadata.expiresAt || !otpVerification.metadata.mobileNumber) {
        throw new Error('Invalid OTP metadata');
      }

      let checkOtpExpired = await otpService.isOtpExpired(otpVerification.metadata.expiresAt)

      if (checkOtpExpired) {
        throw new GraphQLError('Expired OTP', {
          extensions: {
            code: "",
            errors: [],
          },
        });
      }

      const response = {
        message: "OTP verified",
        token: '',
        type: 'LOGIN',
        mobileNumber: otpVerification.metadata.mobileNumber,
        countryCode: otpVerification.metadata.countryCode,
      }


      if (otpVerification.name == "VENDOR_SIGNUP_MOBILE_OTP") {

        otpVerification.isVerified = true;
        await otpVerification.save();

        response.type = "SIGNUP";
        response.token = await jwtService.createVendorSignupJWT(otpVerification._id!.toString());
      }
      else if (otpVerification.name == "VENDOR_LOGIN_MOBILE_OTP") {

        const vendor = await vendorService.findVendorWithFilters({ mobileNumber: otpVerification.metadata.mobileNumber, countryCode: otpVerification.metadata.countryCode }, {}, {});
        if (!vendor) {
          throw new GraphQLError('Expired OTP', {
            extensions: {
              code: "",
              errors: [],
            },
          });
        }
        let token = await jwtService.createVendorJWT(vendor._id!.toString());
        vendor.token = token;
        await vendor.save();
        await otpService.deleteOtpRecord(otpVerification._id);
        response.token = token;
      }
      else {

        throw new GraphQLError('Expired OTP', {
          extensions: {
            code: "",
            errors: [],
          },
        });
      }

      return response;

    },

    // Vendor creation 
    createVendor: async (parent, { input, image }, { req }, info) => {
      await validateInput(validators.VendorCreateValidator, req);

      let email: string = input?.email?.toLowerCase() || "";
      let jwtToken: string = input.token;
      let fullName: string = input.fullName;
      let profilePic: vendorService.FileData | null = null;

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

      const decoded = await jwtService.verifyVendorSignupJWT(jwtToken);

      if (!decoded || !decoded.id) {
        throw new GraphQLError('Invalid Token', {
          extensions: {
            code: "",
            errors: [],
          },
        });
      }

      let otpVerification = await otpService.findOtpRecordWithFilters({ _id: decoded.id }, {}, {});
      if (!otpVerification || !otpVerification.isVerified || !otpVerification.metadata.mobileNumber) {
        throw new GraphQLError('Registration failed.', {
          extensions: {
            code: "",
            errors: [],
          },
        });
      }

      let mobileNumber: string = otpVerification.metadata.mobileNumber;
      let countryCode: string = otpVerification.metadata.countryCode || "+91";

      const existingUserPhoneNumber = await vendorService.findVendorWithFilters({ mobileNumber: mobileNumber, countryCode: countryCode }, {}, { lean: true });

      if (existingUserPhoneNumber) {
        throw new GraphQLError("Phone number already taken", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      if (input.email) {
        const existingUserEmail = await vendorService.findVendorWithFilters({ email: email }, {}, { lean: true });

        if (existingUserEmail) {
          throw new GraphQLError("Email already taken", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: []
            }
          });
        }
      }

      let newVendorData: vendorService.IVendor = {
        fullName,
        mobileNumber,
        countryCode,
        email,
      };

      if (profilePic) {
        newVendorData.profilePic = profilePic;
      }

      const result = await vendorService.createVendor(newVendorData);

      let token = await vendorJwtService.createVendorJWT(result._id!.toString());

      result.token = token;

      await result.save();

      await otpService.deleteOtpRecord(otpVerification._id);

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
        message: "Vendor created",
      };

      return response;
    },
    // Edit vendor profile
    updateVendorProfile: async (parent, { input, image }, { req }, info) => {
      try {
        await verifyVendor(req);
        await validateInput(validators.VendorUpdateValidator, req);

        const vendorId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

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
            fileType: "PUBLIC",
            fileURL: file.location,
            mimeType: mimetype,
            originalName: filename
          }
        }
        let email = input.email?.toLowerCase();
        if (email && vendor.email != email) {
          const isEmailExists = await vendorService.findVendorWithFilters({ email: email }, { _id: 1, email: 1 }, { lean: true });
          if (isEmailExists) {
            throw new GraphQLError('This email already exists', {
              extensions: {
                code: "INTERNAL_SERVER_ERROR",
                errors: []
              }
            });
          }
          vendor.email = email;
        }

        if (input.fullName) {
          vendor.fullName = input.fullName;
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
        await verifyAdmin(req);
        await validateInput(validators.VendorUpdateByAdminValidator, req);

        const vendorId: Types.ObjectId = new Types.ObjectId(input._id);
        let email: string = input?.email?.toLowerCase() || "";

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
            fileType: "PUBLIC",
            fileURL: file.location,
            mimeType: mimetype,
            originalName: filename
          }
        }

        if (email && vendor.email != email) {
          const isEmailExists = await vendorService.findVendorWithFilters({ email: email }, { _id: 1, email: 1 }, { lean: true });
          if (isEmailExists) {
            throw new GraphQLError('This email already exists', {
              extensions: {
                code: "INTERNAL_SERVER_ERROR",
                errors: []
              }
            });
          }
          vendor.email = email;
        }

        if (input.fullName) {
          vendor.fullName = input.fullName;
        }

        if ((input.countryCode && input.countryCode != vendor.countryCode) || (input.mobileNumber && input.mobileNumber !== vendor.mobileNumber)) {
          vendor.countryCode = input.countryCode || "";
          vendor.mobileNumber = input.mobileNumber || "";
          const existingUserPhoneNumber = await vendorService.findVendorWithFilters({ mobileNumber: vendor.mobileNumber, countryCode: vendor.countryCode }, {}, { lean: true });
          if (existingUserPhoneNumber) {
            throw new GraphQLError("Phone number already taken", {
              extensions: {
                code: "INTERNAL_SERVER_ERROR",
                errors: []
              }
            });
          }
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
      await verifyAdmin(req);
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
        await verifyAdmin(req);

        const page: number = input?.page || 0;
        const size: number = input?.size || 10;
        const isKycCompleted: boolean | null = input?.isKycCompleted ?? null;
        const isBlocked: boolean | null = input?.isBlocked ?? null;
        const fullName: string | null = input?.fullName ?? null;
        const email: string | null = input?.email ?? null;
        const mobileNumber: string | null = input?.mobileNumber ?? null;

        const options: vendorService.IVendorsRecordsByAdminOptions = {
          page,
          size,
          isKycCompleted,
          isBlocked,
          fullName,
          email,
          mobileNumber,
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
      await verifyAdmin(req);

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

    // Fetch each vendor record by vendor
    async getVendorRecordByVendor(parent, { }, { req }, info) {
      await verifyVendor(req);

      const _id: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

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

      return response;

    },

    // Fetch each vendor all kycrecord by vendor
    async getVendorAllKycRecordByVendor(parent, { }, { req }, info) {
      await verifyVendor(req);

      try {
        const _id: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

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
    async getKycStatus(parent, { }, { req }, info) {
      await verifyVendor(req);

      try {

        const _id: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

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

