import { Resolvers } from "../../_generated_/resolvers-types";
import { sizeService, categoryService } from "../../services";
import * as validators from "./sizeValidator";
import { validateInput, verifyAdmin } from "../../middlewares";
import { GraphQLUpload } from "graphql-upload-ts";
import { ObjectId, QueryOptions, Types } from "mongoose";
import { GraphQLError } from "graphql";




export const sizeResolver: Resolvers = {

    Mutation: {
        addSize: async (parent, { input }, { req }, info) => {
            await verifyAdmin(req);

            //Validate Input
            await validateInput(validators.sizeMutationValidator, req);

            const categoryId: Types.ObjectId = new Types.ObjectId(input.categoryId);
            const size: string = input?.size || "";
            const isBlocked: boolean = input?.isBlocked || false;



            const isSizeExistsInCategory = await sizeService.getSizeWithFilter(
                { categoryId: categoryId, size: { $regex: new RegExp(`^${size}$`, 'i') } },
                { size: 1 },
                { lean: true }
            )

            if (isSizeExistsInCategory) {
                throw new GraphQLError("Already have this size in this category", {
                    extensions: {
                        code: "BAD_REQUEST",
                        errors: []
                    }
                });
            }

            let parentPath = '';
            if (categoryId) {
                const parentRecord = await categoryService.findCategoryWithFilters({ _id: categoryId }, { _id: 1, path: 1 }, { lean: true });
                if (!parentRecord) {
                    throw new GraphQLError("parent not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }
                parentPath = `${parentRecord.path + parentRecord._id}#`;
            }

            let path = parentPath || "#";

            const sizeRecord: sizeService.ISizeRecord = {
                categoryId,
                size,
                isBlocked,
                categoryIdPath: path,
            };


            const result = await sizeService.createSizeRecord(sizeRecord);
            const response = { _id: result?._id.toString() || "" };
            return response;

        }
    },

    Query: {

        async getSizeRecord(parent, { input }, { req }, info) {

            try {

                //Validate Input
                await validateInput(validators.sizeQueryValidator, req);

                const colorId: Types.ObjectId = new Types.ObjectId(input._id);

                const result = await sizeService.getSizeWithId(colorId);

                if (!result) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const record: sizeService.ISizeRecord = result;


                const response = {
                    record: record
                }

                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }
        },
        async getActiveSizes(parent, { input }, { req }, info) {

            try {

                const categoryId = input?.categoryId ? new Types.ObjectId(input.categoryId).toString() : "";
                const result = await sizeService.getActiveSizes(categoryId);
                const response = {
                    records: result.length ? result : []
                }

                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        },
        async getAllSizesWithCatgeoryId(parent, { input }, { req }, info) {
            await verifyAdmin(req);

            try {

                const categoryId = input?.categoryId ? new Types.ObjectId(input.categoryId).toString() : "";
                const result = await sizeService.getAllSizes(categoryId);
                const response = {
                    records: result.length ? result : []
                }

                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        }
    }
}