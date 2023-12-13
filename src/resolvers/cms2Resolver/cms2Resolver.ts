import { Resolvers } from "../../_generated_/resolvers-types";
import { cms2Service, spaceService } from "../../services";
import * as validators from "./cms2Validator";
import { validateInput, verifyAdmin } from "../../middlewares";
import { createWriteStream } from 'fs';
import { GraphQLUpload } from "graphql-upload-ts";
import path from "path";
import { GraphQLError } from "graphql";
import { Types } from "mongoose";
import { filePaths } from "../../configs";



export const cms2Resolver: Resolvers = {

    Upload: GraphQLUpload,
    Mutation: {
        addCms2Section: async (parent, { input, images }, { req }, info) => {

            //Validate Input
            await validateInput(validators.cmsCreateValidator, req);
            await verifyAdmin(req);

            images = images || [];

            let cms2Images: cms2Service.FileData[] = [];

            for (let image of images) {
                const { createReadStream, filename, mimetype, encoding } = await image;

                const key = spaceService.getFileKey(filePaths.cms, filename, []);

                const stream = createReadStream();

                const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                cms2Images.push({
                    fileType: "PUBLIC",
                    fileURL: file.location,
                    mimeType: mimetype,
                    originalName: filename
                });
            }


            const sectionsCount = await cms2Service.getLatestSection();
            // Generate a unique sectionName
            const sectionName = `SECTION-${sectionsCount + 1}`;

            const items: cms2Service.ICm2Item[] = input.items?.length ? input.items.map((item, index) => {
                const result: cms2Service.ICm2Item = {
                    title: item?.title || "",
                    subTitle: item?.subTitle || "",
                    button: {
                        buttonText: item?.button?.buttonText || "",
                        redirectionURL: item?.button?.redirectionURL || ""
                    }
                };
                if (cms2Images[index]) {
                    result.image = cms2Images[index] as cms2Service.FileData;
                }
                return result;
            }) : [];

            const cms2Record: cms2Service.ICms2Record = {
                pageName: input?.pageName || "",
                sectionName: sectionName,
                title: input?.title || "",
                subTitle: input?.subTitle || "",
                items: items
            };

            const result = await cms2Service.createCms2Record(cms2Record);
            const response = { _id: result?._id.toString() || "", message: "CMS-2 added successfully" };
            return response;
        },

        updateCms2Record: async (parent, { input, images, fileMap }, { req }, info) => {
            try {
                await validateInput(validators.cmsUpdateValidator, req);
                await verifyAdmin(req);


                const _id: string = input._id.toString();

                const existingCmsRecord: cms2Service.ICms2RecordUpdate | null = await cms2Service.getCms2RecordWithId(_id);
                if (!existingCmsRecord) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                images = images || [];

                let cms2Images: cms2Service.FileData[] = [];

                for (let image of images) {
                    const { createReadStream, filename, mimetype, encoding } = await image;

                    const key = spaceService.getFileKey(filePaths.cms, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    cms2Images.push({
                        fileType: "PUBLIC",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    });
                }

                fileMap = fileMap || {};
                console.log(fileMap)

                const items: cms2Service.ICm2Item[] = input.items?.length ? input.items.map((item, index) => {
                    const existingItem = existingCmsRecord.items?.[index] || {};
                    const result: cms2Service.ICm2Item = {
                        title: item?.title || existingItem.title,
                        subTitle: item?.subTitle || existingItem.subTitle,
                        button: {
                            buttonText: item?.button?.buttonText || existingItem.button?.buttonText,
                            redirectionURL: item?.button?.redirectionURL || existingItem.button?.redirectionURL
                        }
                    };


                    if (item?._id != null && fileMap[item._id] != null && fileMap[item._id] >= 0) {
                        if (cms2Images.length > fileMap[item._id]) {
                            result.image = cms2Images[fileMap[item._id]] as cms2Service.FileData;
                        }
                    } else if (existingItem.image) {
                        result.image = existingItem.image;
                    }

                    return result;
                }) : existingCmsRecord.items || [];


                if (input.title) {
                    existingCmsRecord.title = input?.title;
                }

                if (input.pageName) {
                    existingCmsRecord.pageName = input?.pageName;
                }

                if (input.subTitle) {
                    existingCmsRecord.subTitle = input?.subTitle;
                }
                if (items.length > 0) {
                    existingCmsRecord.items = items;
                }


                const result = await existingCmsRecord.save()

                if (!result) {
                    throw new GraphQLError("CMS-2 updatation failed", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = { record: result, message: "CMS-2 updated successfully" };
                return response;
            } catch (error) {
                throw error;
            }
        },

        deleteCms2Record: async (parent, { input }, { req }, info) => {
            try {
                await validateInput(validators.cmsDeleteValidator, req);
                await verifyAdmin(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);
                const filter = { _id };
                const result = await cms2Service.deleteCms2Record(filter);

                if (!result) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = { _id: result?._id?.toString() || "", message: "CMS-2 record deleted successfully" };
                return response;
            } catch (error) {
                throw error;
            }
        },
    },

    Query: {


        // Fetch all CMS records
        async getAllCms2Records(parent, { input }, { req }, info) {
            try {
                await validateInput(validators.getAllCmsRecordsValidator, req);
                await verifyAdmin(req);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                let projection: cms2Service.ICms2RecordsProjection = { _id: 1 };

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
                                            projection[path as keyof cms2Service.ICms2RecordsProjection] = 1;
                                        }
                                    }
                                }
                                else {
                                    projection[fieldName as keyof cms2Service.ICms2RecordsProjection] = 1;
                                }
                            }
                        }
                    }
                }


                const options: cms2Service.ICms2RecordsOptions = {
                    page,
                    size,
                    projection,
                }


                // Fetch all CMS records
                const result = await cms2Service.getCms2RecordsWithFilters(options);
                const response = {
                    records: result.records,
                    maxRecords: result.maxRecords,
                    message: "CMS-2 all records fetched successfully"
                };
                return response;
            } catch (error) {
                throw error;
            }
        },

        // Fetch each section by section name

        async getCms2Record(parent, { input }, { req }, info) {

            try {

                //Validate Input
                await validateInput(validators.cmsSectionQueryValidator, req);

                const sectionName: string = input?.sectionName;

                const result = await cms2Service.getCms2RecordWithSectionName(sectionName);

                if (!result) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }
                const response = {
                    record: result,
                    message: "CMS-2 record successfully"
                }
                return response;

            } catch (error) {
                throw error;
            }
        },

        // Fetch all CMS 2 records for admin
        async getAllCms2RecordsByAdmin(parent, { input }, { req }, info) {
            try {
                // await validateInput(validators.getAllCmsRecordsValidator, req);
                await verifyAdmin(req);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                let projection: cms2Service.ICms2RecordsProjection = { _id: 1 };

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
                                            projection[path as keyof cms2Service.ICms2RecordsProjection] = 1;
                                        }
                                    }
                                }
                                else {
                                    projection[fieldName as keyof cms2Service.ICms2RecordsProjection] = 1;
                                }
                            }
                        }
                    }
                }


                const options: cms2Service.ICms2RecordsOptions = {
                    page,
                    size,
                    projection,
                }

                // Fetch all CMS records
                const result = await cms2Service.getAllCms2RecordsWithFilters(options);
                const response = {
                    records: result.records,
                    maxRecords: result.maxRecords,
                    message: "CMS-2 all records fetched successfully"
                };
                return response;
            } catch (error) {
                throw error;
            }
        },

        // Fetch each record by id for admin

        async getCms2RecordByAdmin(parent, { input }, { req }, info) {

            try {

                //Validate Input
                await validateInput(validators.cms2RecordByAdminQueryValidator, req);
                await verifyAdmin(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);

                const result = await cms2Service.getCms2RecordByAdminWithId(_id);

                if (!result) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const record: cms2Service.ICms2Record = result;


                const response = {
                    record: record,
                    message: "CMS-2 record fetched successfully"
                }



                return response;

            } catch (error) {
                throw error;
            }

        },
    }
}

