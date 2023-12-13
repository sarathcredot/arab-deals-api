import { Resolvers } from "../../_generated_/resolvers-types";
import { colorService, categoryService } from "../../services";
import * as validators from "./colorValidator";
import { validateInput, verifyAdmin } from "../../middlewares";
import { GraphQLUpload } from "graphql-upload-ts";
import { ObjectId, QueryOptions, Types } from "mongoose";
import { GraphQLError } from "graphql";




export const colorResolver: Resolvers = {

    Mutation: {
        addColor: async (parent, { input }, { req }, info) => {
            await verifyAdmin(req);

            //Validate Input
            await validateInput(validators.colorMutationValidator, req);

            // Generate a unique colorName
            const categoryId: Types.ObjectId = new Types.ObjectId(input.categoryId);
            const colorName: string = input?.colorName || "";
            const colorCode: string = input?.colorCode || "";
            const isBlocked: boolean = input?.isBlocked || false;

            const existingCategoryRecord = await categoryService.findCategoryWithFilters(
                { _id: categoryId },
                { _id: 1, path: 1, categoryName: 1 },
                { lean: true }
            );

            if (!existingCategoryRecord) {
                throw new GraphQLError("Category not found", {
                    extensions: {
                        code: "BAD_REQUEST",
                        errors: [],
                    },
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

            const isColorExistsInCategory = await colorService.getColorWithFilters(
                { categoryId: categoryId, colorName: { $regex: new RegExp(`^${colorName}$`, 'i') } },
                { colorName: 1 },
                { lean: true }
            )

            if (isColorExistsInCategory) {
                throw new GraphQLError("Already have this color in this category", {
                    extensions: {
                        code: "BAD_REQUEST",
                        errors: []
                    }
                });
            }

            const colorRecord: colorService.IColorRecord = {
                categoryId,
                colorName,
                colorCode,
                isBlocked,
                categoryIdPath: path,
            };

            const result = await colorService.createColorRecord(colorRecord);
            const response = { _id: result?._id.toString() || "" };
            return response;

        },

        updateColor: async (parent, { input }, { req }, info) => {
            try {
                await validateInput(validators.colorUpdateValidator, req);
                await verifyAdmin(req);

                const colorId: Types.ObjectId = new Types.ObjectId(input._id);

                // Check if the color with the given ID exists
                const existingColor: colorService.IColorDocument | null = await colorService.getColorWithId(colorId);

                if (!existingColor) {
                    throw new GraphQLError("Color record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const categoryId = existingColor.categoryId;
                const categoryRecord = await categoryService.findCategoryWithFilters({ _id: categoryId }, {}, {});
                if (!categoryRecord) {
                    throw new GraphQLError("Category not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }


                const options: QueryOptions = { categoryId };
                options.originalColorName = existingColor.colorName;

                if (input.colorName !== null && existingColor.colorName !== input.colorName) {
                    existingColor.colorName = input.colorName;
                    options.newColorName = input.colorName;
                    await colorService.updateColoNameForProducts(options);
                }

                if (input.colorCode !== null && existingColor.colorCode !== input.colorCode) {
                    existingColor.colorCode = input.colorCode;
                }

                // if (input.isBlocked !== null && existingColor.isBlocked !== input.isBlocked) {
                //     existingColor.isBlocked = input.isBlocked;
                // }

                // Save the updated color record
                const updatedColor = await existingColor.save();

                const response = {
                    _id: updatedColor?._id?.toString() || "",
                    message: "Color updated successfully",
                };
                return response;
            } catch (error) {
                throw error;
            }
        }

    },

    Query: {
        // Fetch each section by color name

        async getColorRecord(parent, { input }, { req }, info) {

            try {

                //Validate Input
                await validateInput(validators.colorQueryValidator, req);

                const colorId: Types.ObjectId = new Types.ObjectId(input._id);

                const result = await colorService.getColorWithId(colorId);

                if (!result) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const record: colorService.IColorRecord = result;


                const response = {
                    record: record
                }



                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        },

        async getActiveColors(parent, { input }, { req }, info) {

            try {

                const categoryId = input?.categoryId ? new Types.ObjectId(input.categoryId).toString() : "";
                const result = await colorService.getActiveColors(categoryId);
                const response = {
                    records: result.length ? result : []
                }

                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        },

        async getAllColorsWithCategoryId(parent, { input }, { req }, info) {
            await verifyAdmin(req);

            try {

                const categoryId = input?.categoryId ? new Types.ObjectId(input.categoryId).toString() : "";
                const result = await colorService.getAllColors(categoryId);
                const response = {
                    records: result?.length ? result : []
                }

                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        }
    }
}