import { Resolvers } from "../../_generated_/resolvers-types";
import * as validators from "./vendorCompanyValidator";
import { validateInput, verifyAdmin, verifyVendor } from "../../middlewares";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { Types } from "mongoose";
import { filePaths } from "../../configs";
import { spaceService, vendorService, vendorCompanyService } from "../../services";

export const vendorCompanyResolver: Resolvers = {

    Upload: GraphQLUpload,

    Mutation: {

        addVendorCompany: async (parent, { input, images, fileMap }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.addVendorCompanyValidator, req);
                await verifyVendor(req);

                let vendorId: Types.ObjectId = new Types.ObjectId(input?.vendorId);
                const vendorRecord = await vendorService.getvendorRecordWithId(vendorId);
                console.log(vendorRecord)

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
                let status: string = "UNDER_VERIFICATION";

                images = images || [];
                let vendorCompanyImages: vendorCompanyService.FileData[] = [];


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

                fileMap = fileMap || {};
                const vendorCompanyRecord: vendorCompanyService.IVendorCompany = {
                    vendorId,
                    companyName,
                    companyType,
                    crNumber,
                    status,
                };

                let vendorCompanyImagesKeys = Object.keys(fileMap);
                vendorCompanyImagesKeys.forEach((imageName) => {
                    if (fileMap[imageName] != null && fileMap[imageName] >= 0) {
                        switch (imageName) {
                            case "crLicense":
                                vendorCompanyRecord.crLicense = vendorCompanyImages[fileMap[imageName]];
                                break;

                            case "cooCertificate":
                                vendorCompanyRecord.cooCertificate = vendorCompanyImages[fileMap[imageName]];
                                break;

                            default:
                        }
                    }
                });


                const result = await vendorCompanyService.createVendorCompanyRecord(vendorCompanyRecord);
                const response = { _id: result?._id.toString() || "", message: "Vendor company record added successfully" };
                return response;

            } catch (error) {
                throw error;
            }
        },

        updateVendorCompany: async (parent, { input, images, fileMap }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.editVendorCompanyValidator, req);
                await verifyVendor(req);

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

                let vendorCompanyRecord = await vendorCompanyService.getVendorCompanyRecordWithFilters({ vendorId: vendorId }, {}, {});

                if (!vendorCompanyRecord) {
                    throw new GraphQLError("Vendor company record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                images = images || [];
                let vendorCompanyImages: vendorCompanyService.FileData[] = [];

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

                fileMap = fileMap || {};

                if (input.companyName) {
                    vendorCompanyRecord.companyName = input?.companyName;
                }

                if (input.companyType) {
                    vendorCompanyRecord.companyType = input?.companyType;
                }

                if (input.crNumber) {
                    vendorCompanyRecord.crNumber = input?.crNumber;
                }

                vendorCompanyRecord.status = "UNDER_VERIFICATION";

                let vendorCompanyImagesKeys = Object.keys(fileMap);
                vendorCompanyImagesKeys.forEach((imageName) => {
                    if (vendorCompanyRecord && fileMap[imageName] != null && fileMap[imageName] >= 0) {
                        switch (imageName) {
                            case "crLicense":
                                vendorCompanyRecord.crLicense = vendorCompanyImages[fileMap[imageName]];
                                break;

                            case "cooCertificate":
                                vendorCompanyRecord.cooCertificate = vendorCompanyImages[fileMap[imageName]];
                                break;

                            default:
                        }
                    }
                });

                const result = await vendorCompanyRecord.save();

                const response = {
                    record: result.toObject(),
                    message: "Vendor company record updated successfully"
                };
                return response;

            } catch (error) {
                throw error;
            }
        },

        // Vendor KYC of company details status updation
        vendorCompanyStatusUpdation: async (parent, { input }, { req }, info) => {
            // await verifyAdmin(req);
            await validateInput(validators.vendorCompanyStatusUpdationValidator, req);

            const _id: Types.ObjectId = new Types.ObjectId(input._id);
            const vendor = await vendorCompanyService.getVendorCompanyRecordWithId(_id);

            if (!vendor) {
                throw new GraphQLError("Record not found", {
                    extensions: {
                        code: "BAD_REQUEST",
                        errors: []
                    }
                });
            }

            if (input.status !== null) {
                vendor.status = input?.status;
            }

            if (input.remarks !== null) {
                vendor.remarks = (input.remarks || []).filter(Boolean) as [];
            }


            await vendor.save();

            console.log(vendor)

            const response = {
                _id: vendor._id?.toString(),
                message: "Vendor kyc of company status updated successfully"
            }

            return response;
        },

        deleteVendorOutlet: async (parent, { input }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.vendorCompanyDeleteValidator, req);
                await verifyVendor(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);
                const result = await vendorCompanyService.deleteVendorCompanyRecord(_id);

                if (!result) {
                    throw new GraphQLError("Company record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = {
                    _id: result?._id?.toString() || "", message: "Company record deleted successfully",
                };
                return response;
            } catch (error) {
                throw error;
            }
        },
    },

    Query: {
        // Fetch all vendor company
        async getAllVendorCompanyRecordsByAdmin(parent, { input }, { req }, info) {
            try {
                await validateInput(validators.getAllVendorCompanyValidator, req);
                await verifyAdmin(req);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                const status: string = input?.status || '';

                const options = {
                    page,
                    size,
                    status,
                }

                const result = await vendorCompanyService.getVendorCompanyRecordsWithFilters(options);
                const response = {
                    records: result.records as vendorCompanyService.IVendorCompanyWithKycData[],
                    maxRecords: result.maxRecords,
                    message: "KYC all records fetched successfully"
                };
                return response;
            } catch (error) {
                throw error;
            }
        },

        // Fetch vendor company record by id
        async getVendorCompanyRecordByAdmin(parent, { input }, { req }, info) {
            try {
                // Validate Input
                await validateInput(validators.vendorCompanyQueryValidator, req);
                await verifyAdmin(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);

                const result = await vendorCompanyService.getVendorCompanyRecordWithId(_id);

                if (!result) {
                    throw new GraphQLError("vendor company record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const response = {
                    record: {
                        ...result.toObject(),  // Convert Mongoose document to plain JavaScript object
                        vendorId: result?.vendorId?.toString()  // Convert ObjectId to string
                    },
                    message: "Vendor company record fetched successfully",
                };

                return response;

            } catch (error) {
                throw error;
            }
        },
    }
};
