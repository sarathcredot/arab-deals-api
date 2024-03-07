import { Resolvers } from "../../_generated_/resolvers-types";
import { cmsService, spaceService } from "../../services";
import * as validators from "./cmsValidator";
import { validateInput, verifyAdmin } from "../../middlewares";
import { createWriteStream } from 'fs';
import path from "path";
import { GraphQLError } from "graphql";
import { Types } from "mongoose";
import { filePaths } from "../../configs";



export const cmsResolver: Resolvers = {

    Mutation: {
        addCmsSection: async (parent, { input, images }, { req }, info) => {
            //Validate Input
            await validateInput(validators.cmsCreateValidator, req);
            await verifyAdmin(req);

            images = images || [];

            let cmsImages = [];

            for (let image of images) {
                const { createReadStream, filename, mimetype, encoding } = await image;

                const key = spaceService.getFileKey(filePaths.cms, filename, []);

                const stream = createReadStream();

                const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);


                cmsImages.push({
                    fileType: "PUBLIC",
                    fileURL: file.location,
                    mimeType: mimetype,
                    originalName: filename
                });
            }

            const pageName = input.pageName;
            const sectionsCount = await cmsService.getLatestSection(pageName);
            // Generate a unique sectionName
            const sectionName = `SECTION-${sectionsCount + 1}`;

            const cmsRecord: cmsService.ICmsRecord = {
                pageName: input?.pageName || "",
                sectionName: sectionName,
                // title: input?.title || "",
                // subTitle: input?.subTitle || "",
                // description: (input.description || []).filter(Boolean) as [],
                buttons: (input.buttons || []).filter(Boolean) as [],
                images: cmsImages || [],
            };

            const result = await cmsService.createCmsRecord(cmsRecord);
            const response = { _id: result?._id.toString() || "", message: "CMS added successfully" };
            return response;

        },

        updateCmsRecord: async (parent, { input, images }, { req }, info) => {
            try {
                await validateInput(validators.cmsUpdateValidator, req);
                await verifyAdmin(req);

                images = images || [];

                const _id: string = input._id.toString();

                const existingCmsRecord = await cmsService.getCmsRecordWithId(_id);
                if (!existingCmsRecord) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }



                let cmsImages = [];

                for (let image of images) {
                    const { createReadStream, filename, mimetype, encoding } = await image;

                    const key = spaceService.getFileKey(filePaths.cms, filename, []);

                    console.log("key: ", key)

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    cmsImages.push({
                        fileType: "PUBLIC",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    });
                }


                let filter = { _id };
                let update: cmsService.ICmsRecord = {};

                if (cmsImages.length > 0) {
                    update.images = cmsImages;
                }

                if (input.buttons != null) {
                    update.buttons = (input.buttons || []).filter(Boolean) as [];
                }

                let updateQuery = { $set: update };

                const result = await cmsService.findOneAndUpdateCms(filter, updateQuery, { lean: true });

                if (!result) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = {
                    _id: result?._id?.toString() || "", message: "CMS record updated created successfully",
                };
                return response;
            } catch (error) {
                throw error;
            }
        },

        // deleteCmsRecord: async (parent, { input }, { req }, info) => {
        //     try {
        //         await validateInput(validators.cmsDeleteValidator, req);
        //         await verifyAdmin(req);

        //         const _id: Types.ObjectId = new Types.ObjectId(input._id);
        //         const filter = { _id };
        //         const result = await cmsService.deleteCmsRecord(filter);

        //         if (!result) {
        //             throw new GraphQLError("Record not found", {
        //                 extensions: {
        //                     code: "BAD_REQUEST",
        //                     errors: [],
        //                 },
        //             });
        //         }

        //         const response = {
        //             _id: result?._id?.toString() || "", message: "CMS record deleted successfully",
        //         };
        //         return response;
        //     } catch (error) {
        //         throw error;
        //     }
        // },
    },

    Query: {
        // Fetch all CMS records
        async getAllCmsRecords(parent, { input }, { req }, info) {
            try {
                await validateInput(validators.getAllCmsRecordsValidator, req);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                const pageName: string = input?.pageName || "";
                let projection: cmsService.ICmsRecordsProjection = { _id: 1 };

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
                                            projection[path as keyof cmsService.ICmsRecordsProjection] = 1;
                                        }
                                    }
                                }
                                else {
                                    projection[fieldName as keyof cmsService.ICmsRecordsProjection] = 1;
                                }
                            }
                        }
                    }
                }


                const options: cmsService.ICmsRecordsOptions = {
                    page,
                    size,
                    projection,
                    pageName
                }

                // Fetch all CMS records
                const result = await cmsService.getCmsRecordsWithFilters(options);
                const response = {
                    records: result.records,
                    maxRecords: result.maxRecords,
                    message: "CMS records fetched successfully",
                };
                return response;
            } catch (error) {
                throw error;
            }
        },

        // Fetch each section by section name

        async getCmsRecord(parent, { input }, { req }, info) {

            try {

                //Validate Input
                await validateInput(validators.cmsSectionQueryValidator, req);

                const sectionName: string = input?.sectionName;
                const pageName: string = input.pageName;

                const result = await cmsService.getCmsRecordWithSectionName(sectionName, pageName);

                if (!result) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const record: cmsService.ICmsRecord = result;


                const response = {
                    record: record,
                    message: "CMS record fetched successfully",
                }



                return response;

            } catch (error) {
                throw error;
            }

        },

        // Fetch all CMS records for admin
        async getAllCmsRecordsByAdmin(parent, { input }, { req }, info) {
            try {
                await validateInput(validators.getAllCmsRecordsValidator, req);
                await verifyAdmin(req);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                let projection: cmsService.ICmsRecordsProjection = { _id: 1 };

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
                                            projection[path as keyof cmsService.ICmsRecordsProjection] = 1;
                                        }
                                    }
                                }
                                else {
                                    projection[fieldName as keyof cmsService.ICmsRecordsProjection] = 1;
                                }
                            }
                        }
                    }
                }


                const options: cmsService.ICmsRecordsOptions = {
                    page,
                    size,
                    projection,
                }

                // Fetch all CMS records
                const result = await cmsService.getAllCmsRecordsWithFilters(options);
                const response = {
                    records: result.records,
                    maxRecords: result.maxRecords,
                    message: "CMS records fetched successfully",
                };
                return response;
            } catch (error) {
                throw error;
            }
        },

        // Fetch each record by id for admin

        async getCmsRecordByAdmin(parent, { input }, { req }, info) {

            try {

                //Validate Input
                await validateInput(validators.cmsRecordByAdminQueryValidator, req);
                await verifyAdmin(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);

                const result = await cmsService.getCmsRecordByAdminWithId(_id);

                if (!result) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const record: cmsService.ICmsRecord = result;


                const response = {
                    record: record,
                    message: "CMS record fetched successfully"
                }



                return response;

            } catch (error) {
                throw error;
            }

        },


    }
}