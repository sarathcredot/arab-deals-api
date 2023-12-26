import { vendorService, jwtService, spaceService, otpService, tempVendorAuthService, vendorJwtService, kycService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./kycValidator";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";

export const kycResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {

    // KYC for company details 
    submitKycCompanyDetails: async (parent, { input, image }, { req }, info) => {
      await validateInput(validators.submitKYCCompanyDetailsValidator, req);
      await verifyAdmin(req);

      try {
        const vendorId: Types.ObjectId = new Types.ObjectId(input.vendorId);
        const vendor = await vendorService.findVendorWithFilters({ _id: vendorId }, {}, {});

        if (!vendor) {
          throw new GraphQLError("Vendor not found with this id", {
            extensions: {
              code: "BAD_REQUEST",
              errors: []
            }
          });
        }
        const kycData = await kycService.findKYCWithFilters({ vendorId: vendorId }, {}, {});

        if (!kycData) {
          throw new GraphQLError("KYC data of this user is initially created", {
            extensions: {
              code: "BAD_REQUEST",
              errors: []
            }
          });
        }

        let licenceImage: kycService.FileData | null = null;

        if (image) {
          const { createReadStream, filename, mimetype, encoding } = await image;
          const key = spaceService.getFileKey(filePaths.kyc, filename, []);
          const stream = createReadStream();
          const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

          licenceImage = {
            fileType: "PRIVATE",
            fileURL: file.location,
            mimeType: mimetype,
            originalName: filename
          }
        }

        const companyDetails: kycService.ICompanyDetails = {
          sectionName: input.companyDetails.sectionName,
          name: input.companyDetails.name,
          type: input.companyDetails.type,
          crNumber: input.companyDetails.crNumber,
          crLicence: input.companyDetails.crLicence,
        };

        if (licenceImage) {
          companyDetails.companyLicenceImage = licenceImage;
        }

        kycData.companyDetails = companyDetails;

        const result = await kycData?.save();

        const response = {
          _id: result?._id?.toString(),
          message: "Vendor company details for KYC verification added successfully",
        };

        return response;
      } catch (error) {
        throw error;
      }
    },

    // KYC for business outlet
    submitKycBusinessOutletDetails: async (parent, { input, images, fileMap }, { req }, info) => {
      await validateInput(validators.submitKYCBusinessOutletDetailsValidator, req);
      await verifyAdmin(req);

      try {
        const vendorId: Types.ObjectId = new Types.ObjectId(input.vendorId);
        const vendor = await vendorService.findVendorWithFilters({ _id: vendorId }, {}, {});

        if (!vendor) {
          throw new GraphQLError("Vendor not found with this id", {
            extensions: {
              code: "BAD_REQUEST",
              errors: []
            }
          });
        }
        const kycData = await kycService.findKYCWithFilters({ vendorId: vendorId }, {}, {});

        if (!kycData) {
          throw new GraphQLError("KYC data of this user is initially created", {
            extensions: {
              code: "BAD_REQUEST",
              errors: []
            }
          });
        }


        images = images || [];

        let outletImages: kycService.FileData[] = [];

        for (let image of images) {
          const { createReadStream, filename, mimetype, encoding } = await image;

          const key = spaceService.getFileKey(filePaths.kyc, filename, []);

          const stream = createReadStream();

          const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

          outletImages.push({
            fileType: "PRIVATE",
            fileURL: file.location,
            mimeType: mimetype,
            originalName: filename
          });
        }

        fileMap = fileMap || {};
        console.log(fileMap)

        const businessOutletDetails: kycService.IBusinessOutlet = {
          sectionName: input.businessOutlet.sectionName,
          name: input.businessOutlet.name,
          address: input.businessOutlet.address,
        };

        let outletImageKeys = Object.keys(fileMap);
        outletImageKeys.forEach((imageName) => {
          if (fileMap[imageName] != null && fileMap[imageName] >= 0) {
            switch (imageName) {
              case "interiorImage":
                businessOutletDetails.interiorImage = outletImages[fileMap[imageName]];
                break;

              case "exteriorImage":
                businessOutletDetails.exteriorImage = outletImages[fileMap[imageName]];
                break;

              default:
            }
          }
        });

        kycData.businessOutlet = businessOutletDetails;

        const result = await kycData?.save();

        const response = {
          _id: result?._id?.toString(),
          message: "Vendor busniess outlet details for KYC verification added successfully",
        };

        return response;
      } catch (error) {
        throw error;
      }
    },

    // KYC for selling prouct
    submitKycSellingProductDetails: async (parent, { input, images }, { req }, info) => {
      await validateInput(validators.submitKycBusinessOutletValidator, req);
      await verifyAdmin(req);

      try {
        const vendorId: Types.ObjectId = new Types.ObjectId(input.vendorId);
        const vendor = await vendorService.findVendorWithFilters({ _id: vendorId }, {}, {});

        if (!vendor) {
          throw new GraphQLError("Vendor not found with this id", {
            extensions: {
              code: "BAD_REQUEST",
              errors: []
            }
          });
        }
        const kycData = await kycService.findKYCWithFilters({ vendorId: vendorId }, {}, {});

        if (!kycData) {
          throw new GraphQLError("KYC data of this user is initially created", {
            extensions: {
              code: "BAD_REQUEST",
              errors: []
            }
          });
        }


        images = images || [];

        let sellingProductImages: kycService.FileData[] = [];

        for (let image of images) {
          const { createReadStream, filename, mimetype, encoding } = await image;

          const key = spaceService.getFileKey(filePaths.kyc, filename, []);

          const stream = createReadStream();

          const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

          sellingProductImages.push({
            fileType: "PRIVATE",
            fileURL: file.location,
            mimeType: mimetype,
            originalName: filename
          });
        }

        const sellingProductDetails: kycService.ISellingProduct = {
          sectionName: input.sellingProduct.sectionName,
          discription: input.sellingProduct.discription,
          brand: input.sellingProduct.brand,
        };


        if (sellingProductImages) {
          sellingProductDetails.sellingProductImage = sellingProductImages;
        }

        kycData.sellingProduct = sellingProductDetails;

        const result = await kycData?.save();

        const response = {
          _id: result?._id?.toString(),
          message: "Vendor selling products details for KYC verification added successfully",
        };

        return response;
      } catch (error) {
        throw error;
      }
    },

    updateIsKycCompleted: async (parent, { }, { req }, info) => {
      // await verifyAdmin(req);
      try {
        const result = await kycService.updateAllRecordsWithIsKycCompleted();

        const response = {
          message: `${result.modifiedCount} documents updated.`
        }

        return response;
      } catch (error) {
        throw error;
      }
    },

  },

  Query: {
    getKYCStatus: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);
      await validateInput(validators.getKYCStatusValidator, req);
      try {

        const vendorId: Types.ObjectId = new Types.ObjectId(input.vendorId);

        const kycData = await kycService.findKYCWithFilters({ vendorId: vendorId }, {}, {});

        if (!kycData) {
          throw new GraphQLError("KYC details not found for the specified vendorId", {
            extensions: {
              code: "BAD_REQUEST",
              errors: []
            }
          });
        }

        const isKycCompleted =
          kycData.companyDetails?.status === "COMPLETED" &&
          kycData.businessOutlet?.status === "COMPLETED" &&
          kycData.sellingProduct?.status === "COMPLETED";

        kycData.isKycCompleted = isKycCompleted;
        await kycData.save();

        // Prepare the response
        const response = {
          companyDetailsStatus: kycData.companyDetails?.status,
          businessOutletStatus: kycData.businessOutlet?.status,
          sellingProductStatus: kycData.sellingProduct?.status,
          isKycCompleted: isKycCompleted,
          message: isKycCompleted
            ? `KYC is completed for the ${kycData.vendorId?.toString()}`
            : `KYC is not completed for the ${kycData.vendorId?.toString()}`,
        };

        return response;
      } catch (error) {
        throw error;
      }
    },

    async getAllKycRecordsByAdmin(parent, { input }, { req }, info) {
      try {
        await validateInput(validators.getAllKycRecordsValidator, req);
        await verifyAdmin(req);

        const page: number = input?.page || 0;
        const size: number = input?.size || 10;

        const options = {
          page,
          size,
        }

        const result = await kycService.getAllKycRecordsWithFilters(options);
        const response = {
          records: result.records,
          maxRecords: result.maxRecords,
          message: "KYC all records fetched successfully"
        };
        return response;
      } catch (error) {
        throw error;
      }
    },

    async getKycRecordByAdmin(parent, { input }, { req }, info) {
      try {
        //Validate Input
        await validateInput(validators.kycRecordByAdminQueryValidator, req);
        await verifyAdmin(req);

        const _id: Types.ObjectId = new Types.ObjectId(input._id);

        const result = await kycService.getKycRecordWithId(_id);

        if (!result) {
          throw new GraphQLError("Record not found", {
            extensions: {
              code: "BAD_REQUEST",
              errors: []
            }
          });
        }

        const record: kycService.IKYC = result;


        const response = {
          record: record,
          message: "KYC record fetched successfully"
        }



        return response;

      } catch (error) {
        throw error;
      }

    },

  },
};

