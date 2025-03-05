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
import { warrantyClaimModel } from "../../models/warrantyClaimModel";
import {adminModel} from  "../../models"


export const warrantyClaimResolver: Resolvers = {

    Upload: GraphQLUpload,

    Mutation: {
        //to send claim request to admin by user
        createWarrantyClaimRequestByUSer: async (parent, { input, image }, { req }, info) => {
            console.log("createWarrantyClaimRequestByUSer");
            await verifyUser(req);
            try {
                const userId = req.authAccount?._id;
                const productId: Types.ObjectId = input.productId;
                const { claimType, issueDescription, warrantyAddress } = input;
                console.log("input", input);
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
                console.log("existingOrderProduct", existingOrderProduct);
                if (!existingOrderProduct) {
                    throw new GraphQLError("Order product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                if (!existingOrderProduct.warranty.warrantyRegister) {
                    throw new GraphQLError("Warranty is not registered for this product", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const monthsDiff = moment(new Date()).diff(moment(existingOrderProduct.deliveryDate), "months");

                if (monthsDiff > existingOrderProduct.warranty.duration) {
                    throw new GraphQLError("Warranty is expired for this product", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const claimDate = moment();
                const warrantyId = `WAR-${claimDate.valueOf()}`;

                let newClaimData: any = {
                    claimType,
                    issueDescription,
                    productImage,
                    user: userId,
                    product: productId,
                    warrantyAddress,
                    order: existingOrderProduct.orderId,
                    warrantyId
                };

                const result = await warrantyClaimService.createWarrantyClaimRequest(newClaimData);

                if (!result) {
                    throw new GraphQLError("Failed to send claim request", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: [],
                        },
                    });
                }

                const data = {

                    actionType: "WARRANTY",
                    action: "WARRANTY HAS BEEN REQUESTED",
                    performedBy: userId,
                    performedByRole: "USERS",
                    referenceId: result?._id,
                    referenceType:"WARRANTY_CLAIM",
                    details: `${warrantyAddress.firstname} requested an warranty (Warranty ID: ${result.warrantyId}) through the website. The system generated the Warranty ID, and the request has been sent for processing.`
                }

                await warrantyClaimService.createActivityLogByWarranty(data)

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
        },

        createWarrantyClaimRequestByUSerInMobile: async (parent, { input, image }, { req }, info) => {
            console.log("createWarrantyClaimRequestByUSer");
            await verifyUser(req);
            try {
                const userId = req.authAccount?._id;
                const productId: Types.ObjectId = input.productId;
                const { claimType, issueDescription, warrantyAddress } = input;
                console.log("input", input);
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
                console.log("existingOrderProduct", existingOrderProduct);
                if (!existingOrderProduct) {
                    throw new GraphQLError("Order product not found", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                if (!existingOrderProduct.warranty.warrantyRegister) {
                    throw new GraphQLError("Warranty is not registered for this product", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const monthsDiff = moment(new Date()).diff(moment(existingOrderProduct.deliveryDate), "months");

                if (monthsDiff > existingOrderProduct.warranty.duration) {
                    throw new GraphQLError("Warranty is expired for this product", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const claimDate = moment();
                const warrantyId = `WAR-${claimDate.valueOf()}`;

                let newClaimData: any = {
                    claimType,
                    issueDescription,
                    productImage,
                    user: userId,
                    product: productId,
                    warrantyAddress,
                    order: existingOrderProduct.orderId,
                    warrantyId
                };

                const result = await warrantyClaimService.createWarrantyClaimRequest(newClaimData);

                if (!result) {
                    throw new GraphQLError("Failed to send claim request", {
                        extensions: {
                            code: "INTERNAL_SERVER_ERROR",
                            errors: [],
                        },
                    });
                }

                const data = {

                    actionType: "WARRANTY",
                    action: "WARRANTY HAS BEEN REQUESTED",
                    performedBy: userId,
                    performedByRole: "USER",
                    referenceId: result?._id,
                    referenceType:"WARRANTY_CLAIM",
                    details: `${warrantyAddress.firstname} requested an warranty (Warranty ID: ${result.warrantyId}) through the website. The system generated the Warranty ID, and the request has been sent for processing.`
                }




                await warrantyClaimService.createActivityLogByWarranty(data)

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
        },





        //to update claim status by admin

        updateClaimStatusByAdmin: async (parent, { input }, { req }, info) => {
            await verifyAdmin(req)

            try {
                const claimRequestId: Types.ObjectId = input.claimRequestId
                const claimStatus = input.claimStatus as "PENDING" | "APPROVED" | "REJECTED" | "REPLACEMENT_SHIPPED" | "REPLACEMENT_COMPLETED" | "RETURNED_TO_WAREHOUSE";
                const Reason: string | null = input?.Reason || null;
                // const rejectedDate: Date | null = input?.rejectedDate || null;
                // const claimDate: Date | null  = input?.claimDate || null;

                if (!claimRequestId) {
                    throw new GraphQLError("claimRequestId is required", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const existingClaimRequest: any = await warrantyClaimModel.findById(claimRequestId)

                if (!existingClaimRequest) {
                    throw new GraphQLError("claim Request with this id is not exist", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                existingClaimRequest.claimStatus = claimStatus

                if (claimStatus === "APPROVED") {
                    if (input?.Date) {
                        existingClaimRequest.claimDate = input.Date;
                    }
                }

                if (claimStatus === "REJECTED") {
                    if (!Reason) {
                        throw new GraphQLError("Rejection reason is required for rejected claims", {
                            extensions: {
                                code: "BAD_REQUEST",
                                errors: [],
                            },
                        });
                    }
                    existingClaimRequest.rejectedReason = Reason;
                    if (input?.Date) {
                        existingClaimRequest.rejectedDate = input.Date;
                    }
                }


                if (claimStatus === "REPLACEMENT_SHIPPED") {

                    if (input?.Date) {
                        existingClaimRequest.replacementShippedDate = input.Date;
                    }
                }

                if (claimStatus === "REPLACEMENT_COMPLETED") {

                    if (input?.Date) {
                        existingClaimRequest.replacementCompletedDate = input.Date;
                    }
                }

                if (claimStatus === "RETURNED_TO_WAREHOUSE") {

                    if (input?.Date) {
                        existingClaimRequest.returnedWarehouseDate = input.Date;
                    }
                }

                await existingClaimRequest.save();

                // add activity log

           const admin=await  adminModel.findById({_id:req?.authAccount?._id})

                const data = {

                    actionType: "WARRANTY",
                    action: `Warranty claim request status update to ${input?.claimStatus} `,
                    performedBy: req?.authAccount?._id,
                    performedByRole: req?.authAccount?.accType,
                    referenceId: claimRequestId,
                    referenceType:"WARRANTY_CLAIM",
                    details: `${admin?.fullName} update Warranty request status of an Warranty ID: ${existingClaimRequest?.warrantyId} from ${existingClaimRequest?.claimStatus} to ${claimStatus}. `
                }

                await warrantyClaimService.createActivityLogByWarranty(data)

                return {
                    success: true,
                    message: "Warranty Claim status updated succesfully",
                }

            } catch (error: any) {
                throw new GraphQLError(error, {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                })
            }
        },

    },



    Query: {
        //to list all claim requests by user on admin side
        getAllClaimRequestsByAdmin: async (parent, { input }, { req }, info) => {
            // await verifyAdmin(req);
            try {
                const page: number = input?.page || 0;
                const size: number = input?.size || 100;
                const options: any = {
                    page: page,
                    size: size
                }
                const matchQuery: any = {};
                if (input?.search) {
                    matchQuery.warrantyId = { $regex: input.search, $options: "i" };
                }

                if (input?.claimStatus) {
                    matchQuery.claimStatus = input.claimStatus
                }


                const response = await warrantyClaimService.getAllWarrantyClaimsBySuperAdmin(options, matchQuery);
                console.log("response", response)
                if (!response) {
                    throw new GraphQLError("unable to fetch warranty claims", {
                        extensions: { code: "INTERNAL_SERVER_ERROR", errors: ["unable to fetch warranty claims"] },
                    });
                }
                return {
                    success: true,
                    data: response.records,
                    maxRecords: response.maxRecords
                }
            } catch (error: any) {
                throw new GraphQLError(error, {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                })
            }
        },

        //to get the details of one specific claim request

        getClaimRequestDetailsByAdmin: async (parent, { input }, { req }, info) => {
            // await verifyAdmin(req);
            try {
                const claimRequestId: Types.ObjectId = input.claimRequestId

                if (!claimRequestId) {
                    throw new GraphQLError("claimRequestId is required", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                const response = await warrantyClaimService.getClaimRequestDetailsByAdmin(claimRequestId)
                console.log("response", response)
                return response.records[0]
            } catch (error: any) {
                throw new GraphQLError(error, {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                })
            }
        }

    }
}