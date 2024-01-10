import { vendorService, jwtService, spaceService, vendorCompanyService, vendorOutletService, vendorJwtService, otpService, attributeService, attributeValueService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./attributeValueValidator";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";

export const attributeValueResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {

    // Attribute creation from admin side
    createAttributeValue: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);
      await validateInput(validators.CreateAttributeValueValidator, req);

      let attributeId: Types.ObjectId = new Types.ObjectId(input.attributeId);
      let value: string = input.value;
      let colorCode: string = input.colorCode;
      let priority: number = input.priority;
      let isBlocked: boolean = input.isBlocked || false;


      let newAttributeValueData: attributeValueService.IAttributeValue = {
        attributeId,
        value,
        colorCode,
        priority,
        isBlocked,
      };

      const result = await attributeValueService.createAttributeValue(newAttributeValueData);

      if (!result) {
        throw new GraphQLError("Unable to create attribute Value", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }


      let response = {
        _id: result._id!.toString(),
        message: "Attribute created successfully",
      };

      return response;
    },

    // Attribute edit from admin side
    // editAttribute: async (parent, { input }, { req }, info) => {
    //   try {
    //     // await verifyAdmin(req);
    //     await validateInput(validators.EditAttributeValidator, req);

    //     const attributeId: Types.ObjectId = new Types.ObjectId(input.attributeId);

    //     // Find the existing attribute by ID
    //     const attributeRecord = await attributeService.getvendorRecordWithId(attributeId);

    //     if (!attributeRecord) {
    //       throw new GraphQLError("Attribute not found", {
    //         extensions: {
    //           code: "NOT_FOUND",
    //           errors: []
    //         }
    //       });
    //     }

    //     if (input.attributeType) {
    //       attributeRecord.attributeType = input?.attributeType;
    //     }

    //     if (input.isBlocked != null) {
    //       attributeRecord.isBlocked = input?.isBlocked;
    //     }

    //     if (input?.name) {
    //       attributeRecord.name = input?.name;
    //     }

    //     if (input.description) {
    //       attributeRecord.description = input?.description;
    //     }


    //     const result = await attributeRecord.save();

    //     let response = {
    //       _id: result._id!.toString(),
    //       message: "Attribute edited successfully",
    //     };

    //     return response;
    //   } catch (error) {
    //     console.error(error);
    //     throw error;
    //   }
    // },

  },

  // Query: {
    // Fetch all vendors records by admin
    // async getAllVendorsRecordsByAdmin(parent, { input }, { req }, info) {
    //   try {
    //     await validateInput(validators.getAllVendorsRecordsByAdminValidator, req);
    //     // await verifyAdmin(req);

    //     const page: number = input?.page || 0;
    //     const size: number = input?.size || 10;
    //     const isKycCompleted: boolean | null = input?.isKycCompleted ?? null;

    //     const options: vendorService.IVendorsRecordsByAdminOptions = {
    //       page,
    //       size,
    //       isKycCompleted,
    //     }

    //     // Fetch all vendors records
    //     const result = await vendorService.getVendorRecordsByAdminWithFilters(options);
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

    // Fetch all attribute records by admin
    // async getAllAttributeRecordsByAdmin(parent, { input }, { req }, info) {
    //   try {
    //     await validateInput(validators.getAllAttributeRecordsValidator, req);
    //     // await verifyAdmin(req);

    //     const page: number = input?.page || 0;
    //     const size: number = input?.size || 10;
    //     const isBlocked: boolean | null = input?.isBlocked ?? null;

    //     let projection: attributeService.IAttributeProjection = { _id: 1 };

    //     const selectedFields = info?.fieldNodes[0]?.selectionSet?.selections || [];
    //     for (const selection of selectedFields) {
    //       if (selection.kind === "Field" && selection.name.value == "records") {

    //         let selectionSet = selection.selectionSet || { selections: [] };
    //         for (let item of selectionSet.selections) {
    //           if (item.kind === "Field") {
    //             const fieldName = item.name.value;
    //             if (["images"].includes(fieldName)) {
    //               let selectionSet = item.selectionSet || { selections: [] };
    //               for (let item2 of selectionSet.selections) {
    //                 if (item2.kind === "Field") {
    //                   const subField = item2.name.value;
    //                   const path = `${fieldName}.${subField}`;
    //                   projection[path as keyof attributeService.IAttributeProjection] = 1;
    //                 }
    //               }
    //             }
    //             else {
    //               projection[fieldName as keyof attributeService.IAttributeProjection] = 1;
    //             }
    //           }
    //         }
    //       }
    //     }


    //     const options: attributeService.IAttributeRecordsOptions = {
    //       page,
    //       size,
    //       projection,
    //       isBlocked,
    //     }

    //     // Fetch all vendors records
    //     const result = await attributeService.getAttributeRecordsWithFilters(options);
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

    // Fetch each vendor record by admin
    // async getAttributeRecordByAdmin(parent, { input }, { req }, info) {
    //   await verifyAdmin(req);

    //   try {
    //     await validateInput(validators.getVendorRecordValidator, req);

    //     const _id: Types.ObjectId = new Types.ObjectId(input._id);

    //     const result = await vendorService.getAttributeRecordByAdminWithAttributeId(_id);

    //     if (!result) {
    //       throw new GraphQLError("Record not found", {
    //         extensions: {
    //           code: "BAD_REQUEST",
    //           errors: []
    //         }
    //       });
    //     }

    //     const response = {
    //       record: {
    //         ...result,
    //         brands: (result?.brands || []).map(brandId => brandId.toString()),
    //         categories: (result?.categories || []).map(categoryId => categoryId.toString()),
    //         vendorId: result?._id?.toString(),
    //       },
    //       message: "Vendor record fetched successfully",
    //     }

    //     return response;

    //   } catch (error) {
    //     throw error;
    //   }

    // },

    // // Fetch each attribute record by admin
    // async getAttributeRecordByVendor(parent, { input }, { req }, info) {
    //   // await verifyVendor(req);

    //   try {
    //     await validateInput(validators.getVendorRecordValidator, req);

    //     const _id: Types.ObjectId = new Types.ObjectId(input._id);

    //     const result = await attributeService.getVendorRecordByVendorWithId(_id);

    //     if (!result) {
    //       throw new GraphQLError("Record not found", {
    //         extensions: {
    //           code: "BAD_REQUEST",
    //           errors: []
    //         }
    //       });
    //     }


    //     const response = {
    //       record: {
    //         ...result,
    //         brands: (result?.brands || []).map(brandId => brandId.toString()),
    //         categories: (result?.categories || []).map(categoryId => categoryId.toString()),
    //         vendorId: result?._id?.toString(),
    //       },
    //       message: "Vendor record fetched successfully",
    //     }

    //     return response;

    //   } catch (error) {
    //     throw error;
    //   }

    // },
  // },
};

