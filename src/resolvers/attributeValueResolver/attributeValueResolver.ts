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

    // Attribute values edit from admin side
    editAttributeValue: async (parent, { input }, { req }, info) => {
      try {
        // await verifyAdmin(req);
        await validateInput(validators.EditAttributeValueValidator, req);

        const attributeValueId: Types.ObjectId = new Types.ObjectId(input.attributeValueId);

        // Find the existing attribute value by ID
        const attributeValueRecord = await attributeValueService.getAttributeValueRecordWithId(attributeValueId);

        if (!attributeValueRecord) {
          throw new GraphQLError("Attribute value not found", {
            extensions: {
              code: "NOT_FOUND",
              errors: []
            }
          });
        }

        if (input.value) {
          attributeValueRecord.value = input?.value;
        }

        if (input.isBlocked != null) {
          attributeValueRecord.isBlocked = input?.isBlocked;
        }

        if (input?.colorCode) {
          attributeValueRecord.colorCode = input?.colorCode;
        }

        if (input.priority) {
          attributeValueRecord.priority = input?.priority;
        }


        const result = await attributeValueRecord.save();
        console.log("result ", result)

        let response = {
          _id: result._id!.toString(),
          attributeId: result.attributeId!.toString(),
          value: result.value,
          colorCode: result.colorCode,
          priority: result.priority,
          isBlocked: result.isBlocked,
          message: "Attribute value edited successfully",
        };

        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

  },
};

