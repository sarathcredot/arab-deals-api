import { Resolvers } from "../../_generated_/resolvers-types";
import * as validators from "./countryValidator";
import { validateInput, verifyAdmin, verifyVendor } from "../../middlewares";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { Types } from "mongoose";
import { filePaths } from "../../configs";
import { spaceService, countryService, categoryService } from "../../services";
import { createReadStream } from 'fs';

export const countryResolver: Resolvers = {

    Upload: GraphQLUpload,

    Mutation: {
        addCountry: async (parent, { input, image }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.countryCreateValidator, req);
                await verifyAdmin(req);

                let countryLogo;

                if (image) {
                    const { createReadStream, filename, mimetype } = await image;

                    const key = spaceService.getFileKey(filePaths.countries, filename, []);

                    console.log("key: ", key);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    countryLogo = {
                        fileType: "PUBLIC",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    }
                }

                const countryRecord = {
                    name: input?.name || "",
                    countryCode: input?.countryCode || "",
                    isBlocked: input?.isBlocked || false,
                    countryLogo: countryLogo,
                };

                const result = await countryService.createCountryRecord(countryRecord);
                const response = { _id: result?._id.toString() || "", message: "Brand added successfully" };
                return response;

            } catch (error) {
                throw error;
            }
        },

        updateCountry: async (parent, { input, image }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.countryUpdateValidator, req);
                await verifyAdmin(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);

                const countryRecord = await countryService.getCountryWithId(_id);
                if (!countryRecord) {
                    throw new GraphQLError("Country record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                let countryLogo;

                if (image) {
                    const { createReadStream, filename, mimetype } = await image;

                    const key = spaceService.getFileKey(filePaths.countries, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    countryLogo = {
                        fileType: "PUBLIC",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    }
                }


                if (input.name) {
                    countryRecord.name = input?.name;
                }

                if (input.isBlocked) {
                    countryRecord.isBlocked = input?.isBlocked;
                }

                if (countryLogo) {
                    countryRecord.countryLogo = countryLogo;
                }

                if (input.isBlocked != null) {
                    countryRecord.isBlocked = input?.isBlocked;
                }

                if (input.countryCode) {
                    countryRecord.countryCode = input?.countryCode;
                }

                const result = await countryRecord.save();

                const response = {
                    _id: result?._id?.toString() || "", message: "country record updated successfully",
                };
                return response;
            } catch (error) {
                throw error;
            }
        },

        deleteCountry: async (parent, { input }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.countryDeleteValidator, req);
                await verifyAdmin(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);
                const result = await countryService.deleteCountryRecord(_id);

                if (!result) {
                    throw new GraphQLError("Brand not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = {
                    _id: result?._id?.toString() || "", message: "Brand deleted successfully",
                };
                return response;
            } catch (error) {
                throw error;
            }
        },
    },

    Query: {
        // Fetch all countries
        async getAllCountryRecordsByAdmin(parent, { input }, { req }, info) {
            try {
                // Validate Input
                await validateInput(validators.getAllCountriesValidator, req);
                await verifyAdmin(req);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                const isBlocked: boolean = input?.isBlocked || false;

                let projection: countryService.ICountryRecordsProjection = { _id: 1 };

                const selectedFields = info?.fieldNodes[0]?.selectionSet?.selections || [];
                for (const selection of selectedFields) {
                    if (selection.kind === "Field" && selection.name.value == "records") {

                        let selectionSet = selection.selectionSet || { selections: [] };
                        for (let item of selectionSet.selections) {
                            if (item.kind === "Field") {
                                const fieldName = item.name.value;
                                if (["logo"].includes(fieldName)) {
                                    let selectionSet = item.selectionSet || { selections: [] };
                                    for (let item2 of selectionSet.selections) {
                                        if (item2.kind === "Field") {
                                            const subField = item2.name.value;
                                            const path = `${fieldName}.${subField}`;
                                            projection[path as keyof countryService.ICountryRecordsProjection] = 1;
                                        }
                                    }
                                }
                                else {
                                    projection[fieldName as keyof countryService.ICountryRecordsProjection] = 1;
                                }
                            }
                        }
                    }
                }


                const options: countryService.ICountryRecordsOptions = {
                    page,
                    size,
                    isBlocked,
                    projection,
                }

                const result = await countryService.getCountryRecordsWithFilters(options);
                const response = {
                    records: result.records,
                    maxRecords: result.maxRecords,
                    message: "Brands fetched successfully",
                };
                return response;
            } catch (error) {
                throw error;
            }
        },
        
        // Fetch country by id
        async getCountryRecordByAdmin(parent, { input }, { req }, info) {
            try {
                await verifyAdmin(req);
                // Validate Input
                await validateInput(validators.countryQueryValidator, req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);

                const result = await countryService.getCountryWithId(_id);

                if (!result) {
                    throw new GraphQLError("Brand not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const response = {
                    record: result,
                    message: "Brand fetched successfully",
                };

                return response;

            } catch (error) {
                throw error;
            }
        },

    }
};
