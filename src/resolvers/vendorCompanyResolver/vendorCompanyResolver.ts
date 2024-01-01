import { Resolvers } from "../../_generated_/resolvers-types";
import * as validators from "./vendorCompanyValidator";
import { validateInput, verifyAdmin } from "../../middlewares";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { Types } from "mongoose";
import { filePaths } from "../../configs";
import { spaceService, brandService, vendorCompanyService } from "../../services";
import { createReadStream } from 'fs';

export const vendorCompanyResolver: Resolvers = {

    Upload: GraphQLUpload,

    Mutation: {
        addVendorCompany: async (parent, { input,  images, fileMap }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.brandCreateValidator, req);
                // await verifyAdmin(req);
                let vendorId: Types.ObjectId = new Types.ObjectId(input.vendorId);
                const vendorRecord = await vendorCompanyService.getBrandWithId(_id);

                if (!vendorRecord) {
                    throw new GraphQLError("Vendor record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                let companyName: string = input?.companyName || "";
                let companyType: string = input?.companyType || "";
                let crNumber: string = input?.crNumber || "";
                let status: string = input?.status || "UNDER_VERIFICATION";
                let remarks: string[] = (input.remarks || []).filter(Boolean) as []

                images = images || [];
                let vendorCompanyImages: vendorCompanyService.FileData[] =  [];


                for (let image of images) {
                    const { createReadStream, filename, mimetype } = await image;

                    const key = spaceService.getFileKey(filePaths.vendorCompany, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    vendorCompanyImages.push({
                        fileType: "PRIVATE",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                      });
                }

                const vendorCompanyRecord = {
                    vendorId,
                    companyName,
                    companyType,
                    crNumber,
                    status,
                    remarks,
                };

                const result = await brandService.createVendorCompanyRecord(vendorCompanyRecord);
                const response = { _id: result?._id.toString() || "", message: "Vendor Company Record added successfully" };
                return response;

            } catch (error) {
                throw error;
            }
        },

        updateBrand: async (parent, { input, image }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.brandUpdateValidator, req);
                await verifyAdmin(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);

                const brandRecord = await brandService.getBrandWithId(_id);
                if (!brandRecord) {
                    throw new GraphQLError("Brand record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                let brandLogo;

                if (image) {
                    const { createReadStream, filename, mimetype } = await image;

                    const key = spaceService.getFileKey(filePaths.brand, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    brandLogo = {
                        fileType: "PUBLIC",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    }
                }


                if (input.brandName) {
                    brandRecord.brandName = input?.brandName;
                }

                if (input.isBlocked) {
                    brandRecord.isBlocked = input?.isBlocked;
                }

                if (brandLogo) {
                    brandRecord.logo = brandLogo;
                }

                const result = await brandRecord.save();

                const response = {
                    _id: result?._id?.toString() || "", message: "Brand updated successfully",
                };
                return response;
            } catch (error) {
                throw error;
            }
        },

        deleteBrand: async (parent, { input }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.brandDeleteValidator, req);
                await verifyAdmin(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);
                const result = await brandService.deleteBrandRecord(_id);

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
        // Fetch all brands
        async getAllBrandRecordsByAdmin(parent, { input }, { req }, info) {
            try {
                // Validate Input
                await validateInput(validators.getAllBrandsValidator, req);
                await verifyAdmin(req);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                let projection: brandService.IBrandRecordsProjection = { _id: 1 };

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
                                            projection[path as keyof brandService.IBrandRecordsProjection] = 1;
                                        }
                                    }
                                }
                                else {
                                    projection[fieldName as keyof brandService.IBrandRecordsProjection] = 1;
                                }
                            }
                        }
                    }
                }


                const options: brandService.IBrandRecordsOptions = {
                    page,
                    size,
                    projection,
                }

                const result = await brandService.getBrandRecordsWithFilters(options);
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

        // Fetch brand by id
        async getBrandRecordByAdmin(parent, { input }, { req }, info) {
            try {
                // Validate Input
                await validateInput(validators.brandQueryValidator, req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);

                const result = await brandService.getBrandWithId(_id);

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
