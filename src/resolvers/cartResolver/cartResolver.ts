import { jwtService, productService, cartService, settingsService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./cartValidator";
import { GraphQLError } from "graphql";
import { validateInput, verifyMobileUser, verifyUser } from "../../middlewares";
import { Types } from "mongoose";

export const cartResolver: Resolvers = {
    Upload: GraphQLUpload,

    Mutation: {
        addToCart: async (parent, { input }, { req }, info) => {

            try {
                await verifyUser(req);
                await validateInput(validators.addToCartValidator, req);
                const quantity: number = input.quantity;
                const userId: Types.ObjectId = req.authAccount._id;
                const productId: Types.ObjectId = new Types.ObjectId(input.productId);

                const shippingConfig = await settingsService.getShippingConfig({}, { sort: { _id: 1 } })
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
                if (product.stock !== undefined && product.stock < quantity) {
                    throw new GraphQLError("No enough stock", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: []
                        }
                    });
                }

                const cart = await cartService.checkCartExist(userId)
                if (cart) {

                    let itemExist = false;

                    for (let item of cart.products) {
                        if (item.productId.equals(productId)) {
                            itemExist = true;
                            break;
                        }
                    }

                    if (itemExist) {
                        await cartService.editQuantityOfItem(productId, userId, quantity);
                    }
                    else {
                        await cartService.addItem(productId, userId, quantity);

                    }
                } else {
                    try {
                        const shippingCharge = shippingConfig?.shippingCharge || 0; 
                        const subTotal = product.sellingPrice * quantity;
                        const grandTotal = subTotal + shippingCharge;
                        await cartService.createCart(input.productId, userId, quantity,shippingCharge,grandTotal,subTotal);
                    } catch (error) {
                        console.log(error);
                    }
                }

                const response = {
                    message: "Items added to cart",

                }
                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }

        },
        // Add to cart in mobile
        addToCartInMobile: async (parent, { input }, { req }, info) => {
            try {
                await verifyMobileUser(req);
                await validateInput(validators.addToCartValidator, req);
                const quantity: number = input.quantity;
                const userId: Types.ObjectId = req.authAccount._id;
                const productId: Types.ObjectId = new Types.ObjectId(input.productId);
                const shippingConfig = await settingsService.getShippingConfig({}, { sort: { _id: 1 } })

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
                if (product.stock !== undefined && product.stock < quantity) {
                    throw new GraphQLError("No enough stock", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: []
                        }
                    });
                }

                const cart = await cartService.checkCartExist(userId)
                if (cart) {

                    let itemExist = false;

                    for (let item of cart.products) {
                        if (item.productId.equals(productId)) {
                            itemExist = true;
                            break;
                        }
                    }

                    if (itemExist) {
                        await cartService.editQuantityOfItem(productId, userId, quantity);
                    }
                    else {
                        await cartService.addItem(productId, userId, quantity);
                    }
                } else {
                    try {
                        const shippingCharge = shippingConfig?.shippingCharge || 0; 
                        const subTotal = product.sellingPrice * quantity;
                        const grandTotal = subTotal + shippingCharge;
                        await cartService.createCart(input.productId, userId, quantity,shippingCharge,grandTotal,subTotal);
                    } catch (error) {
                        console.log(error);
                    }
                }

                const response = {
                    message: "Items added to cart",

                }
                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },

        
        bulkAddToCart: async (parent, { input }, { req }, info) => {

            try {
                await verifyUser(req);
                await validateInput(validators.bulkAddToCartValidator, req);

                const products: cartService.IUserCartProduct[] = input.products || [];
                const userId: Types.ObjectId = req.authAccount._id;

                const cart = await cartService.checkCartExist(userId)
                if (cart) {
                    let temp = [];
                    for (let product of products) {
                        let itemExist = false;
                        for (let item of cart.products) {
                            if (item.productId.equals(product.productId)) {
                                itemExist = true;
                                item.quantity += product.quantity;
                                break;
                            }
                        }
                        if (!itemExist) {
                            temp.push({ productId: product.productId, quantity: product.quantity });
                        }
                    }
                    if (temp.length) {
                        cart.products = cart.products.concat(temp);
                        await cart.save();
                    }
                    cart.products = temp;
                    await cart.save();

                } else {
                    try {
                        await cartService.createBulkCart(userId, products);
                    } catch (error) {
                        console.log(error);
                    }
                }

                const response = {
                    message: "Items added to cart",

                }
                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }

        },
        bulkAddToCartInMobile: async (parent, { input }, { req }, info) => {
            try {
                await verifyMobileUser(req);
                await validateInput(validators.bulkAddToCartValidator, req);

                const products: cartService.IUserCartProduct[] = input.products || [];
                const userId: Types.ObjectId = req.authAccount._id;

                const cart = await cartService.checkCartExist(userId)
                if (cart) {
                    let temp = [];
                    for (let product of products) {
                        let itemExist = false;
                        for (let item of cart.products) {
                            if (item.productId.equals(product.productId)) {
                                itemExist = true;
                                item.quantity += product.quantity;
                                break;
                            }
                        }
                        if (!itemExist) {
                            temp.push({ productId: product.productId, quantity: product.quantity });
                        }
                    }
                    if (temp.length) {
                        cart.products = cart.products.concat(temp);
                        await cart.save();
                    }
                    cart.products = temp;
                    await cart.save();

                } else {
                    try {
                        await cartService.createBulkCart(userId, products);
                    } catch (error) {
                        console.log(error);
                    }
                }

                const response = {
                    message: "Items added to cart",

                }
                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }

        },


        removeFromCart: async (parent, { input }, { req }, info) => {

            try {
                await verifyUser(req);
                await validateInput(validators.removeFromCartValidator, req);
                const userId: Types.ObjectId = req.authAccount._id;
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
                const cart = await cartService.checkCartExist(userId)
                if (cart) {
                    const itemExist = await cartService.checkItemExists(productId);
                    if (itemExist) {
                        try {
                            await cartService.removeItem(productId, userId);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    else {
                        throw new GraphQLError("Product does not exist in cart", {
                            extensions: {
                                code: "INTERNAL_SERVER_ERROR",
                                errors: []
                            }
                        });
                    }
                } else {
                    throw new GraphQLError("Cart does not exist", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: []
                        }
                    });
                }

                const response = {
                    message: "Items removed from cart",

                }
                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }

        },

        removeFromCartInMobile: async (parent, { input }, { req }, info) => {

            try {
                await verifyMobileUser(req);
                await validateInput(validators.removeFromCartValidator, req);
                const userId: Types.ObjectId = req.authAccount._id;
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
                const cart = await cartService.checkCartExist(userId)
                if (cart) {
                    const itemExist = await cartService.checkItemExists(productId);
                    if (itemExist) {
                        try {
                            await cartService.removeItem(productId, userId);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    else {
                        throw new GraphQLError("Product does not exist in cart", {
                            extensions: {
                                code: "INTERNAL_SERVER_ERROR",
                                errors: []
                            }
                        });
                    }
                } else {
                    throw new GraphQLError("Cart does not exist", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: []
                        }
                    });
                }

                const response = {
                    message: "Items removed from cart",

                }
                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }


        },

        updateCartQuantity: async (parent, { input }, { req }, info) => {
            try {
                await verifyUser(req);
                await validateInput(validators.updateCartValidator, req);
                const userId: Types.ObjectId = req.authAccount._id;
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

                if (product.stock !== undefined && product.stock < input.quantity) {
                    throw new GraphQLError("No enough stock", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: []
                        }
                    });
                }
                const cart = await cartService.checkCartExist(userId)
                if (cart) {
                    const itemExist = await cartService.checkItemExists(productId);
                    if (itemExist) {
                        try {
                            await cartService.updateQuantity(productId, userId, input.quantity);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    else {
                        throw new GraphQLError("Product does not exist in cart", {
                            extensions: {
                                code: "INTERNAL_SERVER_ERROR",
                                errors: []
                            }
                        });
                    }
                } else {
                    throw new GraphQLError("Cart does not exist", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: []
                        }
                    });
                }
                const response = {
                    message: "Quantity updated",

                }
                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        },
        updateCartQuantityInMobile: async (parent, { input }, { req }, info) => {
            try {
                await verifyMobileUser(req);
                await validateInput(validators.updateCartValidator, req);
                const userId: Types.ObjectId = req.authAccount._id;
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

                if (product.stock !== undefined && product.stock < input.quantity) {
                    throw new GraphQLError("No enough stock", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: []
                        }
                    });
                }
                const cart = await cartService.checkCartExist(userId)
                if (cart) {
                    const itemExist = await cartService.checkItemExists(productId);
                    if (itemExist) {
                        try {
                            await cartService.updateQuantity(productId, userId, input.quantity);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    else {
                        throw new GraphQLError("Product does not exist in cart", {
                            extensions: {
                                code: "INTERNAL_SERVER_ERROR",
                                errors: []
                            }
                        });
                    }
                } else {
                    throw new GraphQLError("Cart does not exist", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: []
                        }
                    });
                }
                const response = {
                    message: "Quantity updated",

                }
                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        }
    },
    Query: {
        getCart: async (parent, { }, { req }, info) => {
            try {
                await verifyUser(req);
                const userId: Types.ObjectId = new Types.ObjectId(req.authAccount._id)
                const cart = await cartService.getCart(userId);
                const user_Id = userId;

                const shippingConfig = await settingsService.getShippingConfig({}, { sort: { _id: 1 } })

                if (!shippingConfig) {
                    throw new GraphQLError("Settings not found", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: [],
                        },
                    });
                }

                let subTotal = 0;
                let grandTotal = 0;
                let discount = 0;
                let deliveryCharge = shippingConfig.shippingCharge || 0;
                let validList = [];
                let updateList = [];

                if (cart && cart.length) {
                    for (let product of cart) {
                        if (!product ||
                            !product.name ||
                            product.isBlocked ||
                            product.stock <= 0) {
                            updateList.push(cartService.removeItem(product.productId, user_Id));
                            continue;
                        }
                        if (product.quantity > 10) {
                            product.quantity = product.stock < 10 ? product.stock : 10;
                            updateList.push(cartService.updateQuantity(product.productId, user_Id, product.quantity));
                        }
                        else if (product.quantity > product.stock) {
                            product.quantity = product.stock;
                            updateList.push(cartService.updateQuantity(product.productId, user_Id, product.quantity));
                        }
                        subTotal += product.quantity * product.sellingPrice;
                        delete product.isBlocked;
                        validList.push({ ...product, image: product.image.fileURL });
                    }

                    await Promise.all(updateList);
                }

                if (subTotal >= shippingConfig.freeShippingThreshold!) {
                    deliveryCharge = 0;
                }


                grandTotal = parseFloat((subTotal + deliveryCharge).toFixed(2));



                const response = {
                    products: validList,
                    grandTotal,
                    deliveryCharge,
                    subTotal
                }
                return response
            } catch (error) {
                console.log(error);
                throw error;
            }

        },
        getCartInMobile: async (parent, { }, { req }, info) => {
            try {
                await verifyMobileUser(req);
                const userId: Types.ObjectId = new Types.ObjectId(req.authAccount._id)
                const cart = await cartService.getCart(userId);
                const user_Id = userId;

                const shippingConfig = await settingsService.getShippingConfig({}, { sort: { _id: 1 } })

                if (!shippingConfig) {
                    throw new GraphQLError("Settings not found", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: [],
                        },
                    });
                }

                let subTotal = 0;
                let grandTotal = 0;
                let discount = 0;
                let deliveryCharge = shippingConfig.shippingCharge || 0;
                let validList = [];
                let updateList = [];

                if (cart && cart.length) {
                    for (let product of cart) {
                        if (!product ||
                            !product.name ||
                            product.isBlocked ||
                            product.stock <= 0) {
                            updateList.push(cartService.removeItem(product.productId, user_Id));
                            continue;
                        }
                        if (product.quantity > 10) {
                            product.quantity = product.stock < 10 ? product.stock : 10;
                            updateList.push(cartService.updateQuantity(product.productId, user_Id, product.quantity));
                        }
                        else if (product.quantity > product.stock) {
                            product.quantity = product.stock;
                            updateList.push(cartService.updateQuantity(product.productId, user_Id, product.quantity));
                        }
                        subTotal += product.quantity * product.sellingPrice;
                        delete product.isBlocked;
                        validList.push({ ...product, image: product.image.fileURL });
                    }

                    await Promise.all(updateList);
                }

                if (subTotal >= shippingConfig.freeShippingThreshold!) {
                    deliveryCharge = 0;
                }


                grandTotal = parseFloat((subTotal + deliveryCharge).toFixed(2));



                const response = {
                    products: validList,
                    grandTotal,
                    deliveryCharge,
                    subTotal
                }
                return response
            } catch (error) {
                console.log(error);
                throw error;
            }

        }
    }
};

