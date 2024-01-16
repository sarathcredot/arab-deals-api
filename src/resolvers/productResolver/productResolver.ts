import { Resolvers } from "../../_generated_/resolvers-types";
import { categoryService, productService, spaceService } from "../../services";
import * as validators from "./productValidator";
import { validateInput, verifyAdmin } from "../../middlewares";
import { createWriteStream } from 'fs';
import { GraphQLUpload } from "graphql-upload-ts";
import path from "path";
import { ObjectId, QueryOptions, Types } from "mongoose";
import { GraphQLError } from "graphql";
import { filePaths } from "../../configs";

export interface ProductAttributes {
    [key: string]: {
        attributeValueId: string;
        attributeValue: string;
        // other necessary fields if needed
    };
}

export const productResolver: Resolvers = {
    Upload: GraphQLUpload,
    Mutation: {
        uploadProductFile: async (parent, { file }, info) => {
            const { createReadStream, filename, mimetype, encoding } = await file;
            const uploadDir = path.join(path.dirname(path.dirname(path.dirname(__dirname))), "uploads");

            const stream = createReadStream();
            const writeStream = createWriteStream(`${uploadDir}/${Date.now()}${filename}`);

            await new Promise((resolve, reject) => {
                stream.pipe(writeStream);
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });

            return { filename, mimetype, encoding };
        },

        createProduct: async (parent, { input, images, attributeFileMap }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.createProductValidator, req);
                // await verifyAdmin(req);

                images = images || [];

                let cmsImages = [];

                for (let image of images) {
                    const { createReadStream, filename, mimetype, encoding } = await image;
                    const key = spaceService.getFileKey(filePaths.products, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    cmsImages.push({
                        fileType: "PUBLIC",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    });
                }

                let newProduct: productService.IProduct = {};

                let categoryId = input.categoryId;

                let categoryIdPathData, categoryIdPath, categoryName;

                if (categoryId !== undefined) {
                    categoryIdPathData = await categoryService.findCategoryWithFilters(
                        { _id: categoryId },
                        { _id: 1, path: 1, categoryName: 1 },
                        { lean: true }
                    );

                    if (!categoryIdPathData) {
                        throw new GraphQLError("Category not found", {
                            extensions: {
                                code: "BAD_REQUEST",
                                errors: [],
                            },
                        });
                    }

                    categoryIdPath = `${categoryIdPathData?.path}${categoryId}#`;

                    let categoryPathIds = categoryIdPath.split("#").filter(id => id.trim() !== "");

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

                    categoryName = categoryNames.join(" ");
                }

                let productCode: number;
                let productCodeCount = await productService.getLatestProductCode();
                productCode = productCodeCount + 1;

                let tags: string[] = [];
                if (input.tags) {
                    const inputTags: string = input.tags;
                    tags = inputTags.split(',').map(tag => tag.trim());
                }

                newProduct = {
                    vendorId: input.vendorId,
                    brandId: input.brandId || "",
                    brandName: input.brandName || "",
                    productName: input?.productName || "",
                    shortDescription: input?.shortDescription || "",
                    skuId: input?.skuId || "",
                    description: input?.description || "",
                    productInfo: (input.productInfo || []).filter(Boolean) as [],
                    productShortInfo: input?.productShortInfo || "",
                    material: input?.material || "",
                    rating: input?.rating || 0,
                    sellingPrice: input?.sellingPrice || 0,
                    price: input?.price || 0,
                    mrp: input?.mrp || 0,
                    isBlocked: input?.isBlocked || false,
                    tags: tags || [],
                    stock: input?.stock || 0,
                    images: cmsImages || [],
                    categoryId: input.categoryId || "",
                    categoryNamePath: categoryName,
                    categoryIdPath: categoryIdPath,
                    productCode: productCode,
                    status: "UNDER_VERIFICATION",
                    attributes: attributeFileMap,
                    offerPrice: input.offerPrice
                };

                // Create the product
                const result = await productService.createProduct(newProduct);

                const response = {
                    product: result,
                    message: "Product created successfully",
                };

                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },

        createVariant: async (parent, { input, images, attributeFileMap }, { req }, info) => {
            try {
                // Validate Input
                await validateInput(validators.createVariantValidator, req);
                // await verifyAdmin(req);

                images = images || [];

                let cmsImages = [];

                for (let image of images) {
                    const { createReadStream, filename, mimetype, encoding } = await image;
                    const key = spaceService.getFileKey(filePaths.products, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    cmsImages.push({
                        fileType: "PUBLIC",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    });
                }

                let newProduct: productService.IProduct = {};

                let productCode: number = input.productCode;

                const variant = await productService.getProductWithFilters({ productCode: productCode }, {}, { lean: true });
                if (!variant) {
                    throw new GraphQLError("Product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const isVariantExists = await productService.getProductWithFilters({ productCode: productCode,  }, { attributes: attributeFileMap }, { lean: true });

                if (isVariantExists) {
                    throw new GraphQLError("Variant with this same color and size already exists", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                let tags: string[] = [];
                if (input.tags) {
                    const inputTags: string = input.tags;
                    tags = inputTags.split(',').map(tag => tag.trim());
                }

                 newProduct = {
                    // vendorId: input.vendorId,
                    brandId: input.brandId || "",
                    brandName: input.brandName || "",
                    productName: input?.productName || variant.productName,
                    shortDescription: input?.shortDescription || variant.shortDescription,
                    skuId: input?.skuId || variant.skuId,
                    description: input?.description || variant.description,
                    productInfo: (input.productInfo || variant.productInfo || []).filter(Boolean) as [],
                    productShortInfo: input?.productShortInfo || variant.productShortInfo,
                    material: input?.material || variant.material,
                    rating: input?.rating || variant.rating,
                    sellingPrice: input?.sellingPrice || 0,
                    price: input?.price || 0,
                    mrp: input?.mrp || 0,
                    isBlocked: input?.isBlocked || false,
                    tags: tags || [],
                    stock: input?.stock || 0,
                    images: cmsImages || [],
                    categoryId: variant.categoryId,
                    categoryNamePath: variant.categoryNamePath,
                    categoryIdPath: variant.categoryIdPath,
                    productCode: productCode,
                    status: "UNDER_VERIFICATION",
                    attributes: attributeFileMap,
                    offerPrice: input?.offerPrice || 0,
                };

                // Create the product
                const result = await productService.createProduct(newProduct);

                const response = {
                    product: result,
                    message: "Variant created successfully",
                };

                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },

        updateProduct: async (parent, { input, images, attributeFileMap }, { req }, info) => {
            try {
                await validateInput(validators.productUpdateValidator, req);
                // await verifyAdmin(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);

                const existingProduct: productService.IProductDocument | null = await productService.getProductWithId(_id);
                if (!existingProduct) {
                    throw new GraphQLError("Product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                attributeFileMap = attributeFileMap || {};

                images = images || [];

                let cmsImages = [];

                for (let image of images) {
                    const { createReadStream, filename, mimetype, encoding } = await image;
                    const key = spaceService.getFileKey(filePaths.products, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);


                    cmsImages.push({
                        fileType: "PUBLIC",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    });
                }

                let tags: string[] = [];
                if (input.tags) {
                    const inputTags: string = input.tags;
                    tags = inputTags.split(',').map(tag => tag.trim());
                    existingProduct.tags = (tags || []).filter(Boolean) as [];
                }

                let productInfo: string[] = [];
                if (input.productInfo) {
                    existingProduct.productInfo = (input.productInfo || []).filter(Boolean) as [];
                }


                if (input.productName && existingProduct.productName !== input.productName) {
                    existingProduct.productName = input.productName;
                }

                if (input.shortDescription && existingProduct.shortDescription !== input.shortDescription) {
                    existingProduct.shortDescription = input.shortDescription;
                }

                if (input.productInfo) {
                    existingProduct.productInfo = (input.productInfo || []).filter(Boolean) as [];
                }

                if (input.productShortInfo && existingProduct.productShortInfo !== input.shortDescription) {
                    existingProduct.productShortInfo = input.productShortInfo;
                }

                if (input.skuId && existingProduct.skuId !== input.skuId) {
                    existingProduct.skuId = input.skuId;
                }

                if (input.description && existingProduct.description !== input.description) {
                    existingProduct.description = input.description;
                }

                // if (input.color && existingProduct.color !== input.color) {
                //     existingProduct.color = input.color;
                // }

                // if (input.size && existingProduct.size !== input.size) {
                //     existingProduct.size = input.size;
                // }

                if (input.material && existingProduct.material !== input.material) {
                    existingProduct.material = input.material;
                }

                if (input.rating !== null && existingProduct.rating !== input.rating) {
                    existingProduct.rating = input.rating;
                }

                if (input.sellingPrice !== null && existingProduct.sellingPrice !== input.sellingPrice) {
                    existingProduct.sellingPrice = input.sellingPrice;
                }

                if (input.price !== null && existingProduct.price !== input.price) {
                    existingProduct.price = input.price;
                }

                if (input.mrp !== null && existingProduct.mrp !== input.mrp) {
                    existingProduct.mrp = input.mrp;
                }

                if (input.isBlocked !== null && existingProduct.isBlocked !== input.isBlocked) {
                    existingProduct.isBlocked = input.isBlocked;
                }

                if (input.stock !== null && existingProduct.stock !== input.stock) {
                    existingProduct.stock = input.stock;
                }

                if (cmsImages.length > 0) {
                    existingProduct.images = cmsImages;
                }

                if (input.status && existingProduct.status !== input.status) {
                    existingProduct.status = input.status;
                }

                if (input.brandId !== null && existingProduct.brandId !== input.brandId) {
                    existingProduct.brandId = input.brandId;
                }

                if (input.brandName !== null && existingProduct.brandName !== input.brandName) {
                    existingProduct.brandName = input.brandName;
                }

                
                if (attributeFileMap !== null && existingProduct.attributes !== attributeFileMap) {
                    existingProduct.attributes = attributeFileMap;
                }

                // interface AttributeResponse {
                //     [key: string]: productService.IProductAttribute[];
                // }

                // // Ensure existingProduct.attributes is defined and is of the correct type
                // if (!existingProduct.attributes) {
                //     console.log('Initializing attributes for the first time.');
                //     existingProduct.attributes = new Map<string, IProductAttribute[]>();
                // }

                // // Check if attributeFileMap is not null and has keys
                // if (attributeFileMap !== null && Object.keys(attributeFileMap).length > 0) {
                //     // Merge existing attributes with new ones
                //     for (const [key, value] of Object.entries(attributeFileMap)) {
                //         // Check if the key already exists in existingProduct.attributes
                //         if (!existingProduct.attributes.has(key)) {
                //             // If not, create an empty array for the key
                //             existingProduct.attributes.set(key, []);
                //         }

                //         // Ensure existingProduct.attributes.get(key) is an array
                //         const existingArray = existingProduct.attributes.get(key) as IProductAttribute[];

                //         // Merge the existing array with the new one
                //         existingProduct.attributes.set(key, [
                //             ...existingArray,
                //             ...value,
                //         ]);
                //     }

                //     console.log('Updated attributes:', existingProduct.attributes);
                // }

                // Update the product
                const result = await existingProduct.save();


                if (!result) {
                    throw new GraphQLError("Product updatation failed", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = {
                    _id: result?._id?.toString() || "",
                    message: "Product updated successfully",
                };
                return response;
            } catch (error) {
                throw error;
            }
        },

        //  Update product status by admin
        updateProductStatus: async (parent, { input }, { req }, info) => {
            try {
                await validateInput(validators.productUpdateStatusValidator, req);
                await verifyAdmin(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);

                const existingProduct: productService.IProductDocument | null = await productService.getProductWithId(_id);
                if (!existingProduct) {
                    throw new GraphQLError("Product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }


                if (input.status && existingProduct.status !== input.status) {
                    existingProduct.status = input.status;
                }


                // Update the product
                const result = await existingProduct.save();

                if (!result) {
                    throw new GraphQLError("Product updatation failed", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = {
                    _id: result?._id?.toString(),
                    message: "Product updated successfully",
                };
                return response;
            } catch (error) {
                throw error;
            }
        },


        deleteProduct: async (parent, { input }, { req }, info) => {
            try {
                await validateInput(validators.productDeleteValidator, req);
                await verifyAdmin(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);
                const filter = { _id };
                const result = await productService.deleteProduct(filter);

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
                    message: "Product deleted successfully",
                };
                return response;
            } catch (error) {
                throw error;
            }
        },


    },

    Query: {
        // Fetch each product by id detail by admin
        async getProductByAdmin(parent, { input }, { req }, info) {

            try {
                //Validate Input
                await validateInput(validators.productQueryValidator, req);
                // await verifyAdmin(req);

                const productId: Types.ObjectId = new Types.ObjectId(input._id);
                const options: QueryOptions = { lean: true };
                const projection: productService.IProductProjection = {};
                const selectedFields = info?.fieldNodes[0]?.selectionSet?.selections || [];
                for (const selection of selectedFields) {
                    if (selection.kind === "Field" && selection.name.value == "product") {

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
                                            projection[path as keyof productService.IProductProjection] = 1;
                                        }
                                    }
                                }
                                else {
                                    projection[fieldName as keyof productService.IProductProjection] = 1;
                                }
                            }
                        }
                    }
                }

                const result = await productService.getProductWithId(productId, projection, options);
                console.log((result as any).attributes)

                if (!result) {
                    throw new GraphQLError("product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const response = {
                    product: result,
                }

                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        },

        // Fetch all product by admin
        async getProductsByAdmin(parent, { input }, { req }, info) {

            try {

                //Validate Input
                await validateInput(validators.productsQueryValidator, req);
                await verifyAdmin(req);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                const minPrice: number | null = input?.minPrice || null;
                const maxPrice: number | null = input?.maxPrice && input.maxPrice > 0 ? input.maxPrice : null;
                // const color: string[] = (input?.color || []) as [];
                const productSize: string[] = (input?.productSize || []) as [];
                const newest: boolean = input?.newest || false;
                const priceLowToHigh: boolean = input?.priceLowToHigh || false;
                const priceHighToLow: boolean = input?.priceHighToLow || false;
                const query: string = input?.query ? input.query.replace(/[^0-9a-zA-Z]/g, ' ') : '';
                const parentCategory: string = input?.parentCategory ? (new Types.ObjectId(input.parentCategory)).toString() : "";
                const categories: string[] = (input?.categories || []).map((item: string | null) => {
                    return item ? new Types.ObjectId(item).toString() : '';
                }).filter((item) => item ? true : false);


                let projection: productService.IProductsProjection = { _id: 1 };

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
                                            projection[path as keyof productService.IProductsProjection] = 1;
                                        }
                                    }
                                }
                                else {
                                    projection[fieldName as keyof productService.IProductsProjection] = 1;
                                }
                            }
                        }
                    }
                }


                const options: productService.IProductsOptions = {
                    page,
                    size,
                    minPrice,
                    maxPrice,
                    productSize,
                    // color,
                    newest,
                    priceLowToHigh,
                    priceHighToLow,
                    query,
                    projection,
                    parentCategory,
                    categories
                }

                const result = await productService.getProductsByAdminWithFilters(options);


                const response = {
                    maxRecords: result.maxRecords,
                    records: result.records
                }
                return response;
            } catch (error) {
                throw error;
            }

        },
        // Fetch Variants by admin
        // async getVariantsByAdmin(parent, { input }, { req }, info) {
        //     try {
        //         //Validate Input
        //         await validateInput(validators.variantsQueryValidator, req);
        //         await verifyAdmin(req);

        //         const _id: Types.ObjectId = new Types.ObjectId(input._id);


        //         const product = await productService.getProductWithId(_id, { productCode: 1 }, { lean: true });
        //         if (!product) {
        //             throw new GraphQLError("product not found", {
        //                 extensions: {
        //                     code: "BAD_REQUEST",
        //                     errors: []
        //                 }
        //             });
        //         }
        //         let result: productService.IProduct = product;
        //         if (!result.productCode) {
        //             throw new GraphQLError("variants not found", {
        //                 extensions: {
        //                     code: "BAD_REQUEST",
        //                     errors: []
        //                 }
        //             });
        //         }
        //         const variants = await productService.getAllProductVariants(result.productCode);

        //         variants.sort((a, b) => {
        //             return a.size.localeCompare(b.size)
        //         });


        //         let response = {
        //             variants: variants
        //         }

        //         return response;
        //     } catch (error) {
        //         console.log(error);
        //         throw error;
        //     }
        // },

        // Fetch each product by id
        async getProduct(parent, { input }, { req }, info) {

            try {

                //Validate Input
                await validateInput(validators.productQueryValidator, req);

                const productId: Types.ObjectId = new Types.ObjectId(input._id);
                const options: QueryOptions = { lean: true };
                const projection: productService.IProductProjection = {};
                const selectedFields = info?.fieldNodes[0]?.selectionSet?.selections || [];
                for (const selection of selectedFields) {
                    if (selection.kind === "Field" && selection.name.value == "product") {

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
                                            projection[path as keyof productService.IProductProjection] = 1;
                                        }
                                    }
                                }
                                else {
                                    projection[fieldName as keyof productService.IProductProjection] = 1;
                                }
                            }
                        }
                    }
                }

                const result = await productService.getProductWithId(productId, projection, options);

                console.log(result)


                if (!result) {
                    throw new GraphQLError("product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }
                // const categoryId: Types.ObjectId = (result as categoryService.CategoryDocument).categoryId;

                // const lowestCategoryTreeData = await categoryService.findCategoryWithFilters({ _id: categoryId }, { _id: 1, path: 1, sizeChart: 1 }, { lean: true });

                const response = {
                    product: result,
                    // sizeChartUrl: (lowestCategoryTreeData as categoryService.CategoryDocument).sizeChart?.fileURL
                }

                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        },

        async getProducts(parent, { input }, { req }, info) {

            try {

                //Validate Input
                await validateInput(validators.productsQueryValidator, req);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                const minPrice: number | null = input?.minPrice || null;
                const maxPrice: number | null = input?.maxPrice && input.maxPrice > 0 ? input.maxPrice : null;
                // const color: string[] = (input?.color || []) as [];
                const productSize: string[] = (input?.productSize || []) as [];
                const newest: boolean = input?.newest || false;
                const priceLowToHigh: boolean = input?.priceLowToHigh || false;
                const priceHighToLow: boolean = input?.priceHighToLow || false;
                const query: string = input?.query ? input.query.replace(/[^0-9a-zA-Z]/g, ' ') : '';
                const parentCategory: string = input?.parentCategory ? (new Types.ObjectId(input.parentCategory)).toString() : "";
                const categories: string[] = (input?.categories || []).map((item: string | null) => {
                    return item ? new Types.ObjectId(item).toString() : '';
                }).filter((item) => item ? true : false);


                let projection: productService.IProductsProjection = { _id: 1 };

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
                                            projection[path as keyof productService.IProductsProjection] = 1;
                                        }
                                    }
                                }
                                else {
                                    projection[fieldName as keyof productService.IProductsProjection] = 1;
                                }
                            }
                        }
                    }
                }


                const options: productService.IProductsOptions = {
                    page,
                    size,
                    minPrice,
                    maxPrice,
                    productSize,
                    // color,
                    newest,
                    priceLowToHigh,
                    priceHighToLow,
                    query,
                    projection,
                    parentCategory,
                    categories
                }

                const result = await productService.getProductsWithFilters(options);

                const response = {
                    maxRecords: result.maxRecords,
                    records: result.records
                }
                return response;
            } catch (error) {
                throw error;
            }

        },


        // async getVariants(parent, { input }, { req }, info) {
        //     try {

        //         //Validate Input
        //         await validateInput(validators.variantsQueryValidator, req);
        //         const _id: Types.ObjectId = new Types.ObjectId(input._id);


        //         const product = await productService.getProductWithId(_id, { productCode: 1 }, { lean: true });
        //         if (!product) {
        //             throw new GraphQLError("product not found", {
        //                 extensions: {
        //                     code: "BAD_REQUEST",
        //                     errors: []
        //                 }
        //             });
        //         }
        //         let result: productService.IProduct = product;
        //         if (!result.productCode) {
        //             throw new GraphQLError("variants not found", {
        //                 extensions: {
        //                     code: "BAD_REQUEST",
        //                     errors: []
        //                 }
        //             });
        //         }
        //         let variants = await productService.getProductVariants(result.productCode);

        //         variants.sort((a, b) => {
        //             return a.size.localeCompare(b.size)
        //         });

        //         let response = {
        //             variants: variants
        //         }

        //         return response;
        //     } catch (error) {
        //         console.log(error);
        //         throw error;
        //     }
        // },

        async getProductsAutoComplete(parent, { input }, { req }, info) {
            try {

                //Validate Input
                await validateInput(validators.productsAutoCompleteQueryValidator, req);

                const query: string = (input.query.replace(/[^0-9a-zA-Z]/g, ' ')).trim().toLowerCase();
                let suggestions: productService.IProductSuggestion[] = [];

                if (query) {
                    suggestions = await productService.getProductsAutoComplete(query);
                    suggestions = suggestions.map((suggestion) => {
                        let color = suggestion.color?.split(" ").pop()?.toLowerCase() ?? "";
                        if (color && query.includes(color)) {
                            suggestion.productName = `${color} ${suggestion.productName}`
                        }
                        return suggestion;
                    })
                }

                let response = {
                    suggestions: suggestions
                }

                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },

        async getRelatedProducts(parent, { input }, { req }, info) {
            try {

                //Validate Input
                await validateInput(validators.relatedProductsQueryValidator, req);
                const _id: Types.ObjectId = new Types.ObjectId(input._id);
                const limit: number = input.limit || 12;


                const product = await productService.getProductWithId(_id, { _id: 1, categoryId: 1, productCode: 1 }, { lean: true });
                if (!product) {
                    throw new GraphQLError("product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }
                let productData: productService.IProduct = product;
                if (!productData.categoryId) {
                    throw new GraphQLError("category not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const options: QueryOptions = { productCode: productData.productCode, categoryId: productData.categoryId, limit: limit };

                const records = await productService.getProductsByCategory(options);
                if (!records || records.length === 0) {
                    throw new GraphQLError("Related products not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                let response = {
                    records: records
                }

                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },

    },

}