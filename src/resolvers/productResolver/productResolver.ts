import { Resolvers } from "../../_generated_/resolvers-types";
import { categoryService, orderProductService, productService, spaceService } from "../../services";
import * as validators from "./productValidator";
import { validateInput, verifyAdmin, verifyVendor } from "../../middlewares";
import { createWriteStream } from 'fs';
import { GraphQLUpload } from "graphql-upload-ts";
import path from "path";
import { ObjectId, QueryOptions, Types } from "mongoose";
import { GraphQLError } from "graphql";
import { filePaths } from "../../configs";

export const productResolver: Resolvers = {
    Mutation: {
        // uploadProductFile: async (parent, { file }, info) => {
        //     const { createReadStream, filename, mimetype, encoding } = await file;
        //     const uploadDir = path.join(path.dirname(path.dirname(path.dirname(__dirname))), "uploads");

        //     const stream = createReadStream();
        //     const writeStream = createWriteStream(`${uploadDir}/${Date.now()}${filename}`);

        //     await new Promise((resolve, reject) => {
        //         stream.pipe(writeStream);
        //         writeStream.on('finish', resolve);
        //         writeStream.on('error', reject);
        //     });

        //     return { filename, mimetype, encoding };
        // },

        createProduct: async (parent, { input, images, productDetailImages }, { req }, info) => {
            try {
                await verifyVendor(req);
                await validateInput(validators.createProductValidator, req);

                const vendorId = req.authAccount._id;


                images = images || [];


                let productImages = [];

                for (let image of images) {
                    const { createReadStream, filename, mimetype, encoding } = await image;
                    const key = spaceService.getFileKey(filePaths.products, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    productImages.push({
                        fileType: "PUBLIC",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    });
                }

                productDetailImages = productDetailImages || [];

                let detailImages = [];

                for (let image of productDetailImages) {
                    const { createReadStream, filename, mimetype, encoding } = await image;
                    const key = spaceService.getFileKey(filePaths.productDetails, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    detailImages.push({
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

                    categoryName = categoryNames.join("/");
                }

                let productCode: number;
                let productCodeCount = await productService.getLatestProductCode();
                productCode = productCodeCount + 1;

                let tags: string[] = [];
                if (input.tags) {
                    const inputTags: string = input.tags;
                    tags = inputTags.split(',').map(tag => tag.trim());
                }

                let attributes: Types.ObjectId[] = (input.attributes || []).filter(Boolean) as [];

                // Explicitly define the type of result based on your Mongoose model
                const attributeIdsArray = attributes.map(attr => new Types.ObjectId(attr)) || []; // Assuming the field is named 'attributes'

                const attributeData = await productService.getProductsAttributesData(attributeIdsArray);


                newProduct = {
                    vendorId: vendorId,
                    brandId: input.brandId || "",
                    brandName: input.brandName || "",
                    productName: input?.productName || "",
                    shortDescription: input?.shortDescription || "",
                    skuId: input?.skuId || "",
                    description: input?.description || "",
                    productInfo: (input.productInfo || []).filter(Boolean) as [],
                    productShortInfo: input?.productShortInfo || input?.productName,
                    rating: input?.rating || 0,
                    sellingPrice: input?.sellingPrice || 0,
                    price: input?.price || 0,
                    mrp: input?.mrp || 0,
                    isBlocked: false,
                    tags: tags || [],
                    stock: input?.stock || 0,
                    images: productImages || [],
                    productDetailImages: detailImages || [],
                    categoryId: input.categoryId || "",
                    categoryNamePath: categoryName,
                    categoryIdPath: categoryIdPath,
                    productCode: productCode,
                    status: "UNDER_VERIFICATION",
                    attributes: attributeData,
                    offerPrice: input.offerPrice || 0,
                    delivery_type: input.delivery_type || "",
                    returnPolicy: input.returnPolicy
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

        createVariant: async (parent, { input, images, productDetailImages }, { req }, info) => {
            try {
                await verifyVendor(req);
                await validateInput(validators.createVariantValidator, req);
                const vendorId = req.authAccount._id;

                images = images || [];

                let productImages = [];

                for (let image of images) {
                    const { createReadStream, filename, mimetype, encoding } = await image;
                    const key = spaceService.getFileKey(filePaths.products, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    productImages.push({
                        fileType: "PUBLIC",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    });
                }

                productDetailImages = productDetailImages || [];

                let detailImages = [];

                for (let image of productDetailImages) {
                    const { createReadStream, filename, mimetype, encoding } = await image;
                    const key = spaceService.getFileKey(filePaths.productDetails, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    detailImages.push({
                        fileType: "PUBLIC",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    });
                }


                let newProduct: productService.IProduct = {};

                let productCode: number = input.productCode;

                const variant = await productService.getProductWithFilters({ productCode: productCode, vendorId: vendorId }, {}, { lean: true });
                if (!variant) {
                    throw new GraphQLError("Product not found", {
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

                let attributes: Types.ObjectId[] = (input.attributes || []).filter(Boolean) as [];

                // Explicitly define the type of result based on your Mongoose model
                const attributeIdsArray = attributes.map(attr => new Types.ObjectId(attr)) || []; // Assuming the field is named 'attributes'

                const existingProduct = await productService.getProductsVairantsIds(productCode);

                if (!existingProduct || existingProduct.length === 0) {
                    throw new GraphQLError("Product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const inputAttrIds = attributes.map(attr => attr.toString()) || [];

                // Validate that input attributeValueIds are a subset of existing attributeValueIds
                if (inputAttrIds.every(id => existingProduct[0].existAttrIds.includes(id))) {
                    throw new GraphQLError("Variant already exist!");
                }

                const attributeData = await productService.getProductsAttributesData(attributeIdsArray);

                newProduct = {
                    vendorId: vendorId,
                    brandId: variant.brandId,
                    brandName: variant.brandName,
                    productName: input?.productName || variant.productName,
                    shortDescription: input?.shortDescription || variant.shortDescription,
                    skuId: input?.skuId || variant.skuId,
                    description: input?.description || variant.description,
                    productInfo: (input.productInfo || variant.productInfo || []).filter(Boolean) as [],
                    productShortInfo: input?.productShortInfo || variant.productShortInfo,
                    rating: input?.rating || variant.rating,
                    sellingPrice: input?.sellingPrice || 0,
                    price: input?.price || 0,
                    mrp: input?.mrp || 0,
                    isBlocked: false,
                    tags: tags || [],
                    stock: input?.stock || 0,
                    images: productImages || [],
                    productDetailImages: detailImages || [],
                    categoryId: variant.categoryId,
                    categoryNamePath: variant.categoryNamePath,
                    categoryIdPath: variant.categoryIdPath,
                    productCode: productCode,
                    status: "UNDER_VERIFICATION",
                    attributes: attributeData,
                    offerPrice: 0,
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

        updateProduct: async (parent, { input, images, productDetailImages }, { req }, info) => {
            try {
                await verifyVendor(req);
                await validateInput(validators.productUpdateValidator, req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);
                const vendorId = req.authAccount._id;

                const existingProduct: productService.IProductDocument | null = await productService.getProductWithFilters({ _id: _id, vendorId: vendorId }, {}, {});
                if (!existingProduct) {
                    throw new GraphQLError("Product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                images = images || [];

                let productImages = [];

                for (let image of images) {
                    if (!image) {
                        continue;
                    }
                    const { createReadStream, filename, mimetype, encoding } = await image;
                    if (!createReadStream) {
                        continue;
                    }
                    const key = spaceService.getFileKey(filePaths.products, filename, []);
                    const stream = createReadStream();
                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);
                    productImages.push({
                        fileType: "PUBLIC",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    });
                }

                productDetailImages = productDetailImages || [];

                let detailImages = [];

                for (let image of productDetailImages) {
                    if (!image) {
                        continue;
                    }
                    const { createReadStream, filename, mimetype, encoding } = await image;
                    if (!createReadStream) {
                        continue;
                    }
                    const key = spaceService.getFileKey(filePaths.productDetails, filename, []);
                    const stream = createReadStream();
                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);
                    detailImages.push({
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

                if (input.productName && existingProduct.productName !== input.productName) {
                    existingProduct.productName = input.productName;
                }


                if (input.shortDescription && existingProduct.shortDescription !== input.shortDescription) {
                    existingProduct.shortDescription = input.shortDescription;
                }

                if (input.brandId && existingProduct.brandId !== input.brandId) {
                    existingProduct.brandId = input.brandId;
                }

                if (input.brandName && existingProduct.brandName !== input.brandName) {
                    existingProduct.brandName = input.brandName;
                }

                if (input.productInfo) {
                    existingProduct.productInfo = (input.productInfo || []).filter(Boolean) as [];
                }

                if (input.remarks) {
                    existingProduct.remarks = input.remarks as string[];
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

                if (input.rating && input.rating > 0 && existingProduct.rating !== input.rating) {
                    existingProduct.rating = input.rating;
                }

                if (input.sellingPrice && input.sellingPrice > 0 && existingProduct.sellingPrice !== input.sellingPrice) {
                    existingProduct.sellingPrice = input.sellingPrice;
                }

                if (input.price && input.price > 0 && existingProduct.price !== input.price) {
                    existingProduct.price = input.price;
                }

                if (input.mrp && input.mrp > 0 && existingProduct.mrp !== input.mrp) {
                    existingProduct.mrp = input.mrp;
                }


                if (input.stock && input.stock >= 0) {
                    existingProduct.stock = input.stock;
                }

                if (productImages.length > 0) {
                    existingProduct.images = productImages;
                }

                if (detailImages.length > 0) {
                    existingProduct.productDetailImages = detailImages;
                }

                if (input.delivery_type && existingProduct.delivery_type !== input.delivery_type) {

                    existingProduct.delivery_type = input.delivery_type;
                }

                existingProduct.returnPolicy = input.returnPolicy



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


        updateProductByAdmin: async (parent, { input, images, productDetailImages }, { req }, info) => {
            try {
                await verifyAdmin(req);
                await validateInput(validators.productUpdateByAdminValidator, req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);


                const existingProduct: productService.IProductDocument | null = await productService.getProductWithFilters({ _id: _id }, {}, {});
                if (!existingProduct) {
                    throw new GraphQLError("Product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                images = images || [];

                let productImages = [];

                for (let image of images) {
                    const { createReadStream, filename, mimetype, encoding } = await image;
                    const key = spaceService.getFileKey(filePaths.products, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    productImages.push({
                        fileType: "PUBLIC",
                        fileURL: file.location,
                        mimeType: mimetype,
                        originalName: filename
                    });
                }

                productDetailImages = productDetailImages || [];

                let detailImages = [];

                for (let image of productDetailImages) {
                    const { createReadStream, filename, mimetype, encoding } = await image;
                    const key = spaceService.getFileKey(filePaths.productDetails, filename, []);

                    const stream = createReadStream();

                    const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

                    detailImages.push({
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

                if (input.productName && existingProduct.productName !== input.productName) {
                    existingProduct.productName = input.productName;
                }

                if (input.shortDescription && existingProduct.shortDescription !== input.shortDescription) {
                    existingProduct.shortDescription = input.shortDescription;
                }

                if (input.brandId && existingProduct.brandId !== input.brandId) {
                    existingProduct.brandId = input.brandId;
                }

                if (input.brandName && existingProduct.brandName !== input.brandName) {
                    existingProduct.brandName = input.brandName;
                }

                if (input.productInfo) {
                    existingProduct.productInfo = (input.productInfo || []).filter(Boolean) as [];
                }

                if (input.remarks) {
                    existingProduct.remarks = input.remarks as string[];
                }

                if (input.productShortInfo && existingProduct.productShortInfo !== input.shortDescription) {
                    existingProduct.productShortInfo = input.productShortInfo;
                }

                if (input.skuId && existingProduct.skuId !== input.skuId) {
                    existingProduct.skuId = input.skuId;
                }

                if (input.warehouseSkuId && existingProduct.warehouseSkuId !== input.warehouseSkuId) {
                    existingProduct.warehouseSkuId = input.warehouseSkuId;
                }

                if (input.description && existingProduct.description !== input.description) {
                    existingProduct.description = input.description;
                }

                if (input.rating && input.rating > 0 && existingProduct.rating !== input.rating) {
                    existingProduct.rating = input.rating;
                }

                if (input.sellingPrice && input.sellingPrice > 0 && existingProduct.sellingPrice !== input.sellingPrice) {
                    existingProduct.sellingPrice = input.sellingPrice;
                }

                if (input.price && input.price > 0 && existingProduct.price !== input.price) {
                    existingProduct.price = input.price;
                }

                if (input.mrp && input.mrp > 0 && existingProduct.mrp !== input.mrp) {
                    existingProduct.mrp = input.mrp;
                }

                if (input.isBlocked == false || input.isBlocked === true) {
                    existingProduct.isBlocked = input.isBlocked;
                }

                if (input.stock && input.stock >= 0) {
                    existingProduct.stock = input.stock;
                }

                if (productImages.length > 0) {
                    existingProduct.images = productImages;
                }

                if (input.status && existingProduct.status !== input.status) {
                    existingProduct.status = input.status;
                }

                if (detailImages.length > 0) {
                    existingProduct.productDetailImages = detailImages;
                }

                if (input.delivery_type && existingProduct.delivery_type !== input.delivery_type) {

                    existingProduct.delivery_type = input.delivery_type;
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
                    _id: result?._id?.toString() || "",
                    message: "Product updated successfully",
                };
                return response;
            } catch (error) {
                throw error;
            }
        },


        //  Update product status by vendor by under progress
        submitProductForPreviewByVendor: async (parent, { input }, { req }, info) => {
            try {
                await verifyVendor(req);
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

                // Hardcoded beacuse only one status is passing
                existingProduct.status = "UNDER_VERIFICATION";


                // Update the product
                const result = await existingProduct.save();

                if (!result) {
                    throw new GraphQLError("Product status updatation failed", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = {
                    _id: result?._id?.toString(),
                    message: "Product submitted for verification",
                };
                return response;
            } catch (error) {
                throw error;
            }
        },


        // deleteProduct: async (parent, { input }, { req }, info) => {
        //     try {
        //         await validateInput(validators.productDeleteValidator, req);
        //         await verifyAdmin(req);

        //         const _id: Types.ObjectId = new Types.ObjectId(input._id);
        //         const filter = { _id };
        //         const result = await productService.deleteProduct(filter);

        //         if (!result) {
        //             throw new GraphQLError("Record not found", {
        //                 extensions: {
        //                     code: "BAD_REQUEST",
        //                     errors: [],
        //                 },
        //             });
        //         }

        //         const response = {
        //             _id: result?._id?.toString() || "",
        //             message: "Product deleted successfully",
        //         };
        //         return response;
        //     } catch (error) {
        //         throw error;
        //     }
        // },


    },

    Query: {
        // Fetch each product by id detail by admin
        async getProductByAdmin(parent, { input }, { req }, info) {

            try {
                //Validate Input
                await validateInput(validators.productQueryValidator, req);
                await verifyAdmin(req);

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

                // product return policy data 

                const returnPolicyData = await productService.getProductReturnPolicy(result._id)


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


                if (returnPolicyData) {

                    response.product = { ...response.product, returnPolicyData }
                }


                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        },

        // Fetch each product by id detail by vendor
        async getProductByVendor(parent, { input }, { req }, info) {

            try {
                //Validate Input
                await validateInput(validators.productQueryValidator, req);
                // await verifyVendor(req);

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

                const returnPolicyData = await productService.getProductReturnPolicy(result._id)


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

                if (returnPolicyData) {

                    response.product = { ...response.product, returnPolicyData }
                }




                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        },

        //TODO 1
        // Fetch all product by admin
        async getProductsByAdmin(parent, { input }, { req }, info) {

            try {

                //Validate Input
                await validateInput(validators.adminProductsQueryValidator, req);
                await verifyAdmin(req);

                const status = input?.status || "";
                const vendorId: Types.ObjectId = input?.vendorId || null;
                const page: number = input?.page || 0;
                const size: number = input?.size || 1e6;
                const minPrice: number | null = input?.minPrice || null;
                const maxPrice: number | null = input?.maxPrice && input.maxPrice > 0 ? input.maxPrice : null;
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
                    newest,
                    priceLowToHigh,
                    priceHighToLow,
                    query,
                    projection,
                    parentCategory,
                    categories,
                    status,
                    vendorId
                }
                console.log("OPTION = ", options)
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
        // Fetch all product by admin
        async getProductsByAdminForCoupon(parent, { input }, { req }, info) {
            try {
                await verifyAdmin(req);
                console.log("Product input = ", input)

                const brands: string[] = (input?.brands || []).map((item: string | null) => {
                    return item ? new Types.ObjectId(item).toString() : '';
                }).filter((item) => item ? true : false);
                const categories: string[] = (input?.categories || []).map((item: string | null) => {
                    return item ? new Types.ObjectId(item).toString() : '';
                }).filter((item) => item ? true : false);


                const data = {
                    brands,
                    categories
                }
                const result = await productService.getProductsByAdminForCoupon(data);
                const response = {
                    records: result.records
                }
                return response;

            } catch (error) {
                throw error
            }
        },
        // fetch product in vendor side
        async getProductsByVendor(parent, { input }, { req }, info) {

            try {

                //Validate Input
                await validateInput(validators.vendorProductsQueryValidator, req);
                await verifyVendor(req);

                const vendorId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

                const status: string = input?.status || "";
                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                const minPrice: number | null = input?.minPrice || null;
                const maxPrice: number | null = input?.maxPrice && input.maxPrice > 0 ? input.maxPrice : null;
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


                const options: productService.IProductsByVendorOptions = {
                    vendorId,
                    page,
                    size,
                    minPrice,
                    maxPrice,
                    newest,
                    priceLowToHigh,
                    priceHighToLow,
                    query,
                    projection,
                    parentCategory,
                    categories,
                    status
                }

                const result = await productService.getProductsByVendorWithFilters(options);


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
        async getVariantsByAdmin(parent, { input }, { req }, info) {
            try {
                //Validate Input
                await validateInput(validators.variantsQueryValidator, req);
                // await verifyAdmin(req);

                const _id: Types.ObjectId = new Types.ObjectId(input._id);

                const page: number = input?.page || 0;
                const size: number = input?.size || 10;

                const product = await productService.getProductWithId(_id, { productCode: 1 }, { lean: true });
                if (!product) {
                    throw new GraphQLError("product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }
                let result: productService.IProduct = product;
                if (!result.productCode) {
                    throw new GraphQLError("variants not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const productCode = result.productCode;

                const options = { page, size, productCode }
                const variants = await productService.getAllProductVariantsByAdminWithProductCode(options);


                let response = {
                    maxRecords: variants.maxRecords,
                    records: variants.records,
                    message: "Variants feteched successfully"
                }

                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },

        // Fetch each product by id
        async getProduct(parent, { input }, { req }, info) {

            try {

                //Validate Input
                await validateInput(validators.productQueryValidator, req);

                const productId: Types.ObjectId = new Types.ObjectId(input._id);


                const result = await productService.getProductWithFilters({ _id: productId, isBlocked: false, status: "APPROVED" }, {}, { lean: true });
                const returnPolicyData = await productService.getProductReturnPolicy(result._id)

               


                if (!result) {
                    throw new GraphQLError("product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const response = {
                    product: { ...result, _id: result._id ? result._id.toString() : "" },

                }

                if (returnPolicyData) {

                    response.product = { ...response.product, returnPolicyData };


                }

                console.log("pro get ",response)

                return response;

            } catch (error) {
                console.log(error);
                throw error;
            }

        },

        // Fetch each product by id in mobile side
        async getProductInMobile(parent, { input }, { req }, info) {

            try {

                //Validate Input
                await validateInput(validators.productQueryValidator, req);

                const productId: Types.ObjectId = new Types.ObjectId(input._id);


                const result = await productService.getProductWithFilters({ _id: productId, isBlocked: false, status: "APPROVED" }, {}, { lean: true });
                const returnPolicyData = await productService.getProductReturnPolicy(result._id)

                // console.log(result)


                if (!result) {
                    throw new GraphQLError("product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }

                const response = {
                    product: { ...result, _id: result._id ? result._id.toString() : "" },
                }

                if (returnPolicyData) {

                    response.product = { ...response.product, returnPolicyData };


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
                const discount: number = input?.discount || 0;
                const minPrice: number | null = input?.minPrice || null;
                const maxPrice: number | null = input?.maxPrice && input.maxPrice > 0 ? input.maxPrice : null;
                const newest: boolean = input?.newest || false;
                const priceLowToHigh: boolean = input?.priceLowToHigh || false;
                const priceHighToLow: boolean = input?.priceHighToLow || false;
                const bestSeller: boolean = input?.bestSeller || false;
                const query: string = input?.query ? input.query.replace(/[^0-9a-zA-Z]/g, ' ') : '';
                const parentCategory: string = input?.parentCategory ? (new Types.ObjectId(input.parentCategory)).toString() : "";
                const categories: string[] = (input?.categories || []).map((item: string | null) => {
                    return item ? new Types.ObjectId(item).toString() : '';
                }).filter((item) => item ? true : false);

                const brands: string[] = (input?.brands || []).map((item: string | null) => {
                    return item ? new Types.ObjectId(item).toString() : '';
                }).filter((item) => item ? true : false);

                const attributes: Array<{ id: string, values: string[] }> = (input?.attributes || []).map((attribute) => {
                    return {
                        id: attribute?.id ? new Types.ObjectId(attribute.id).toString() : '',
                        values: (attribute?.values || []).filter((value): value is string => value !== null && value !== undefined),
                    };
                }).filter((attribute) => attribute.id && attribute.values.length > 0);

                const tags: string[] = (input?.tags || []).filter(Boolean) as [];

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

                let ids: Types.ObjectId[] = [];

                if (bestSeller) {
                    let result = await orderProductService.getBestSellingProducts();
                    ids = result.map((item) => item._id);
                }

                const options: productService.IProductsOptions = {
                    ids,
                    page,
                    size,
                    minPrice,
                    maxPrice,
                    newest,
                    priceLowToHigh,
                    priceHighToLow,
                    query,
                    projection,
                    parentCategory,
                    categories,
                    brands,
                    attributes,
                    tags,
                    discount
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

        // Products listing in mobile side
        async getProductsInMobile(parent, { input }, { req }, info) {

            try {
                //Validate Input
                await validateInput(validators.productsQueryValidator, req);
                const page: number = input?.page || 0;
                const size: number = input?.size || 10;
                const discount: number = input?.discount || 0;
                const minPrice: number | null = input?.minPrice || null;
                const maxPrice: number | null = input?.maxPrice && input.maxPrice > 0 ? input.maxPrice : null;
                const newest: boolean = input?.newest || false;
                const priceLowToHigh: boolean = input?.priceLowToHigh || false;
                const priceHighToLow: boolean = input?.priceHighToLow || false;
                const bestSeller: boolean = input?.bestSeller || false;
                const query: string = input?.query ? input.query.replace(/[^0-9a-zA-Z]/g, ' ') : '';
                const parentCategory: string = input?.parentCategory ? (new Types.ObjectId(input.parentCategory)).toString() : "";
                const categories: string[] = (input?.categories || []).map((item: string | null) => {
                    return item ? new Types.ObjectId(item).toString() : '';
                }).filter((item) => item ? true : false);

                const brands: string[] = (input?.brands || []).map((item: string | null) => {
                    return item ? new Types.ObjectId(item).toString() : '';
                }).filter((item) => item ? true : false);

                const attributes: Array<{ id: string, values: string[] }> = (input?.attributes || []).map((attribute) => {
                    return {
                        id: attribute?.id ? new Types.ObjectId(attribute.id).toString() : '',
                        values: (attribute?.values || []).filter((value): value is string => value !== null && value !== undefined),
                    };
                }).filter((attribute) => attribute.id && attribute.values.length > 0);

                const tags: string[] = (input?.tags || []).filter(Boolean) as [];

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

                let ids: Types.ObjectId[] = [];

                if (bestSeller) {
                    let result = await orderProductService.getBestSellingProducts();
                    ids = result.map((item) => item._id);
                }

                const options: productService.IProductsOptions = {
                    ids,
                    page,
                    size,
                    minPrice,
                    maxPrice,
                    newest,
                    priceLowToHigh,
                    priceHighToLow,
                    query,
                    projection,
                    parentCategory,
                    categories,
                    brands,
                    attributes,
                    tags,
                    discount
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


        async getVariants(parent, { input }, { req }, info) {
            try {

                //Validate Input
                await validateInput(validators.variantsQueryValidator, req);
                const _id: Types.ObjectId = new Types.ObjectId(input._id);


                const product = await productService.getProductWithId(_id, { productCode: 1 }, { lean: true });
                if (!product) {
                    throw new GraphQLError("product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }
                let result: productService.IProduct = product;
                if (!result.productCode) {
                    throw new GraphQLError("variants not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }
                let variants = await productService.getProductVariants(result.productCode);

                let response = {
                    variants: variants
                }

                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },

        async getVariantsInMobile(parent, { input }, { req }, info) {
            try {

                //Validate Input
                await validateInput(validators.variantsQueryValidator, req);
                const _id: Types.ObjectId = new Types.ObjectId(input._id);


                const product = await productService.getProductWithId(_id, { productCode: 1 }, { lean: true });
                if (!product) {
                    throw new GraphQLError("product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }
                let result: productService.IProduct = product;
                if (!result.productCode) {
                    throw new GraphQLError("variants not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: []
                        }
                    });
                }
                let variants = await productService.getProductVariants(result.productCode);

                let response = {
                    variants: variants
                }

                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },

        // Variants table for admin
        async getVariantsTableByAdmin(parent, { input }, { req }, info) {
            try {

                //Validate Input
                await validateInput(validators.adminVariantsTableQueryValidator, req);
                const productCode: number = input.productCode;


                let options = { productCode };

                let variants = await productService.getProductVariantsByAdminTable(options);

                let response = {
                    records: variants.records,
                    maxRecords: variants.maxRecords,
                    message: "Variants records fetched successfully",
                }

                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },

        // Variants table for admin
        async getVariantsTableByVendor(parent, { input }, { req }, info) {
            try {

                //Validate Input
                await verifyVendor(req);
                await validateInput(validators.variantsTableByVendorQueryValidator, req);

                const productCode: number = input.productCode;
                const vendorId: Types.ObjectId = req.authAccount._id;


                let options = { productCode, vendorId };

                let variants = await productService.getProductVariantsByVendorTable(options);

                let response = {
                    records: variants.records,
                    maxRecords: variants.maxRecords,
                    message: "Variants records fetched successfully",
                }

                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },

        async getProductsAutoComplete(parent, { input }, { req }, info) {
            try {

                //Validate Input
                await validateInput(validators.productsAutoCompleteQueryValidator, req);

                const query: string = (input.query.replace(/[^0-9a-zA-Z]/g, ' ')).trim().toLowerCase();
                let suggestions: productService.IProductSuggestion[] = [];

                if (query) {
                    suggestions = await productService.getProductsAutoComplete(query);
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
        async getProductsAutoCompleteInMobile(parent, { input }, { req }, info) {
            try {

                //Validate Input
                await validateInput(validators.productsAutoCompleteQueryValidator, req);

                const query: string = (input.query.replace(/[^0-9a-zA-Z]/g, ' ')).trim().toLowerCase();
                let suggestions: productService.IProductSuggestion[] = [];

                console.log(query, 'SEARCH QUERY');

                if (query) {
                    suggestions = await productService.getProductsAutoComplete(query);
                    console.log(suggestions, 'SUGGESTIONS')
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

        //TODO-3
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

                let response: any = {
                    records: records
                };

                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },
        async getRelatedProductsInMobile(parent, { input }, { req }, info) {
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

                let response: any = {
                    records: records
                };

                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },

        // Fetch max price
        async getProductsMaxPrice(parent, { input }, { req }, info) {
            try {

                //Validate Input
                await validateInput(validators.macPriceValidator, req);

                const categories: string[] = (input?.categories || []).map((item: string | null) => {
                    return item ? new Types.ObjectId(item).toString() : '';
                }).filter((item: any) => item ? true : false);



                const options: productService.IProductsPriceRangeOptions = {
                    categories,
                }

                const result = await productService.getProductsMaxPriceRangeWithCategories(options);

                const response = {
                    maxPrice: result,
                    message: "Products max price fetched successfully"
                }
                return response;
            } catch (error) {
                throw error;
            }

        },

        // Fetch max price
        async getProductsMaxPriceInMobile(parent, { input }, { req }, info) {
            try {

                //Validate Input
                await validateInput(validators.macPriceValidator, req);

                const categories: string[] = (input?.categories || []).map((item: string | null) => {
                    return item ? new Types.ObjectId(item).toString() : '';
                }).filter((item: any) => item ? true : false);



                const options: productService.IProductsPriceRangeOptions = {
                    categories,
                }

                const result = await productService.getProductsMaxPriceRangeWithCategories(options);

                const response = {
                    maxPrice: result,
                    message: "Products max price fetched successfully"
                }
                return response;
            } catch (error) {
                throw error;
            }

        },


    },


}