import { Resolvers } from "../../_generated_/resolvers-types";
import { categoryService, spaceService, vendorService } from "../../services";
import * as validators from "./categoryValidator";
import { validateInput, verifyAdmin } from "../../middlewares";
import { createWriteStream } from 'fs';
import { GraphQLUpload } from "graphql-upload-ts";
import path from "path";
import { ObjectId, QueryOptions, Types } from "mongoose";
import { GraphQLError } from "graphql";
import { filePaths } from "../../configs";


export const categoryResolver: Resolvers = {

    Upload: GraphQLUpload,
    Mutation: {
        createCategory: async (parent, { input, image }, { req }, info) => {

            //Validate Input
            await validateInput(validators.categoryCreateValidator, req);
            // await verifyAdmin(req);

            // let sizeChart: categoryService.FileData | null = null;
            let attributes: Types.ObjectId[] = (input.attributes || []).filter(Boolean) as [];

            // if (image) {
            //     const { createReadStream, filename, mimetype, encoding } = await image;
            //     const key = spaceService.getFileKey(filePaths.categorySizeChart, filename, []);
            //     const stream = createReadStream();
            //     const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

            //     sizeChart = {
            //         fileType: "PUBLIC",
            //         fileURL: file.location,
            //         mimeType: mimetype,
            //         originalName: filename
            //     }
            // }

            const category: categoryService.ICategory = {
                categoryName: input.categoryName || "",
                isBlocked: input.isBlocked || false,
                description: input.description || "",
                isLeaf: input.isLeaf || false,
                attributes
            }
            // if (sizeChart) {
            //     category.sizeChart = sizeChart;
            // }
            let parentPath = '';
            if (input.parentId) {
                const parentRecord = await categoryService.findCategoryWithFilters({ _id: input.parentId }, { _id: 1, path: 1, isLeaf: 1 }, { lean: true });

                if (!parentRecord) {
                    throw new GraphQLError("parent not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                if (parentRecord.isLeaf != null && parentRecord.isLeaf) {
                    throw new GraphQLError("This node is not further expandable", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                parentPath = `${parentRecord.path + parentRecord._id}#`;

            } else {

                const isCategoriesEmpty = await categoryService.findCategoriesWithFilters(
                    {},
                    { _id: 1 },
                    { lean: true, limit: 1 }
                );

                if (!isCategoriesEmpty || isCategoriesEmpty.length === 0) {
                    category.categoryName = input.categoryName || "Default";
                    category.isDefault = true;
                }

            }

            category.path = parentPath || "#";


            const result = await categoryService.createCategory(category);

            if (!result) {
                throw new GraphQLError("Unable to create category", {
                    extensions: {
                        code: "INTERNAL_SERVER_ERROR",
                        errors: []
                    }
                });
            }

            return {
                _id: result._id.toString()
            }

        },
        updateCategory: async (parent, { input, image }, { req }, info) => {
            try {
                await validateInput(validators.categoryUpdateValidator, req);
                // await verifyAdmin(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);

                const categoryRecord = await categoryService.findCategoryWithFilters(
                    { _id: _id },
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

                // let sizeChart: categoryService.FileData | null = null;

                // if (image) {
                //     const { createReadStream, filename, mimetype, encoding } = await image;
                //     const key = spaceService.getFileKey(filePaths.categorySizeChart, filename, []);
                //     const stream = createReadStream();
                //     const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                //     sizeChart = {
                //         fileType: "PUBLIC",
                //         fileURL: file.location,
                //         mimeType: mimetype,
                //         originalName: filename
                //     }
                // }

                const options: QueryOptions = {};

                if (input.categoryName) {
                    categoryRecord.categoryName = input.categoryName;
                    // Update category name for related products
                    options.categoryRecord = categoryRecord;
                    options.originalCategoryName = categoryRecord.categoryName;
                    options.newCategoryName = input.categoryName;
                    await categoryService.updateCategoryNameForProducts(options);
                }

                if (typeof input.isBlocked === 'boolean') {
                    categoryRecord.isBlocked = input.isBlocked;
                }

                if (input.description) {
                    categoryRecord.description = input?.description;
                }
                // if (sizeChart) {
                //     categoryRecord.sizeChart = sizeChart;
                // }
                if (typeof input.isLeaf === 'boolean') {
                    categoryRecord.isLeaf = input.isLeaf;
                }

                if (input.attributes) {
                    // Check if any input.attributes are already in the existing category array
                    const existingAttributesSet = new Set(categoryRecord.attributes.map(attribute => attribute?.toString()));

                    if (input.attributes.some(attribute => attribute && existingAttributesSet.has(attribute.toString()))) {
                        throw new GraphQLError("One or more attributes already exist in the category", {
                            extensions: {
                                code: "BAD_REQUEST",
                                errors: [],
                            },
                        });
                    }

                    categoryRecord.attributes = [...categoryRecord.attributes, ...(input.attributes || [])].filter(Boolean) as [];
                }
                if (input.brands) {
                    // Check if any input.brands are already in the existing category array
                    const existingBrandsSet = new Set(categoryRecord.brands.map(brand => brand?.toString()));

                    if (input.brands.some(brand => brand && existingBrandsSet.has(brand.toString()))) {
                        throw new GraphQLError("One or more brands already exist in the category", {
                            extensions: {
                                code: "BAD_REQUEST",
                                errors: [],
                            },
                        });
                    }

                    categoryRecord.brands = [...categoryRecord.brands, ...(input.brands || [])].filter(Boolean) as [];
                }

                await categoryRecord.save();

                const response = {
                    _id: categoryRecord._id.toString(),
                    message: "Category successfully updated"
                };
                return response;
            } catch (error) {
                throw error;
            }
        },
        deleteCategory: async (parent, { input }, { req }, info) => {
            try {
                await validateInput(validators.categoryDeleteValidator, req);
                await verifyAdmin(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);
                const filter = { _id };
                const result = await categoryService.deleteCategoryRecord(filter);

                // Todo : prune the branch

                if (!result) {
                    throw new GraphQLError("Record not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = {
                    _id: result?._id?.toString() || "",
                    message: "Category successfully deleted"
                };
                return response;
            } catch (error) {
                throw error;
            }
        },
    },
    Query: {
        getAllChildCategories: async (parent, { input }, { req }, info) => {
            try {
                //Validate Input
                await validateInput(validators.categoriesQueryValidator, req);
                await verifyAdmin(req);

                const parentId = input.parent ? new Types.ObjectId(input.parent) : "";

                const mPath = parentId ? new RegExp(`${parentId}#$`) : /^#$/;

                const result = await categoryService.findCategoriesWithFilters({ path: mPath }, { _id: 1, categoryName: 1, isBlocked: 1, isLeaf: 1, description: 1 }, { lean: true, sort: { categoryName: 1 } });

                const response = {
                    records: result && result.length ? result.map((item) => { return { ...item, _id: item._id.toString() } }) : []
                }

                return response;

            } catch (error) {
                throw error;
            }
        },
        getActiveChildCategories: async (parent, { input }, { req }, info) => {
            try {
                //Validate Input
                await validateInput(validators.categoriesQueryValidator, req);

                const parentId = input.parent ? new Types.ObjectId(input.parent) : "";

                const mPath = parentId ? new RegExp(`${parentId}#$`) : /^#$/;

                const result = await categoryService.findCategoriesWithFilters({ path: mPath, isBlocked: false, isDefault: false }, { _id: 1, categoryName: 1 }, { lean: true, sort: { categoryName: 1 } });

                const response = {
                    records: result && result.length ? result.map((item) => { return { ...item, _id: item._id.toString() } }) : []
                }

                return response;

            } catch (error) {
                throw error;
            }
        },
        getActiveCategoryTree: async (parent, { }, { req }, info) => {
            try {

                const result = await categoryService.findCategoriesWithFilters({ isBlocked: false, isDefault: false }, { _id: 1, categoryName: 1, path: 1 }, { lean: true, sort: { path: 1 } });

                if (!result || result.length == 0) {
                    throw new GraphQLError("Records not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const parentCategories = result.filter((item) => item.path === "#");
                const childCategories = result.filter((item) => item.path !== "#");
                let finalResult = [];


                function findChildren(parentId: string): any[] {
                    let children = [];
                    for (let [key, item] of childCategories.entries()) {
                        if (new RegExp(`${parentId}#$`).test(item.path)) {
                            let data = findChildren(item._id.toString());
                            let child = {
                                ...item, _id: item._id.toString(), children: data
                            }
                            children.push(child);
                        }
                    }
                    return children;
                }

                for (let item of parentCategories) {
                    const data = findChildren(item._id.toString());
                    finalResult.push(
                        {
                            ...item,
                            _id: item._id.toString(),
                            children: data
                        }
                    )
                }

                const response = {
                    records: finalResult
                }
                return response;

            } catch (error) {
                throw error;
            }
        },

        async getCategoriesAutoComplete(parent, { input }, { req }, info) {
            try {

                //Validate Input
                await validateInput(validators.categoryAutoCompleteQueryValidator, req);

                const query: string = (input.query.replace(/[^0-9a-zA-Z]/g, ' ')).trim().toLowerCase();
                let suggestions: categoryService.ICategorySuggestion[] = [];
                if (query) {
                    suggestions = await categoryService.getCategoriesAutoComplete(query);
                }
                let response = {
                    suggestions: suggestions.map((item) => { return { ...item, _id: item._id.toString() } })
                }
                return response;
            } catch (error) {
                throw error;
            }
        },

        getAllLeafRecords: async (parent, { }, { req }, info) => {
            try {
                // await verifyAdmin(req);
                const result = await categoryService.findCategoriesWithFilters(
                    { isLeaf: true, isDefault: false },
                    { _id: 1, categoryName: 1, path: 1, isBlocked: 1, description: 1, isLeaf: 1 },
                    { lean: true, path: 1 }
                );

                if (!result || result.length === 0) {
                    throw new GraphQLError("Records not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                let finalResult = await Promise.all(
                    result.map(async (n) => {
                        const categoryIdPathData = await categoryService.findCategoryWithFilters(
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
                            categoryName: n.categoryName,
                            path: n.path,
                            isBlocked: n.isBlocked,
                            fullCategoryName: categoryName,
                            description: n.description,
                            isLeaf: n.isLeaf
                        };
                    })
                );

                const response = {
                    records: finalResult,
                };

                finalResult.sort((a, b) => {
                    return a.fullCategoryName.localeCompare(b.fullCategoryName);
                });
                return response;
            } catch (error) {
                throw error;
            }
        },

        getLevelCategories: async (parent, { input }, { req }, info) => {
            //Validate Input
            await validateInput(validators.categoryLevelValidator, req);

            try {
                const limit: number = input?.limit || 3;
                const level: number = input?.level || 0;
                const options = { limit, level };

                const result = await categoryService.getLevelCategoriesByFilters(
                    options
                );

                if (!result || result.length === 0) {
                    throw new GraphQLError(`${level}-level records not found`, {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = {
                    records: result.map((item) => { return { ...item, _id: item._id.toString(), categoryName: item.categoryName } }),
                };

                return response;
            } catch (error) {
                throw error;
            }
        },

        getAllCategoriesOfVendor: async (parent, { input }, { req }, info) => {
            try {
                // await verifyAdmin(req);
                const vendorId: Types.ObjectId = new Types.ObjectId(input.vendorId);

                const vendor = await vendorService.getvendorRecordWithId(vendorId);

                if (!vendor) {
                    throw new GraphQLError("Vendor not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const attributes = vendor.categories || [];

                if (!vendor || attributes?.length === 0) {
                    throw new GraphQLError("Records not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                let finalResult = await Promise.all(
                    attributes.map(async (n) => {
                        const categoryIdPathData = await categoryService.findCategoryWithFilters(
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
                            _id: n._id.toString(),
                            categoryName: categoryIdPathData?.categoryName,
                            isBlocked: categoryIdPathData?.isBlocked,
                            fullCategoryName: categoryName,
                            isLeaf: categoryIdPathData?.isLeaf
                        };
                    })
                );

                const response = {
                    records: finalResult,
                };

                finalResult.sort((a, b) => {
                    return a.fullCategoryName.localeCompare(b.fullCategoryName);
                });
                return response;
            } catch (error) {
                throw error;
            }
        },


        getAllCategoriesOfVendorByAdmin: async (parent, { input }, { req }, info) => {
            try {
                await verifyAdmin(req);
                const vendorId: Types.ObjectId = new Types.ObjectId(input.vendorId);

                const vendor = await vendorService.getvendorRecordWithId(vendorId);

                if (!vendor) {
                    throw new GraphQLError("Vendor not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const attributes = vendor.categories || [];

                if (!vendor || attributes?.length === 0) {
                    throw new GraphQLError("Records not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                let finalResult = await Promise.all(
                    attributes.map(async (n) => {
                        const categoryIdPathData = await categoryService.findCategoryWithFilters(
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
                            _id: n._id.toString(),
                            categoryName: categoryIdPathData?.categoryName,
                            isBlocked: categoryIdPathData?.isBlocked,
                            fullCategoryName: categoryName,
                            isLeaf: categoryIdPathData?.isLeaf
                        };
                    })
                );

                const response = {
                    records: finalResult,
                };

                finalResult.sort((a, b) => {
                    return a.fullCategoryName.localeCompare(b.fullCategoryName);
                });
                return response;
            } catch (error) {
                throw error;
            }
        },

    }


}