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
    // Fetch all vendors records
    async getAllVendorsRecordsByAdmin(parent, { input }, { req }, info) {
      try {
          await validateInput(validators.getAllVendorsRecordsValidator, req);
          // await verifyAdmin(req);

          const page: number = input?.page || 0;
          const size: number = input?.size || 10;
          let projection: vendorService.IVendorProjection = { _id: 1 };

          const selectedFields = info?.fieldNodes[0]?.selectionSet?.selections || [];
          for (const selection of selectedFields) {
              if (selection.kind === "Field" && selection.name.value == "records") {

                  let selectionSet = selection.selectionSet || { selections: [] };
                  for (let item of selectionSet.selections) {
                      if (item.kind === "Field") {
                          const fieldName = item.name.value;
                          if (["images"].includes(fieldName)) {
                              let selectionSet = item.selectionSet || { selections: [] };
                              for (let item2 of selectionSet.selections) {
                                  if (item2.kind === "Field") {
                                      const subField = item2.name.value;
                                      const path = `${fieldName}.${subField}`;
                                      projection[path as keyof vendorService.IVendorProjection] = 1;
                                  }
                              }
                          }
                          else {
                              projection[fieldName as keyof vendorService.IVendorProjection] = 1;
                          }
                      }
                  }
              }
          }


          const options: vendorService.IVendorsRecordsOptions = {
              page,
              size,
              projection,
          }

          // Fetch all CMS records
          const result = await vendorService.getVendorsRecordsWithFilters(options);
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
  },
};

