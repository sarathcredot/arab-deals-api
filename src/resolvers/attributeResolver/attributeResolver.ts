import { attributeService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./attributeValidator";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";

export const attributeResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {

    // Attribute creation from admin side
    createAttribute: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);
      await validateInput(validators.CreateAttributeValidator, req);

      let attributeType: string = input.attributeType;
      let name: string = input.name;
      let description: string = input.description;
      let isBlocked: boolean = input.isBlocked || false;


      let newAttributeData: attributeService.IAttribute = {
        attributeType,
        name,
        description,
        isBlocked,
      };

      const result = await attributeService.createAttribute(newAttributeData);

      if (!result) {
        throw new GraphQLError("Unable to create attribute", {
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
    editAttribute: async (parent, { input }, { req }, info) => {
      try {
        // await verifyAdmin(req);
        await validateInput(validators.EditAttributeValidator, req);

        const attributeId: Types.ObjectId = new Types.ObjectId(input.attributeId);

        // Find the existing attribute by ID
        const attributeRecord = await attributeService.getvendorRecordWithId(attributeId);

        if (!attributeRecord) {
          throw new GraphQLError("Attribute not found", {
            extensions: {
              code: "NOT_FOUND",
              errors: []
            }
          });
        }

        if (input.attributeType) {
          attributeRecord.attributeType = input?.attributeType;
        }

        if (input.isBlocked != null) {
          attributeRecord.isBlocked = input?.isBlocked;
        }

        if (input?.name) {
          attributeRecord.name = input?.name;
        }

        if (input.description) {
          attributeRecord.description = input?.description;
        }


        const result = await attributeRecord.save();

        let response = {
          _id: result._id!.toString(),
          message: "Attribute edited successfully",
        };

        return response;
      }catch (error) {
        console.error(error);
        throw error;
      }
    },

  },

  Query: {

    // Fetch all attribute records by admin
    async getAllAttributeRecordsByAdmin(parent, { input }, { req }, info) {
      try {
        await validateInput(validators.getAllAttributeRecordsValidator, req);
        // await verifyAdmin(req);

        const page: number = input?.page || 0;
        const size: number = input?.size || 10;
        const isBlocked: boolean | null = input?.isBlocked ?? null;

        let projection: attributeService.IAttributeProjection = { _id: 1 };

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
                                    projection[path as keyof attributeService.IAttributeProjection] = 1;
                                }
                            }
                        }
                        else {
                            projection[fieldName as keyof attributeService.IAttributeProjection] = 1;
                        }
                    }
                }
            }
        }


        const options: attributeService.IAttributeRecordsOptions = {
          page,
          size,
          projection,
          isBlocked,
        }

        // Fetch all vendors records
        const result = await attributeService.getAttributeRecordsWithFilters(options);
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

    // Fetch each attribute record by admin
    async getAttributeRecordByAdmin(parent, { input }, { req }, info) {
      // await verifyAdmin(req);

      try {
        await validateInput(validators.getAttributeRecordValidator, req);

        const attributeId: Types.ObjectId = new Types.ObjectId(input.attributeId);

        const options = { attributeId };

        const result = await attributeService.getAttributeRecordByAdminWithAttributeId(options);

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
            _id: result?.record?._id?.toString(), 
            attributeType: result?.record?.attributeType,
            name: result?.record?.name,
            description: result?.record?.description,
            attributeValues: result?.record?.attributeValues || [],
            isBlocked: result?.record?.isBlocked,
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

