import { Resolvers } from "../../_generated_/resolvers-types";
import * as validators from "./vendorOutletValidator";
import { validateInput, verifyAdmin } from "../../middlewares";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { Types } from "mongoose";
import { filePaths } from "../../configs";
import { spaceService, brandService, vendorService, vendorCompanyService, vendorOutletService } from "../../services";
import { createReadStream } from 'fs';

export const vendorOutletResolver: Resolvers = {

    Upload: GraphQLUpload,

    Mutation: {

        addVendorOutlet: async (parent, { input, images, fileMap }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.addVendorOutletValidatior, req);
                // await verifyAdmin(req);
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

                    const key = spaceService.getFileKey(filePaths.vendorOutlet, filename, []);

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

        // updateBrand: async (parent, { input, image }, { req }, info) => {
        //     try {
        //         // Validate Input
        //         await validateInput(validators.brandUpdateValidator, req);
        //         await verifyAdmin(req);

        //         const _id: Types.ObjectId = new Types.ObjectId(input._id);

        //         const brandRecord = await brandService.getBrandWithId(_id);
        //         if (!brandRecord) {
        //             throw new GraphQLError("Brand record not found", {
        //                 extensions: {
        //                     code: "BAD_REQUEST",
        //                     errors: [],
        //                 },
        //             });
        //         }

        //         let brandLogo;

        //         if (image) {
        //             const { createReadStream, filename, mimetype } = await image;

        //             const key = spaceService.getFileKey(filePaths.brand, filename, []);

        //             const stream = createReadStream();

        //             const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

        //             brandLogo = {
        //                 fileType: "PUBLIC",
        //                 fileURL: file.location,
        //                 mimeType: mimetype,
        //                 originalName: filename
        //             }
        //         }


        //         if (input.brandName) {
        //             brandRecord.brandName = input?.brandName;
        //         }

        //         if (input.isBlocked) {
        //             brandRecord.isBlocked = input?.isBlocked;
        //         }

        //         if (brandLogo) {
        //             brandRecord.logo = brandLogo;
        //         }

        //         const result = await brandRecord.save();

        //         const response = {
        //             _id: result?._id?.toString() || "", message: "Brand updated successfully",
        //         };
        //         return response;
        //     } catch (error) {
        //         throw error;
        //     }
        // },

        // deleteBrand: async (parent, { input }, { req }, info) => {
        //     try {
        //         // Validate Input
        //         await validateInput(validators.brandDeleteValidator, req);
        //         await verifyAdmin(req);

        //         const _id: Types.ObjectId = new Types.ObjectId(input._id);
        //         const result = await brandService.deleteBrandRecord(_id);

        //         if (!result) {
        //             throw new GraphQLError("Brand not found", {
        //                 extensions: {
        //                     code: "BAD_REQUEST",
        //                     errors: [],
        //                 },
        //             });
        //         }

        //         const response = {
        //             _id: result?._id?.toString() || "", message: "Brand deleted successfully",
        //         };
        //         return response;
        //     } catch (error) {
        //         throw error;
        //     }
        // },
    },

    Query: {
        // Fetch all brands
        // async getAllVendorCompanyRecordsByAdmin(parent, { input }, { req }, info) {
        //     try {
        //         // Validate Input
        //         await validateInput(validators.getAllBrandsValidator, req);
        //         await verifyAdmin(req);

        //         const page: number = input?.page || 0;
        //         const size: number = input?.size || 10;
        //         let projection: vendorCompanyService.IVendorCompanyRecordsProjection = { _id: 1 };

        //         // const selectedFields = info?.fieldNodes[0]?.selectionSet?.selections || [];
        //         // for (const selection of selectedFields) {
        //         //     if (selection.kind === "Field" && selection.name.value == "records") {

        //         //         let selectionSet = selection.selectionSet || { selections: [] };
        //         //         for (let item of selectionSet.selections) {
        //         //             if (item.kind === "Field") {
        //         //                 const fieldName = item.name.value;
        //         //                 if (["logo"].includes(fieldName)) {
        //         //                     let selectionSet = item.selectionSet || { selections: [] };
        //         //                     for (let item2 of selectionSet.selections) {
        //         //                         if (item2.kind === "Field") {
        //         //                             const subField = item2.name.value;
        //         //                             const path = `${fieldName}.${subField}`;
        //         //                             projection[path as keyof vendorCompanyService.IVendorCompanyRecordsProjection ] = 1;
        //         //                         }
        //         //                     }
        //         //                 }
        //         //                 else {
        //         //                     projection[fieldName as keyof vendorCompanyService.IVendorCompanyRecordsProjection ] = 1;
        //         //                 }
        //         //             }
        //         //         }
        //         //     }
        //         // }


        //         const options: brandService.IBrandRecordsOptions = {
        //             page,
        //             size,
        //             projection,
        //         }

        //         const result = await brandService.getBrandRecordsWithFilters(options);
        //         const response = {
        //             records: result.records,
        //             maxRecords: result.maxRecords,
        //             message: "Brands fetched successfully",
        //         };
        //         return response;
        //     } catch (error) {
        //         throw error;
        //     }
        // },

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
