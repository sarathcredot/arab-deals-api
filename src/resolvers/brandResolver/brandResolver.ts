import { Resolvers } from "../../_generated_/resolvers-types";
import * as validators from "./brandValidator";
import { validateInput, verifyAdmin, verifyVendor } from "../../middlewares";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { Types } from "mongoose";
import { filePaths } from "../../configs";
import { spaceService, brandService, categoryService } from "../../services";
import { createReadStream } from 'fs';

export const brandResolver: Resolvers = {

    Upload: GraphQLUpload,

    Mutation: {
        addBrand: async (parent, { input, image }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.brandCreateValidator, req);
                await verifyAdmin(req);

                let brandLogo;

                if (image) {
                    const { createReadStream, filename, mimetype } = await image;

                    const key = spaceService.getFileKey(filePaths.brand, filename, []);

                    console.log("key: ", key);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    brandLogo = {
                        fileType: "PUBLIC",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    }
                }

                const brandRecord = {
                    brandName: input.brandName,
                    isBlocked: input?.isBlocked || false,
                    logo: brandLogo,
                    isPopular: input?.isPopular || false,
                    priority: input.priority,
                };

                const result = await brandService.createBrandRecord(brandRecord);
                const response = { _id: result?._id.toString() || "", message: "Brand added successfully" };
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

                if (input.isBlocked != null) {
                    brandRecord.isBlocked = input?.isBlocked;
                }

                if (input.priority) {
                    brandRecord.priority = input?.priority;
                }

                if (input.isPopular) {
                    brandRecord.isPopular = input?.isPopular;
                }

                if (input.categories) {
                    // Check if any input.brands are already in the existing category array
                    const existingBrandsSet = new Set(brandRecord.categories.map(category => category?.toString()));

                    if (input.categories.some(brand => brand && existingBrandsSet.has(brand.toString()))) {
                        throw new GraphQLError("One or more brands already exist in the category", {
                            extensions: {
                                code: "BAD_REQUEST",
                                errors: [],
                            },
                        });
                    }

                    brandRecord.categories = [...brandRecord.categories, ...(input.categories || [])].filter(Boolean) as [];
                }

                const result = await brandRecord.save();

                const response = {
                    _id: result?._id?.toString() || "", message: "Brand record updated successfully",
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
                const isBlocked: boolean = input?.isBlocked || false;

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
                    isBlocked,
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

        // Fetch all top brands
        async getAllTopBrandRecords(parent, { input }, { req }, info) {
            try {
                // Validate Input
                await validateInput(validators.getAllBrandsValidator, req);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                const isBlocked: boolean = input?.isBlocked || false;

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
                    isBlocked,
                    projection,
                }

                const result = await brandService.getTopBrandRecordsWithFilters(options);
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

        async getAllTopBrandRecordsInMobile(parent, { input }, { req }, info) {
            try {
                // Validate Input
                await validateInput(validators.getAllBrandsValidator, req);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                const isBlocked: boolean = input?.isBlocked || false;

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
                    isBlocked,
                    projection,
                }

                const result = await brandService.getTopBrandRecordsInMobileWithFilters(options);
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

        // Fetch all brands by Admin
        async getAllBrandRecordsWithVendorByAdmin(parent, { input }, { req }, info) {
            try {
                // Validate Input
                await validateInput(validators.getAllBrandsWithVendorByAdminValidator, req);
                await verifyAdmin(req);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                const vendorId: Types.ObjectId = new Types.ObjectId(input.vendorId);


                const options: brandService.IBrandRecordsWithVendorByAdminOptions = {
                    page,
                    size,
                    vendorId,
                }

                const result = await brandService.getBrandRecordsWithVendorByAdminFilters(options);
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

        // Fetch all brands by Vendor
        async getAllBrandRecordsWithVendorByVendor(parent, { input }, { req }, info) {
            try {
                // Validate Input
                await validateInput(validators.getAllBrandsWithVendorByVendorValidator, req);
                await verifyVendor(req);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                const vendorId: Types.ObjectId = new Types.ObjectId(input.vendorId);


                const options: brandService.IBrandRecordsWithVendorByVendorOptions = {
                    page,
                    size,
                    vendorId,
                }

                const result = await brandService.getBrandRecordsWithVendorByAdminFilters(options);
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
                await verifyAdmin(req);
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

        // Fetch each brand records  and each record values with category in vendor portal
        async getBrandDetailsWithCategory(parent, { input }, { req }, info) {

            try {
                await validateInput(validators.getBrandsWithCategoryValidator, req);

                const categoryId: Types.ObjectId = new Types.ObjectId(input.categoryId);

                const categoryRecord = await categoryService.findCategoryWithFilters(
                    { _id: categoryId },
                    {},
                    {}
                );

                if (!categoryRecord) {
                    throw new GraphQLError("Category not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const options = { categoryId };

                // const result = await brandService.getCategoryWithBrandsBycategoryId(options);
                const result = await brandService.getBrandsWithFilter({ categories: options.categoryId }, "_id brandName logo isPopular priority", {});
                if (!result) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const response = {

                    records: result?.map((n: any) => ({
                        _id: n?._id?.toString(),
                        brandName: n?.brandName,
                        isBlocked: n?.isBlocked,
                        logo: n?.logo,
                        isPopular: n?.isPopular,
                        priority: n?.priority,
                    })),
                    message: "Vendor record fetched successfully",

                }

                return response;

            } catch (error) {
                throw error;
            }

        },

        // Fetch each brand records  and each record values with category in mobile
        async getBrandDetailsWithCategoryInMobile(parent, { input }, { req }, info) {

            try {
                await validateInput(validators.getBrandsWithCategoryValidator, req);

                const categoryId: Types.ObjectId = new Types.ObjectId(input.categoryId);

                const categoryRecord = await categoryService.findCategoryWithFilters(
                    { _id: categoryId },
                    {},
                    {}
                );

                if (!categoryRecord) {
                    throw new GraphQLError("Category not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const options = { categoryId };

                // const result = await brandService.getCategoryWithBrandsBycategoryId(options);
                const result = await brandService.getBrandsWithFilter({ categories: options.categoryId }, "_id brandName logo isPopular priority", {});
                if (!result) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const response = {

                    records: result?.map((n: any) => ({
                        _id: n?._id?.toString(),
                        brandName: n?.brandName,
                        isBlocked: n?.isBlocked,
                        logo: n?.logo,
                        isPopular: n?.isPopular,
                        priority: n?.priority,
                    })),
                    message: "Vendor record fetched successfully",

                }

                return response;

            } catch (error) {
                throw error;
            }

        },

        // Fetch each brand records  and each record values with category in vendor portal
        async getCategoryDetailsWithBrand(parent, { input }, { req }, info) {

            try {
                await validateInput(validators.getCategoriesWithbrandValidator, req);

                const brandId: Types.ObjectId = new Types.ObjectId(input.brandId);

                // const brandRecord = await categoryService.findCategoryWithFilters(
                //     { _id: brandId },
                //     { _id: 1, brandName: 1, isBlocked: 1, isPopular: 1, priority: 1, categories: 1 },
                //     {lean: true}
                // );

                // console.log("brandRecord: ", brandRecord)

                // if (!brandRecord) {
                //     throw new GraphQLError("Brand not found", {
                //         extensions: {
                //             code: "BAD_REQUEST",
                //             errors: [],
                //         },
                //     });
                // }

                // const options = { brandId };

                // const result = await brandService.getCategoryWithBrandByBrandId(options);

                // if (!result) {
                //     throw new GraphQLError("Record not found", {
                //         extensions: {
                //             code: "BAD_REQUEST",
                //             errors: []
                //         }
                //     });
                // }
                const result = await brandService.getBrandWithFilters(
                    { _id: brandId },
                    { categories: 1, brandName: 1, _id: 1 },
                    { lean: true }
                );

                let finalResult = await Promise.all(
                    (result as any).categories.map(async (n: any) => {
                        const categoryIdPathData: any = await categoryService.findCategoryWithFilters(
                            { _id: n._id },
                            { _id: 1, path: 1, categoryName: 1, isBlocked: 1, description: 1, isLeaf: 1 },
                            { lean: true }
                        );

                        let categoryIdPath = `${categoryIdPathData?.path}${n._id}#`;

                        let categoryName = "";

                        let categoryPathIds = [];

                        if (categoryIdPath) {
                            categoryPathIds = categoryIdPath.split("#");
                            categoryPathIds = categoryPathIds.filter((id) => id.trim() !== "");

                            const categoryNames = [];

                            for (let categoryIdPathId of categoryPathIds) {
                                const categoryNamePathData = await categoryService.findCategoryWithFilters(
                                    { _id: categoryIdPathId },
                                    { _id: 1, categoryName: 1 },
                                    { lean: true }
                                );

                                if (categoryNamePathData) {
                                    categoryNames.push(categoryNamePathData.categoryName);
                                }
                            }

                            categoryName = categoryNames.join(" / ");
                        }

                        return {
                            _id: String(n._id),
                            categoryName: categoryIdPathData.categoryName,
                            path: categoryIdPathData.path,
                            isBlocked: categoryIdPathData.isBlocked,
                            fullCategoryName: categoryName,
                            description: categoryIdPathData.description,
                            isLeaf: categoryIdPathData.isLeaf
                        };
                    })
                );

                finalResult.sort((a, b) => {
                    return a.fullCategoryName.localeCompare(b.fullCategoryName);
                });

                const response = {
                    records: {
                        brandId: result?._id?.toString(),
                        brandName: result?.brandName,
                        categories: finalResult
                    },
                    message: "Vendor record fetched successfully",
                }

                return response;

            } catch (error) {
                throw error;
            }

        },

    }
};
