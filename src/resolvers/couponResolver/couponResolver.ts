import { jwtService, spaceService, otpService, deliveryAgentService, orderProductService, couponService, cartService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor, verifyDeliveryAgent, verifyUser } from "../../middlewares";
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, } from "mongoose";
import { filePaths } from "../../configs";
import { deliveryAgentModel } from "../../models/deliveryAgentModel";
import { error } from "console";
import { couponsModel } from ".././../models/couponsModel";
import { cartModel } from "../../models/cartModel";
import { userModel } from '../../models/userModel'
import { productModel } from "../../models/proudctModel";


export const couponResolver: Resolvers = {


  Upload: GraphQLUpload,

  Mutation: {

    //create coupon by admin
    createCouponsByAdmin: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);
      try {
        let name: string = input.name
        let code: string = input.code
        let description: string | null | undefined = input?.description;
        // let couponType: string = input.couponType 
        let discountType: string = input.discountType
        let couponApplicableType: string | null | undefined = input?.couponApplicableType
        let discountValue: number | null | undefined = input?.discountValue
        let orderCount: number | null | undefined = input?.orderCount
        let max_discount: number | null | undefined = input?.max_discount;
        let minOrderAmount: number | null | undefined = input?.minOrderAmount;
        let validCategories: couponService.ICategory[] | null | undefined = input?.validCategories as couponService.ICategory[] | null | undefined;
        let validProducts: couponService.IProduct[] | null | undefined = input?.validProducts as couponService.IProduct[] | null | undefined;
        let validUsers: couponService.IUser[] | null | undefined = input?.validUsers as couponService.IUser[] | null | undefined;
        let validBrands: couponService.IBrand[] | null | undefined = input?.validBrands as couponService.IBrand[] | null | undefined;
        let usageLimit: number | null | undefined = input?.usageLimit;
        let usagePerUserLimit: number | null | undefined = input?.usagePerUserLimit;
        let startDate: Date = input?.startDate
        let expiryDate: Date = input?.expiryDate


        const existingCoupon = await couponsModel.findOne({ code: code });

        if (existingCoupon) {
          throw new GraphQLError("Coupon code already exists,Try another code", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Coupon code already exists"] },
          });
        }


        // Validate discountType and max_discount

        if (discountType === "PERCENTAGE" && !max_discount) {
          throw new GraphQLError("max_discount is required for percentage-based discounts.", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["max_discount is required for percentage-based discounts."] },
          });
        }


        // Validate dates
        if (startDate && expiryDate && new Date(startDate) >= new Date(expiryDate)) {
          throw new GraphQLError("expiryDate must be after startDate.", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }


        let newCouponData = {
          name,
          code,
          description,
          // couponType,
          orderCount,
          discountType,
          couponApplicableType,
          discountValue,
          max_discount,
          minOrderAmount,
          validCategories,
          validProducts,
          validBrands,
          validUsers,
          usageLimit,
          usagePerUserLimit,
          startDate,
          expiryDate
        };

        const result = await couponService.createCouponsByAdmin(newCouponData);
        console.log(result)

        if (!result) {
          throw new GraphQLError("Unable to create coupons!!Try again", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }

        return {
          success: true,
          message: "Coupon created successfully.",
        };

      } catch (error: any) {
        console.error("Error in createCouponsByAdmin:", error);
        throw new GraphQLError(error, {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },

    //edit coupon by admin

    editCouponsByAdmin: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);
      console.log("called")
      try {

        const {
          name,
          code,
          description,
          discountType,
          couponApplicableType,
          discountValue,
          max_discount,
          minOrderAmount,
          validCategories,
          validProducts,
          validUsers,
          usageLimit,
          usagePerUserLimit,
          startDate,
          expiryDate,
          orderCount,
          validBrands
        } = input;

        const couponId: Types.ObjectId = input._id

        if (!couponId) {
          throw new GraphQLError("Coupon id is required", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Coupon id is required"] },
          });
        }


        const existingCoupon = await couponsModel.findOne({ _id: couponId });
        console.log("existingCoupon", existingCoupon)

        if (!existingCoupon) {
          throw new GraphQLError("Coupon not  exist,Try again!!", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Coupon not exist"] },
          });
        }

        // Validate discountType and max_discount

        if (discountType && discountType === "PERCENTAGE" && !max_discount) {
          throw new GraphQLError("max_discount is required for percentage-based discounts.", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["max_discount is required for percentage-based discounts."] },
          });
        }


        // Validate dates
        if (startDate && expiryDate && new Date(startDate) >= new Date(expiryDate)) {
          throw new GraphQLError("expiryDate must be after startDate.", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }

        const updateData = {
          ...(name && { name }),
          ...(code && { code }),
          ...(description && { description }),
          ...(discountType && { discountType }),
          ...(couponApplicableType && { couponApplicableType }),
          ...(discountValue && { discountValue }),
          ...(max_discount && { max_discount }),
          ...(minOrderAmount && { minOrderAmount }),
          ...(validCategories && { validCategories }),
          ...(validProducts && { validProducts }),
          ...(validUsers && { validUsers }),
          ...(usageLimit && { usageLimit }),
          ...(usagePerUserLimit && { usagePerUserLimit }),
          ...(startDate && { startDate }),
          ...(expiryDate && { expiryDate }),
          ...(orderCount && { orderCount }),
          ...(validBrands && { validBrands }),
        };

        const result = await couponService.editCouponsByAdmin(couponId, updateData);
        console.log("result", result)

        if (!result) {
          throw new GraphQLError("Unable to edit coupons!!Try again", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }

        return {
          success: true,
          message: "Coupon edited successfully.",
        };

      } catch (error: any) {
        console.error("Error in editCouponsByAdmin:", error);
        throw new GraphQLError(error, {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },


    // // admin edit coupen 

    adminSuspendTheCupone: async (parent, { input }, { req }, info) => {

      try {

        const options = {

          _id: input?._id,
          isActive: input?.isActive?? undefined
        }

        await couponService.adminSuspendTheCupone(options)

        return {
          status: true,
          msg: "Coupen status changed"
        }


      } catch (error: any) {

        throw new GraphQLError("Coupen status changing Failed ", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });

      }
    },

    //apply coupon API by user

    applyCouponByUser: async (parent, { input }, { req }, info) => {
      try {

        let discount: number | undefined = 0;

        await verifyUser(req) 
        const userId = req.authAccount?._id; 
       
        let code;
        let couponId;

        if(input?.code){
          const coupon=await couponsModel.findOne({code:input?.code})

          if(!coupon){
            throw new GraphQLError("Coupon code not exists,Try another code", {
              extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Coupon code not exists"] },
            });
          }

          couponId=coupon?._id;
          code=coupon?.code;
        }else{
          couponId=input?.couponId;    
          code=input?.code;
        }

        console.log("couponId",couponId)

        const userCart=await cartService.findUserCart(userId)

        let subTotal=userCart?.subTotal;
        console.log("subTotal",subTotal)

        let grandTotal=userCart?.grandTotal;

        let shippingCharge=userCart?.shippingCharge


        const existingCoupon = await couponsModel.findOne({
          $or: [
            { code: code },
            { _id: couponId }
          ]
        })

        if (!existingCoupon) {
          throw new GraphQLError("Coupon code not exists,Try another code", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Coupon code not exists"] },
          });
        }

        const existingUser = await userModel.findOne({ _id: userId })

        if (!existingUser) {
          throw new GraphQLError("Something went Wrong!!Login Again!!", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Something went Wrong!!Login Again!!"] },
          });
        }


        const existingCart = await cartModel.findOne({ userId: userId })

        if (!existingCart) {
          throw new GraphQLError("cart not found!!Try again", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["cart not found!!Try again"] },
          });
        }

        if(existingCart.products.length===0){
          throw new GraphQLError("Your cart is empty!!", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Your cart is empty!!"] },
          });
        }

        if(existingCart.isCouponApplied){
          throw new GraphQLError("Only one coupon can be applied!!", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["This coupon is not active!!"] },
          });
        }

        //check coupon active or not
        if (!existingCoupon.isActive) {
          throw new GraphQLError("This coupon is not active!!", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["This coupon is not active!!"] },
          });
        }

        //check expired or not

        if (existingCoupon.expiryDate && new Date() > new Date(existingCoupon.expiryDate)) {
          throw new GraphQLError("This coupon is expired!!", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["This coupon is expired!!"] },
          });
        }

        //check if he is a valid user or not

        if (existingCoupon.validUsers.length !== 0) {
          const validUser = existingCoupon.validUsers.find(users => users?.user?.toString() === userId.toString());

          if (!validUser) {
            throw new GraphQLError("This coupon is not valid for you", {
              extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["This coupon is not valid for you"] },
            });
          }
        }


        //check the usage limit of this coupon exceed or not

        if (existingCoupon.usageLimit) {
          const result = await couponService.findusageLimit(couponId)
          if (result >= existingCoupon.usageLimit) {
            throw new GraphQLError("The limit of coupon is reached", {
              extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["The limit of coupon is reached"] },
            });
          }
        }


        //check the usage per user limit of this coupon exceed or not

        if (existingCoupon.usagePerUserLimit) {
          const result = await couponService.findusagePerUserLimit(couponId, userId)
          if (result >= existingCoupon.usagePerUserLimit) {
            throw new GraphQLError("usage limit reached", {
              extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["The limit of coupon is reached"] },
            });
          }

        }


        //check if there is any orderlimit
        if (existingCoupon.orderCount) {
          const result = await couponService.findOrderCount(userId)

          if (existingCoupon.orderCount - 1 !== result) {
            throw new GraphQLError(`This coupon is only applicable for your ${existingCoupon.orderCount} order`, {
              extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
            });
          }
        }

        //calculate grand total/subtotal/shipping charge 
       
        // const subTotal=await couponService.findSubTotal(userId)


        //check the discount type of coupon

        //FLAT COUPON

        if (existingCoupon.discountType === "FLAT") {
          //check if there is any restriction

          //check if there is any valid brands

          if (existingCoupon.validBrands.length !== 0) {

            //checking if there is any certain categories under brand
            if (existingCoupon.validCategories.length !== 0) {
              console.log("called")
              const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)
              console.log("result", result)


              // const matchingBrands = result.filter((item: any) =>
              //   existingCoupon.validBrands.some((validBrand: any) =>
              //     validBrand.brand.equals(item.brandId) // Check if brandId matches
              //   ) &&
              //   existingCoupon.validCategories.some((validCategory: any) =>
              //     validCategory.category.equals(item.categoryId) // Check if categoryId matches
              //   )
              // );


              const validCategories = existingCoupon.validCategories.map((validCategory: any) =>
                validCategory.category.toString() 
              );
              
              const matchingBrands = result.filter((item: any) =>
                existingCoupon.validBrands.some((validBrand: any) =>
                  validBrand.brand.equals(item.brandId) 
                ) &&
                item.categoryIdPath.some((categoryId: string) =>
                  validCategories.includes(categoryId)  
                )
              );
              
              
              console.log("matchingBrands", matchingBrands);


              if (matchingBrands.length === 0) {
                throw new GraphQLError("This coupon is not applicable for this product", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }


              let product_sum = 0;

              for (const item of matchingBrands) {  
                  product_sum += item.sellingprice;
              }


              if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
                throw new GraphQLError("Order amount is below the required minimum", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
                });
              }

              if (existingCoupon.discountValue) {
                const sortedMatchingBrands = matchingBrands.sort((a: any, b: any) => b.price - a.price);
    
                let cumulativePrice = 0;
                let appliedProducts = [];
                

                for (let i = 0; i < sortedMatchingBrands.length ;) {
                  const item = sortedMatchingBrands[i];
                
                  if(item.price > existingCoupon.discountValue ){
                      appliedProducts.push(item.productId);
                      break;
                  }
                  else if(cumulativePrice + item.price > existingCoupon.discountValue && item.quantity > 0){
                    appliedProducts.push(item.productId);
                    break;
                  }
                  else if (cumulativePrice + item.price <= existingCoupon.discountValue && item.quantity > 0) {
                   
                    // Add the same product again if quantity is available
                    appliedProducts.push(item.productId);
                    cumulativePrice += item.price;
                    item.quantity--; // Reduce the quantity of the current product
                  } else if (item.quantity === 0) {
                    // Move to the next product when the current product's quantity is exhausted
                    i++;
                  } else if (cumulativePrice >= existingCoupon.discountValue) {
                    // Stop once the discount is met
                    break;
                  }


                }

                let discountSubTotal=subTotal-existingCoupon.discountValue
                let discountGrandTotal = discountSubTotal + shippingCharge;

                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:existingCoupon.discountValue,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
              }
              // Update userUsage

              // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)



            } else {
              //if only brands
              const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)
              console.log("brandResult", result)

              const matchingBrands = result.filter((item: any) =>
                existingCoupon.validBrands.some((validBrand: any) =>
                  validBrand.brand.equals(item.brandId)
                )
              );
              console.log("matchingBrands", matchingBrands)

              if (matchingBrands.length === 0) {
                throw new GraphQLError("This coupon is not applicable for this product", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }


              let product_sum = 0;

              for (const item of matchingBrands) {  
                  product_sum += item.sellingprice;
              }


              if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
                throw new GraphQLError("Order amount is below the required minimum", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
                });
              }

              console.log("product_sum", product_sum)

              if (existingCoupon.discountValue) {
                // Sort matchingBrands by price in descending order
                const sortedMatchingBrands = matchingBrands.sort((a: any, b: any) => b.price - a.price);
    
                let cumulativePrice = 0;
                let appliedProducts = [];
                

                for (let i = 0; i < sortedMatchingBrands.length ;) {
                  const item = sortedMatchingBrands[i];
                
                  if(item.price > existingCoupon.discountValue ){
                    console.log("break1 called")
                      appliedProducts.push(item.productId);
                      break;
                  }
                  else if(cumulativePrice + item.price > existingCoupon.discountValue && item.quantity > 0){
                    appliedProducts.push(item.productId);
                    break;
                  }
                  else if (cumulativePrice + item.price <= existingCoupon.discountValue && item.quantity > 0) {
                   
                    // Add the same product again if quantity is available
                    appliedProducts.push(item.productId);
                    cumulativePrice += item.price;
                    item.quantity--; // Reduce the quantity of the current product
                  } else if (item.quantity === 0) {
                    // Move to the next product when the current product's quantity is exhausted
                    i++;
                  } else if (cumulativePrice >= existingCoupon.discountValue) {
                    // Stop once the discount is met
                    break;
                  }


                }

              
                let discountSubTotal=subTotal-existingCoupon.discountValue
                let discountGrandTotal = discountSubTotal + shippingCharge;
                console.log("discountSubTotal",discountSubTotal)
                console.log("discountGrandTotal",discountGrandTotal)
            
                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:existingCoupon.discountValue,isCouponApplied:true,appliedCoupon:couponId ,appliedProducts:appliedProducts}, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
              }
              // Update userUsage

              // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)

            }
            //to check if there is oly valid categories
          } else if (existingCoupon.validCategories.length !== 0) {
            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)
            console.log("result",result)


            // const matchingCategories = result.filter((item: any) =>
            //   existingCoupon.validCategories.some((validCategory: any) =>
            //     validCategory.category.equals(item.categoryId)
            //   )
            // );

            const validCategories = existingCoupon.validCategories.map((validCategory: any) =>
              validCategory.category.toString() 
            );

            console.log("validCategories", validCategories)
            
            const matchingCategories = result.filter((item: any) =>
              item.categoryIdPath.some((categoryId: string) =>
                validCategories.includes(categoryId)  
              )
            );

           console.log("matchingCategories", matchingCategories)
          
            if (matchingCategories.length === 0) {
              throw new GraphQLError("This coupon is not applicable for this product", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }

            


            let product_sum = 0;

            for (const item of matchingCategories) {  
                product_sum += item.sellingprice;
            }


            if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }

            if (existingCoupon.discountValue) {
              // Sort matchingBrands by price in descending order
              const sortedMatchingBrands = matchingCategories.sort((a: any, b: any) => b.price - a.price);
    
              let cumulativePrice = 0;
              let appliedProducts = [];
              

              for (let i = 0; i < sortedMatchingBrands.length ;) {
                const item = sortedMatchingBrands[i];
              
                if(item.price > existingCoupon.discountValue ){
                  console.log("break1 called")
                    appliedProducts.push(item.productId);
                    break;
                }
                else if(cumulativePrice + item.price > existingCoupon.discountValue && item.quantity > 0){
                  appliedProducts.push(item.productId);
                  break;
                }
                else if (cumulativePrice + item.price <= existingCoupon.discountValue && item.quantity > 0) {
                 
                  // Add the same product again if quantity is available
                  appliedProducts.push(item.productId);
                  cumulativePrice += item.price;
                  item.quantity--; // Reduce the quantity of the current product
                } else if (item.quantity === 0) {
                  // Move to the next product when the current product's quantity is exhausted
                  i++;
                } else if (cumulativePrice >= existingCoupon.discountValue) {
                  // Stop once the discount is met
                  break;
                }


              }

              let discountSubTotal=subTotal-existingCoupon.discountValue
              let discountGrandTotal = discountSubTotal + shippingCharge;

              const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:existingCoupon.discountValue,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
              if(!discountResult){
                throw new GraphQLError("Error in applying coupon", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }
            }

            // Update userUsage

            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)

          } else if (existingCoupon.validProducts.length !== 0) {
            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)



            const matchingProducts = result.filter((item: any) =>
              existingCoupon.validProducts.some((validProducts: any) =>
                validProducts.product.equals(item.productId)
              )
            );

            if (matchingProducts.length === 0) {
              throw new GraphQLError("This coupon is not applicable for this product", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }


            let product_sum = 0;

            for (const item of matchingProducts) {  
                product_sum += item.sellingprice;
            }


            if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }

            if (existingCoupon.discountValue) {
              // Sort matchingBrands by price in descending order
              const sortedMatchingBrands = matchingProducts.sort((a: any, b: any) => b.price - a.price);
    
              let cumulativePrice = 0;
              let appliedProducts = [];
              

              for (let i = 0; i < sortedMatchingBrands.length ;) {
                const item = sortedMatchingBrands[i];
              
                if(item.price > existingCoupon.discountValue ){
                  console.log("break1 called")
                    appliedProducts.push(item.productId);
                    break;
                }
                else if(cumulativePrice + item.price > existingCoupon.discountValue && item.quantity > 0){
                  appliedProducts.push(item.productId);
                  break;
                }
                else if (cumulativePrice + item.price <= existingCoupon.discountValue && item.quantity > 0) {
                 
                  // Add the same product again if quantity is available
                  appliedProducts.push(item.productId);
                  cumulativePrice += item.price;
                  item.quantity--; // Reduce the quantity of the current product
                } else if (item.quantity === 0) {
                  // Move to the next product when the current product's quantity is exhausted
                  i++;
                } else if (cumulativePrice >= existingCoupon.discountValue) {
                  // Stop once the discount is met
                  break;
                }


              }


              let discountSubTotal=subTotal-existingCoupon.discountValue
              let discountGrandTotal = discountSubTotal + shippingCharge;
              const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:existingCoupon.discountValue,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
              if(!discountResult){
                throw new GraphQLError("Error in applying coupon", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }
            }
            // Update userUsage

            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)
          } else {


            if (existingCoupon.minOrderAmount && subTotal < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum   ", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }


            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)

            if (existingCoupon.discountValue) {

              const sortedMatchingBrands = result.sort((a: any, b: any) => b.price - a.price);
    
              let cumulativePrice = 0;
              let appliedProducts = [];
              

              for (let i = 0; i < sortedMatchingBrands.length ;) {
                const item = sortedMatchingBrands[i];
              
                if(item.price > existingCoupon.discountValue ){
                  console.log("break1 called")
                    appliedProducts.push(item.productId);
                    break;
                }
                else if(cumulativePrice + item.price > existingCoupon.discountValue && item.quantity > 0){
                  appliedProducts.push(item.productId);
                  break;
                }
                else if (cumulativePrice + item.price <= existingCoupon.discountValue && item.quantity > 0) {
                 
                  // Add the same product again if quantity is available
                  appliedProducts.push(item.productId);
                  cumulativePrice += item.price;
                  item.quantity--; // Reduce the quantity of the current product
                } else if (item.quantity === 0) {
                  // Move to the next product when the current product's quantity is exhausted
                  i++;
                } else if (cumulativePrice >= existingCoupon.discountValue) {
                  // Stop once the discount is met
                  break;
                }


              }



              let discountSubTotal=subTotal-existingCoupon.discountValue
              let discountGrandTotal = discountSubTotal + shippingCharge;

              const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:existingCoupon.discountValue,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
              if(!discountResult){
                throw new GraphQLError("Error in applying coupon", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }
            }

            // Update userUsage

            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)

          }

          discount = existingCoupon?.discountValue

        }

        
        //PERCENTAGE COUPON

        if (existingCoupon.discountType === "PERCENTAGE") {
          if (existingCoupon.validBrands.length !== 0) {

            //checking if there is any certain categories under brand
            if (existingCoupon.validCategories.length !== 0) {
              //write logic here

              const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)
              console.log("result", result)

              const validCategories = existingCoupon.validCategories.map((validCategory: any) =>
                validCategory.category.toString() 
              );
              
              const matchingBrands = result.filter((item: any) =>
                existingCoupon.validBrands.some((validBrand: any) =>
                  validBrand.brand.equals(item.brandId) 
                ) &&
                item.categoryIdPath.some((categoryId: string) =>
                  validCategories.includes(categoryId)  
                )
              );

              console.log("matchingBrands", matchingBrands)


              if (matchingBrands.length === 0) {
                throw new GraphQLError("This coupon is not applicable for this product", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }


              let product_sum = 0;
              let discount_amount = 0;


              for (const item of matchingBrands) {  
                  product_sum += item.sellingprice;
              }

              console.log("Product_sum", product_sum)



              if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
                throw new GraphQLError("Order amount is below the required minimum", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
                });
              }



              if (existingCoupon.discountValue) {
                discount_amount = ((existingCoupon?.discountValue) / 100) * product_sum;
              }


              
              if (existingCoupon.max_discount) {
                if (existingCoupon.max_discount >= discount_amount) {
                  const sortedMatchingBrands = matchingBrands.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > discount_amount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > discount_amount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= discount_amount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= discount_amount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }

                  let discountSubTotal=subTotal-discount_amount;
                  let discountGrandTotal = discountSubTotal + shippingCharge;
                  const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, {  grandTotal: discountGrandTotal,discount:discount_amount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                  if(!discountResult){
                    throw new GraphQLError("Error in applying coupon", {
                      extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                    });
                  }
                  discount = discount_amount

                } else {
                  const sortedMatchingBrands = matchingBrands.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > existingCoupon.max_discount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > existingCoupon.max_discount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= existingCoupon.max_discount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= existingCoupon.max_discount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }
                  let discountSubTotal=subTotal-existingCoupon.max_discount;
                  let discountGrandTotal = discountSubTotal + shippingCharge;
                  const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, {  grandTotal: discountGrandTotal,discount:existingCoupon.max_discount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                  if(!discountResult){
                    throw new GraphQLError("Error in applying coupon", {
                      extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                    });
                  }
                  discount=existingCoupon.max_discount
                }
              }

              // Update userUsage
              // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)



            } else {
              //if only brands
              const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)

              // const matchingBrands= result
              // .map((item:any) => item.brandId.toString()) 
              // .filter((brandId:any) => existingCoupon.validBrands.includes(brandId));

              const matchingBrands = result.filter((item: any) =>
                existingCoupon.validBrands.some((validBrand: any) =>
                  validBrand.brand.equals(item.brandId)
                )
              );

              console.log("matchingBrands", matchingBrands)

              if (matchingBrands.length === 0) {
                throw new GraphQLError("This coupon is not applicable for this product", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }


              let product_sum = 0;
              let discount_amount = 0;


              for (const item of matchingBrands) {  
                product_sum += item.sellingprice;
            }


            console.log("Product_sum", product_sum)



              if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
                throw new GraphQLError("Order amount is below the required minimum", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
                });
              }



              if (existingCoupon.discountValue) {
                discount_amount = ((existingCoupon?.discountValue) / 100) * product_sum;
              }

              console.log(discount_amount)


              if (existingCoupon.max_discount) {
                if (existingCoupon.max_discount >= discount_amount) {
                  const sortedMatchingBrands = matchingBrands.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > discount_amount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > discount_amount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= discount_amount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= discount_amount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }
                  let discountSubTotal=subTotal-discount_amount;
                  let discountGrandTotal = discountSubTotal + shippingCharge;
                  const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:discount_amount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                  if(!discountResult){
                    throw new GraphQLError("Error in applying coupon", {
                      extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                    });
                  }
                  discount = discount_amount

                } else {
                  console.log("first called")
                  const sortedMatchingBrands = matchingBrands.sort((a: any, b: any) => b.price - a.price);
                  console.log("sortedMatchingBrands", sortedMatchingBrands)
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > existingCoupon.max_discount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > existingCoupon.max_discount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= existingCoupon.max_discount && item.quantity > 0) {
                      console.log("inner called")
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    console.log("item.quantity",item.quantity)
                  } else if (item.quantity === 0) {
                    console.log("increment i")
                    // Move to the next product when the current product's quantity is exhausted
                    i++;
                    console.log({i})
                    
                    } else if (cumulativePrice >= existingCoupon.max_discount) {
                      // Stop once the discount is met
                      break;
                    }
                   
  
                  }


                  console.log("finished")
                  let discountSubTotal=subTotal-existingCoupon.max_discount;
                  let discountGrandTotal = discountSubTotal + shippingCharge;
                  const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:existingCoupon.max_discount,isCouponApplied:true,appliedCoupon:couponId ,appliedProducts:appliedProducts}, { new: true })
                  if(!discountResult){
                    throw new GraphQLError("Error in applying coupon", {
                      extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                    });
                  }
                  discount=existingCoupon.max_discount
                }
              }

             
              // Update userUsage

              // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)

            }
            //to check if there is oly valid categories
          } else if (existingCoupon.validCategories.length !== 0) {
            //write logic here

            //if only brands
            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)

            // const matchingBrands= result
            // .map((item:any) => item.brandId.toString()) 
            // .filter((brandId:any) => existingCoupon.validBrands.includes(brandId));

            const validCategories = existingCoupon.validCategories.map((validCategory: any) =>
              validCategory.category.toString() 
            );

            console.log("validCategories", validCategories)
            
            const matchingCategories = result.filter((item: any) =>
              item.categoryIdPath.some((categoryId: string) =>
                validCategories.includes(categoryId)  
              )
            );

            if (matchingCategories.length === 0) {
              throw new GraphQLError("This coupon is not applicable for this product", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }


            let product_sum = 0;
            let discount_amount = 0;



            for (const item of matchingCategories) {
              product_sum += item.sellingprice;
            }



            if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }



            if (existingCoupon.discountValue) {
              discount_amount = ((existingCoupon?.discountValue) / 100) * product_sum;
            }


           
            if (existingCoupon.max_discount) {
              if (existingCoupon.max_discount >= discount_amount) {
                const sortedMatchingBrands = matchingCategories.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > discount_amount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > discount_amount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= discount_amount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= discount_amount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }
                let discountSubTotal=subTotal-discount_amount;
                let discountGrandTotal = discountSubTotal + shippingCharge;
                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, {  grandTotal: discountGrandTotal,discount:discount_amount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
                discount = discount_amount

              } else {
                const sortedMatchingBrands = matchingCategories.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > existingCoupon.max_discount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > existingCoupon.max_discount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= existingCoupon.max_discount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= existingCoupon.max_discount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }
                let discountSubTotal=subTotal-existingCoupon.max_discount;
                let discountGrandTotal = discountSubTotal + shippingCharge;
                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, {  grandTotal: discountGrandTotal,discount:existingCoupon.max_discount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
                discount=existingCoupon.max_discount
              }
            }
            // Update userUsage

            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)


          } else if (existingCoupon.validProducts.length !== 0) {
            //write logic here
            console.log("called")

            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)

            console.log("result", result)

            const matchingProducts = result.filter((item: any) =>
              existingCoupon.validProducts.some((validProducts: any) =>
                validProducts.product.equals(item.productId)
              )
            );


            console.log("matchingProducts",matchingProducts)

            if (matchingProducts.length === 0) {
              throw new GraphQLError("This coupon is not applicable for this product", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }


            let product_sum = 0;
            let discount_amount = 0;


            for (const item of matchingProducts) {
              product_sum += item.sellingprice;
            }

            console.log("product_sum",product_sum)

            if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }



            if (existingCoupon.discountValue) {
              discount_amount = ((existingCoupon?.discountValue) / 100) * product_sum;
            }


            
            if (existingCoupon.max_discount) {
              if (existingCoupon.max_discount >= discount_amount) {
                const sortedMatchingBrands = matchingProducts.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > discount_amount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > discount_amount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= discount_amount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= discount_amount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }
                let discountSubTotal=subTotal-discount_amount;
                let discountGrandTotal = discountSubTotal + shippingCharge;
                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:discount_amount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
                discount = discount_amount

              } else {
                const sortedMatchingBrands = matchingProducts.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > existingCoupon.max_discount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > existingCoupon.max_discount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= existingCoupon.max_discount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= existingCoupon.max_discount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }
                let discountSubTotal=subTotal-existingCoupon.max_discount;
                let discountGrandTotal = discountSubTotal + shippingCharge;
                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, {  grandTotal: discountGrandTotal,discount:existingCoupon.max_discount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
                discount=existingCoupon.max_discount
              }
            }
            // Update userUsage
            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)



          } else {
            //write logic here
            let discount_amount = 0;

            if (existingCoupon.minOrderAmount && subTotal < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }


            if (existingCoupon.discountValue) {
              discount_amount = ((existingCoupon?.discountValue) / 100) * subTotal;
            }

            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)

            if (existingCoupon.max_discount) {
              if (existingCoupon.max_discount >= discount_amount) {
                const sortedMatchingBrands = result.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > discount_amount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > discount_amount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= discount_amount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= discount_amount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }
                let discountSubTotal=subTotal-discount_amount;
                let discountGrandTotal = discountSubTotal + shippingCharge;
                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:discount_amount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
                discount = discount_amount

              } else {
                const sortedMatchingBrands = result.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > existingCoupon.max_discount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > existingCoupon.max_discount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= existingCoupon.max_discount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= existingCoupon.max_discount) {
                      // Stop once the discount is met
                      break;
                    }
                  }

                let discountSubTotal=subTotal-existingCoupon.max_discount;
                let discountGrandTotal = discountSubTotal + shippingCharge;
                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, {  grandTotal: discountGrandTotal,discount:existingCoupon.max_discount,isCouponApplied:true,appliedCoupon:couponId }, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
                discount=existingCoupon.max_discount
              }
            }

            // Update userUsage
            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)



          }
        }

        //FREE_SHIPPING COUPONS

        console.log(existingCoupon.discountType)

        if (existingCoupon.discountType === "FREE_SHIPPING") {
          console.log("called")
          console.log(existingCart.shippingCharge)

          if(existingCart.shippingCharge === 0){
            throw new GraphQLError("You already have free shipping", {
              extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["You already have free shipping"] },
            })
          }
           

          console.log("free_shipping coupon")
          if (existingCoupon.validBrands.length !== 0) {

            //checking if there is any certain categories under brand
            if (existingCoupon.validCategories.length !== 0) {
              const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)


              const validCategories = existingCoupon.validCategories.map((validCategory: any) =>
                validCategory.category.toString() 
              );
              
              const matchingBrands = result.filter((item: any) =>
                existingCoupon.validBrands.some((validBrand: any) =>
                  validBrand.brand.equals(item.brandId) 
                ) &&
                item.categoryIdPath.some((categoryId: string) =>
                  validCategories.includes(categoryId)  
                )
              );

              console.log("matchingBrands", matchingBrands);


              if (matchingBrands.length === 0) {
                throw new GraphQLError("This coupon is not applicable for this product", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }

              let product_sum = 0;
            
              for (const item of matchingBrands) {  
                product_sum += item.sellingprice;
            }




              if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
                throw new GraphQLError("Order amount is below the required minimum", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
                });
              }

              let discount_shippingCharge = 0;
              let discount_grandTotal=subTotal+discount_shippingCharge
              const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discount_grandTotal,discount:shippingCharge,isCouponApplied:true,shippingCharge:discount_shippingCharge,appliedCoupon:couponId }, { new: true })
              if(!discountResult){
                throw new GraphQLError("Error in applying coupon", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }
              // Update userUsage

              discount=discount_shippingCharge

              // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)



            } else {
              //if only brands
              const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)
              console.log("brandResult", result)

              const matchingBrands = result.filter((item: any) =>
                existingCoupon.validBrands.some((validBrand: any) =>
                  validBrand.brand.equals(item.brandId)
                )
              );
              console.log("matchingBrands", matchingBrands)

              if (matchingBrands.length === 0) {
                throw new GraphQLError("This coupon is not applicable for this product", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }


             
              let product_sum = 0;
            
              for (const item of matchingBrands) {  
                product_sum += item.sellingprice;
            }




              if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
                throw new GraphQLError("Order amount is below the required minimum", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
                });
              }

              let discount_shippingCharge = 0;
              let discount_grandTotal=subTotal+discount_shippingCharge
              const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discount_grandTotal,discount:shippingCharge,isCouponApplied:true,shippingCharge:discount_shippingCharge,appliedCoupon:couponId }, { new: true })
              if(!discountResult){
                throw new GraphQLError("Error in applying coupon", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }
              // Update userUsage

              discount=discount_shippingCharge

              // Update userUsage

              // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)

            }
            //to check if there is oly valid categories
          } else if (existingCoupon.validCategories.length !== 0) {
            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)


            const validCategories = existingCoupon.validCategories.map((validCategory: any) =>
              validCategory.category.toString() 
            );

            console.log("validCategories", validCategories)
            
            const matchingCategories = result.filter((item: any) =>
              item.categoryIdPath.some((categoryId: string) =>
                validCategories.includes(categoryId)  
              )
            );

            if (matchingCategories.length === 0) {
              throw new GraphQLError("This coupon is not applicable for this product", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }


            let product_sum = 0;
            
            for (const item of matchingCategories) {  
              product_sum += item.sellingprice;
          }




            if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }

            let discount_shippingCharge = 0;
            let discount_grandTotal=subTotal+discount_shippingCharge
            const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discount_grandTotal,discount:shippingCharge,isCouponApplied:true,shippingCharge:discount_shippingCharge ,appliedCoupon:couponId}, { new: true })
            if(!discountResult){
              throw new GraphQLError("Error in applying coupon", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }
            // Update userUsage

            discount=discount_shippingCharge

            // Update userUsage

            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)

          } else if (existingCoupon.validProducts.length !== 0) {
            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)



            const matchingProducts = result.filter((item: any) =>
              existingCoupon.validProducts.some((validProducts: any) =>
                validProducts.product.equals(item.productId)
              )
            );

            if (matchingProducts.length === 0) {
              throw new GraphQLError("This coupon is not applicable for this product", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }


           
            let product_sum = 0;
            
            for (const item of matchingProducts) {  
              product_sum += item.sellingprice;
          }




            if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }

            let discount_shippingCharge = 0;
            let discount_grandTotal=subTotal+discount_shippingCharge
            const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discount_grandTotal,discount:shippingCharge,isCouponApplied:true,shippingCharge:discount_shippingCharge ,appliedCoupon:couponId}, { new: true })
            if(!discountResult){
              throw new GraphQLError("Error in applying coupon", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }
            // Update userUsage

            discount=discount_shippingCharge

            // Update userUsage

            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)
          } else {

            if (existingCoupon.minOrderAmount && grandTotal < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }

            let discount_shippingCharge = 0;
            let discount_grandTotal=subTotal+discount_shippingCharge
            const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discount_grandTotal,discount:shippingCharge,isCouponApplied:true,shippingCharge:discount_shippingCharge,appliedCoupon:couponId }, { new: true })
            console.log("discountResult", discountResult)
            if(!discountResult){
              throw new GraphQLError("Error in applying coupon", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }
            // Update userUsage

            discount=discount_shippingCharge
            // Update userUsage
            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)

          }

        }

        return {
          success: true,
          message: "Coupon applied successfully.",
        };

      } catch (error: any) {
        throw new GraphQLError(error, {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },


    applyCouponByUserInMobile: async (parent, { input }, { req }, info) => {
      try {

        let discount: number | undefined = 0;

        await verifyUser(req) 
        const userId = req.authAccount?._id; 
       
        let code;
        let couponId;

        if(input?.code){
          const coupon=await couponsModel.findOne({code:input?.code})

          if(!coupon){
            throw new GraphQLError("Coupon code not exists,Try another code", {
              extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Coupon code not exists"] },
            });
          }

          couponId=coupon?._id;
          code=coupon?.code;
        }else{
          couponId=input?.couponId;    
          code=input?.code;
        }

        console.log("couponId",couponId)

        const userCart=await cartService.findUserCart(userId)

        let subTotal=userCart?.subTotal;
        console.log("subTotal",subTotal)

        let grandTotal=userCart?.grandTotal;

        let shippingCharge=userCart?.shippingCharge


        const existingCoupon = await couponsModel.findOne({
          $or: [
            { code: code },
            { _id: couponId }
          ]
        })

        if (!existingCoupon) {
          throw new GraphQLError("Coupon code not exists,Try another code", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Coupon code not exists"] },
          });
        }

        const existingUser = await userModel.findOne({ _id: userId })

        if (!existingUser) {
          throw new GraphQLError("Something went Wrong!!Login Again!!", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Something went Wrong!!Login Again!!"] },
          });
        }


        const existingCart = await cartModel.findOne({ userId: userId })

        if (!existingCart) {
          throw new GraphQLError("cart not found!!Try again", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["cart not found!!Try again"] },
          });
        }

        if(existingCart.products.length===0){
          throw new GraphQLError("Your cart is empty!!", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Your cart is empty!!"] },
          });
        }

        if(existingCart.isCouponApplied){
          throw new GraphQLError("Only one coupon can be applied!!", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["This coupon is not active!!"] },
          });
        }

        //check coupon active or not
        if (!existingCoupon.isActive) {
          throw new GraphQLError("This coupon is not active!!", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["This coupon is not active!!"] },
          });
        }

        //check expired or not

        if (existingCoupon.expiryDate && new Date() > new Date(existingCoupon.expiryDate)) {
          throw new GraphQLError("This coupon is expired!!", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["This coupon is expired!!"] },
          });
        }

        //check if he is a valid user or not

        if (existingCoupon.validUsers.length !== 0) {
          const validUser = existingCoupon.validUsers.find(users => users?.user?.toString() === userId.toString());

          if (!validUser) {
            throw new GraphQLError("This coupon is not valid for you", {
              extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["This coupon is not valid for you"] },
            });
          }
        }


        //check the usage limit of this coupon exceed or not

        if (existingCoupon.usageLimit) {
          const result = await couponService.findusageLimit(couponId)
          if (result >= existingCoupon.usageLimit) {
            throw new GraphQLError("The limit of coupon is reached", {
              extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["The limit of coupon is reached"] },
            });
          }
        }


        //check the usage per user limit of this coupon exceed or not

        if (existingCoupon.usagePerUserLimit) {
          const result = await couponService.findusagePerUserLimit(couponId, userId)
          if (result >= existingCoupon.usagePerUserLimit) {
            throw new GraphQLError("usage limit reached", {
              extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["The limit of coupon is reached"] },
            });
          }

        }


        //check if there is any orderlimit
        if (existingCoupon.orderCount) {
          const result = await couponService.findOrderCount(userId)

          if (existingCoupon.orderCount - 1 !== result) {
            throw new GraphQLError(`This coupon is only applicable for your ${existingCoupon.orderCount} order`, {
              extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
            });
          }
        }

        //calculate grand total/subtotal/shipping charge 
       
        // const subTotal=await couponService.findSubTotal(userId)


        //check the discount type of coupon

        //FLAT COUPON

        if (existingCoupon.discountType === "FLAT") {
          //check if there is any restriction

          //check if there is any valid brands

          if (existingCoupon.validBrands.length !== 0) {

            //checking if there is any certain categories under brand
            if (existingCoupon.validCategories.length !== 0) {
              console.log("called")
              const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)
              console.log("result", result)


              // const matchingBrands = result.filter((item: any) =>
              //   existingCoupon.validBrands.some((validBrand: any) =>
              //     validBrand.brand.equals(item.brandId) // Check if brandId matches
              //   ) &&
              //   existingCoupon.validCategories.some((validCategory: any) =>
              //     validCategory.category.equals(item.categoryId) // Check if categoryId matches
              //   )
              // );


              const validCategories = existingCoupon.validCategories.map((validCategory: any) =>
                validCategory.category.toString() 
              );
              
              const matchingBrands = result.filter((item: any) =>
                existingCoupon.validBrands.some((validBrand: any) =>
                  validBrand.brand.equals(item.brandId) 
                ) &&
                item.categoryIdPath.some((categoryId: string) =>
                  validCategories.includes(categoryId)  
                )
              );
              
              
              console.log("matchingBrands", matchingBrands);


              if (matchingBrands.length === 0) {
                throw new GraphQLError("This coupon is not applicable for this product", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }


              let product_sum = 0;

              for (const item of matchingBrands) {  
                  product_sum += item.sellingprice;
              }


              if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
                throw new GraphQLError("Order amount is below the required minimum", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
                });
              }

              if (existingCoupon.discountValue) {
                const sortedMatchingBrands = matchingBrands.sort((a: any, b: any) => b.price - a.price);
    
                let cumulativePrice = 0;
                let appliedProducts = [];
                

                for (let i = 0; i < sortedMatchingBrands.length ;) {
                  const item = sortedMatchingBrands[i];
                
                  if(item.price > existingCoupon.discountValue ){
                      appliedProducts.push(item.productId);
                      break;
                  }
                  else if(cumulativePrice + item.price > existingCoupon.discountValue && item.quantity > 0){
                    appliedProducts.push(item.productId);
                    break;
                  }
                  else if (cumulativePrice + item.price <= existingCoupon.discountValue && item.quantity > 0) {
                   
                    // Add the same product again if quantity is available
                    appliedProducts.push(item.productId);
                    cumulativePrice += item.price;
                    item.quantity--; // Reduce the quantity of the current product
                  } else if (item.quantity === 0) {
                    // Move to the next product when the current product's quantity is exhausted
                    i++;
                  } else if (cumulativePrice >= existingCoupon.discountValue) {
                    // Stop once the discount is met
                    break;
                  }


                }

                let discountSubTotal=subTotal-existingCoupon.discountValue
                let discountGrandTotal = discountSubTotal + shippingCharge;

                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:existingCoupon.discountValue,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
              }
              // Update userUsage

              // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)



            } else {
              //if only brands
              const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)
              console.log("brandResult", result)

              const matchingBrands = result.filter((item: any) =>
                existingCoupon.validBrands.some((validBrand: any) =>
                  validBrand.brand.equals(item.brandId)
                )
              );
              console.log("matchingBrands", matchingBrands)

              if (matchingBrands.length === 0) {
                throw new GraphQLError("This coupon is not applicable for this product", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }


              let product_sum = 0;

              for (const item of matchingBrands) {  
                  product_sum += item.sellingprice;
              }


              if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
                throw new GraphQLError("Order amount is below the required minimum", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
                });
              }

              console.log("product_sum", product_sum)

              if (existingCoupon.discountValue) {
                // Sort matchingBrands by price in descending order
                const sortedMatchingBrands = matchingBrands.sort((a: any, b: any) => b.price - a.price);
    
                let cumulativePrice = 0;
                let appliedProducts = [];
                

                for (let i = 0; i < sortedMatchingBrands.length ;) {
                  const item = sortedMatchingBrands[i];
                
                  if(item.price > existingCoupon.discountValue ){
                    console.log("break1 called")
                      appliedProducts.push(item.productId);
                      break;
                  }
                  else if(cumulativePrice + item.price > existingCoupon.discountValue && item.quantity > 0){
                    appliedProducts.push(item.productId);
                    break;
                  }
                  else if (cumulativePrice + item.price <= existingCoupon.discountValue && item.quantity > 0) {
                   
                    // Add the same product again if quantity is available
                    appliedProducts.push(item.productId);
                    cumulativePrice += item.price;
                    item.quantity--; // Reduce the quantity of the current product
                  } else if (item.quantity === 0) {
                    // Move to the next product when the current product's quantity is exhausted
                    i++;
                  } else if (cumulativePrice >= existingCoupon.discountValue) {
                    // Stop once the discount is met
                    break;
                  }


                }

              
                let discountSubTotal=subTotal-existingCoupon.discountValue
                let discountGrandTotal = discountSubTotal + shippingCharge;
                console.log("discountSubTotal",discountSubTotal)
                console.log("discountGrandTotal",discountGrandTotal)
            
                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:existingCoupon.discountValue,isCouponApplied:true,appliedCoupon:couponId ,appliedProducts:appliedProducts}, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
              }
              // Update userUsage

              // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)

            }
            //to check if there is oly valid categories
          } else if (existingCoupon.validCategories.length !== 0) {
            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)
            console.log("result",result)


            // const matchingCategories = result.filter((item: any) =>
            //   existingCoupon.validCategories.some((validCategory: any) =>
            //     validCategory.category.equals(item.categoryId)
            //   )
            // );

            const validCategories = existingCoupon.validCategories.map((validCategory: any) =>
              validCategory.category.toString() 
            );

            console.log("validCategories", validCategories)
            
            const matchingCategories = result.filter((item: any) =>
              item.categoryIdPath.some((categoryId: string) =>
                validCategories.includes(categoryId)  
              )
            );

           console.log("matchingCategories", matchingCategories)
          
            if (matchingCategories.length === 0) {
              throw new GraphQLError("This coupon is not applicable for this product", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }

            


            let product_sum = 0;

            for (const item of matchingCategories) {  
                product_sum += item.sellingprice;
            }


            if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }

            if (existingCoupon.discountValue) {
              // Sort matchingBrands by price in descending order
              const sortedMatchingBrands = matchingCategories.sort((a: any, b: any) => b.price - a.price);
    
              let cumulativePrice = 0;
              let appliedProducts = [];
              

              for (let i = 0; i < sortedMatchingBrands.length ;) {
                const item = sortedMatchingBrands[i];
              
                if(item.price > existingCoupon.discountValue ){
                  console.log("break1 called")
                    appliedProducts.push(item.productId);
                    break;
                }
                else if(cumulativePrice + item.price > existingCoupon.discountValue && item.quantity > 0){
                  appliedProducts.push(item.productId);
                  break;
                }
                else if (cumulativePrice + item.price <= existingCoupon.discountValue && item.quantity > 0) {
                 
                  // Add the same product again if quantity is available
                  appliedProducts.push(item.productId);
                  cumulativePrice += item.price;
                  item.quantity--; // Reduce the quantity of the current product
                } else if (item.quantity === 0) {
                  // Move to the next product when the current product's quantity is exhausted
                  i++;
                } else if (cumulativePrice >= existingCoupon.discountValue) {
                  // Stop once the discount is met
                  break;
                }


              }

              let discountSubTotal=subTotal-existingCoupon.discountValue
              let discountGrandTotal = discountSubTotal + shippingCharge;

              const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:existingCoupon.discountValue,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
              if(!discountResult){
                throw new GraphQLError("Error in applying coupon", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }
            }

            // Update userUsage

            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)

          } else if (existingCoupon.validProducts.length !== 0) {
            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)



            const matchingProducts = result.filter((item: any) =>
              existingCoupon.validProducts.some((validProducts: any) =>
                validProducts.product.equals(item.productId)
              )
            );

            if (matchingProducts.length === 0) {
              throw new GraphQLError("This coupon is not applicable for this product", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }


            let product_sum = 0;

            for (const item of matchingProducts) {  
                product_sum += item.sellingprice;
            }


            if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }

            if (existingCoupon.discountValue) {
              // Sort matchingBrands by price in descending order
              const sortedMatchingBrands = matchingProducts.sort((a: any, b: any) => b.price - a.price);
    
              let cumulativePrice = 0;
              let appliedProducts = [];
              

              for (let i = 0; i < sortedMatchingBrands.length ;) {
                const item = sortedMatchingBrands[i];
              
                if(item.price > existingCoupon.discountValue ){
                  console.log("break1 called")
                    appliedProducts.push(item.productId);
                    break;
                }
                else if(cumulativePrice + item.price > existingCoupon.discountValue && item.quantity > 0){
                  appliedProducts.push(item.productId);
                  break;
                }
                else if (cumulativePrice + item.price <= existingCoupon.discountValue && item.quantity > 0) {
                 
                  // Add the same product again if quantity is available
                  appliedProducts.push(item.productId);
                  cumulativePrice += item.price;
                  item.quantity--; // Reduce the quantity of the current product
                } else if (item.quantity === 0) {
                  // Move to the next product when the current product's quantity is exhausted
                  i++;
                } else if (cumulativePrice >= existingCoupon.discountValue) {
                  // Stop once the discount is met
                  break;
                }


              }


              let discountSubTotal=subTotal-existingCoupon.discountValue
              let discountGrandTotal = discountSubTotal + shippingCharge;
              const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:existingCoupon.discountValue,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
              if(!discountResult){
                throw new GraphQLError("Error in applying coupon", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }
            }
            // Update userUsage

            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)
          } else {


            if (existingCoupon.minOrderAmount && subTotal < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum   ", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }


            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)

            if (existingCoupon.discountValue) {

              const sortedMatchingBrands = result.sort((a: any, b: any) => b.price - a.price);
    
              let cumulativePrice = 0;
              let appliedProducts = [];
              

              for (let i = 0; i < sortedMatchingBrands.length ;) {
                const item = sortedMatchingBrands[i];
              
                if(item.price > existingCoupon.discountValue ){
                  console.log("break1 called")
                    appliedProducts.push(item.productId);
                    break;
                }
                else if(cumulativePrice + item.price > existingCoupon.discountValue && item.quantity > 0){
                  appliedProducts.push(item.productId);
                  break;
                }
                else if (cumulativePrice + item.price <= existingCoupon.discountValue && item.quantity > 0) {
                 
                  // Add the same product again if quantity is available
                  appliedProducts.push(item.productId);
                  cumulativePrice += item.price;
                  item.quantity--; // Reduce the quantity of the current product
                } else if (item.quantity === 0) {
                  // Move to the next product when the current product's quantity is exhausted
                  i++;
                } else if (cumulativePrice >= existingCoupon.discountValue) {
                  // Stop once the discount is met
                  break;
                }


              }



              let discountSubTotal=subTotal-existingCoupon.discountValue
              let discountGrandTotal = discountSubTotal + shippingCharge;

              const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:existingCoupon.discountValue,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
              if(!discountResult){
                throw new GraphQLError("Error in applying coupon", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }
            }

            // Update userUsage

            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)

          }

          discount = existingCoupon?.discountValue

        }

        
        //PERCENTAGE COUPON

        if (existingCoupon.discountType === "PERCENTAGE") {
          if (existingCoupon.validBrands.length !== 0) {

            //checking if there is any certain categories under brand
            if (existingCoupon.validCategories.length !== 0) {
              //write logic here

              const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)
              console.log("result", result)

              const validCategories = existingCoupon.validCategories.map((validCategory: any) =>
                validCategory.category.toString() 
              );
              
              const matchingBrands = result.filter((item: any) =>
                existingCoupon.validBrands.some((validBrand: any) =>
                  validBrand.brand.equals(item.brandId) 
                ) &&
                item.categoryIdPath.some((categoryId: string) =>
                  validCategories.includes(categoryId)  
                )
              );

              console.log("matchingBrands", matchingBrands)


              if (matchingBrands.length === 0) {
                throw new GraphQLError("This coupon is not applicable for this product", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }


              let product_sum = 0;
              let discount_amount = 0;


              for (const item of matchingBrands) {  
                  product_sum += item.sellingprice;
              }

              console.log("Product_sum", product_sum)



              if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
                throw new GraphQLError("Order amount is below the required minimum", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
                });
              }



              if (existingCoupon.discountValue) {
                discount_amount = ((existingCoupon?.discountValue) / 100) * product_sum;
              }


              
              if (existingCoupon.max_discount) {
                if (existingCoupon.max_discount >= discount_amount) {
                  const sortedMatchingBrands = matchingBrands.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > discount_amount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > discount_amount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= discount_amount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= discount_amount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }

                  let discountSubTotal=subTotal-discount_amount;
                  let discountGrandTotal = discountSubTotal + shippingCharge;
                  const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, {  grandTotal: discountGrandTotal,discount:discount_amount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                  if(!discountResult){
                    throw new GraphQLError("Error in applying coupon", {
                      extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                    });
                  }
                  discount = discount_amount

                } else {
                  const sortedMatchingBrands = matchingBrands.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > existingCoupon.max_discount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > existingCoupon.max_discount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= existingCoupon.max_discount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= existingCoupon.max_discount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }
                  let discountSubTotal=subTotal-existingCoupon.max_discount;
                  let discountGrandTotal = discountSubTotal + shippingCharge;
                  const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, {  grandTotal: discountGrandTotal,discount:existingCoupon.max_discount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                  if(!discountResult){
                    throw new GraphQLError("Error in applying coupon", {
                      extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                    });
                  }
                  discount=existingCoupon.max_discount
                }
              }

              // Update userUsage
              // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)



            } else {
              //if only brands
              const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)

              // const matchingBrands= result
              // .map((item:any) => item.brandId.toString()) 
              // .filter((brandId:any) => existingCoupon.validBrands.includes(brandId));

              const matchingBrands = result.filter((item: any) =>
                existingCoupon.validBrands.some((validBrand: any) =>
                  validBrand.brand.equals(item.brandId)
                )
              );

              console.log("matchingBrands", matchingBrands)

              if (matchingBrands.length === 0) {
                throw new GraphQLError("This coupon is not applicable for this product", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }


              let product_sum = 0;
              let discount_amount = 0;


              for (const item of matchingBrands) {  
                product_sum += item.sellingprice;
            }


            console.log("Product_sum", product_sum)



              if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
                throw new GraphQLError("Order amount is below the required minimum", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
                });
              }



              if (existingCoupon.discountValue) {
                discount_amount = ((existingCoupon?.discountValue) / 100) * product_sum;
              }

              console.log(discount_amount)


              if (existingCoupon.max_discount) {
                if (existingCoupon.max_discount >= discount_amount) {
                  const sortedMatchingBrands = matchingBrands.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > discount_amount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > discount_amount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= discount_amount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= discount_amount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }
                  let discountSubTotal=subTotal-discount_amount;
                  let discountGrandTotal = discountSubTotal + shippingCharge;
                  const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:discount_amount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                  if(!discountResult){
                    throw new GraphQLError("Error in applying coupon", {
                      extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                    });
                  }
                  discount = discount_amount

                } else {
                  console.log("first called")
                  const sortedMatchingBrands = matchingBrands.sort((a: any, b: any) => b.price - a.price);
                  console.log("sortedMatchingBrands", sortedMatchingBrands)
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > existingCoupon.max_discount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > existingCoupon.max_discount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= existingCoupon.max_discount && item.quantity > 0) {
                      console.log("inner called")
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    console.log("item.quantity",item.quantity)
                  } else if (item.quantity === 0) {
                    console.log("increment i")
                    // Move to the next product when the current product's quantity is exhausted
                    i++;
                    console.log({i})
                    
                    } else if (cumulativePrice >= existingCoupon.max_discount) {
                      // Stop once the discount is met
                      break;
                    }
                   
  
                  }


                  console.log("finished")
                  let discountSubTotal=subTotal-existingCoupon.max_discount;
                  let discountGrandTotal = discountSubTotal + shippingCharge;
                  const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:existingCoupon.max_discount,isCouponApplied:true,appliedCoupon:couponId ,appliedProducts:appliedProducts}, { new: true })
                  if(!discountResult){
                    throw new GraphQLError("Error in applying coupon", {
                      extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                    });
                  }
                  discount=existingCoupon.max_discount
                }
              }

             
              // Update userUsage

              // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)

            }
            //to check if there is oly valid categories
          } else if (existingCoupon.validCategories.length !== 0) {
            //write logic here

            //if only brands
            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)

            // const matchingBrands= result
            // .map((item:any) => item.brandId.toString()) 
            // .filter((brandId:any) => existingCoupon.validBrands.includes(brandId));

            const validCategories = existingCoupon.validCategories.map((validCategory: any) =>
              validCategory.category.toString() 
            );

            console.log("validCategories", validCategories)
            
            const matchingCategories = result.filter((item: any) =>
              item.categoryIdPath.some((categoryId: string) =>
                validCategories.includes(categoryId)  
              )
            );

            if (matchingCategories.length === 0) {
              throw new GraphQLError("This coupon is not applicable for this product", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }


            let product_sum = 0;
            let discount_amount = 0;



            for (const item of matchingCategories) {
              product_sum += item.sellingprice;
            }



            if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }



            if (existingCoupon.discountValue) {
              discount_amount = ((existingCoupon?.discountValue) / 100) * product_sum;
            }


           
            if (existingCoupon.max_discount) {
              if (existingCoupon.max_discount >= discount_amount) {
                const sortedMatchingBrands = matchingCategories.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > discount_amount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > discount_amount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= discount_amount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= discount_amount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }
                let discountSubTotal=subTotal-discount_amount;
                let discountGrandTotal = discountSubTotal + shippingCharge;
                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, {  grandTotal: discountGrandTotal,discount:discount_amount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
                discount = discount_amount

              } else {
                const sortedMatchingBrands = matchingCategories.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > existingCoupon.max_discount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > existingCoupon.max_discount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= existingCoupon.max_discount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= existingCoupon.max_discount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }
                let discountSubTotal=subTotal-existingCoupon.max_discount;
                let discountGrandTotal = discountSubTotal + shippingCharge;
                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, {  grandTotal: discountGrandTotal,discount:existingCoupon.max_discount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
                discount=existingCoupon.max_discount
              }
            }
            // Update userUsage

            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)


          } else if (existingCoupon.validProducts.length !== 0) {
            //write logic here
            console.log("called")

            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)

            console.log("result", result)

            const matchingProducts = result.filter((item: any) =>
              existingCoupon.validProducts.some((validProducts: any) =>
                validProducts.product.equals(item.productId)
              )
            );


            console.log("matchingProducts",matchingProducts)

            if (matchingProducts.length === 0) {
              throw new GraphQLError("This coupon is not applicable for this product", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }


            let product_sum = 0;
            let discount_amount = 0;


            for (const item of matchingProducts) {
              product_sum += item.sellingprice;
            }

            console.log("product_sum",product_sum)

            if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }



            if (existingCoupon.discountValue) {
              discount_amount = ((existingCoupon?.discountValue) / 100) * product_sum;
            }


            
            if (existingCoupon.max_discount) {
              if (existingCoupon.max_discount >= discount_amount) {
                const sortedMatchingBrands = matchingProducts.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > discount_amount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > discount_amount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= discount_amount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= discount_amount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }
                let discountSubTotal=subTotal-discount_amount;
                let discountGrandTotal = discountSubTotal + shippingCharge;
                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:discount_amount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
                discount = discount_amount

              } else {
                const sortedMatchingBrands = matchingProducts.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > existingCoupon.max_discount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > existingCoupon.max_discount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= existingCoupon.max_discount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= existingCoupon.max_discount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }
                let discountSubTotal=subTotal-existingCoupon.max_discount;
                let discountGrandTotal = discountSubTotal + shippingCharge;
                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, {  grandTotal: discountGrandTotal,discount:existingCoupon.max_discount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
                discount=existingCoupon.max_discount
              }
            }
            // Update userUsage
            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)



          } else {
            //write logic here
            let discount_amount = 0;

            if (existingCoupon.minOrderAmount && subTotal < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }


            if (existingCoupon.discountValue) {
              discount_amount = ((existingCoupon?.discountValue) / 100) * subTotal;
            }

            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)

            if (existingCoupon.max_discount) {
              if (existingCoupon.max_discount >= discount_amount) {
                const sortedMatchingBrands = result.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > discount_amount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > discount_amount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= discount_amount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= discount_amount) {
                      // Stop once the discount is met
                      break;
                    }
  
  
                  }
                let discountSubTotal=subTotal-discount_amount;
                let discountGrandTotal = discountSubTotal + shippingCharge;
                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discountGrandTotal,discount:discount_amount,isCouponApplied:true,appliedCoupon:couponId,appliedProducts:appliedProducts }, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
                discount = discount_amount

              } else {
                const sortedMatchingBrands = result.sort((a: any, b: any) => b.price - a.price);
    
                  let cumulativePrice = 0;
                  let appliedProducts = [];
                  
  
                  for (let i = 0; i < sortedMatchingBrands.length ;) {
                    const item = sortedMatchingBrands[i];
                  
                    if(item.price > existingCoupon.max_discount ){
                      console.log("break1 called")
                        appliedProducts.push(item.productId);
                        break;
                    }
                    else if(cumulativePrice + item.price > existingCoupon.max_discount && item.quantity > 0){
                      appliedProducts.push(item.productId);
                      break;
                    }
                    else if (cumulativePrice + item.price <= existingCoupon.max_discount && item.quantity > 0) {
                     
                      // Add the same product again if quantity is available
                      appliedProducts.push(item.productId);
                      cumulativePrice += item.price;
                      item.quantity--; // Reduce the quantity of the current product
                    } else if (item.quantity === 0) {
                      // Move to the next product when the current product's quantity is exhausted
                      i++;
                    } else if (cumulativePrice >= existingCoupon.max_discount) {
                      // Stop once the discount is met
                      break;
                    }
                  }

                let discountSubTotal=subTotal-existingCoupon.max_discount;
                let discountGrandTotal = discountSubTotal + shippingCharge;
                const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, {  grandTotal: discountGrandTotal,discount:existingCoupon.max_discount,isCouponApplied:true,appliedCoupon:couponId }, { new: true })
                if(!discountResult){
                  throw new GraphQLError("Error in applying coupon", {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                  });
                }
                discount=existingCoupon.max_discount
              }
            }

            // Update userUsage
            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)



          }
        }

        //FREE_SHIPPING COUPONS

        console.log(existingCoupon.discountType)

        if (existingCoupon.discountType === "FREE_SHIPPING") {

          console.log("free_shipping coupon")
          if (existingCoupon.validBrands.length !== 0) {

            //checking if there is any certain categories under brand
            if (existingCoupon.validCategories.length !== 0) {
              const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)


              const validCategories = existingCoupon.validCategories.map((validCategory: any) =>
                validCategory.category.toString() 
              );
              
              const matchingBrands = result.filter((item: any) =>
                existingCoupon.validBrands.some((validBrand: any) =>
                  validBrand.brand.equals(item.brandId) 
                ) &&
                item.categoryIdPath.some((categoryId: string) =>
                  validCategories.includes(categoryId)  
                )
              );

              console.log("matchingBrands", matchingBrands);


              if (matchingBrands.length === 0) {
                throw new GraphQLError("This coupon is not applicable for this product", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }

              let product_sum = 0;
            
              for (const item of matchingBrands) {  
                product_sum += item.sellingprice;
            }




              if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
                throw new GraphQLError("Order amount is below the required minimum", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
                });
              }

              let discount_shippingCharge = 0;
              let discount_grandTotal=subTotal+discount_shippingCharge
              const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discount_grandTotal,discount:shippingCharge,isCouponApplied:true,shippingCharge:discount_shippingCharge,appliedCoupon:couponId }, { new: true })
              if(!discountResult){
                throw new GraphQLError("Error in applying coupon", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }
              // Update userUsage

              discount=discount_shippingCharge

              // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)



            } else {
              //if only brands
              const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)
              console.log("brandResult", result)

              const matchingBrands = result.filter((item: any) =>
                existingCoupon.validBrands.some((validBrand: any) =>
                  validBrand.brand.equals(item.brandId)
                )
              );
              console.log("matchingBrands", matchingBrands)

              if (matchingBrands.length === 0) {
                throw new GraphQLError("This coupon is not applicable for this product", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }


             
              let product_sum = 0;
            
              for (const item of matchingBrands) {  
                product_sum += item.sellingprice;
            }




              if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
                throw new GraphQLError("Order amount is below the required minimum", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
                });
              }

              let discount_shippingCharge = 0;
              let discount_grandTotal=subTotal+discount_shippingCharge
              const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discount_grandTotal,discount:shippingCharge,isCouponApplied:true,shippingCharge:discount_shippingCharge,appliedCoupon:couponId }, { new: true })
              if(!discountResult){
                throw new GraphQLError("Error in applying coupon", {
                  extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
                });
              }
              // Update userUsage

              discount=discount_shippingCharge

              // Update userUsage

              // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)

            }
            //to check if there is oly valid categories
          } else if (existingCoupon.validCategories.length !== 0) {
            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)


            const validCategories = existingCoupon.validCategories.map((validCategory: any) =>
              validCategory.category.toString() 
            );

            console.log("validCategories", validCategories)
            
            const matchingCategories = result.filter((item: any) =>
              item.categoryIdPath.some((categoryId: string) =>
                validCategories.includes(categoryId)  
              )
            );

            if (matchingCategories.length === 0) {
              throw new GraphQLError("This coupon is not applicable for this product", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }


            let product_sum = 0;
            
            for (const item of matchingCategories) {  
              product_sum += item.sellingprice;
          }




            if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }

            let discount_shippingCharge = 0;
            let discount_grandTotal=subTotal+discount_shippingCharge
            const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discount_grandTotal,discount:shippingCharge,isCouponApplied:true,shippingCharge:discount_shippingCharge ,appliedCoupon:couponId}, { new: true })
            if(!discountResult){
              throw new GraphQLError("Error in applying coupon", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }
            // Update userUsage

            discount=discount_shippingCharge

            // Update userUsage

            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)

          } else if (existingCoupon.validProducts.length !== 0) {
            const result = await couponService.findValidBrands(userId, couponId, grandTotal, subTotal, shippingCharge)



            const matchingProducts = result.filter((item: any) =>
              existingCoupon.validProducts.some((validProducts: any) =>
                validProducts.product.equals(item.productId)
              )
            );

            if (matchingProducts.length === 0) {
              throw new GraphQLError("This coupon is not applicable for this product", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }


           
            let product_sum = 0;
            
            for (const item of matchingProducts) {  
              product_sum += item.sellingprice;
          }




            if (existingCoupon.minOrderAmount && product_sum < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }

            let discount_shippingCharge = 0;
            let discount_grandTotal=subTotal+discount_shippingCharge
            const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discount_grandTotal,discount:shippingCharge,isCouponApplied:true,shippingCharge:discount_shippingCharge ,appliedCoupon:couponId}, { new: true })
            if(!discountResult){
              throw new GraphQLError("Error in applying coupon", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }
            // Update userUsage

            discount=discount_shippingCharge

            // Update userUsage

            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)
          } else {

            if (existingCoupon.minOrderAmount && grandTotal < existingCoupon.minOrderAmount) {
              throw new GraphQLError("Order amount is below the required minimum", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["Order amount is below the required minimum"] },
              });
            }

            let discount_shippingCharge = 0;
            let discount_grandTotal=subTotal+discount_shippingCharge
            const discountResult = await cartModel.findByIdAndUpdate(existingCart._id, { grandTotal: discount_grandTotal,discount:shippingCharge,isCouponApplied:true,shippingCharge:discount_shippingCharge,appliedCoupon:couponId }, { new: true })
            console.log("discountResult", discountResult)
            if(!discountResult){
              throw new GraphQLError("Error in applying coupon", {
                extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't apply this code"] },
              });
            }
            // Update userUsage

            discount=discount_shippingCharge
            // Update userUsage
            // const updatedCoupon = await couponService.updateUserUsage(userId, couponId)

          }

        }

        return {
          success: true,
          message: "Coupon applied successfully.",
        };

      } catch (error: any) {
        throw new GraphQLError(error, {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },


    //remove coupon by user
    removeCoupon: async (parent, {  }, { req }, info) => {
      await verifyUser(req) 
      const userId = req.authAccount?._id; 
  
       const existingCart = await cartModel.findOne({ userId: userId })

        if (!existingCart) {
          throw new GraphQLError("cart not found!!Try again", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["cart not found!!Try again"] },
          });
        }

        const result =await cartService.updateCartTotals(userId)

        if(!result){
          throw new GraphQLError("Error in removing coupon", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't remove this code"] }, 
          });
        }


        const updateresult= await cartModel.findByIdAndUpdate(existingCart._id, { isCouponApplied: false,discount:0,appliedCoupon:null,appliedProducts:null }, { new: true });


        if(!updateresult){
          throw new GraphQLError("Error in removing coupon", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't remove this code"] }, 
          });
        }


        return {
          success: true,
          message: "Coupon removed successfully."
        }

    },

    //remove coupon by user in mobile

    removeCouponInMobile: async (parent, { }, { req }, info) => {
      console.log("called")
      await verifyUser(req) 
      const userId = req.authAccount?._id; 
     

       const existingCart = await cartModel.findOne({ userId: userId })
       console.log("existingCart",existingCart)

        if (!existingCart) {
          throw new GraphQLError("cart not found!!Try again", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["cart not found!!Try again"] },
          });
        }

        const result =await cartService.updateCartTotals(userId)
        console.log("result",result)

        if(!result){
          throw new GraphQLError("Error in removing coupon", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't remove this code"] }, 
          });
        }


        const updateresult= await cartModel.findByIdAndUpdate(existingCart._id, { isCouponApplied: false,discount:0,appliedCoupon:null,appliedProducts:null }, { new: true });
        console.log("updateresult",updateresult)


        if(!updateresult){
          throw new GraphQLError("Error in removing coupon", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["you can't remove this code"] }, 
          });
        }


        return {
          success: true,
          message: "Coupon removed successfully."
        }

    },

    
    adminDeleteTheCoupon: async (parent, { input }, { req }, info) => {

      try {

        await couponService.adminDeleteTheCoupon(input?._id)

        return {
          status: true,
          msg: "Coupon deleted successfully "
        }

      } catch (error) {

        throw new GraphQLError("Coupen delete Failed ", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });

      }
    }

  },


  //   // get all coupens in admin portl 

  // getAllCoupenToAdmin:async(parent, {input }, { req }, info)=>{

  //     // admin verfy

  //     await verifyAdmin(req)

  //       try {

  //           const page: number = input?.page || 0;
  //           const size: number = input?.size || 10;
  //             const options:any={
  //               page:page ,
  //               size:size,

  //             }

  //             if(input.isActive)options.isActive=input.isActive
  //             if(input.startDate)options.startDate=input.startDate
  //             if(input.expiryDate)options.expiryDate=input.expiryDate

  //           const result= await couponService.getAllCoupenToAdmin(options)
  //           return result



  //       } catch (error) {



  //       }


  // }       
  // }



  Query: {

    // get all coupens in admin portl 

    getAllCoupenToAdmin: async (parent, { input }, { req }, info) => {

      // console.log("error")
      console.log("input", input)

      // admin verfy

      //  await verifyAdmin(req)

      try {

        const page: number = input?.page || 0;
        const size: number = input?.size || 10;
        const options: any = {
          page: page,
          size: size,

        }

        if (input.isActive) options.isActive = input.isActive
        if (input.startDate) options.startDate = input.startDate
        if (input.expiryDate) options.expiryDate = input.expiryDate
        if (input.search) options.search = input.search

        const result = await couponService.getAllCoupenToAdmin(options)


        return result


      } catch (error: any) {


        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });
      }


    },

    getOneCouponDetails: async (parent, { input }, { req }, info) => {

      try {

        const result = await couponService.getOneCouponDetails(input?._id)

        console.log(result)

        return result

      } catch (error: any) {

        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });

      }


    },


   // get coupons by user in web 
    getCouponsByUser: async (parent, {input }, { req }, info) => {

      // user verfy

      await verifyUser(req)


      try {
        
           const options={

            userid:req.authAccount._id,
            page:input?.page || 0,
            size:input?.size || 10

           }

        const result = await couponService.getCouponsByUser(options)

        console.log("user coupons", result)

        return result;

      } catch (error: any) {

        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });


      }
    },


    // get coupons by user in mobile
    getCouponsByUserMobile: async (parent, { }, { req }, info) => {

      // user verfy

      await verifyUser(req)

      console.log("user data",req.authAccount._id)


      try {


        const result = await couponService.getCouponsByUserMobile(req.authAccount._id)

        

        return result;

      } catch (error: any) {

        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });


      }
    },

  },


}








