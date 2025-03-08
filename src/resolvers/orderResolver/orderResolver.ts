import {
  activityLogService,
  cartService,
  couponService,
  deliveryAgentService,
  notificationService,
  orderProductService,
  orderService,
  productService,
  settingsService,
  spaceService,
  userShippingAddressService,
} from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import * as validators from "./orderValidator";
import { GraphQLError } from "graphql";
import {
  verifyUser,
  verifyAdmin,
  validateInput,
  verifyVendor,
  verifyMobileUser,
} from "../../middlewares";
import { Types } from "mongoose";
import moment from "moment";
import { filePaths } from "../../configs";
import { GraphQLUpload } from "graphql-upload-ts";
import { cartModel } from "../../models/cartModel";
import { orderProductModel } from "../../models/orderProductModel";
import { adminModel } from "../../models/adminModel";
import { userModel } from "../../models/userModel";

export const orderResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {
    createUserOrder: async (parent, { input }, { req, io }, info) => {

      console.log("create user order resolver called");
      // console.log("io",io)
      await verifyUser(req);
      await validateInput(validators.createOrderValidator, req);

      const userId = req.authAccount._id;
      let { shippingAddressId, paymentMode, grandTotal } = input;

      const orderDate = moment();
      const orderId = `ORD-${orderDate.valueOf()}`;

      const shippingAddress =
        await userShippingAddressService.getShippingAddressWithFilters(
          { _id: shippingAddressId },
          {},
          { lean: true }
        );
      if (!shippingAddress) {
        throw new GraphQLError("Shipping Address not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      const [paymentConfig, shippingConfig] = await Promise.all([
        settingsService.getPaymentConfig({}, { sort: { _id: 1 } }),
        settingsService.getShippingConfig({}, { sort: { _id: 1 } }),
      ]);



      if (!paymentConfig || !shippingConfig) {
        throw new GraphQLError("Settings not found", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });
      }

      // console.log(shippingConfig)
      // console.log("shippingConfig.defaultReturnPolicy",shippingConfig.defaultReturnPolicy)
      let defaultReturnPolicyId = shippingConfig.defaultReturnPolicy


      if (paymentMode == "COD") {
        if (!paymentConfig.cod) {
          throw new GraphQLError("COD is disabled", {
            extensions: {
              code: "BAD_REQUEST",
              errors: [],
            },
          });
        }
      }

      const cartItems = await cartService.getOrderCart(userId);

      const uniqueVendorIds: Set<Types.ObjectId> = new Set();
      cartItems.forEach((item: any) => {
        if (item.vendorId) {
          uniqueVendorIds.add(item.vendorId);
        }
      });

      const vendorIds: Types.ObjectId[] = [...uniqueVendorIds];

      if (cartItems.length === 0) {
        throw new GraphQLError("Cart is empty", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      let calculatedSellingPrice = 0,
        calculatedShippingCharge = shippingConfig.shippingCharge || 0,
        calculatedGrandTotal = 0;

      for (let product of cartItems) {
        if (
          !product.name ||
          product.isBlocked ||
          product.sellingPrice <= 0 ||
          product.stock <= 0 ||
          product.quantity > product.stock
        ) {
          throw new GraphQLError("Cart changed, order failed", {
            extensions: {
              code: "BAD_REQUEST",
              errors: [],
            },
          });
        }
        calculatedSellingPrice += product.quantity * product.sellingPrice;
      }

      const userCart = await cartModel.findOne({ userId: userId })

      let appliedProducts: Types.ObjectId[] | null | undefined = userCart?.appliedProducts

      let totalDiscountPrice: number | undefined | null = 0;

      appliedProducts?.forEach((id) => {
        const product = cartItems.find((item) => item.productId.toString() === id.toString());
        if (product) {
          totalDiscountPrice = (totalDiscountPrice || 0) + product.sellingPrice
        }
      });


      const appliedProductCounts: Record<string, number> = {};

      appliedProducts?.forEach((id) => {
        const key = id.toString(); // Ensure consistent key format
        appliedProductCounts[key] = (appliedProductCounts[key] || 0) + 1;
      });



      const products: orderProductService.IOrderProduct[] = [];

      let itemCount = 0;

      for (const product of cartItems) {
        for (let i = 0; i < product.quantity; i++) {
          // console.log("This is product",product)
          let returnPolicyId = await orderService.getReturnPolicyForProduct(product.productId, defaultReturnPolicyId);
          let warrantyPolicyId = await orderService.getWarrantyPolicyForProduct(product.productId);
          console.log(warrantyPolicyId, "warrantyPolicyId")
          // console.log(returnPolicyId,"returnPolicyId")
          const returnPolicy = await orderService.getReturnPolicy(returnPolicyId)
          const warrantyPolicy = await orderService.getWarrantyPolicy(warrantyPolicyId)
          console.log(warrantyPolicy, "warrantyPolicy")
          // console.log(returnPolicy,"returnPolicy")

          itemCount++;
          const productIdKey = product.productId.toString();
          const isDiscounted = appliedProductCounts[productIdKey] && appliedProductCounts[productIdKey] > 0;
          let discountSellingPrice;
          if (isDiscounted) {
            // Decrease the count of the product ID in the appliedProductCounts map
            let actualSellingPrice = product.sellingPrice
            discountSellingPrice = Math.round((actualSellingPrice / (totalDiscountPrice || 0)) * (userCart?.discount || 0))
            appliedProductCounts[productIdKey]--;
          }

          products.push({
            userId: userId,
            productId: product.productId,
            orderId: orderId,
            itemId: `${orderId}-${itemCount}`,
            productName: product.name,
            shortDescription: product.shortDescription,
            skuId: product.skuId,
            warehouseSkuId: product.warehouseSkuId,
            image: {
              fileType: product.image?.fileType,
              fileURL: product.image?.fileURL,
              originalName: product.image?.originalName,
              mimeType: product.image?.mimeType,
            },
            returnPeriod: returnPolicy?.duration || 0,
            returnPolicyName: returnPolicy?.name,
            returnPolicyDescription: returnPolicy?.description,
            returnCharge: returnPolicy?.returnCharge || 0,
            mrp: product.mrp,
            sellingPrice: isDiscounted ? product.sellingPrice - (discountSellingPrice ?? 0) : product.sellingPrice,
            shippingCharge: 0,
            paymentMode: paymentMode,
            paymentStatus: "PENDING",
            orderDate: orderDate.toDate(),
            shippingStatus: "PENDING",
            vendorId: product.vendorId,
            warranty: {
              name: warrantyPolicy?.name,
              description: warrantyPolicy?.description,
              duration: warrantyPolicy?.duration,
              warrantyType: warrantyPolicy?.warrantyType,
              // warrantyRegister:true
            }
          });
        }
      };


      console.log(products, "products");

      if (calculatedSellingPrice < shippingConfig.freeShippingThreshold!) {
        products[0].shippingCharge = calculatedShippingCharge;
      } else {
        calculatedShippingCharge = 0;
      }

      calculatedGrandTotal = parseFloat(
        (calculatedSellingPrice + calculatedShippingCharge).toFixed(2)
      );

      // if (calculatedGrandTotal !== parseFloat(grandTotal.toFixed(2))) {
      //   throw new GraphQLError("Cart changed, order failed", {
      //     extensions: {
      //       code: "BAD_REQUEST",
      //       errors: [],
      //     },
      //   });
      // }


      const order: orderService.IOrder = {
        userId: userId,
        orderId: orderId,
        paymentMode: paymentMode,
        orderDate: orderDate.toDate(),
        shippingAddress: shippingAddress,
        orderStatus: "PENDING",
        vendorIds: vendorIds,
        grandTotal: userCart?.grandTotal,
        shippingCharge: userCart?.shippingCharge,
        subTotal: userCart?.subTotal,
        discount: userCart?.discount
      };

      await orderService.createOrder(order)
      const orderProducts = await orderProductService.createOrderProducts(products)

      console.log("order result", orderProducts)


      if (orderProducts) {
        for (const orderProduct of orderProducts) {
          await activityLogService.createActivityLog({
            actionType: "ORDER",
            action: "ORDER HAS BEEN PLACED",
            performedBy: userId,
            performedByRole: "USERS",
            referenceId: orderProduct?._id,
            referenceType: "ORDER_PRODUCTS",
            details: `${shippingAddress.firstname} placed an order ${orderProduct.orderId} through the website.  The order has been successfully registered in the system and is now waiting for processing.`,
          });
        }
      }



      // await Promise.all([
      //   orderService.createOrder(order),
      //   orderProductService.createOrderProducts(products),
      // ]);



      try {
        let productStock = cartItems.map((product) => {
          return { _id: product.productId, quantity: product.quantity };
        });
        await Promise.all([
          cartService.emptyUserCart(userId),
          productService.decreaseProductsStock(productStock),
          userShippingAddressService.updateDefaultShipingAddress(
            userId,
            shippingAddressId
          ),
        ]);
      } catch (error) {
        console.log(error);
      }

      if (userCart?.isCouponApplied) {
        const couponId = userCart?.appliedCoupon
        if (!couponId) {
          throw new GraphQLError("Coupon not found", {
            extensions: {
              code: "BAD_REQUEST",
              errors: [],
            },
          });
        }
        await couponService.updateUserUsage(userId, couponId)
        await couponService.deleteCouponFromCart(userId, couponId)
      }

      //create order placed notification


      const order_placed_notification = await notificationService.createNotification({
        title: "New order placed!!!!",
        message: `Order ${orderId} has been placed  by ${shippingAddress.firstname}.`,
        type: "new_order",
        permissions: ["orders", "shipping-orders"],
        orderId: orderId
      })


      io.emit("new_notification", order_placed_notification);
      // console.log("🔔 Notification sent to admin dashboard:", order_placed_notification);

      // console.log("emitted")


      // for (let product of cartItems) {
      //   console.log("this is products Product:", product);
      // }

      //check product stock(if low stock send notification to admin)

      for (let product of cartItems) {
        const previousStock = product.stock;
        const newStock = product.stock - product.quantity;
        if (previousStock > 10 && newStock <= 10) {

          console.log(product.stock)
          // Low stock notification
          const low_stock_notification = await notificationService.createNotification({
            title: "Low Stock Alert!!!",
            message: `Product ${product.name} (ID: ${product.productId}) is running low on stock.`,
            type: "low_stock",
            permissions: ["product"],
            orderId: orderId,
            productId: product.productId,
          });
          io.emit("new_notification", low_stock_notification);
        }

        if (previousStock > 0 && newStock <= 0) {
          // Out of stock notification
          const out_of_stock_notification = await notificationService.createNotification({
            title: "Out of Stock Alert!!!",
            message: `Product ${product.name} (ID: ${product.productId}) is out of stock and needs restocking.`,
            type: "out_of_stock",
            permissions: ["product"],
            orderId: orderId,
            productId: product.productId,
          });
          io.emit("new_notification", out_of_stock_notification);
        }
      }

      let response = {
        orderId: orderId,
      };

      return response;
    },

    createUserOrderInMobile: async (parent, { input }, { req }, info) => {
      console.log("create user order resolver called");
      await verifyUser(req);
      await validateInput(validators.createOrderValidator, req);

      const userId = req.authAccount._id;
      let { shippingAddressId, paymentMode, grandTotal } = input;

      const orderDate = moment();
      const orderId = `ORD-${orderDate.valueOf()}`;

      const shippingAddress =
        await userShippingAddressService.getShippingAddressWithFilters(
          { _id: shippingAddressId },
          {},
          { lean: true }
        );
      if (!shippingAddress) {
        throw new GraphQLError("Shipping Address not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      const [paymentConfig, shippingConfig] = await Promise.all([
        settingsService.getPaymentConfig({}, { sort: { _id: 1 } }),
        settingsService.getShippingConfig({}, { sort: { _id: 1 } }),
      ]);

      if (!paymentConfig || !shippingConfig) {
        throw new GraphQLError("Settings not found", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });
      }

      let defaultReturnPolicyId = shippingConfig.defaultReturnPolicy


      if (paymentMode == "COD") {
        if (!paymentConfig.cod) {
          throw new GraphQLError("COD is disabled", {
            extensions: {
              code: "BAD_REQUEST",
              errors: [],
            },
          });
        }
      }

      const cartItems = await cartService.getOrderCart(userId);

      const uniqueVendorIds: Set<Types.ObjectId> = new Set();
      cartItems.forEach((item: any) => {
        if (item.vendorId) {
          uniqueVendorIds.add(item.vendorId);
        }
      });

      const vendorIds: Types.ObjectId[] = [...uniqueVendorIds];

      if (cartItems.length === 0) {
        throw new GraphQLError("Cart is empty", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      let calculatedSellingPrice = 0,
        calculatedShippingCharge = shippingConfig.shippingCharge || 0,
        calculatedGrandTotal = 0;

      for (let product of cartItems) {
        if (
          !product.name ||
          product.isBlocked ||
          product.sellingPrice <= 0 ||
          product.stock <= 0 ||
          product.quantity > product.stock
        ) {
          throw new GraphQLError("Cart changed, order failed", {
            extensions: {
              code: "BAD_REQUEST",
              errors: [],
            },
          });
        }
        calculatedSellingPrice += product.quantity * product.sellingPrice;
      }

      const userCart = await cartModel.findOne({ userId: userId })

      let appliedProducts: Types.ObjectId[] | null | undefined = userCart?.appliedProducts

      let totalDiscountPrice: number | undefined | null = 0;

      appliedProducts?.forEach((id) => {
        const product = cartItems.find((item) => item.productId.toString() === id.toString());
        if (product) {
          totalDiscountPrice = (totalDiscountPrice || 0) + product.sellingPrice
        }
      });


      const appliedProductCounts: Record<string, number> = {};

      appliedProducts?.forEach((id) => {
        const key = id.toString(); // Ensure consistent key format
        appliedProductCounts[key] = (appliedProductCounts[key] || 0) + 1;
      });



      const products: orderProductService.IOrderProduct[] = [];

      let itemCount = 0;

      for (const product of cartItems) {
        for (let i = 0; i < product.quantity; i++) {
          // console.log("This is product",product)
          let returnPolicyId = await orderService.getReturnPolicyForProduct(product.productId, defaultReturnPolicyId);
          let warrantyPolicyId = await orderService.getWarrantyPolicyForProduct(product.productId);
          // console.log(returnPolicyId,"returnPolicyId")
          const returnPolicy = await orderService.getReturnPolicy(returnPolicyId)
          const warrantyPolicy = await orderService.getWarrantyPolicy(warrantyPolicyId)
          // console.log(returnPolicy,"returnPolicy")

          itemCount++;
          const productIdKey = product.productId.toString();
          const isDiscounted = appliedProductCounts[productIdKey] && appliedProductCounts[productIdKey] > 0;
          let discountSellingPrice;
          if (isDiscounted) {
            // Decrease the count of the product ID in the appliedProductCounts map
            let actualSellingPrice = product.sellingPrice
            discountSellingPrice = Math.round((actualSellingPrice / (totalDiscountPrice || 0)) * (userCart?.discount || 0))
            appliedProductCounts[productIdKey]--;
          }

          products.push({
            userId: userId,
            productId: product.productId,
            orderId: orderId,
            itemId: `${orderId}-${itemCount}`,
            productName: product.name,
            shortDescription: product.shortDescription,
            skuId: product.skuId,
            warehouseSkuId: product.warehouseSkuId,
            image: {
              fileType: product.image?.fileType,
              fileURL: product.image?.fileURL,
              originalName: product.image?.originalName,
              mimeType: product.image?.mimeType,
            },
            returnPeriod: returnPolicy?.duration || 0,
            returnPolicyName: returnPolicy?.name,
            returnPolicyDescription: returnPolicy?.description,
            returnCharge: returnPolicy?.returnCharge || 0,
            mrp: product.mrp,
            sellingPrice: isDiscounted ? product.sellingPrice - (discountSellingPrice ?? 0) : product.sellingPrice,
            shippingCharge: 0,
            paymentMode: paymentMode,
            paymentStatus: "PENDING",
            orderDate: orderDate.toDate(),
            shippingStatus: "PENDING",
            vendorId: product.vendorId,
            warranty: {
              name: warrantyPolicy?.name,
              description: warrantyPolicy?.description,
              duration: warrantyPolicy?.duration,
              warrantyType: warrantyPolicy?.warrantyType,
              // warrantyRegister:true
            }
          });
        }
      };


      if (calculatedSellingPrice < shippingConfig.freeShippingThreshold!) {
        products[0].shippingCharge = calculatedShippingCharge;
      } else {
        calculatedShippingCharge = 0;
      }

      calculatedGrandTotal = parseFloat(
        (calculatedSellingPrice + calculatedShippingCharge).toFixed(2)
      );

      // if (calculatedGrandTotal !== parseFloat(grandTotal.toFixed(2))) {
      //   throw new GraphQLError("Cart changed, order failed", {
      //     extensions: {
      //       code: "BAD_REQUEST",
      //       errors: [],
      //     },
      //   });
      // }


      const order: orderService.IOrder = {
        userId: userId,
        orderId: orderId,
        paymentMode: paymentMode,
        orderDate: orderDate.toDate(),
        shippingAddress: shippingAddress,
        orderStatus: "PENDING",
        vendorIds: vendorIds,
        grandTotal: userCart?.grandTotal,
        shippingCharge: userCart?.shippingCharge,
        subTotal: userCart?.subTotal,
        discount: userCart?.discount
      };

      await orderService.createOrder(order)
      const orderProducts = await orderProductService.createOrderProducts(products)

      console.log("order result", orderProducts)


      if (orderProducts) {
        for (const orderProduct of orderProducts) {
          await activityLogService.createActivityLog({
            actionType: "ORDER",
            action: "ORDER HAS BEEN PLACED",
            performedBy: userId,
            performedByRole: "USERS",
            referenceId: orderProduct?._id,
            referenceType: "ORDER_PRODUCTS",
            details: `${shippingAddress.firstname} placed an order ${orderProduct.orderId} through the website.  The order has been successfully registered in the system and is now waiting for processing.`,
          });
        }
      }

      // await Promise.all([
      //   orderService.createOrder(order),
      //   orderProductService.createOrderProducts(products),
      // ]);

      try {
        let productStock = cartItems.map((product) => {
          return { _id: product.productId, quantity: product.quantity };
        });
        await Promise.all([
          cartService.emptyUserCart(userId),
          productService.decreaseProductsStock(productStock),
          userShippingAddressService.updateDefaultShipingAddress(
            userId,
            shippingAddressId
          ),
        ]);
      } catch (error) {
        console.log(error);
      }

      if (userCart?.isCouponApplied) {
        const couponId = userCart?.appliedCoupon
        if (!couponId) {
          throw new GraphQLError("Coupon not found", {
            extensions: {
              code: "BAD_REQUEST",
              errors: [],
            },
          });
        }
        await couponService.updateUserUsage(userId, couponId)
      }

      let response = {
        orderId: orderId,
      };

      return response;
    },
    // createUserOrderInMobile: async (parent, { input }, { req }, info) => {
    //   await verifyMobileUser(req);
    //   await validateInput(validators.createOrderValidator, req);

    //   const userId = req.authAccount._id;
    //   let { shippingAddressId, paymentMode, grandTotal } = input;

    //   const orderDate = moment();
    //   const orderId = `ORD-${orderDate.valueOf()}`;

    //   const shippingAddress =
    //     await userShippingAddressService.getShippingAddressWithFilters(
    //       { _id: shippingAddressId },
    //       {},
    //       { lean: true }
    //     );
    //   if (!shippingAddress) {
    //     throw new GraphQLError("Shipping Address not found", {
    //       extensions: {
    //         code: "BAD_REQUEST",
    //         errors: [],
    //       },
    //     });
    //   }

    //   const [paymentConfig, shippingConfig] = await Promise.all([
    //     settingsService.getPaymentConfig({}, { sort: { _id: 1 } }),
    //     settingsService.getShippingConfig({}, { sort: { _id: 1 } }),
    //   ]);

    //   if (!paymentConfig || !shippingConfig) {
    //     throw new GraphQLError("Settings not found", {
    //       extensions: {
    //         code: "INTERNAL_SERVER_ERROR",
    //         errors: [],
    //       },
    //     });
    //   }

    //   if (paymentMode == "COD") {
    //     if (!paymentConfig.cod) {
    //       throw new GraphQLError("COD is disabled", {
    //         extensions: {
    //           code: "BAD_REQUEST",
    //           errors: [],
    //         },
    //       });
    //     }
    //   }

    //   const cartItems = await cartService.getOrderCart(userId);

    //   const uniqueVendorIds: Set<Types.ObjectId> = new Set();
    //   cartItems.forEach((item: any) => {
    //     if (item.vendorId) {
    //       uniqueVendorIds.add(item.vendorId);
    //     }
    //   });

    //   const vendorIds: Types.ObjectId[] = [...uniqueVendorIds];

    //   if (cartItems.length === 0) {
    //     throw new GraphQLError("Cart is empty", {
    //       extensions: {
    //         code: "BAD_REQUEST",
    //         errors: [],
    //       },
    //     });
    //   }

    //   let calculatedSellingPrice = 0,
    //     calculatedShippingCharge = shippingConfig.shippingCharge || 0,
    //     calculatedGrandTotal = 0;

    //   for (let product of cartItems) {
    //     if (
    //       !product.name ||
    //       product.isBlocked ||
    //       product.sellingPrice <= 0 ||
    //       product.stock <= 0 ||
    //       product.quantity > product.stock
    //     ) {
    //       throw new GraphQLError("Cart changed, order failed", {
    //         extensions: {
    //           code: "BAD_REQUEST",
    //           errors: [],
    //         },
    //       });
    //     }
    //     calculatedSellingPrice += product.quantity * product.sellingPrice;
    //   }

    //   const products: orderProductService.IOrderProduct[] = [];

    //   let itemCount = 0;

    //   cartItems.forEach((product, index) => {
    //     for (let i = 0; i < product.quantity; i++) {
    //       itemCount++;
    //       products.push({
    //         userId: userId,
    //         productId: product.productId,
    //         orderId: orderId,
    //         itemId: `${orderId}-${itemCount}`,
    //         productName: product.name,
    //         shortDescription: product.shortDescription,
    //         skuId: product.skuId,
    //         warehouseSkuId: product.warehouseSkuId,
    //         image: {
    //           fileType: product.image?.fileType,
    //           fileURL: product.image?.fileURL,
    //           originalName: product.image?.originalName,
    //           mimeType: product.image?.mimeType,
    //         },
    //         returnPeriod: shippingConfig.returnPeriod || 0,
    //         mrp: product.mrp,
    //         sellingPrice: product.sellingPrice,
    //         shippingCharge: 0,
    //         paymentMode: paymentMode,
    //         paymentStatus: "PENDING",
    //         orderDate: orderDate.toDate(),
    //         shippingStatus: "PENDING",
    //         vendorId: product.vendorId,
    //       });
    //     }
    //   });

    //   if (calculatedSellingPrice < shippingConfig.freeShippingThreshold!) {
    //     products[0].shippingCharge = calculatedShippingCharge;
    //   } else {
    //     calculatedShippingCharge = 0;
    //   }

    //   calculatedGrandTotal = parseFloat(
    //     (calculatedSellingPrice + calculatedShippingCharge).toFixed(2)
    //   );

    //   // if (calculatedGrandTotal !== parseFloat(grandTotal.toFixed(2))) {
    //   //   throw new GraphQLError("Cart changed, order failed", {
    //   //     extensions: {
    //   //       code: "BAD_REQUEST",
    //   //       errors: [],
    //   //     },
    //   //   });
    //   // }

    //   const userCart=await cartModel.findOne({userId:userId})

    //   const order: orderService.IOrder = {
    //     userId: userId,
    //     orderId: orderId,
    //     paymentMode: paymentMode,
    //     orderDate: orderDate.toDate(),
    //     shippingAddress: shippingAddress,
    //     orderStatus: "PENDING",
    //     vendorIds: vendorIds,
    //     grandTotal: userCart?.grandTotal,
    //     shippingCharge: userCart?.shippingCharge,
    //     subTotal: userCart?.subTotal,
    //     discount: userCart?.discount
    //   };
    //   await Promise.all([
    //     orderService.createOrder(order),
    //     orderProductService.createOrderProducts(products),
    //   ]);

    //   try {
    //     let productStock = cartItems.map((product) => {
    //       return { _id: product.productId, quantity: product.quantity };
    //     });
    //     await Promise.all([
    //       cartService.emptyUserCart(userId),
    //       productService.decreaseProductsStock(productStock),
    //       userShippingAddressService.updateDefaultShipingAddress(
    //         userId,
    //         shippingAddressId
    //       ),
    //     ]);
    //   } catch (error) {
    //     console.log(error);
    //   }

    //   if(userCart?.isCouponApplied){
    //     const couponId=userCart?.appliedCoupon
    //     if(!couponId) {
    //       throw new GraphQLError("Coupon not found", {
    //         extensions: {
    //           code: "BAD_REQUEST",
    //           errors: [],
    //         },
    //       });
    //     }
    //     await couponService.updateUserUsage(userId, couponId)
    //   }


    //   let response = {
    //     orderId: orderId,
    //   };

    //   return response;
    // },

    updateAdminOrderProduct: async (
      parent,
      { input, invoice },
      { req },
      info
    ) => {
      await verifyAdmin(req);
      await validateInput(validators.updateAdminOrderProductValidator, req);
      const adminId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

      const admin = await adminModel.findById(adminId);


      console.log(input);
      const _id = input._id;

      const shippingCharge = parseFloat(`${input.shippingCharge}`);

      const product = await orderProductService.getOrderProductWithId(_id);

      if (!product) {
        throw new GraphQLError("Product not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      // console.log("product.shippingStatus", product.shippingStatus);
      // console.log("input.shippingStatus", input.shippingStatus);

      if (input.shippingStatus === "PACKAGE_IN_PROGRESS") {
        await activityLogService.createActivityLog({
          actionType: "ORDER",
          action: "PACKAGING STARTED",
          performedBy: adminId,
          performedByRole: "ADMINS",
          referenceId: product?._id,
          referenceType: "ORDER_PRODUCTS",
          details: `${admin?.fullName} (Admin) updated the order ${product?.itemId} status to "Packaging In Progress". The product is now being packed and prepared for shipment. `,
        });
      }

      if (input.shippingStatus === "SHIPPED") {
        await activityLogService.createActivityLog({
          actionType: "ORDER",
          action: "ORDER SHIPPED",
          performedBy: adminId,
          performedByRole: "ADMINS",
          referenceId: product?._id,
          referenceType: "ORDER_PRODUCTS",
          details: `${admin?.fullName} (Admin) marked order  ${product?.itemId} as "Shipped". The package has been successfully handed over to the team for delivery.`,
        });
      }

      if (input.shippingStatus === "OUT_FOR_DELIVERY") {
        await activityLogService.createActivityLog({
          actionType: "ORDER",
          action: "OUT FOR DELIVERY",
          performedBy: adminId,
          performedByRole: "ADMINS",
          referenceId: product?._id,
          referenceType: "ORDER_PRODUCTS",
          details: `${product?.deliveryAgentName} (Delivery Agent) has picked up the package for order ${product?.itemId} and is now "Out for Delivery". The customer will receive the package shortly. `,
        });
      }

      if (input.shippingStatus === "DELIVERED") {
        await activityLogService.createActivityLog({
          actionType: "ORDER",
          action: "ORDER DELIVERED",
          performedBy: adminId,
          performedByRole: "ADMINS",
          referenceId: product?._id,
          referenceType: "ORDER_PRODUCTS",
          details: `${product?.deliveryAgentName}  (Delivery Agent) successfully delivered the order ${product?.itemId} to the customer. The status has been updated to "Delivered". `,
        });
      }

      if (input.shippingStatus === "CANCELED") {
        await activityLogService.createActivityLog({
          actionType: "ORDER",
          action: "ORDER CANCELED",
          performedBy: adminId,
          performedByRole: "ADMINS",
          referenceId: product?._id,
          referenceType: "ORDER_PRODUCTS",
          details: `${admin?.fullName} (Admin) Cancelled  the order ${product?.itemId} . The status has been updated to "Cancelled" `,
        });
      }

      if (input.refundStatus === "PENDING") {
        await activityLogService.createActivityLog({
          actionType: "ORDER",
          action: "REFUND REQUEST PENDING",
          performedBy: adminId,
          performedByRole: "ADMINS",
          referenceId: product?._id,
          referenceType: "ORDER_PRODUCTS",
          details: `${admin?.fullName} (Admin) marked the refund status as PENDING for order ${product?.orderId}. The request is under review.`,
        });
      }

      if (input.refundStatus === "PAID") {
        await activityLogService.createActivityLog({
          actionType: "ORDER",
          action: "REFUND PROCESSED",
          performedBy: adminId,
          performedByRole: "ADMINS",
          referenceId: product?._id,
          referenceType: "ORDER_PRODUCTS",
          details: `${admin?.fullName} (Admin) marked the refund as PAID for order ${product?.orderId}. The amount has been successfully processed, and the refund has been issued to the customer.`,
        });
      }


      if (input.paymentRemark) {
        product.paymentRemark = input.paymentRemark;
      }
      if (input.shippingStatus) {
        product.shippingStatus = input.shippingStatus;
      }

      if (!isNaN(shippingCharge)) {
        product.shippingCharge = shippingCharge;
      }

      if (product.shippingStatus == "CANCELED") {
        if (input.cancelUserReason) {
          product.cancelUserReason = input.cancelUserReason;
        }
        if (input.cancelAdminComment) {
          product.cancelAdminComment = input.cancelAdminComment;
        }
        if (input.cancelledDate) {
          product.cancelledDate = input.cancelledDate;
        }
      } else {
        product.cancelUserReason = "";
        product.cancelAdminComment = "";
        product.cancelledDate = undefined;
      }

      if (product.shippingStatus == "DELIVERED") {
        const result = await orderProductModel.findById(_id)
        if (result?.warranty?.duration) {
          await orderProductModel.findByIdAndUpdate(_id, { "warranty.warrantyRegister": true }, { new: true });
        }
      }


      if (product.shippingStatus == "DELIVERED") {
        if (input.deliveryDate) {
          product.deliveryDate = input.deliveryDate;
        }
      } else {
        product.deliveryDate = undefined;
      }

      if (
        ["SHIPPED", "DELIVERED", "CANCELED"].includes(
          product.shippingStatus || ""
        )
      ) {
        if (input.shippedDate) {
          product.shippedDate = input.shippedDate;
        }
      } else if (
        ["PENDING", "PACKAGE_IN_PROGRESS"].includes(
          product.shippingStatus || ""
        )
      ) {
        product.shippedDate = undefined;
      }

      if (input.shippingStatus === "CANCELED") {

        const result = await orderProductModel.findById(_id)
        let product = [
          {
            _id: result?.productId,
            quantity: 1,
          },
        ];

        await productService.increaseProductsStock(product)
      }

      if (input.returnStatus) {
        if (product.shippingStatus == "DELIVERED") {
          product.returnStatus = input.returnStatus;

          if (input.returnStatus === "REJECTED") {
            await activityLogService.createActivityLog({
              actionType: "RETURN",
              action: "RETURN REQUEST REJECTED",
              performedBy: adminId,
              performedByRole: "ADMINS",
              referenceId: product?._id,
              referenceType: "ORDER_PRODUCTS",
              details: `${admin?.fullName} (Admin) rejected the return request for order ${product?.itemId}. The return process has been declined, and the customer has been notified. `,
            });
          }


          if (input.returnStatus === "APPROVED") {
            await activityLogService.createActivityLog({
              actionType: "RETURN",
              action: "RETURN REQUEST APPROVED",
              performedBy: adminId,
              performedByRole: "ADMINS",
              referenceId: product?._id,
              referenceType: "ORDER_PRODUCTS",
              details: `${admin?.fullName} (Admin) approved the return request for order ${product?.itemId}. The system has now marked the order as "Return Approved", and a delivery agent will be assigned for pickup. `,
            });
            const refund = product.sellingPrice;
            product.refundAmount = refund;
            product.refundStatus = "PENDING";
          }

          // if(input.returnStatus==="COLLECTED"){
          //     product.returnDate=moment().toDate();
          // }
        } else {
          throw new GraphQLError("This item can't be returned", {
            extensions: {
              code: "BAD_REQUEST",
              errors: [],
            },
          });
        }
      }

      if (product.shippingStatus == "DELIVERED") {
        if (product.returnStatus == "REJECTED") {
          if (input.returnRejectedDate) {
            product.returnRejectedDate = input.returnRejectedDate;
          }
        } else {
          product.returnRejectedDate = undefined;
        }

        if (product.returnStatus == "APPROVED") {
          // if (input.returnDate) {
          //     product.returnDate = input.returnDate;
          // }
          // console.log(product.sellingPrice)
          // console.log(product.refundAmount)
          // const refund= product.sellingPrice;
          // product.refundAmount =refund
          // product.refundStatus = "PENDING";
        }

        if (input.returnAdminComment) {
          product.returnAdminComment = input.returnAdminComment;
        }

        if (input.returnUserReason) {
          product.returnUserReason = input.returnUserReason;
        }

        // if (input.agentId) {
        //     product.returndeliveryAgentId = input.agentId;
        //     product.returnOrderAssignedOn=moment().toDate();

        //     const existingAgent = await deliveryAgentService.findAssignedDeliveryAgentWithFilters(
        //         { _id: input.agentId },
        //         { _id: 1, isActive: 1,wallet:1,fullName:1 },
        //         {}
        //      );

        //     console.log(existingAgent)
        //     if (!existingAgent) {
        //     throw new GraphQLError("Delivery Agent not found", {
        //         extensions: { code: "NOT_FOUND" },
        //     });
        //     }
        //     existingAgent.wallet.numberOfReturnOrderAssigned+=1
        //     existingAgent.save();
        // }

        // if (input.agentName) {
        //     product.returndeliveryAgentName = input.agentName;
        // }

        if (input.returnRequestDate) {
          product.returnRequestDate = input.returnRequestDate;
        }
      } else {
        product.returnStatus = "NA";
        product.returnUserReason = "";
        product.returnAdminComment = "";
        product.returnRequestDate = undefined;
        product.returnDate = undefined;
        product.returnRejectedDate = undefined;
        product.returndeliveryAgentId = undefined;
        product.returndeliveryAgentName = undefined;
      }

      if (input.refundStatus) {
        product.refundStatus = input.refundStatus;
      }

      if (["CANCELED", "DELIVERED"].includes(product.shippingStatus || "")) {
        if (product.refundStatus == "PAID") {
          if (input.refundAmount) {
            product.refundAmount = input.refundAmount;
          }
          if (input.refundDate) {
            product.refundDate = input.refundDate;
          }
        } else {
          product.refundAmount = 0;
          product.refundDate = undefined;
        }

        if (input.refundComment) {
          product.refundComment = input.refundComment;
        }
        if (input.refundRequestDate) {
          product.refundRequestDate = input.refundRequestDate;
        }
      } else {
        product.refundAmount = 0;
        product.refundStatus = "NA";
        product.refundComment = "";
        product.refundRequestDate = undefined;
        product.refundDate = undefined;
      }

      if (input.courierId) {
        product.courierId = input.courierId;
      }
      if (input.invoiceNumber) {
        product.invoiceNumber = input.invoiceNumber;
      }
      if (input.paymentStatus) {
        product.paymentStatus = input.paymentStatus;
      }

      if (invoice) {
        const { createReadStream, filename, mimetype, encoding } =
          await invoice;
        const key = spaceService.getFileKey(filePaths.invoices, filename, []);

        const stream = createReadStream();

        const file = await spaceService.privateFileUpload(
          key,
          mimetype,
          { mimetype: mimetype },
          stream
        );

        product.invoice = {
          fileType: "PRIVATE",
          fileURL: file.location,
          mimeType: mimetype,
          originalName: filename,
        };
      }



      await product.save();

      try {
        let products = await orderProductService.getOrderProductsWithFilters(
          { orderId: product.orderId! },
          { shippingStatus: 1 },
          { lean: true }
        );

        let isPendingExists = products.some(
          (item) => item.shippingStatus === "PENDING"
        );
        let isInProgressExists = products.some((item) =>
          ["PACKAGE_IN_PROGRESS", "SHIPPED"].includes(item.shippingStatus || "")
        );
        let status;
        if (isPendingExists) {
          status = "PENDING";
        } else if (isInProgressExists) {
          status = "IN_PROGRESS";
        } else {
          status = "COMPLETED";
        }
        await orderService.updateOrderStatus(product.orderId!, status);
      } catch (error) {
        console.log(error);
      }

      const response = { _id: _id };

      return response;
    },

    updateAdminOrderProductOtpSent: async (parent, { input }, { req }, info) => {

      await verifyAdmin(req)
      try {

        await deliveryAgentService.deliveryTimeOtpGenerate(input?.orderId)

        return {

          status: true,
          otp: true,
          msg: ""

        }

      } catch (error: any) {

        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });
      }
    },


    deliveryStatusOtpVerifyAdmin: async (parent, { input }, { req }, info) => {

      await verifyAdmin(req)
      try {

        const options: {
          agentId: Types.ObjectId;
          orderItemId: any;
          code: string;
          deliveryStatus: string | undefined;
          paymentMode: string | undefined;
          remarks: string | undefined;
          returnStatus: string | undefined;
          returnRemark: string | undefined;
        } = {
          agentId: input?.agentId,
          orderItemId: input?.orderItemId,
          code: input?.code || " ",
          returnStatus: input?.returnStatus || undefined,
          returnRemark: input?.returnRemark || undefined,
          deliveryStatus: input?.deliveryStatus || undefined,
          paymentMode: input?.paymentMode || undefined,
          remarks: input?.remarks || undefined
        };

        await deliveryAgentService.deliveryTimeOtpverify(options)

        return {
          status: true,
          msg: "OTP verified and status updated"
        }

      } catch (error: any) {

        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });


      }
    },







    //API for return request from user
    returnUserOrderProduct: async (parent, { input, image }, { req, io }, info) => {
      //add product image and return address
      // console.log(image, "IMAGE FOR RETURN ORDER!!!!!!!!");
      // Verify user and validate input
      await verifyUser(req);
      await validateInput(validators.returnUserOrderValidator, req);

      console.log("ret ", input)
      let returnProductImage: orderProductService.FileData[] = [];

      if (image) {
        try {
          for (let images of image) {
            const { createReadStream, filename, mimetype, encoding } =
              await images;
            const key = spaceService.getFileKey(
              filePaths.returnProduct,
              filename,
              []
            );
            const stream = createReadStream();
            const file = await spaceService.publicFileUpload(
              key,
              mimetype,
              { mimetype: mimetype },
              stream
            );

            returnProductImage.push({
              fileType: "PUBLIC",
              fileURL: file.location,
              mimeType: mimetype,
              originalName: filename,
            });
          }
        } catch (error) {
          throw new GraphQLError("image upload failed", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
          });
        }
      }


      // Extract user ID and input
      const userId = req.authAccount?._id;
      if (!userId) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const { _id, returnUserReason, bankDetails = {}, returnAddress } = input;

      // console.log(input, "INPUT FOR RETURN ORDER!!!!!!!!");

      // Fetch order product
      const orderProduct = await orderProductService.getOrderProductWithFilters(
        {
          _id,
        }
      );

      if (!orderProduct) {
        throw new GraphQLError("Order not found", {
          extensions: { code: "BAD_REQUEST", errors: [] },
        });
      }

      // console.log(orderProduct);

      if (orderProduct.shippingStatus !== "DELIVERED") {
        throw new GraphQLError("Order can't be returned", {
          extensions: { code: "BAD_REQUEST", errors: [] },
        });
      }

      // console.log("Delivery Date:", orderProduct.deliveryDate);
      // console.log("Return Period:", orderProduct.returnPeriod);
      // console.log(
      //     "Days Difference:",
      //     moment(orderProduct.deliveryDate).diff(moment(), "days")
      // );

      const returnDeadline = moment(orderProduct.deliveryDate).add(
        orderProduct.returnPeriod || 0,
        "days"
      );
      const isReturnable = moment().isSameOrBefore(returnDeadline);

      // console.log(isReturnable);

      if (!isReturnable) {
        console.log("cant")
        throw new GraphQLError("Order can't be returned", {
          extensions: { code: "BAD_REQUEST", errors: [] },
        });
      }

      // let returnProductImage: orderProductService.FileData[] = [];

      // if (image) {
      //   try {
      //     for (let images of image) {
      //       const { createReadStream, filename, mimetype, encoding } =
      //         await images;
      //       const key = spaceService.getFileKey(
      //         filePaths.returnProduct,
      //         filename,
      //         []
      //       );
      //       const stream = createReadStream();
      //       const file = await spaceService.publicFileUpload(
      //         key,
      //         mimetype,
      //         { mimetype: mimetype },
      //         stream
      //       );

      //       returnProductImage.push({
      //         fileType: "PUBLIC",
      //         fileURL: file.location,
      //         mimeType: mimetype,
      //         originalName: filename,
      //       });
      //     }
      //   } catch (error) {
      //     throw new GraphQLError("image upload failed", {
      //       extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
      //     });
      //   }
      // }

      if (!returnProductImage) {
        throw new GraphQLError("image upload failed", {
          extensions: {
            code: "BAD_REQUEST",
          },
        });
      }

      const validatedBankDetails = {
        accountHolderName: bankDetails?.accountHolderName || "",
        accountNumber: bankDetails?.accountNumber || "",
        ifscCode: bankDetails?.ifscCode || "",
        bankName: bankDetails?.bankName || "",
        branchName: bankDetails?.branchName || "",
      };

      const validatedReturnAddress = returnAddress
        ? {
          firstname: returnAddress.firstname || "",
          email: returnAddress.email || "",
          mobile: returnAddress.mobile || "",
          country: returnAddress.country || "India", // Default to "India"
          houseNumber: returnAddress.houseNumber || "",
          streetName: returnAddress.streetName || "",
          apartment: returnAddress.apartment || "",
          suite: returnAddress.suite || "",
          unit: returnAddress.unit || "",
          city: returnAddress.city || "",
          postCode: returnAddress.postCode || "",
          governorate: returnAddress.governorate,
          village: returnAddress.village,
          governorateID: returnAddress.governorateID,
          villageID: returnAddress.villageID,
          address: returnAddress.address || ""
        }
        : null;

      if (orderProduct.returnCharge && orderProduct.sellingPrice) {
        const returnAmount = (orderProduct.returnCharge / 100) * orderProduct?.sellingPrice
        orderProduct.refundAmount = returnAmount
      }

      orderProduct.returnUserReason = returnUserReason;
      orderProduct.returnRequestDate = moment().toDate();
      orderProduct.refundBankDetails = validatedBankDetails;
      if (validatedReturnAddress) {
        orderProduct.returnAddress = validatedReturnAddress;
      }
      orderProduct.returnStatus = "PENDING";
      orderProduct.returnProductImage = returnProductImage;

      await orderProduct.save();

      const response = {
        _id: _id,
      };




      await activityLogService.createActivityLog({
        actionType: "RETURN",
        action: "RETURN REQUEST INITIATED",
        performedBy: userId,
        performedByRole: "USERS",
        referenceId: orderProduct?._id,
        referenceType: "ORDER_PRODUCTS",
        details: `${returnAddress?.firstname} (Customer) requested a return for order  ${orderProduct.itemId} through the website. The return request has been submitted and is now waiting for approval.`,
      });



      const return_order_placed_notification = await notificationService.createNotification({
        title: "New return order placed !!!!",
        message: `A return order (ID: ${orderProduct?.orderId}) has been placed. Please review and process the request.`,
        type: "return_order",
        permissions: ["orders", "return-orders"],
        orderId: orderProduct?.orderId,
        productId: _id

      })

      io.emit("new_notification", return_order_placed_notification);

      console.log("return res", response)

      return response;
    },

    returnUserOrderProductInMob: async (parent, { input, image }, { req, io }, info) => {
      //add product image and return address
      // console.log(image, "IMAGE FOR RETURN ORDER!!!!!!!!");
      // Verify user and validate input
      await verifyUser(req);
      await validateInput(validators.returnUserOrderValidator, req);

      // Extract user ID and input
      const userId = req.authAccount?._id;
      if (!userId) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const { _id, returnUserReason, bankDetails = {}, returnAddress } = input;

      // console.log(input, "INPUT FOR RETURN ORDER!!!!!!!!");

      // Fetch order product
      const orderProduct = await orderProductService.getOrderProductWithFilters(
        {
          _id,
        }
      );

      if (!orderProduct) {
        throw new GraphQLError("Order not found", {
          extensions: { code: "BAD_REQUEST", errors: [] },
        });
      }

      // console.log(orderProduct);

      if (orderProduct.shippingStatus !== "DELIVERED") {
        throw new GraphQLError("Order can't be returned", {
          extensions: { code: "BAD_REQUEST", errors: [] },
        });
      }

      // console.log("Delivery Date:", orderProduct.deliveryDate);
      // console.log("Return Period:", orderProduct.returnPeriod);
      // console.log(
      //     "Days Difference:",
      //     moment(orderProduct.deliveryDate).diff(moment(), "days")
      // );

      const returnDeadline = moment(orderProduct.deliveryDate).add(
        orderProduct.returnPeriod || 0,
        "days"
      );
      const isReturnable = moment().isSameOrBefore(returnDeadline);

      // console.log(isReturnable);

      if (!isReturnable) {
        console.log("cant")
        throw new GraphQLError("Order can't be returned", {
          extensions: { code: "BAD_REQUEST", errors: [] },
        });
      }

      let returnProductImage: orderProductService.FileData[] = [];

      if (image) {
        try {
          for (let images of image) {
            const { createReadStream, filename, mimetype, encoding } =
              await images;
            const key = spaceService.getFileKey(
              filePaths.returnProduct,
              filename,
              []
            );
            const stream = createReadStream();
            const file = await spaceService.publicFileUpload(
              key,
              mimetype,
              { mimetype: mimetype },
              stream
            );

            returnProductImage.push({
              fileType: "PUBLIC",
              fileURL: file.location,
              mimeType: mimetype,
              originalName: filename,
            });
          }
        } catch (error) {
          throw new GraphQLError("image upload failed", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
          });
        }
      }

      if (!returnProductImage) {
        throw new GraphQLError("image upload failed", {
          extensions: {
            code: "BAD_REQUEST",
          },
        });
      }

      const validatedBankDetails = {
        accountHolderName: bankDetails?.accountHolderName || "",
        accountNumber: bankDetails?.accountNumber || "",
        ifscCode: bankDetails?.ifscCode || "",
        bankName: bankDetails?.bankName || "",
        branchName: bankDetails?.branchName || "",
      };

      const validatedReturnAddress = returnAddress
        ? {
          firstname: returnAddress.firstname || "",
          email: returnAddress.email || "",
          mobile: returnAddress.mobile || "",
          country: returnAddress.country || "India", // Default to "India"
          houseNumber: returnAddress.houseNumber || "",
          streetName: returnAddress.streetName || "",
          apartment: returnAddress.apartment || "",
          suite: returnAddress.suite || "",
          unit: returnAddress.unit || "",
          city: returnAddress.city || "",
          postCode: returnAddress.postCode || "",
          governorate: returnAddress.governorate,
          village: returnAddress.village,
          governorateID: returnAddress.governorateID,
          villageID: returnAddress.villageID,
          address: returnAddress.address || ""
        }
        : null;

      if (orderProduct.returnCharge && orderProduct.sellingPrice) {
        const returnAmount = (orderProduct.returnCharge / 100) * orderProduct?.sellingPrice
        orderProduct.refundAmount = returnAmount
      }

      orderProduct.returnUserReason = returnUserReason;
      orderProduct.returnRequestDate = moment().toDate();
      orderProduct.refundBankDetails = validatedBankDetails;
      if (validatedReturnAddress) {
        orderProduct.returnAddress = validatedReturnAddress;
      }
      orderProduct.returnStatus = "PENDING";
      orderProduct.returnProductImage = returnProductImage;

      await orderProduct.save();

      const response = {
        _id: _id,
      };



      await activityLogService.createActivityLog({
        actionType: "RETURN",
        action: "RETURN REQUEST INITIATED",
        performedBy: userId,
        performedByRole: "USERS",
        referenceId: orderProduct?._id,
        referenceType: "ORDER_PRODUCTS",
        details: `${returnAddress?.firstname} (Customer) requested a return for order  ${orderProduct.itemId} through the website. The return request has been submitted and is now waiting for approval.`,
      });

      const return_order_placed_notification = await notificationService.createNotification({
        title: "New return order placed !!!!",
        message: `A return order (ID: ${orderProduct?.orderId}) has been placed. Please review and process the request.`,
        type: "return_order",
        permissions: ["orders", "return-orders"],
        orderId: orderProduct?.orderId,
        productId: _id

      })

      io.emit("new_notification", return_order_placed_notification);

      console.log("return res", response)

      return response;
    },

    returnUserOrderProductInMobile: async (
      parent,
      { input },
      { req },
      info
    ) => {
      await verifyMobileUser(req);
      await validateInput(validators.returnUserOrderValidator, req);
      const userId = req.authAccount._id;
      let { _id, returnUserReason } = input;

      const orderProduct = await orderProductService.getOrderProductWithFilters(
        { userId: userId, _id: _id }
      );

      if (!orderProduct) {
        throw new GraphQLError("Order not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      const isReturnable =
        moment(orderProduct.deliveryDate).diff(moment(), "days") <=
        (orderProduct.returnPeriod || 0);

      if (!isReturnable) {
        throw new GraphQLError("Order can't be returned", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      orderProduct.returnUserReason = returnUserReason;
      orderProduct.returnRequestDate = moment().toDate();
      orderProduct.returnStatus = "PENDING";

      await orderProduct.save();

      const response = {
        _id: _id,
      };

      return response;
    },

    cancelUserOrderProduct: async (parent, { input }, { req }, info) => {
      await verifyUser(req);
      await validateInput(validators.cancelUserOrderValidator, req);
      const userId = req.authAccount._id;
      let { _id } = input;

      const user = await userModel.findById(userId)

      const orderProduct = await orderProductService.getOrderProductWithFilters(
        { userId: userId, _id: _id }
      );

      if (!orderProduct) {
        throw new GraphQLError("Order not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      if (
        !["PENDING", "PACKAGE_IN_PROGRESS"].includes(
          orderProduct.shippingStatus || ""
        )
      ) {
        throw new GraphQLError("Order can't be canceled", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      orderProduct.shippingStatus = "CANCELED";
      orderProduct.cancelUserReason = input?.cancelUserReason
      orderProduct.cancelledDate = moment().toDate();

      await orderProduct.save();

      try {
        let product = [
          {
            _id: orderProduct?.productId,
            quantity: 1,
          },
        ];

        console.log("update stock")

        await productService.increaseProductsStock(product);
      } catch (error) {
        console.log(error);
      }

      try {
        let products = await orderProductService.getOrderProductsWithFilters(
          { orderId: orderProduct.orderId! },
          { shippingStatus: 1 },
          { lean: true }
        );

        let isPendingExists = products.some(
          (item) => item.shippingStatus === "PENDING"
        );
        let isInProgressExists = products.some((item) =>
          ["PACKAGE_IN_PROGRESS", "SHIPPED"].includes(item.shippingStatus || "")
        );
        let status;
        if (isPendingExists) {
          status = "PENDING";
        } else if (isInProgressExists) {
          status = "IN_PROGRESS";
        } else {
          status = "COMPLETED";
        }
        await orderService.updateOrderStatus(orderProduct.orderId!, status);
      } catch (error) {
        console.log(error);
      }

      const response = {
        _id: _id,
      };


      await activityLogService.createActivityLog({
        actionType: "ORDER",
        action: "ORDER CANCELED",
        performedBy: userId,
        performedByRole: "USERS",
        referenceId: orderProduct?._id,
        referenceType: "ORDER_PRODUCTS",
        details: `${user?.displayName}  (User) Cancelled  the order ${orderProduct?.itemId} . The status has been updated to "Cancelled" `,
      });


      return response;
    },
    cancelUserOrderProductInMobile: async (
      parent,
      { input },
      { req },
      info
    ) => {
      await verifyMobileUser(req);
      await validateInput(validators.cancelUserOrderValidator, req);
      const userId = req.authAccount._id;
      let { _id } = input;
      const user = await userModel.findById(userId)

      const orderProduct = await orderProductService.getOrderProductWithFilters(
        { userId: userId, _id: _id }
      );

      if (!orderProduct) {
        throw new GraphQLError("Order not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      if (
        !["PENDING", "PACKAGE_IN_PROGRESS"].includes(
          orderProduct.shippingStatus || ""
        )
      ) {
        throw new GraphQLError("Order can't be canceled", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      orderProduct.shippingStatus = "CANCELED";
      orderProduct.cancelUserReason = input?.cancelUserReason
      orderProduct.cancelledDate = moment().toDate();

      await orderProduct.save();

      try {
        let product = [
          {
            _id: _id,
            quantity: 1,
          },
        ];

        await productService.increaseProductsStock(product);
      } catch (error) {
        console.log(error);
      }

      try {
        let products = await orderProductService.getOrderProductsWithFilters(
          { orderId: orderProduct.orderId! },
          { shippingStatus: 1 },
          { lean: true }
        );

        let isPendingExists = products.some(
          (item) => item.shippingStatus === "PENDING"
        );
        let isInProgressExists = products.some((item) =>
          ["PACKAGE_IN_PROGRESS", "SHIPPED"].includes(item.shippingStatus || "")
        );
        let status;
        if (isPendingExists) {
          status = "PENDING";
        } else if (isInProgressExists) {
          status = "IN_PROGRESS";
        } else {
          status = "COMPLETED";
        }
        await orderService.updateOrderStatus(orderProduct.orderId!, status);
      } catch (error) {
        console.log(error);
      }

      const response = {
        _id: _id,
      };

      await activityLogService.createActivityLog({
        actionType: "ORDER",
        action: "ORDER CANCELED",
        performedBy: userId,
        performedByRole: "USERS",
        referenceId: orderProduct?._id,
        referenceType: "ORDER_PRODUCTS",
        details: `${user?.displayName}  (User) Cancelled  the order ${orderProduct?.itemId} . The status has been updated to "Cancelled" `,
      });

      return response;
    },
  },
  Query: {
    getAdminOrders: async (parent, { input }, { req }, info) => {
      await verifyAdmin(req);
      await validateInput(validators.getAdminOrdersValidator, req);

      let filters: orderService.IOrdersOptions = { page: 0, size: 10 };

      if (input._id) {
        filters._id = input._id;
      }
      if (input.userId) {
        filters.userId = input.userId;
      }
      if (input.orderId) {
        filters.orderId = input.orderId;
      }
      if (input.paymentMode) {
        filters.paymentMode = input.paymentMode;
      }
      if (input.orderStatus) {
        filters.orderStatus = input.orderStatus;
      }
      if (input.postCode) {
        filters.postCode = input.postCode;
      }
      if (input.startDate) {
        filters.startDate = moment(input.startDate).toDate();
      }
      if (input.endDate) {
        filters.endDate = moment(input.endDate).toDate();
      }
      if (input.page) {
        filters.page = input.page;
      }
      if (input.size) {
        filters.size = input.size;
      }

      const response = await orderService.getAdminOrdersWithFilters(filters);

      return response;
    },
    getAdminOrderDetails: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);

      await validateInput(validators.getAdminOrderDetailsValidator, req);

      const response = await orderService.getAdminOrderDetails(input.orderId);

      return response;
    },
    getAdminShippingProducts: async (parent, { input }, { req }, info) => {
      await verifyAdmin(req);
      await validateInput(
        validators.getAdminOrderShippingProductsValidator,
        req
      );

      let filters: orderProductService.IShippingProductsOptions = {
        page: 0,
        size: 10,
        sort: "",
      };

      if (input._id) {
        filters._id = input._id;
      }
      if (input.userId) {
        filters.userId = input.userId;
      }
      if (input.vendorId) {
        filters.vendorId = input.vendorId;
      }
      if (input.orderId) {
        filters.orderId = input.orderId;
      }
      if (input.itemId) {
        filters.itemId = input.itemId;
      }
      if (input.productId) {
        filters.productId = input.productId;
      }
      if (input.skuId) {
        filters.skuId = input.skuId;
      }
      if (input.paymentMode) {
        filters.paymentMode = input.paymentMode;
      }
      if (input.paymentStatus) {
        filters.paymentStatus = input.paymentStatus;
      }
      if (input.shippingStatus) {
        filters.shippingStatus = input.shippingStatus;
      }
      if (input.orderStartDate) {
        filters.orderStartDate = moment(input.orderStartDate).toDate();
      }
      if (input.orderEndDate) {
        filters.orderEndDate = moment(input.orderEndDate).toDate();
      }
      if (input.shippingStartDate) {
        filters.shippingStartDate = moment(input.shippingStartDate).toDate();
      }
      if (input.shippingEndDate) {
        filters.shippingEndDate = moment(input.shippingEndDate).toDate();
      }
      if (input.deliveryStartDate) {
        filters.deliveryStartDate = moment(input.deliveryStartDate).toDate();
      }
      if (input.deliveryEndDate) {
        filters.deliveryEndDate = moment(input.deliveryEndDate).toDate();
      }
      if (input.cancelledStartDate) {
        filters.cancelledStartDate = moment(input.cancelledStartDate).toDate();
      }
      if (input.cancelledEndDate) {
        filters.cancelledEndDate = moment(input.cancelledEndDate).toDate();
      }
      if (input.courierId) {
        filters.courierId = input.courierId;
      }
      if (input.invoiceNumber) {
        filters.invoiceNumber = input.invoiceNumber;
      }
      if (input.page) {
        filters.page = input.page;
      }
      if (input.size) {
        filters.size = input.size;
      }
      if (input.sort) {
        filters.sort = input.sort;
      }

      const response = await orderProductService.getShippingProducts(filters);

      return response;
    },
    getAdminReturnProducts: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);
      await validateInput(validators.getAdminOrderReturnProductsValidator, req);

      let filters: orderProductService.IReturnProductsOptions = {
        page: 0,
        size: 10,
        sort: "",
      };

      if (input._id) {
        filters._id = input._id;
      }
      if (input.userId) {
        filters.userId = input.userId;
      }
      if (input.vendorId) {
        filters.vendorId = input.vendorId;
      }
      if (input.itemId) {
        filters.itemId = input.itemId;
      }
      if (input.orderId) {
        filters.orderId = input.orderId;
      }
      if (input.productId) {
        filters.productId = input.productId;
      }
      if (input.skuId) {
        filters.skuId = input.skuId;
      }
      if (input.paymentMode) {
        filters.paymentMode = input.paymentMode;
      }
      if (input.returnStatus) {
        filters.returnStatus = input.returnStatus;
      }
      if (input.deliveryStartDate) {
        filters.deliveryStartDate = moment(input.deliveryStartDate).toDate();
      }
      if (input.deliveryEndDate) {
        filters.deliveryEndDate = moment(input.deliveryEndDate).toDate();
      }
      if (input.returnRequestStartDate) {
        filters.returnRequestStartDate = moment(
          input.returnRequestStartDate
        ).toDate();
      }
      if (input.returnRequestEndDate) {
        filters.returnRequestEndDate = moment(
          input.returnRequestEndDate
        ).toDate();
      }
      if (input.returnStartDate) {
        filters.returnStartDate = moment(input.returnStartDate).toDate();
      }
      if (input.returnEndDate) {
        filters.returnEndDate = moment(input.returnEndDate).toDate();
      }
      if (input.returnRejectStartDate) {
        filters.returnRejectStartDate = moment(
          input.returnRejectStartDate
        ).toDate();
      }
      if (input.returnRejectEndDate) {
        filters.returnRejectEndDate = moment(
          input.returnRejectEndDate
        ).toDate();
      }
      if (input.courierId) {
        filters.courierId = input.courierId;
      }
      if (input.invoiceNumber) {
        filters.invoiceNumber = input.invoiceNumber;
      }
      if (input.page) {
        filters.page = input.page;
      }
      if (input.size) {
        filters.size = input.size;
      }
      if (input.sort) {
        filters.sort = input.sort;
      }

      const response = await orderProductService.getReturnProducts(filters);

      return response;
    },
    getAdminRefundProducts: async (parent, { input }, { req }, info) => {
      await verifyAdmin(req);
      await validateInput(validators.getAdminOrderRefundProductsValidator, req);

      let filters: orderProductService.IRefundProductsOptions = {
        page: 0,
        size: 10,
        sort: "",
      };

      if (input._id) {
        filters._id = input._id;
      }
      if (input.userId) {
        filters.userId = input.userId;
      }
      if (input.vendorId) {
        filters.vendorId = input.vendorId;
      }
      if (input.orderId) {
        filters.orderId = input.orderId;
      }
      if (input.itemId) {
        filters.itemId = input.itemId;
      }
      if (input.productId) {
        filters.productId = input.productId;
      }
      if (input.skuId) {
        filters.skuId = input.skuId;
      }
      if (input.paymentMode) {
        filters.paymentMode = input.paymentMode;
      }
      if (input.refundStatus) {
        filters.refundStatus = input.refundStatus;
      }
      if (input.refundRequestStartDate) {
        filters.refundRequestStartDate = moment(
          input.refundRequestStartDate
        ).toDate();
      }
      if (input.refundRequestEndDate) {
        filters.refundRequestEndDate = moment(
          input.refundRequestEndDate
        ).toDate();
      }
      if (input.refundStartDate) {
        filters.refundStartDate = moment(input.refundStartDate).toDate();
      }
      if (input.refundEndDate) {
        filters.refundEndDate = moment(input.refundEndDate).toDate();
      }
      if (input.courierId) {
        filters.courierId = input.courierId;
      }
      if (input.invoiceNumber) {
        filters.invoiceNumber = input.invoiceNumber;
      }
      if (input.page) {
        filters.page = input.page;
      }
      if (input.size) {
        filters.size = input.size;
      }
      if (input.sort) {
        filters.sort = input.sort;
      }

      const response = await orderProductService.getRefundProducts(filters);

      return response;
    },
    getAdminOrderProduct: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);
      await validateInput(validators.getAdminOrderProductValidator, req);

      const product =
        await orderProductService.getOrderProductByIdIncludeVendorNew(
          input._id
        );
      console.log(product, "PRODUCT DETAIL OBJ");
      if (!product) {
        throw new GraphQLError("Record not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      return product;
    },
    getAdminOrderProducts: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);
      await validateInput(validators.getAdminOrderProductsValidator, req);

      const result =
        await orderProductService.getOrderProductsWithFiltersIncludeVendorNew({
          orderId: input?.orderId,
        });

      const response = {
        // products: result.map((item: any) => { return { ...item.toObject(), vendorId: item.vendorId._id, vendorName: item.vendorId.fullName } })
        products: result,
      };

      console.log(response, "GET ADMIN ORDER PRODUCTS F");

      return response;
    },
    getUserOrderProduct: async (parent, { input }, { req }, info) => {
      await verifyUser(req);
      await validateInput(validators.getUserOrderProductValidator, req);

      const userId = req.authAccount._id;

      const result = await orderProductService.getOrderProductWithFilters(
        { _id: input._id, userId: userId },
        {},
        { lean: true }
      );

      if (!result) {
        throw new GraphQLError("Record not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      const response = result;

      return response;
    },
    getUserOrderProductInMobile: async (parent, { input }, { req }, info) => {
      await verifyMobileUser(req);
      await validateInput(validators.getUserOrderProductValidator, req);

      const userId = req.authAccount._id;

      const result = await orderProductService.getOrderProductWithFilters(
        { _id: input._id, userId: userId },
        {
          _id: 1,
          productId: 1,
          vendorId: 1,
          orderId: 1,
          productName: 1,
          shortDescription: 1,
          skuId: 1,
          image: 1,
          returnPeriod: 1,
          mrp: 1,
          sellingPrice: 1,
          shippingCharge: 1,
          paymentMode: 1,
          paymentStatus: 1,
          orderDate: 1,
          shippingStatus: 1,
          shippedDate: 1,
          deliveryDate: 1,
          returnStatus: 1,
          returnDate: 1,
          returnRejectedDate: 1,
          refundStatus: 1,
          refundAmount: 1,
          refundDate: 1,
          cancelledDate: 1,
          courierId: 1,
          invoiceNumber: 1,
          invoice: 1,
        },
        { lean: true }
      );

      if (!result) {
        throw new GraphQLError("Record not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      const response = result;

      return response;
    },
    getUserOrderDetails: async (parent, { input }, { req }, info) => {
      await verifyUser(req);
      await validateInput(validators.getUserOrderDetailsValidator, req);

      const userId = new Types.ObjectId(req.authAccount._id);

      const result = await orderService.getUserOrderDetails(
        input.orderId,
        userId
      );

      if (!result) {
        throw new GraphQLError("Record not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      const response = result;

      return response;
    },
    getUserOrderDetailsInMobile: async (parent, { input }, { req }, info) => {
      await verifyMobileUser(req);
      await validateInput(validators.getUserOrderDetailsValidator, req);

      const userId = new Types.ObjectId(req.authAccount._id);

      const result = await orderService.getUserOrderDetails(
        input.orderId,
        userId
      );

      if (!result) {
        throw new GraphQLError("Record not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      const response = result;

      return response;
    },
    getUserOrderProducts: async (parent, { input }, { req }, info) => {
      await verifyUser(req);
      await validateInput(validators.getUserOrderProductsValidator, req);

      const userId = req.authAccount._id;

      let filters: orderProductService.IUserOrderProductsOptions = {
        page: 0,
        size: 10,
        userId: userId,
      };

      if (input.page) {
        filters.page = input.page;
      }
      if (input.size) {
        filters.size = input.size;
      }

      const result = await orderProductService.getUserOrderProducts(filters);

      const response = result;

      return response;
    },
    getUserOrderProductsInMobile: async (parent, { input }, { req }, info) => {
      await verifyMobileUser(req);
      await validateInput(validators.getUserOrderProductsValidator, req);

      const userId = req.authAccount._id;

      let filters: orderProductService.IUserOrderProductsOptions = {
        page: 0,
        size: 10,
        userId: userId,
      };

      if (input.page) {
        filters.page = input.page;
      }
      if (input.size) {
        filters.size = input.size;
      }

      const result = await orderProductService.getUserOrderProducts(filters);

      const response = result;

      return response;
    },
    getUserOrderProductsByAdmin: async (parent, { input }, { req }, info) => {
      await verifyAdmin(req);
      await validateInput(validators.getUserOrderProductsByAdminValidator, req);

      const userId = input.userId;
      const orderId = input.orderId || "";

      let filters: orderProductService.IUserOrderProductsByAdminOptions = {
        page: 0,
        size: 10,
        userId: userId,
        orderId: orderId,
      };

      if (input.page) {
        filters.page = input.page;
      }
      if (input.size) {
        filters.size = input.size;
      }

      const result = await orderProductService.getUserOrderProductsByAdmin(
        filters
      );

      const response = result;

      return response;
    },

    getVendorOrders: async (parent, { input }, { req }, info) => {
      await verifyVendor(req);
      await validateInput(validators.getVendorOrdersValidator, req);

      const vendorId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

      let filters: orderService.IOrdersOptions = { page: 0, size: 10 };

      if (vendorId) {
        filters.vendorId = vendorId;
      }
      if (input._id) {
        filters._id = input._id;
      }
      if (input.userId) {
        filters.userId = input.userId;
      }
      if (input.orderId) {
        filters.orderId = input.orderId;
      }
      if (input.paymentMode) {
        filters.paymentMode = input.paymentMode;
      }
      if (input.orderStatus) {
        filters.orderStatus = input.orderStatus;
      }
      if (input.postCode) {
        filters.postCode = input.postCode;
      }
      if (input.startDate) {
        filters.startDate = moment(input.startDate).toDate();
      }
      if (input.endDate) {
        filters.endDate = moment(input.endDate).toDate();
      }
      if (input.page) {
        filters.page = input.page;
      }
      if (input.size) {
        filters.size = input.size;
      }

      const response = await orderService.getVendorOrdersWithFilters(filters);

      return response;
    },

    getVendorOrderDetails: async (parent, { input }, { req }, info) => {
      await verifyVendor(req);
      await validateInput(validators.getAdminOrderDetailsValidator, req);

      const vendorId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

      const response = await orderService.getVendorOrderDetails(
        input.orderId,
        vendorId
      );
      return response;
    },

    getVendorShippingProducts: async (parent, { input }, { req }, info) => {
      await verifyVendor(req);
      await validateInput(
        validators.getVenodrOrderShippingProductsValidator,
        req
      );

      let vendorId = req.authAccount._id;

      let filters: orderProductService.IVendorShippingProductsOptions = {
        page: 0,
        size: 10,
        sort: "",
        vendorId: vendorId,
      };

      if (input._id) {
        filters._id = input._id;
      }
      if (input.userId) {
        filters.userId = input.userId;
      }
      if (input.orderId) {
        filters.orderId = input.orderId;
      }
      if (input.itemId) {
        filters.itemId = input.itemId;
      }
      if (input.productId) {
        filters.productId = input.productId;
      }
      if (input.skuId) {
        filters.skuId = input.skuId;
      }
      if (input.paymentMode) {
        filters.paymentMode = input.paymentMode;
      }
      if (input.paymentStatus) {
        filters.paymentStatus = input.paymentStatus;
      }
      if (input.shippingStatus) {
        filters.shippingStatus = input.shippingStatus;
      }
      if (input.orderStartDate) {
        filters.orderStartDate = moment(input.orderStartDate).toDate();
      }
      if (input.orderEndDate) {
        filters.orderEndDate = moment(input.orderEndDate).toDate();
      }
      if (input.shippingStartDate) {
        filters.shippingStartDate = moment(input.shippingStartDate).toDate();
      }
      if (input.shippingEndDate) {
        filters.shippingEndDate = moment(input.shippingEndDate).toDate();
      }
      if (input.deliveryStartDate) {
        filters.deliveryStartDate = moment(input.deliveryStartDate).toDate();
      }
      if (input.deliveryEndDate) {
        filters.deliveryEndDate = moment(input.deliveryEndDate).toDate();
      }
      if (input.cancelledStartDate) {
        filters.cancelledStartDate = moment(input.cancelledStartDate).toDate();
      }
      if (input.cancelledEndDate) {
        filters.cancelledEndDate = moment(input.cancelledEndDate).toDate();
      }
      if (input.courierId) {
        filters.courierId = input.courierId;
      }
      if (input.invoiceNumber) {
        filters.invoiceNumber = input.invoiceNumber;
      }
      if (input.page) {
        filters.page = input.page;
      }
      if (input.size) {
        filters.size = input.size;
      }
      if (input.sort) {
        filters.sort = input.sort;
      }

      const response = await orderProductService.getVendorShippingProducts(
        filters
      );

      return response;
    },
    getVendorRefundProducts: async (parent, { input }, { req }, info) => {
      await verifyVendor(req);
      await validateInput(
        validators.getVendorOrderRefundProductsValidator,
        req
      );

      let vendorId = req.authAccount._id;

      let filters: orderProductService.IVendorRefundProductsOptions = {
        page: 0,
        size: 10,
        sort: "",
        vendorId: vendorId,
      };

      if (input._id) {
        filters._id = input._id;
      }
      if (input.userId) {
        filters.userId = input.userId;
      }
      if (input.orderId) {
        filters.orderId = input.orderId;
      }
      if (input.itemId) {
        filters.itemId = input.itemId;
      }
      if (input.productId) {
        filters.productId = input.productId;
      }
      if (input.skuId) {
        filters.skuId = input.skuId;
      }
      if (input.paymentMode) {
        filters.paymentMode = input.paymentMode;
      }
      if (input.refundStatus) {
        filters.refundStatus = input.refundStatus;
      }
      if (input.refundRequestStartDate) {
        filters.refundRequestStartDate = moment(
          input.refundRequestStartDate
        ).toDate();
      }
      if (input.refundRequestEndDate) {
        filters.refundRequestEndDate = moment(
          input.refundRequestEndDate
        ).toDate();
      }
      if (input.refundStartDate) {
        filters.refundStartDate = moment(input.refundStartDate).toDate();
      }
      if (input.refundEndDate) {
        filters.refundEndDate = moment(input.refundEndDate).toDate();
      }
      if (input.courierId) {
        filters.courierId = input.courierId;
      }
      if (input.invoiceNumber) {
        filters.invoiceNumber = input.invoiceNumber;
      }
      if (input.page) {
        filters.page = input.page;
      }
      if (input.size) {
        filters.size = input.size;
      }
      if (input.sort) {
        filters.sort = input.sort;
      }

      const response = await orderProductService.getVendorRefundProducts(
        filters
      );

      return response;
    },
    getVendorReturnProducts: async (parent, { input }, { req }, info) => {
      await verifyVendor(req);
      await validateInput(
        validators.getVendorOrderReturnProductsValidator,
        req
      );

      let vendorId = req.authAccount._id;

      let filters: orderProductService.IVendorReturnProductsOptions = {
        page: 0,
        size: 10,
        sort: "",
        vendorId: vendorId,
      };

      if (input._id) {
        filters._id = input._id;
      }
      if (input.userId) {
        filters.userId = input.userId;
      }
      if (input.itemId) {
        filters.itemId = input.itemId;
      }
      if (input.orderId) {
        filters.orderId = input.orderId;
      }
      if (input.productId) {
        filters.productId = input.productId;
      }
      if (input.skuId) {
        filters.skuId = input.skuId;
      }
      if (input.paymentMode) {
        filters.paymentMode = input.paymentMode;
      }
      if (input.returnStatus) {
        filters.returnStatus = input.returnStatus;
      }
      if (input.deliveryStartDate) {
        filters.deliveryStartDate = moment(input.deliveryStartDate).toDate();
      }
      if (input.deliveryEndDate) {
        filters.deliveryEndDate = moment(input.deliveryEndDate).toDate();
      }
      if (input.returnRequestStartDate) {
        filters.returnRequestStartDate = moment(
          input.returnRequestStartDate
        ).toDate();
      }
      if (input.returnRequestEndDate) {
        filters.returnRequestEndDate = moment(
          input.returnRequestEndDate
        ).toDate();
      }
      if (input.returnStartDate) {
        filters.returnStartDate = moment(input.returnStartDate).toDate();
      }
      if (input.returnEndDate) {
        filters.returnEndDate = moment(input.returnEndDate).toDate();
      }
      if (input.returnRejectStartDate) {
        filters.returnRejectStartDate = moment(
          input.returnRejectStartDate
        ).toDate();
      }
      if (input.returnRejectEndDate) {
        filters.returnRejectEndDate = moment(
          input.returnRejectEndDate
        ).toDate();
      }
      if (input.courierId) {
        filters.courierId = input.courierId;
      }
      if (input.invoiceNumber) {
        filters.invoiceNumber = input.invoiceNumber;
      }
      if (input.page) {
        filters.page = input.page;
      }
      if (input.size) {
        filters.size = input.size;
      }
      if (input.sort) {
        filters.sort = input.sort;
      }

      const response = await orderProductService.getVendorReturnProducts(
        filters
      );

      return response;
    },

    getVendorOrderProduct: async (parent, { input }, { req }, info) => {
      await verifyVendor(req);
      await validateInput(validators.getVendorOrderProductValidator, req);

      let product = await orderProductService.getVendorOrderProductById(
        input._id
      );

      if (!product) {
        throw new GraphQLError("Record not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }

      const response = product;
      return response;
    },

    getVendorOrderProducts: async (parent, { input }, { req }, info) => {
      await verifyVendor(req);
      await validateInput(validators.getAdminOrderProductsValidator, req);
      let vendorId = req?.authAccount?._id;

      const result =
        await orderProductService.getOrderProductsWithFiltersIncludeVendorNew({
          orderId: input.orderId,
          vendorId: new Types.ObjectId(vendorId),
        });

      const response = {
        // products: result.map((item: any) => {
        //   return {
        //     ...item.toObject(),
        //     vendorId: item.vendorId._id,
        //     vendorName: item.vendorId.fullName,
        //   };
        // }),
        products: result
      };

      return response;
    },

    getProductDeliveryTypeDeliveryAgents: async (
      parent,
      { input },
      { req },
      info
    ) => {
      try {
        // await verifyAdmin(req);
        // products id validation
        await validateInput(
          validators.getProductDeliveryTypeDeliveryAgentsValidator,
          req
        );

        // find products delivery type and delivery agents
        const options = {
          proid: input.productId,
          villageID: input.villageID || "",
          governorateID: input.governorateID || " "

        }

        const result: any =
          await orderService.getProductDeliveryTypeDeliveryAgents(options);

        return {
          deliveryType: result.deliveryType,
          deliveryAgents: result.deliveryAgents,
        };
      } catch (error) {
        throw new GraphQLError("Unable find data", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        });
      }
    },

    getOrderActivityLogByAdmin: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);
      try {
        const orderProductId = input.orderProductId;
        const result = await orderService.getOrderActivityLogByAdmin(orderProductId);
        console.log("result", result)
        return result
      } catch (error) {
        throw new GraphQLError("Unable find data", {
          extensions: {
            code: "BAD_REQUEST",
            errors: [],
          },
        })
      }

    },
  }
};
