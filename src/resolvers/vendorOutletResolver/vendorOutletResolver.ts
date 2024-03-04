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

                await verifyVendor(req);

                // Validate Input
                await validateInput(validators.addVendorOutletValidatior, req);

                const vendorId = req.authAccount._id;

                let vendorOutletRecord = await vendorOutletService.getVendorOutletRecordWithFilters({ vendorId: vendorId }, {}, {});

                if (!vendorOutletRecord) {
                    vendorOutletRecord = await vendorOutletService.createVendorOutletRecord({ vendorId: vendorId });
                }
                else if (vendorOutletRecord && vendorOutletRecord.status !== "PENDING") {
                    throw new GraphQLError("Outlet details cant be updated", {
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

                if (images.length !== 3) {
                    throw new GraphQLError("Documents not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                for (let image of images) {
                    const { createReadStream, filename, mimetype } = await image;

                    const key = spaceService.getFileKey(filePaths.vendorCompany, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.privateFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    vendorOutetImages.push({
                        fileType: "PRIVATE",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    });
                }

                fileMap = fileMap || {};

                vendorOutletRecord.outletName = outletName;
                vendorOutletRecord.country = country;
                vendorOutletRecord.district = district;
                vendorOutletRecord.village = village;
                vendorOutletRecord.address = address;
                vendorOutletRecord.contactPersonName = contactPersonName;
                vendorOutletRecord.contactPersonNumber = contactPersonNumber;
                vendorOutletRecord.contactPersonDesignation = contactPersonDesignation;
                vendorOutletRecord.status = status;

                let outletImageKeys = Object.keys(fileMap);
                outletImageKeys.forEach((imageName) => {
                    if (fileMap[imageName] != null && fileMap[imageName] >= 0) {
                        switch (imageName) {
                            case "outletLicense":
                                vendorOutletRecord!.outletLicense = vendorOutetImages[fileMap[imageName]];
                                break;

                            case "interiorImage":
                                vendorOutletRecord!.interiorImage = vendorOutetImages[fileMap[imageName]];
                                break;

                            case "exteriorImage":
                                vendorOutletRecord!.exteriorImage = vendorOutetImages[fileMap[imageName]];
                                break;

                            default:
                        }
                    }
                });

                await vendorOutletRecord.save();
                const response = { _id: vendorOutletRecord._id?.toString() || "", message: "Vendor outlet record added successfully" };
                return response;

            } catch (error) {
                throw error;
            }
        },

        updateVendorOutlet: async (parent, { input, images, fileMap }, { req }, info) => {
            try {
                await verifyVendor(req);
                // Validate Input
                await validateInput(validators.updateVendorOutletValidatior, req);

                const vendorId = req.authAccount._id;

                const outletRecord = await vendorOutletService.getVendorOutletRecordWithFilters({ vendorId: vendorId }, {}, {});

                if (!outletRecord) {
                    throw new GraphQLError("Outlet record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                if (!["PENDING", "REJECTED"].includes(outletRecord.status || "")) {
                    throw new GraphQLError("Company details cant be updated", {
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
                    const file = await spaceService.privateFileUpload(key, mimetype, { mimetype: mimetype }, stream);

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
                await outletRecord.save();

                const response = {
                    message: "Vendor outlet record updated successfully"
                };
                return response;

            } catch (error) {
                throw error;
            }
        },

        updateVendorOutletByAdmin: async (parent, { input, interiorImage, exteriorImage, outletLicense }, { req }, info) => {
            await validateInput(validators.updateVendorOutletByAdminValidatior, req);
            await verifyAdmin(req);

            let { _id, outletName, country, district, village, address, contactPersonName, contactPersonNumber, contactPersonDesignation, status, remarks } = input;

            let vendorOutletRecord = await vendorOutletService.getVendorOutletRecordWithFilters({ _id: _id }, {}, {});

            if (!vendorOutletRecord) {
                throw new GraphQLError("Vendor outlet record not found", {
                    extensions: {
                        code: "BAD_REQUEST",
                        errors: [],
                    },
                });
            }

            if (outletName) {
                vendorOutletRecord.outletName = outletName;
            }
            if (country) {
                vendorOutletRecord.country = country;
            }
            if (district) {
                vendorOutletRecord.district = district;
            }
            if (village) {
                vendorOutletRecord.village = village;
            }
            if (contactPersonNumber) {
                vendorOutletRecord.contactPersonNumber = contactPersonNumber;
            }
            if (address) {
                vendorOutletRecord.address = address;
            }
            if (contactPersonName) {
                vendorOutletRecord.contactPersonName = contactPersonName;
            }
            if (contactPersonDesignation) {
                vendorOutletRecord.contactPersonDesignation = contactPersonDesignation;
            }
            if (status) {
                vendorOutletRecord.status = status;
                vendorOutletRecord.remarks = remarks || [];

            }

            if (interiorImage) {
                const { createReadStream, filename, mimetype } = await interiorImage;

                const key = spaceService.getFileKey(filePaths.vendorCompany, filename, []);

                const stream = createReadStream();
                const file = await spaceService.privateFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                vendorOutletRecord.interiorImage = {
                    fileType: "PRIVATE",
                    fileURL: file.location,
                    mimeType: mimetype,
                    originalName: filename
                };
            }

            if (exteriorImage) {
                const { createReadStream, filename, mimetype } = await exteriorImage;

                const key = spaceService.getFileKey(filePaths.vendorCompany, filename, []);

                const stream = createReadStream();
                const file = await spaceService.privateFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                vendorOutletRecord.exteriorImage = {
                    fileType: "PRIVATE",
                    fileURL: file.location,
                    mimeType: mimetype,
                    originalName: filename
                };
            }

            if (outletLicense) {
                const { createReadStream, filename, mimetype } = await outletLicense;

                const key = spaceService.getFileKey(filePaths.vendorCompany, filename, []);

                const stream = createReadStream();
                const file = await spaceService.privateFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                vendorOutletRecord.outletLicense = {
                    fileType: "PRIVATE",
                    fileURL: file.location,
                    mimeType: mimetype,
                    originalName: filename
                };
            }

            await vendorOutletRecord.save();

            const response = {
                message: "Vendor company record updated successfully"
            };
            return response;

        }




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
                    throw new GraphQLError("vendor outlet record not found", {
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
        async getVendorOutletRecord(parent, { }, { req }, info) {
            try {
                // Validate Input
                await verifyVendor(req);

                const _id: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

                const result = await vendorOutletService.getVendorOutletRecordWithId(_id);

                if (!result) {
                    throw new GraphQLError("vendor outlet record not found", {
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
                    message: "Vendor outlet record fetched successfully",
                };

                return response;

            } catch (error) {
                throw error;
            }
        },
    }
};
