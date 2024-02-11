import { Resolvers } from "../../_generated_/resolvers-types";
import * as validators from "./vendorOutletValidator";
import { validateInput, verifyAdmin, verifyVendor } from "../../middlewares";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { Types } from "mongoose";
import { filePaths } from "../../configs";
import { spaceService, vendorService, vendorCompanyService, vendorOutletService } from "../../services";
import { createReadStream } from 'fs';

export const vendorOutletResolver: Resolvers = {

    Upload: GraphQLUpload,

    Mutation: {

        addVendorOutlet: async (parent, { input, images, fileMap }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.addVendorOutletValidatior, req);
                await verifyVendor(req);

                let vendorId: Types.ObjectId = new Types.ObjectId(input?.vendorId);
                const vendorRecord = await vendorService.getvendorRecordWithId(vendorId);

                if (!vendorRecord) {
                    throw new GraphQLError("Vendor record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                let outletName: string = input?.outletName || "";
                let country: string = input?.country || "";
                let district: string = input?.district || "";
                let village: string = input?.village || "";
                let address: string = input?.address || "";
                let contactPersonName: string = input?.contactPersonName || "";
                let contactPersonNumber: string = input?.contactPersonNumber || "";
                let contactPersonDesignation: string = input?.contactPersonDesignation || "";
                let status: string = "UNDER_VERIFICATION";

                images = images || [];
                let vendorOutetImages: vendorCompanyService.FileData[] = [];


                for (let image of images) {
                    const { createReadStream, filename, mimetype } = await image;

                    const key = spaceService.getFileKey(filePaths.vendorCompany, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    vendorOutetImages.push({
                        fileType: "PRIVATE",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    });
                }

                fileMap = fileMap || {};
                const vendorOutletRecord: vendorOutletService.IVendorOutlet = {
                    vendorId,
                    outletName,
                    country,
                    district,
                    village,
                    address,
                    contactPersonName,
                    contactPersonNumber,
                    contactPersonDesignation,
                    status,
                };

                let outletImageKeys = Object.keys(fileMap);
                outletImageKeys.forEach((imageName) => {
                    if (fileMap[imageName] != null && fileMap[imageName] >= 0) {
                        switch (imageName) {
                            case "outletLicense":
                                vendorOutletRecord.outletLicense = vendorOutetImages[fileMap[imageName]];
                                break;

                            case "interiorImage":
                                vendorOutletRecord.interiorImage = vendorOutetImages[fileMap[imageName]];
                                break;

                            case "exteriorImage":
                                vendorOutletRecord.exteriorImage = vendorOutetImages[fileMap[imageName]];
                                break;

                            default:
                        }
                    }
                });


                const result = await vendorOutletService.createVendorOutletRecord(vendorOutletRecord);
                const response = { _id: result?._id.toString() || "", message: "Vendor outlet record added successfully" };
                return response;

            } catch (error) {
                throw error;
            }
        },

        updateVendorOutlet: async (parent, { input, images, fileMap }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.updateVendorOutletValidatior, req);
                // await verifyVendor(req);

                let vendorId: Types.ObjectId = new Types.ObjectId(input?.vendorId);
                const vendorRecord = await vendorService.getvendorRecordWithId(vendorId);

                if (!vendorRecord) {
                    throw new GraphQLError("Vendor record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const outletRecord = await vendorOutletService.getVendorOutletRecordWithFilters({ vendorId: vendorId }, {}, {});

                if (!outletRecord) {
                    throw new GraphQLError("Outlet record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                // Update outlet fields
                outletRecord.outletName = input?.outletName || outletRecord.outletName;
                outletRecord.country = input?.country || outletRecord.country;
                outletRecord.district = input?.district || outletRecord.district;
                outletRecord.village = input?.village || outletRecord.village;
                outletRecord.address = input?.address || outletRecord.address;
                outletRecord.contactPersonName = input?.contactPersonName || outletRecord.contactPersonName;
                outletRecord.contactPersonNumber = input?.contactPersonNumber || outletRecord.contactPersonNumber;
                outletRecord.contactPersonDesignation = input?.contactPersonDesignation || outletRecord.contactPersonDesignation;
                outletRecord.status = "UNDER_VERIFICATION";

                images = images || [];
                let outletImages: vendorCompanyService.FileData[] = [];

                for (let image of images) {
                    const { createReadStream, filename, mimetype } = await image;

                    const key = spaceService.getFileKey(filePaths.vendorOutlet, filename, []);

                    const stream = createReadStream();
                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    outletImages.push({
                        fileType: "PRIVATE",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    });
                }

                fileMap = fileMap || {};
                let outletImageKeys = Object.keys(fileMap);

                outletImageKeys.forEach((imageName) => {
                    if (fileMap[imageName] != null && fileMap[imageName] >= 0) {
                        switch (imageName) {
                            case "outletLicense":
                                outletRecord.outletLicense = outletImages[fileMap[imageName]];
                                break;

                            case "interiorImage":
                                outletRecord.interiorImage = outletImages[fileMap[imageName]];
                                break;

                            case "exteriorImage":
                                outletRecord.exteriorImage = outletImages[fileMap[imageName]];
                                break;

                            default:
                        }
                    }
                });

                // Save the updated outlet record
                const result = await outletRecord.save();

                const response = {
                    record: result.toObject(),
                    message: "Vendor outlet record updated successfully"
                };
                return response;

            } catch (error) {
                throw error;
            }
        },

        // Vendor KYC of outlet details status updation
        vendorOutletStatusUpdation: async (parent, { input }, { req }, info) => {
            await validateInput(validators.vendorOutletStatusUpdationValidator, req);

            const _id: Types.ObjectId = new Types.ObjectId(input._id);
            const vendor = await vendorOutletService.getVendorOutletRecordWithId(_id);

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

            const response = {
                _id: vendor._id?.toString(),
                status: vendor.status,
                message: "Vendor kyc of outlet status updated successfully"
            }

            return response;
        },


        deleteVendorOutlet: async (parent, { input }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.vendorOutletDeleteValidator, req);
                await verifyVendor(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);
                const result = await vendorOutletService.deleteOutletRecord(_id);

                if (!result) {
                    throw new GraphQLError("Outlet record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = {
                    _id: result?._id?.toString() || "", message: "Outlet record deleted successfully",
                };
                return response;
            } catch (error) {
                throw error;
            }
        },
    },

    Query: {
        // Fetch all vendor outlet
        async getAllVendorOutletRecordsByAdmin(parent, { input }, { req }, info) {
            try {
                // await verifyAdmin(req);
                await validateInput(validators.getAllVendorOutletValidator, req);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                const status: string = input?.status || '';

                const options = {
                    page,
                    size,
                    status,
                }

                const result = await vendorOutletService.getVendorOutletRecordsWithFilters(options);
                const response = {
                    records: result.records as vendorOutletService.IVendorOutletWithKycData[],
                    maxRecords: result.maxRecords,
                    message: "KYC all records fetched successfully"
                };
                return response;
            } catch (error) {
                throw error;
            }
        },

        // Fetch vendor outlet record by id
        async getVendorOutletRecordByAdmin(parent, { input }, { req }, info) {
            try {
                // Validate Input
                await verifyAdmin(req);
                await validateInput(validators.vendorOutletQueryValidator, req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);

                const result = await vendorOutletService.getVendorOutletRecordWithId(_id);

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
