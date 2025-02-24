import { jwtService, spaceService, otpService, deliveryAgentService, orderProductService, roleService, returnPolicyService, warrantyPolicyService, warrantyClaimService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor, verifyDeliveryAgent, verifySuperAdmin, verifyUser } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";
import { error } from "console";
import moment from "moment";
import { finished } from "stream/promises";
import { startOfDay, endOfDay, max } from "date-fns"
import path from "path";
import fs from "fs";
import { returnPolicyModel } from "../../models/returnPolicyModel";
import { shippingConfigModel } from "../../models/shippingConfigModel";
import { warrantyPolicyModel } from "../../models/warrantyPolicyModel";


export const warrantyClaimResolver: Resolvers = {

    Upload: GraphQLUpload,

        Mutation: {
            createWarrantyClaimRequestByUSer: async (parent, { input,image}, { req }, info) => {
                await verifyUser(req);
                try {
                    const userId = req.authAccount?._id;
                    const  productId:Types.ObjectId = input.productId;
                    const { claimType, issueDescription, warrantyAddress } = input;
                    let productImage: any = [];

                    if (image) {
                        try {
                          for (let images of image) {
                            const { createReadStream, filename, mimetype, encoding } =
                              await images;
                            const key = spaceService.getFileKey(
                              filePaths.warrantyProduct,
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
                
                            productImage.push({
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
                
                    const existingOrderProduct = await warrantyClaimService.findOrderProductWithFilters(productId, userId);
                    if (!existingOrderProduct) {
                        throw new GraphQLError("Order product not found", {
                            extensions: {
                                code: "BAD_REQUEST",
                                errors: [],
                            },
                        });
                    }

                    if(existingOrderProduct.warranty.warrantyRegister === false){
                        throw new GraphQLError("Warranty is not registered for this product", {
                            extensions: {
                                code: "BAD_REQUEST",
                                errors: [],
                            },
                        });
                    }

                    const monthsDiff = moment(new Date()).diff(moment(existingOrderProduct.deliveryDate), "months");

                    if(monthsDiff > existingOrderProduct.warranty.duration){
                        throw new GraphQLError("Warranty is expired for this product", {
                            extensions: {
                                code: "BAD_REQUEST",
                                errors: [],
                            },
                        });
                    }

                    let newClaimData: any = {
                        claimType,
                        issueDescription,
                        productImage,
                        user: userId,
                        product: productId,
                        warrantyAddress,
                        order: existingOrderProduct.orderId
                    };

                    const result=await warrantyClaimService.createWarrantyClaimRequest(newClaimData);

                    if(!result){
                        throw new GraphQLError("Failed to send claim request", {
                            extensions: {
                                code: "INTERNAL_SERVER_ERROR",
                                errors: [],
                            },
                        });
                    }

                    return {
                        success: true,
                        message: "Warranty Claim Request send succesfully",
                    }
                } catch (error: any) {
                    console.error(" Error in createWarrantyClaimRequestByUSer resolver:", error);
                    throw new GraphQLError(error, {
                        extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                    });
                }
            } ,
           
        },



        //     Query: {


        

        //    }

}