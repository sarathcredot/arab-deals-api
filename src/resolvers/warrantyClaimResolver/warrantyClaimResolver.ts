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
import { adminModel, deliveryAgentModel } from "../../models"


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

                const existingClaimRequest = await warrantyClaimModel.findOne({ product: productId })
                if (existingClaimRequest) {
                    throw new GraphQLError("Claim request already exist for this product", {
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
                    referenceType: "WARRANTY_CLAIM",
                    details: `${warrantyAddress.firstname} (Customer) requested a warranty claim for Warranty ID: ${result.warrantyId} through the website. The request is now waiting for processing.`
                    // `${warrantyAddress.firstname} requested an warranty (Warranty ID: ${result.warrantyId}) through the website. The system generated the Warranty ID, and the request has been sent for processing.`
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

                const existingClaimRequest = await warrantyClaimModel.findOne({ product: productId })
                if (existingClaimRequest) {
                    throw new GraphQLError("Claim request already exist for this product", {
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
                    referenceType: "WARRANTY_CLAIM",
                    details: `${warrantyAddress.firstname} (Customer) requested a warranty claim for Warranty ID: ${result.warrantyId} through the website. The request is now waiting for processing.`

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
                const claimStatus = input.claimStatus as "PENDING" | "APPROVED" | "POSTPONED" | "OUT_FOR_DELIVERY" | "REJECTED" | "REPLACEMENT_SHIPPED" | "REPLACEMENT_COMPLETED" | "RETURNED_TO_WAREHOUSE" | "PACKAGE_IN_PROGRESS";
                const Reason: string | null = input?.Reason || null;
                const agentStatus = input.agentStatus
                let agentData
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
                const existingStatus = existingClaimRequest?.claimStatus
                const admin = await adminModel.findById({ _id: req?.authAccount?._id })




                if (!existingClaimRequest) {
                    throw new GraphQLError("claim Request with this id is not exist", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                // existingClaimRequest.claimStatus = claimStatus

                if (agentStatus === true) {

                    agentData = await deliveryAgentModel.findById({ _id: existingClaimRequest?.deliveryAgentId })
                }

                if (claimStatus === "APPROVED") {

                    existingClaimRequest.claimStatus = claimStatus
                    if (input?.Date) {
                        existingClaimRequest.claimDate = input.Date;

                        const data = {

                            actionType: "WARRANTY",
                            action: `Warranty claim request status update ${existingStatus} to ${claimStatus} `,
                            performedBy: req?.authAccount?._id,
                            performedByRole: "ADMINS",
                            referenceId: claimRequestId,
                            referenceType: "WARRANTY_CLAIM",
                            details: `${admin?.fullName} (Admin) approved the warranty claim request ${existingClaimRequest?.warrantyId}. The process has been initiated to provide a ${existingClaimRequest?.claimType}.`
                            // `${admin?.fullName} update Warranty request status of an Warranty ID: ${existingClaimRequest?.warrantyId} from ${existingStatus} to ${claimStatus}. `
                        }

                        await warrantyClaimService.createActivityLogByWarranty(data)


                    }

                    await existingClaimRequest.save();

                    return {
                        success: true,
                        otp:false,
                        message: "Warranty Claim status updated succesfully",
                    }

                }

                if (claimStatus === "REJECTED" && agentStatus === false) {
                    if (!Reason) {
                        throw new GraphQLError("Rejection reason is required for rejected claims", {
                            extensions: {
                                code: "BAD_REQUEST",
                                errors: [],
                            },
                        });
                    }
                    existingClaimRequest.rejectedReason = Reason;
                    existingClaimRequest.claimStatus = claimStatus
                    if (input?.Date) {
                        existingClaimRequest.rejectedDate = input.Date;


                        const data = {

                            actionType: "WARRANTY",
                            action: `Warranty claim request status update ${existingStatus} to ${claimStatus}  `,
                            performedBy: req?.authAccount?._id,
                            performedByRole: "ADMINS",
                            referenceId: claimRequestId,
                            referenceType: "WARRANTY_CLAIM",
                            details: `${admin?.fullName} (Admin) rejected the warranty claim request ${existingClaimRequest?.warrantyId} . The claim has been declined, and the customer has been notified`
                            // `${admin?.fullName} update Warranty request status of an Warranty ID: ${existingClaimRequest?.warrantyId} from ${existingStatus} to ${claimStatus}. `
                        }

                        await warrantyClaimService.createActivityLogByWarranty(data)
                    }

                    await existingClaimRequest.save();

                    return {
                        success: true,
                        otp:false,
                        message: "Warranty Claim status updated succesfully",
                    }
                }

                if (claimStatus === "PACKAGE_IN_PROGRESS") {

                    existingClaimRequest.claimStatus = claimStatus
                    const data = {

                        actionType: "WARRANTY",
                        action: `Warranty claim request status update ${existingStatus} to ${claimStatus}  `,
                        performedBy: req?.authAccount?._id,
                        performedByRole: "ADMINS",
                        referenceId: claimRequestId,
                        referenceType: "WARRANTY_CLAIM",
                        details: `${admin?.fullName} (Admin) updated the warranty ${existingClaimRequest?.warrantyId} status to "Packaging In Progress". The replacement product is now being packed and prepared for shipment.
`
                        // `${admin?.fullName} update Warranty request status of an Warranty ID: ${existingClaimRequest?.warrantyId} from ${existingStatus} to ${claimStatus}. `
                    }

                    await warrantyClaimService.createActivityLogByWarranty(data)

                    await existingClaimRequest.save();

                    return {
                        success: true,
                        otp:false,
                        message: "Warranty Claim status updated succesfully",
                    }

                }


                if (claimStatus === "REPLACEMENT_SHIPPED") {

                    existingClaimRequest.claimStatus = claimStatus
                    if (input?.Date) {
                        existingClaimRequest.replacementShippedDate = input.Date;

                        const data = {

                            actionType: "WARRANTY",
                            action: `Warranty claim request status update ${existingStatus} to ${claimStatus}  `,
                            performedBy: req?.authAccount?._id,
                            performedByRole: "ADMINS",
                            referenceId: claimRequestId,
                            referenceType: "WARRANTY_CLAIM",
                            details: `${admin?.fullName}(Admin) marked the replacement product for warranty ${existingClaimRequest?.warrantyId}  as "Shipped". The package has been handed over to the delivery agent.
`

                            // `${admin?.fullName} update Warranty request status of an Warranty ID: ${existingClaimRequest?.warrantyId} from ${existingStatus} to ${claimStatus}. `
                        }

                        await warrantyClaimService.createActivityLogByWarranty(data)

                        await existingClaimRequest.save();

                        return {
                            success: true,
                            otp:false,
                            message: "Warranty Claim status updated succesfully",
                        }

                    }
                }

                if (claimStatus === "OUT_FOR_DELIVERY" && agentStatus === true) {

                    existingClaimRequest.claimStatus = claimStatus

                    const data = {
                        actionType: "WARRANTY",
                        action: `Warranty claim call status update ${existingStatus} to ${claimStatus} `,
                        performedBy: req?.authAccount?._id,
                        performedByRole: "ADMINS",
                        referenceId: claimRequestId,
                        referenceType: "WARRANTY_CLAIM",
                        details: `${agentData?.fullName}(Delivery Agent) has picked up the replacement product for warranty ${existingClaimRequest?.warrantyId} and is now "Out for Delivery". The customer will receive the product shortly.
          `
                        // `${agentData?.fullName} update Warranty request status of an Warranty cal ID: ${result?.warrantyId} from ${existingStatus} to ${claimStatus}. `,

                    }

                    await warrantyClaimService.createActivityLogByWarranty(data)


                    await existingClaimRequest.save();

                    return {
                        success: true,
                        otp:false,
                        message: "Warranty Claim status updated succesfully",
                    }
                }


                if (claimStatus === "RETURNED_TO_WAREHOUSE" && agentStatus === true) {
                    existingClaimRequest.claimStatus = claimStatus
                    existingClaimRequest.returnedWarehouseDate = new Date();

                    const data = {
                        actionType: "WARRANTY",
                        action: `Warranty claim call status update ${existingStatus} to ${claimStatus} `,
                        performedBy: req?.authAccount?._id,
                        performedByRole: "ADMINS",
                        referenceId: claimRequestId,
                        referenceType: "WARRANTY_CLAIM",
                        details: ` ${agentData?.fullName}(Delivery Agent) successfully returned the defective product for warranty ${existingClaimRequest?.warrantyId} to the warehouse for further inspection or disposal.
          
          `
                        //  `${agentData?.fullName} update Warranty request status of an Warranty cal ID: ${result?.warrantyId} from ${existingStatus}} to ${claimStatus}. `,

                    }

                    await deliveryAgentModel.findByIdAndUpdate({_id:agentData?._id},{

                        $inc: {
              
                        
                          'wallet.numberOfPendingWarrantyCall': -1
              
                        }
                      })
              

                    await warrantyClaimService.createActivityLogByWarranty(data)

                    await existingClaimRequest.save();

                    return {
                        success: true,
                        otp:false,
                        message: "Warranty Claim status updated succesfully",
                    }


                }

                if (claimStatus === "POSTPONED" && agentStatus === false) {

                    existingClaimRequest.claimStatus = claimStatus


                    const data = {

                        actionType: "WARRANTY",
                        action: `Warranty claim request status update ${existingStatus} to ${claimStatus} `,
                        performedBy: req?.authAccount?._id,
                        performedByRole: "ADMINS",
                        referenceId: claimRequestId,
                        referenceType: "WARRANTY_CLAIM",
                        details: `${admin?.fullName} (Admin) approved the warranty claim request ${existingClaimRequest?.warrantyId}. The process has been initiated to provide a ${existingClaimRequest?.claimType}.`
                        // `${admin?.fullName} update Warranty request status of an Warranty ID: ${existingClaimRequest?.warrantyId} from ${existingStatus} to ${claimStatus}. `
                    }

                    await warrantyClaimService.createActivityLogByWarranty(data)

                    await existingClaimRequest.save();
                    return {
                        success: true,
                        otp:false,
                        message: "Warranty Claim status updated succesfully",
                    }

                }



                if (claimStatus === "POSTPONED" && agentStatus === true) {

                    existingClaimRequest.claimStatus = claimStatus


                    const data = {

                        actionType: "WARRANTY",
                        action: `Warranty claim request status update ${existingStatus} to ${claimStatus} `,
                        performedBy: req?.authAccount?._id,
                        performedByRole: "ADMINS",
                        referenceId: claimRequestId,
                        referenceType: "WARRANTY_CLAIM",
                        details: `${agentData?.fullName} (Admin) approved the warranty claim request ${existingClaimRequest?.warrantyId}. The process has been initiated to provide a ${existingClaimRequest?.claimType}.`
                        // `${admin?.fullName} update Warranty request status of an Warranty ID: ${existingClaimRequest?.warrantyId} from ${existingStatus} to ${claimStatus}. `
                    }

                    await warrantyClaimService.createActivityLogByWarranty(data)

                    await existingClaimRequest.save();
                    return {
                        success: true,
                        otp:false,
                        message: "Warranty Claim status updated succesfully",
                    }

                }


                if (claimStatus === "REPLACEMENT_COMPLETED" && agentStatus === true || claimStatus === "REJECTED" && agentStatus === true) {
                    console.log("called")
                    // agent.wallet.numberOfReturnOrderDelivered+=1;

                    //generate otp and save and send to user
                    const result = await deliveryAgentService.replacementTimeOtpGenerate(claimRequestId)
                    console.log(result)

                    if (!result) {
                        throw new GraphQLError("Unable to generate otp", {
                            extensions: { code: "INTERNAL_SERVER_ERROR" },
                        })
                    }



                    return {
                        success: true,
                        otp:true,
                        message: "Warranty Claim status updated succesfully",
                    }
                   
                }


                return {
                    success: false,
                    otp:false,
                    message: "Warranty Claim status updated failed",
                }
                

            } catch (error: any) {
                throw new GraphQLError(error, {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                })
            }
        },

        // admin update delivery agent status in claim request

        updateClaimStatusByAdminAgentStatus: async (parent, { input }, { req }, info) => {
            await verifyAdmin(req);
            const agentId: Types.ObjectId = new Types.ObjectId(input?.agentId);

            let claimRequestId: Types.ObjectId = input?.claimRequestId;
            let claimStatus: string = input?.claimStatus;
            let remarks: string | undefined | null = input?.remarks;

            console.log(claimStatus)

            const result = await warrantyClaimModel.findOne({ _id: claimRequestId });
            const existingStatus = result?.claimStatus
            const agentData = await deliveryAgentModel.findById({ _id: agentId?._id })


            if (!result) {
                throw new GraphQLError("claim request not found", {
                    extensions: { code: "NOT_FOUND" },
                })
            }


            if (claimStatus === "OUT_FOR_DELIVERY") {
                result.claimStatus = claimStatus
                await result.save()

                const data = {
                    actionType: "WARRANTY",
                    action: `Warranty claim call status update ${existingStatus} to ${claimStatus} `,
                    performedBy: req?.authAccount?._id,
                    performedByRole: "ADMINS",
                    referenceId: claimRequestId,
                    referenceType: "WARRANTY_CLAIM",
                    details: `${agentData?.fullName}(Delivery Agent) has picked up the replacement product for warranty ${result?.warrantyId} and is now "Out for Delivery". The customer will receive the product shortly.
      `
                    // `${agentData?.fullName} update Warranty request status of an Warranty cal ID: ${result?.warrantyId} from ${existingStatus} to ${claimStatus}. `,

                }

                await warrantyClaimService.createActivityLogByWarranty(data)


                return {
                    status: true,
                    otp: false,
                    msg: " Claim status updated"
                }
            }

            if (claimStatus === "RETURNED_TO_WAREHOUSE") {
                result.claimStatus = claimStatus
                result.returnedWarehouseDate = new Date();
                await result.save()

                const data = {
                    actionType: "WARRANTY",
                    action: `Warranty claim call status update ${existingStatus} to ${claimStatus} `,
                    performedBy: req?.authAccount?._id,
                    performedByRole: "ADMINS",
                    referenceId: claimRequestId,
                    referenceType: "WARRANTY_CLAIM",
                    details: ` ${agentData?.fullName}(Delivery Agent) successfully returned the defective product for warranty ${result?.warrantyId} to the warehouse for further inspection or disposal.
      
      `
                    //  `${agentData?.fullName} update Warranty request status of an Warranty cal ID: ${result?.warrantyId} from ${existingStatus}} to ${claimStatus}. `,

                }

                await warrantyClaimService.createActivityLogByWarranty(data)


                return {
                    status: true,
                    otp: false,
                    msg: " Claim status updated"
                }
            }

            if (claimStatus === "POSTPONED") {
                result.claimStatus = claimStatus
                result.postponedDate = new Date();
                if (input?.remarks) {
                    result.postponedReason = input?.remarks
                }
                await result.save()

                const data = {
                    actionType: "WARRANTY",
                    action: `Warranty claim call status update ${existingStatus}} to ${claimStatus} `,
                    performedBy: req?.authAccount?._id,
                    performedByRole: "DELIVERYAGENT",
                    referenceId: claimRequestId,
                    referenceType: "ADMINS",
                    details: `${agentData?.fullName} (Delivery Agent) Delivery of the replacement product and collection of the defective item for warranty ${result?.warrantyId} has been POSTPONED`
                    // `${agentData?.fullName} update Warranty request status of an Warranty cal ID: ${result?.warrantyId} from ${existingStatus}} to ${claimStatus}. `,

                }

                await warrantyClaimService.createActivityLogByWarranty(data)


                return {
                    status: true,
                    otp: false,
                    msg: "Claim status updated"
                }

            }

            if (claimStatus === "REPLACEMENT_COMPLETED" || claimStatus === "REJECTED") {
                console.log("called")
                // agent.wallet.numberOfReturnOrderDelivered+=1;

                //generate otp and save and send to user
                const result = await deliveryAgentService.replacementTimeOtpGenerate(claimRequestId)
                console.log(result)

                if (!result) {
                    throw new GraphQLError("Unable to generate otp", {
                        extensions: { code: "INTERNAL_SERVER_ERROR" },
                    })
                }




                return {
                    status: true,
                    otp: true,
                    msg: "Claim status updated"
                }
            }


            return {
                status: false,
                otp: false,
                msg: "Error in Updating Status",
            };
        },

        //  // admin update delivery agent status in claim request otp verification

        claimOtpVerificationByAdminAGentStatus: async (parent, { input }, { req }, info) => {
            await verifyAdmin(req);
            const agentId: Types.ObjectId = new Types.ObjectId(input?.agentId);

            try {
                // verify otp
                const options: {
                    agentId: Types.ObjectId;
                    claimRequestId: Types.ObjectId;
                    code: string;
                    claimStatus: string | undefined;
                    remarks: string | undefined;
                } = {
                    agentId: agentId,
                    claimRequestId: input?.claimRequestId,
                    code: input?.code || " ",
                    claimStatus: input?.claimStatus || undefined,
                    remarks: input?.remarks || undefined,
                };


                const result = await deliveryAgentService.claimOtpVerificationAdmin(options);

                // Handle different responses based on the service result
                if (!result.flag) {
                    throw new GraphQLError("Failed to update claim status", {
                        extensions: {
                            code: "BAD_REQUEST",
                            errors: [],
                        },
                    });
                }

                return {
                    status: true,
                    msg: result.message || "OTP verified and status updated",
                };

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
        },

        getWarrantyActivityLogByAdmin: async (parent, { input }, { req }, info) => {

            //    await verifyAdmin(req)
            try {

                const result = await warrantyClaimService.getWarrantyActivityLogByAdmin(input?.warrantyId)

                console.log("result", result)

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

        getOrderProductWarrantyClaim: async (parent, { input }, { req }, info) => {

            try {

                const result = await warrantyClaimService.getOrderProductWarrantyClaim(input?.orderProductId)

                return result;

            } catch (error: any) {

                throw new GraphQLError(error, {
                    extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
                })
            }

        }

    }
}