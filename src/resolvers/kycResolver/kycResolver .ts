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

    submitKYC: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);

      try {
        // Validate input
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

        const companyDetails = {
          sectionName: input.companyDetails?.sectionName,
          name: input.companyDetails?.name,
          type: input.companyDetails?.type,
          crNumber: input.companyDetails?.crNumber,
          crLicence: input.companyDetails?.crLicence,
          status: input.companyDetails?.status,
          remarks: input.companyDetails?.remarks,
          // companyLicenceImage: ,
        };
        const businessOutlet = {
          sectionName: input.businessOutlet?.sectionName,
          name: input.businessOutlet?.name,
          address: input.businessOutlet?.address,
          // interiorImage: ,
          // exteriorImage: ,
          status: input.businessOutlet?.status,
          remarks: input.businessOutlet?.remarks,
        };
        const sellingProduct = {
          sectionName: input.sellingProduct?.sectionName,
          discribtion: input.sellingProduct?.discribtion,
          brand: input.sellingProduct?.brand,
          // sellingProductImage: ,
          status: input.sellingProduct?.status,
          remarks: input.sellingProduct?.remarks,
        };

        let newDocument: any = {
          vendorId,
          companyDetails,
          businessOutlet,
          sellingProduct
        }

        // Create or update KYC details for the vendor
        const result = await kycService.createKYC(newDocument);

        const response = {
          _id: result?._id,
          message: "KYC details submitted successfully",
        };

        return response;
      } catch (error) {
        throw error;
      }
    },

  },

  Query: {
    getKYCStatus: async (parent, { input }, { req }, info) => {
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
  },
};

