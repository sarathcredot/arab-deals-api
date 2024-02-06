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
                const userId: string = req.authAccount._id;
                const productId: Types.ObjectId = new Types.ObjectId(input.productId);

                const product = await productService.getProductWithFilters({ _id: productId }, {}, {});

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


                const wishlist = await wishListService.checkWishlistExist(userId)
                if (wishlist) {
                    const itemExist = await wishListService.checkItemExists(productId);
                    if (itemExist) {
                        throw new GraphQLError("Product already added to wishlist", {
                            extensions: {
                                code: "INTERNAL_SERVER_ERROR",
                                errors: []
                            }
                        });
                    } else {
                        try {
                            await wishListService.addItem(productId, userId);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                } else {
                    try {
                        await wishListService.createWishlist(productId, userId);
                    } catch (error) {
                        console.log(error);
                    }
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
            await validateInput(validators.addToWishListValidator, req);
            const userId: string = req.authAccount._id;
            const productId: Types.ObjectId = new Types.ObjectId(input.productId);

            const product = await productService.getProductWithFilters({ _id: productId }, {}, {});

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


            const wishlist = await wishListService.checkWishlistExist(userId)
            if (wishlist) {
                const itemExist = await wishListService.checkItemExists(productId);
                if (itemExist) {

                    try {
                        await wishListService.removeItem(productId, userId);
                    } catch (error) {
                        console.log(error);
                    }

                } else {
                    throw new GraphQLError("Product not exist in wishlist", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: []
                        }
                    });
                }
            } else {
                throw new GraphQLError("User Wishlist does not exist", {
                    extensions: {
                        code: "INTERNAL_SERVER_ERROR",
                        errors: []
                    }
                });
            }
            const response = {
                message: "Product removed from wishlist",

            }
            return response;
        },
    },
    Query: {
        async getWishList(parent, { }, { req }, info) {
            await verifyUser(req);
            const userId: string = req.authAccount._id;
            const wishlist = await wishListService.checkWishlistExist(userId)
            if (wishlist) {
                const products = wishlist.products.map((product: any) => product.productId.toString())
                return {products}
            } else {
                throw new GraphQLError("User Wishlist does not exist", {
                    extensions: {
                        code: "INTERNAL_SERVER_ERROR",
                        errors: []
                    }
                });
            }

        }
    }


};

