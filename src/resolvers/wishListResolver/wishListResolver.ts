import { jwtService, productService, cartService, wishListService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./wishListValidator";
import { GraphQLError } from "graphql";
import { validateInput, verifyUser, } from "../../middlewares";
import { Types } from "mongoose";

export const wishListResolver: Resolvers = {
    Upload: GraphQLUpload,

    Mutation: {
        addToWishList: async (parent, { input }, { req }, info) => {
            try {

                await verifyUser(req);
                await validateInput(validators.addToWishListValidator, req);
                const userId = req.authAccount._id;
                const productId = input.productId;

                const product = await productService.getProductWithFilters({ _id: productId }, { _id: 1 }, { lean: true });

                if (!product) {
                    throw new GraphQLError("Product not found", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: []
                        }
                    });
                }
                if (product.isBlocked) {
                    throw new GraphQLError("Product is blocked", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: []
                        }
                    });
                }

                const wishlist = await wishListService.getWishList(userId)
                if (wishlist) {
                    let flag = false;
                    for (let item of wishlist.products || []) {
                        if (item.productId.equals(productId)) {
                            flag = true;
                            break;
                        }
                    }
                    if (!flag) {
                        wishlist.products?.push({ productId: productId });
                    }
                    await wishlist.save();

                } else {
                    await wishListService.createWishlist(productId, userId);
                }
                const response = {
                    message: "Product added to wishlist",
                }
                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }

        },
        addToWishListInMobile: async (parent, { input }, { req }, info) => {
            try {

                await verifyUser(req);
                await validateInput(validators.addToWishListInMobileValidator, req);
                const userId = req.authAccount._id;
                const productId = input.productId;

                const product = await productService.getProductWithFilters({ _id: productId }, { _id: 1 }, { lean: true });

                if (!product) {
                    throw new GraphQLError("Product not found", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: []
                        }
                    });
                }
                if (product.isBlocked) {
                    throw new GraphQLError("Product is blocked", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: []
                        }
                    });
                }

                const wishlist = await wishListService.getWishList(userId)
                if (wishlist) {
                    let flag = false;
                    for (let item of wishlist.products || []) {
                        if (item.productId.equals(productId)) {
                            flag = true;
                            break;
                        }
                    }
                    if (!flag) {
                        wishlist.products?.push({ productId: productId });
                    }
                    await wishlist.save();

                } else {
                    await wishListService.createWishlist(productId, userId);
                }
                const response = {
                    message: "Product added to wishlist",
                }
                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }

        },

        removeFromWishList: async (parent, { input }, { req }, info) => {
            await verifyUser(req);
            await validateInput(validators.removeFromWishListValidator, req);
            const userId: Types.ObjectId = req.authAccount._id;
            const productId: Types.ObjectId = new Types.ObjectId(input.productId);

            await wishListService.removeItemFromWishList(productId, userId);

            const response = {
                message: "Product removed from wishlist",

            }

            return response;
        },
        removeFromWishListInMobile: async (parent, { input }, { req }, info) => {
            await verifyUser(req);
            await validateInput(validators.removeFromWishListInMobileValidator, req);
            const userId: Types.ObjectId = req.authAccount._id;
            const productId: Types.ObjectId = new Types.ObjectId(input.productId);

            await wishListService.removeItemFromWishList(productId, userId);

            const response = {
                message: "Product removed from wishlist",

            }

            return response;
        },
    },
    Query: {
        getWishListProducts: async (parent, { }, { req }, info) => {
            await verifyUser(req);
            const userId: Types.ObjectId = req.authAccount._id;

            const products = await wishListService.getWishListProducts(userId);

            const removeProducts = products.filter((product) => {
                return product.isBlocked || !product.productName
            });

            if (removeProducts.length) {
                try {
                    let promiseChain = [];
                    for (let product of removeProducts) {
                        promiseChain.push(
                            wishListService.removeItemFromWishList(product.productId, userId)
                        );
                    }
                    await Promise.all(promiseChain);
                } catch (error) {
                    console.log(error);
                }
            }

            const response = {
                products: products.filter((product) => !product.isBlocked && product.productName)
            }

            return response;
        },
        getWishListProductsInMobile: async (parent, { }, { req }, info) => {
            await verifyUser(req);
            const userId: Types.ObjectId = req.authAccount._id;

            const products = await wishListService.getWishListProducts(userId);

            const removeProducts = products.filter((product) => {
                return product.isBlocked || !product.productName
            });

            if (removeProducts.length) {
                try {
                    let promiseChain = [];
                    for (let product of removeProducts) {
                        promiseChain.push(
                            wishListService.removeItemFromWishList(product.productId, userId)
                        );
                    }
                    await Promise.all(promiseChain);
                } catch (error) {
                    console.log(error);
                }
            }

            const response = {
                products: products.filter((product) => !product.isBlocked && product.productName)
            }

            return response;
        },
        getWishListProductStatus: async (parent, { input }, { req }, info) => {
            await verifyUser(req);
            await validateInput(validators.wishListItemExistsValidator, req);
            const userId: Types.ObjectId = req.authAccount._id;
            const productId = input.productId;

            const product = await wishListService.checkItemExists(productId);

            const response = {
                isExist: product ? true : false
            }
            return response;
        },
        getWishListProductStatusInMobile: async (parent, { input }, { req }, info) => {
            await verifyUser(req);
            await validateInput(validators.wishListItemExistsInMobileValidator, req);
            const userId: Types.ObjectId = req.authAccount._id;
            const productId = input.productId;

            const product = await wishListService.checkItemExists(productId);

            const response = {
                isExist: product ? true : false
            }
            return response;
        }
    }

};

