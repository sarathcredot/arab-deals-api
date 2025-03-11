import { jwtService, spaceService, otpService, deliveryAgentService, orderProductService, warrantyClaimService, activityLogService } from "../../services";

import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./deliveryAgentValidator";
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor, verifyDeliveryAgent } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";
import { deliveryAgentModel } from "../../models/deliveryAgentModel";
import { error } from "console";


import { v4 as uuidv4 } from 'uuid';
import { settlementModel } from "../../models/settlementModel";
import moment from "moment";
import { finished } from "stream/promises";
import { orderProductModel } from "../../models/orderProductModel";
import { startOfDay, endOfDay } from "date-fns"


import path from "path";
import fs from "fs";
import { warrantyClaimModel, adminModel } from "../../models";


// Load the static JSON file
const locationsPath = path.resolve(__dirname, "../../../public/locations.json");
const locations = JSON.parse(fs.readFileSync(locationsPath, "utf8"));

interface EditAgentResult {
  flag: boolean;
}

type DeliveryLoginData = {
  userInput: string;
  password: string;

}

type OrderAssignDeliveryAgentInput = {
  orderItemId: Types.ObjectId
  deliveryAgentId: Types.ObjectId
  deliveryAgentName: string
  bundleCount: number

}

type WarrantyCallAssignDeliveryAgentInput = {
  warrantyCallID: Types.ObjectId
  deliveryAgentId: Types.ObjectId
  deliveryAgentName: string
  bundleCount: number

}





export const deliveryAgentResolver: Resolvers = {

  Upload: GraphQLUpload,
  Mutation: {

    // delivery agent creation from admin side
    createDeliveryAgent: async (parent, { input, image }, { req }, info) => {
      console.log(input)
      // await verifyAdmin(req);
      await validateInput(validators.deliveryAgentCreateByAdminValidator, req);

      let fullName: string = input.fullName;
      let contactNumber: string = input.contactNumber;
      let countryCode:string=input.countryCode;
      let userID: string = input.userID;
      let password: string = input.password;
      let agentType: string = input.agentType;
      let vendorID: Types.ObjectId = input?.vendorID;
      let governorate: string = input.governorate;
      let village: string = input.village;
      let governorateID: string = input.governorateID;
      let villageID: string = input.villageID;

      try {
        // Check if the contact number already exists

        let licence: deliveryAgentService.FileData | undefined;

        if (image) {
          try {

            const { createReadStream, filename, mimetype, encoding } = await image;
            const key = spaceService.getFileKey(filePaths.deliveryagentLicence, filename, []);
            const stream = createReadStream();
            const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

            licence = {
              fileType: "PUBLIC",
              fileURL: file.location,
              mimeType: mimetype,
              originalName: filename
            };
          } catch (error) {
            throw new GraphQLError("License upload failed", {
              extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
            });
          }
        }


        if (!licence) {
          throw new GraphQLError("License not found", {
            extensions: { code: "BAD_REQUEST" },
          });
        }

        const existingContact = await deliveryAgentService.findDeliveryAgentWithFilters(
          { contactNumber },
          { _id: 1 },
          { lean: true }
        );



        if (existingContact) {

          throw new GraphQLError("Contact number already exists", {
            extensions: { code: "BAD_REQUEST" },
          });

        }

        const ID = uuidv4();
        let newDeliveryAgentData: deliveryAgentService.IDeliveryAgent = {
          fullName,
          contactNumber,
          countryCode,
          userID,
          password,
          agentType,
          vendorID,
          licence,
          ID,
          governorate,
          village,
          governorateID,
          villageID

        };

        const result = await deliveryAgentService.createDeliveryAgent(newDeliveryAgentData, password);

        if (!result) {
          throw new GraphQLError("Unable to create delivery agent", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }

        return {
          _id: result._id,
          message: "Delivery Agent successfully created",
          error: false,
        };
      } catch (error: any) {
        console.error("Error in createDeliveryAgent resolver:", error);
        throw new GraphQLError(error, {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },


    // delivery agent suspension from admin side
    suspendDeliveryAgent: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);
      const { agentId, isActive } = input;

      // Validate the input
      if (!agentId) {
        throw new GraphQLError("Agent ID is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      try {
        // Check if the delivery agent exists
        const existingAgent = await deliveryAgentService.findDeliveryAgentWithFilters(
          { _id: agentId },
          { _id: 1, isActive: 1 },
          { lean: true }
        );

        if (!existingAgent) {
          throw new GraphQLError("Delivery Agent not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        // Update the isActive status
        const updatedAgent = await deliveryAgentService.suspendDeliveryAgent(
          new Types.ObjectId(agentId),
          isActive
        );

        if (!updatedAgent) {
          throw new GraphQLError("Unable to update Delivery Agent status", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }

        return {
          _id: updatedAgent._id,
          message: `${isActive ? "Activated delivery agent succsessfully" : "suspended delievery agent successfully"}`
        };
      } catch (error: any) {
        throw new GraphQLError(error.message || "Error suspending Delivery Agent", {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },

    //update available status by agent
    updateAvailableStatus: async (parent, { input }, { req }, info) => {
      console.log("ethyyy")
      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);
      const { isAvailable } = input;

      // Validate the input
      if (!agentId) {
        throw new GraphQLError("Agent ID is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      try {
        // Check if the delivery agent exists
        const existingAgent = await deliveryAgentService.findDeliveryAgentWithFilters(
          { _id: agentId },
          { _id: 1, isAvailable: 1 },
          { lean: true }
        );

        if (!existingAgent) {
          throw new GraphQLError("Delivery Agent not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        // Update the isActive status
        const updatedAgent = await deliveryAgentService.updateAvailableStatus(
          new Types.ObjectId(agentId),
          isAvailable
        );

        if (!updatedAgent) {
          throw new GraphQLError("Unable to update Your Availability", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }

        return {
          _id: updatedAgent._id,
          message: `${isAvailable ? "Set agent as available" : "set agent as not available"}`
        };
      } catch (error: any) {
        throw new GraphQLError(error.message || "Error suspending Delivery Agent", {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },


    //update available status by admin

    updateAvailableStatusByAdmin: async (parent, { input }, { req }, info) => {
      console.log("ethyyy")
      await verifyAdmin(req);
      const { isAvailable, agentId } = input;

      // Validate the input
      if (!agentId) {
        throw new GraphQLError("Agent ID is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      try {
        // Check if the delivery agent exists
        const existingAgent = await deliveryAgentService.findDeliveryAgentWithFilters(
          { _id: agentId },
          { _id: 1, isAvailable: 1 },
          { lean: true }
        );

        if (!existingAgent) {
          throw new GraphQLError("Delivery Agent not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        // Update the isActive status
        const updatedAgent = await deliveryAgentService.updateAvailableStatus(
          new Types.ObjectId(agentId),
          isAvailable
        );

        if (!updatedAgent) {
          throw new GraphQLError("Unable to update Your Availability", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }

        return {
          _id: updatedAgent._id,
          message: `${isAvailable ? "Set agent as available" : "set agent as not available"}`
        };
      } catch (error: any) {
        throw new GraphQLError(error.message || "Error suspending Delivery Agent", {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },

    //to create settlement by admin 

    createSettlement: async (parent, { input }, { req }, info) => {
      //  await verifyAdmin(req);

      const { agentId, amount } = input;
      const remarks: string | undefined = input?.remarks ?? undefined;

      try {
        // Check if the delivery agent exists
        const existingAgent = await deliveryAgentService.findDeliveryAgentWithFilters(
          { _id: agentId },
          { _id: 1, wallet: 1 },
          { lean: false }
        );

        if (!existingAgent) {
          throw new GraphQLError("Delivery Agent not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        if (existingAgent.wallet.cashInHand < amount) {
          throw new GraphQLError("Insufficient funds. The agent does not have enough money for this settlement.", {
            extensions: { code: "BAD_REQUEST" },
          });
        }


        let settlementData: deliveryAgentService.ISettlement = {
          type: "SETTLED", agentId, amount, remarks, totalAmount: existingAgent.wallet.cashInHand, balance: existingAgent.wallet.cashInHand - amount
        };

        const result = await deliveryAgentService.createSettlement(settlementData, agentId);

        if (!result) {
          throw new GraphQLError("Unable to create settlement", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: [],
            },
          });
        }

        return {
          _id: result._id,
          message: "settlement successfully created",
        };

      } catch (error: any) {
        throw new GraphQLError(error.message || "Error Creating  settlement", {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },


    //to edit settlement by admin

    editSettlement: async (parent, { input }, { req }, info) => {
      //  await verifyAdmin(req);

      const { settlementId, amount } = input;
      console.log(settlementId)

      const remarks: string | undefined = input?.remarks ?? undefined;

      try {

        const existingSettlement = await deliveryAgentService.findSettlementtWithFilters(
          { _id: settlementId },
          { _id: 1, type: 1, agentId: 1, amount: 1, createdAt: 1, remarks: 1, totalAmount: 1, balance: 1 },
          { lean: false });


        if (!existingSettlement) {
          throw new GraphQLError("Settlement not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }


        // Check if the delivery agent exists
        const existingAgent = await deliveryAgentService.findDeliveryAgentWithFilters(
          { _id: existingSettlement.agentId },
          { _id: 1, wallet: 1, lastSettlementID: 1 },
          { lean: false }
        );

        if (!existingAgent) {
          throw new GraphQLError("Delivery Agent not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        console.log(existingAgent.lastSettlementID)


        if (existingAgent.lastSettlementID.toString() !== settlementId.toString()) {
          throw new GraphQLError("This Settlement cannot be edited", {
            extensions: { code: "UNAUTHORIZED_ACTION" },
          });
        }


        // Calculate the wallet adjustment
        const originalAmount = existingSettlement.amount;
        const walletAdjustment = amount - originalAmount;

        if (existingAgent.wallet.cashInHand < walletAdjustment) {
          throw new GraphQLError("Insufficient funds. The agent does not have enough money for this adjustment.", {
            extensions: { code: "BAD_REQUEST" },
          });
        }
        // Update settlement data
        const updatedSettlementData = {
          amount,
          type: "SETTLED",
          agentId: existingSettlement.agentId,
          remarks,
          balance: existingAgent.wallet.cashInHand - walletAdjustment,
        };

        const result = await deliveryAgentService.editSettlement(settlementId, updatedSettlementData, walletAdjustment, existingSettlement.agentId);

        if (!result) {
          throw new GraphQLError("Unable to update settlement", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: [],
            },
          });
        }

        return {
          _id: result._id,
          message: "Settlement successfully updated",
        };

      } catch (error: any) {
        throw new GraphQLError(error.message || "Error Creating  settlement", {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },


    // delivery agent data edit 
    editDeliveryAgentData: async (parent, { input, image }, { req }, info) => {

      try {

        console.log("edit req")

        await verifyAdmin(req);

        // delivery agent edit input validation
        await validateInput(validators.deliveryAgentEditByAdminValidator, req);

        if (!input._id) {

          throw new GraphQLError("Agent ID is required", {
            extensions: { code: "BAD_USER_INPUT" },
          });

        } else {


          let agentData = {}


          if (image) {

            // licence uploding 

            console.log("licnce")

            const { createReadStream, filename, mimetype, encoding } = await image;
            const key = spaceService.getFileKey(filePaths.deliveryagentLicence, filename, []);
            const stream = createReadStream();
            const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

            const uploaddlicence = {
              fileType: "PUBLIC",
              fileURL: file.location,
              mimeType: mimetype,
              originalName: filename
            }

            agentData = {

              _id: input._id,
              fullName: input.fullName,
              contactNumber: input.contactNumber,
              userID: input.userID,
              agentType: input.agentType,
              vendorID: input.vendorID,
              isActive: input.isActive,
              isAvailable: input.isAvailable,
              governorate: input.governorate,
              village: input.village,
              governorateID: input.governorateID,
              villageID: input.villageID,
              licence: uploaddlicence
            }

          } else { // without  licence updation

            agentData = {
              _id: input._id,
              fullName: input.fullName,
              contactNumber: input.contactNumber,
              userID: input.userID,
              agentType: input.agentType,
              vendorID: input.vendorID,
              isActive: input.isActive,
              isAvailable: input.isAvailable,
              governorate: input.governorate,
              village: input.village,
              governorateID: input.governorateID,
              villageID: input.villageID,

            }
          }



          const result = await deliveryAgentService.editAgentData(agentData)

          // check mobile number exit or not 
          if (result.numberExit) {

            console.log("number exit res")

            throw new GraphQLError("this email or mobile number already exit ", {
              extensions: {
                code: "BAD_USER_INPUT",
                errors: [],
              },
            });


          }

          return {

            status: true,
            msg: "agent data edited"
          }  // agent data edited

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


    // delivery agent login 

    loginDeliveryAgent: async (parent, { input }, { req }, info): Promise<any> => {

      try {

        // input validation

        await validateInput(validators.loginDeliveryAgentValidator, req)

        // agent login 
        const result: any = await deliveryAgentService.loginDeliveryAgent(input as DeliveryLoginData)
        console.log(result)

        if (result.login) {


          const token = await jwtService.createDeliveryAgentLoginJWT({ id: result._id, userID: result.userId })


          return {   // agent login done
            status: "login",
            fullName: result.fullname,
            token: token,
            msg: result.msg
          }



        } else if (result.notfount) {


          return {

            status: "notfount",
            fullName: "#",
            token: "#",
            msg: result.msg
          }
        } else {

          console.log(result)
          return {

            status: "mismatch",
            fullName: "#",
            token: "#",
            msg: result.msg
          }
        }

      } catch (error) {

        throw new GraphQLError("Unable to login delivery agent", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });

      }


    },

    // order assign to delivery agent 

    orderAssignDeliveryAgent: async (parent, { input }, { req }, info) => {
      await verifyAdmin(req);
      const adminId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

      try {

        // input validation
        await validateInput(validators.orderAssignDeliveryAgentValidator, req)

        const result: any = await deliveryAgentService.orderAssignDeliveryAgent(input as OrderAssignDeliveryAgentInput, adminId)

        if (result.flag) {

          return {  // order assign to delivery agent
            status: true,
            msg: "order assign to delivery agent"
          }

        } else {

          throw new GraphQLError("Unable to assigen delivery agent", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: [],
            },
          });

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


    //assign return orders to delivery agent from admin side

    returnOrderAssignDeliveryAgent: async (parent, { input }, { req }, info) => {
      await verifyAdmin(req);
      const adminId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

      try {
        // input validation
        // await validateInput(validators.orderAssignDeliveryAgentValidator, req)

        const { orderItemId, deliveryAgentId, deliveryAgentName, bundleCount } = input

        const result: any = await deliveryAgentService.returnAssignDeliveryAgent(input as OrderAssignDeliveryAgentInput, adminId)

        if (result.flag) {
          return {
            status: true,
            msg: "order assign to delivery agent"
          }

        } else {
          throw new GraphQLError("Unable to assigen delivery agent", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: [],
            },
          });
        }

      } catch (error) {

        throw new GraphQLError("Unable to assigen delivery agent", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });

      }
    },

    // warranty call assign to delivery agent 
    warrantyCallAssignDeliveryAgent: async (parent, { input }, { req }, info) => {

      await verifyAdmin(req)

      try {

        await deliveryAgentService.warrantyCallAsssignDeliveryAgent(input as WarrantyCallAssignDeliveryAgentInput)
        const admin = await adminModel.findById({ _id: req?.authAccount?._id })
        const warrantyCallDetails = await warrantyClaimModel.findById({ _id: input?.warrantyCallID })

        // add activity log 

        const data = {
          actionType: "WARRANTY",
          action: `Warranty claim call assigned to delivery boy `,
          performedBy: req?.authAccount?._id,
          performedByRole: "ADMINS",
          referenceId: input?.warrantyCallID,
          referenceType: "WARRANTY_CLAIM",
          details: `${admin?.fullName} assign Warranty call of an Warranty ID: ${warrantyCallDetails?.warrantyId}  to delivery agent ${warrantyCallDetails?.deliveryAgentName}. `,

        }

        await warrantyClaimService.createActivityLogByWarranty(data)

        return {

          status: true,
          msg: "Warranty call assigned to delivery agent"
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






    //change return status from agent side
    returnStatusChangeDeliveryAgent: async (parent, { input }, { req }, info) => {
      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

      const agent = await deliveryAgentModel.findOne({ _id: agentId });

      let orderProductId: Types.ObjectId = input?.orderProductId;
      let returnStatus: string = input?.returnStatus;
      let remarks: string = input?.remarks;

      console.log(returnStatus)

      const result = await orderProductModel.findOne({ _id: orderProductId });


      if (!result) {
        throw new GraphQLError("Order product not found", {
          extensions: { code: "NOT_FOUND" },
        })
      }

 


      if (returnStatus === "RETURNED TO WAREHOUSE") {
        await activityLogService.createActivityLog({
          actionType: "RETURN",
          action: "RETURNED TO WAREHOUSE",
          performedBy: agentId,
          performedByRole: "DELIVERYAGENT",
          referenceId: orderProductId,
          referenceType: "ORDER_PRODUCTS",
          details: `${agent?.fullName} (Delivery Agent) successfully returned the collected item to the warehouse. The return process is now completed for order ${result?.itemId}, and the customer is now waiting for the refund. `,
        });
        console.log("called")
        result.returnStatus = returnStatus
        result.returnDate = new Date();
        await result.save()
        return {
          status: true,
          otp: false,
          msg: "Order product status updated"
        }
      }

      if (returnStatus === "POSTPONED") {
        await activityLogService.createActivityLog({
          actionType: "RETURN",
          action: " RETURN POSTPONED",
          performedBy: agentId,
          performedByRole: "DELIVERYAGENT",
          referenceId: orderProductId,
          referenceType: "ORDER_PRODUCTS",
          details: `${agent?.fullName} (Delivery Agent) postponed the return process for Order Product ID: ${result?.itemId}. The return will be rescheduled for a later date.`,
        });

        await deliveryAgentModel.findByIdAndUpdate({ _id:agentId }, {
          $inc: {
            'wallet.numberOfPendingReturns': -1
          }
        })
        result.returnStatus = returnStatus
        result.returnPostponedDate = new Date();
        result.returnPostponedRemarks = remarks
        await result.save()
        return {
          status: true,
          otp: false,
          msg: "Order product status updated"
        }

      }

      if (returnStatus === "COLLECTED" || returnStatus === "REJECTED") {
        console.log("called")
        // agent.wallet.numberOfReturnOrderDelivered+=1;

        //generate otp and save and send to user
        const result = await deliveryAgentService.deliveryTimeOtpGenerate(input.orderProductId)
        console.log(result)

        if (!result) {
          throw new GraphQLError("Unable to generate otp", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          })
        }

        return {
          status: true,
          otp: true,
          msg: "Order product status updated"
        }
      }


      return {
        status: false,
        otp: false,
        msg: "Error in Updating Status",
      };


    },


    //change claim status from agent side 

    updateClaimStatusByAgent: async (parent, { input }, { req }, info) => {
      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

      let claimRequestId: Types.ObjectId = input?.claimRequestId;
      let claimStatus: string = input?.claimStatus;
      let remarks: string | undefined | null = input?.remarks;

      console.log(claimStatus)

      const result = await warrantyClaimModel.findOne({ _id: claimRequestId });
      const existingStatus=result?.claimStatus
      const agentData=await deliveryAgentModel.findById({_id:req?.authAccount?._id})


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
          performedByRole: "DELIVERYAGENT",
          referenceId: claimRequestId,
          referenceType: "WARRANTY_CLAIM",
          details:`${agentData?.fullName}(Delivery Agent) has picked up the replacement product for warranty ${result?.warrantyId} and is now "Out for Delivery". The customer will receive the product shortly.
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

        await deliveryAgentModel.findByIdAndUpdate({_id:req?.authAccount?._id},{

          $inc: {
            'wallet.numberOfPendingWarrantyCall': {
              $cond: {
                if: { $gt: ["$wallet.numberOfPendingWarrantyCall", 0] },
                then: -1,
                else: 0
              }
            }

          }

          
        })

        const data = {
          actionType: "WARRANTY",
          action: `Warranty claim call status update ${existingStatus} to ${claimStatus} `,
          performedBy: req?.authAccount?._id,
          performedByRole: "DELIVERYAGENT",
          referenceId: claimRequestId,
          referenceType: "WARRANTY_CLAIM",
          details:` ${agentData?.fullName}(Delivery Agent) successfully returned the defective product for warranty ${result?.warrantyId} to the warehouse for further inspection or disposal.

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
          referenceType: "WARRANTY_CLAIM",
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


    //to verify otp while repalce product with user by agent

    claimOtpVerification: async (parent, { input }, { req }, info) => {
      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

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
          claimRequestId: input.claimRequestId,
          code: input.code || " ",
          claimStatus: input?.claimStatus || undefined,
          remarks: input?.remarks || undefined,
        };


        const result = await deliveryAgentService.claimOtpVerification(options);

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

    //chage return status after otp verify from agent side
    // returnStatusChangeAfterOtpVerify: async (parent, { input }, { req }, info) => {
    //   await verifyDeliveryAgent(req);
    //   const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

    //   let orderProductId: Types.ObjectId = input?.orderProductId;
    //   let returnStatus: string = input?.returnStatus;
    //   let remarks: string = input?.remarks;

    //   const result = await orderProductModel.findOne({ _id: orderProductId });
    //   const agent=await deliveryAgentModel.findOne({_id:agentId})

    //   if (!result) {
    //     throw new GraphQLError("Order product not found", {
    //       extensions: { code: "NOT_FOUND" },
    //     })
    //   }

    //   if (!agent) {
    //     throw new GraphQLError("agent not found", {
    //       extensions: { code: "NOT_FOUND" },
    //     })
    //   }


    //     if(returnStatus === "REJECTED"){
    //         agent.wallet.numberOfReturnOrderDelivered-=1;
    //         result.returnStatus=returnStatus
    //         result.returnRejectedDate=new Date();
    //         result.returnRejectedRemarks=remarks
    //    }


    //       if(returnStatus === "COLLECTED"){
    //           agent.wallet.numberOfReturnOrderDelivered-=1;
    //           result.returnStatus=returnStatus
    //           result.returnCollectedDate=new Date();
    //           result.returnCollectedRemarks=remarks
    //       }

    //   await agent.save()
    //   await result.save()
    //   return {
    //     status: true,
    //     msg: "Order product status updated"
    //   }

    // },

    //api to change shipping status from agent side
    orderDelivedbyAgent: async (parent, { input }, { req }, info) => {


      try {

        // check delivery agent login or not

        const deliveryAgentData = await verifyDeliveryAgent(req)

        console.log(input.deliveryStatus)

        if (!deliveryAgentData) {

          throw new GraphQLError("Unauthorized", {
            extensions: {
              code: "UNAUTHORIZED",
              errors: []
            },
          });

        }

        const agentId = new Types.ObjectId(deliveryAgentData?.id)
        const agent = await deliveryAgentModel.findOne({ _id: agentId })
        const order_product = await orderProductModel.findOne({ _id: input.orderItemId })


        // check this delivery status POSTPONED

        if (input.deliveryStatus === "POSTPONED" || input.deliveryStatus === "OUT_FOR_DELIVERY") {
            if(input.deliveryStatus === "POSTPONED"){
                  await activityLogService.createActivityLog({
                    actionType: "ORDER",
                    action: "DELIVERY POSTPONED",
                    performedBy: agentId,
                    performedByRole: "DELIVERYAGENT",
                    referenceId: input.orderItemId,
                    referenceType: "ORDER_PRODUCTS",
                    details: `${agent?.fullName} postponed order ${order_product?.itemId} . `,
                  });
                }
          
                if(input.deliveryStatus === "OUT_FOR_DELIVERY"){
                  await activityLogService.createActivityLog({
                    actionType: "ORDER",
                    action: "OUT FOR DELIVERY",
                    performedBy: agentId,
                    performedByRole: "DELIVERYAGENT",
                    referenceId: input.orderItemId,
                    referenceType: "ORDER_PRODUCTS",
                    details: `${agent?.fullName} (Delivery Agent) has picked up the package for order ${order_product?.itemId} and is now "Out for Delivery". The customer will receive the package shortly. `,
                  });
                }

          console.log(input.deliveryStatus)
          const obj = {

            deliveryAgentId: agentId,
            orderItemId: input.orderItemId,
            deliveryStatus: input.deliveryStatus,
            remarks: input.remarks || ""
          }

          const result = await deliveryAgentService.orderDelivedbyAgent(obj)

          return {
            status: true,
            otp: false,
            msg: "delivery status updated"
          }


        } else {

          // check this delivery status DELIVERED OR CANCELED OR RETURN

          // share otp to user mobile number
          await deliveryAgentService.deliveryTimeOtpGenerate(input.orderItemId)

          return {

            status: true,
            otp: true,
            msg: "OTP shared to customer"
          }

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

    //api to verify otp and update status
    deliveryStatusOtpVerify: async (parent, { input }, { req }, info) => {

      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

      try {
        // verify otp
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
          agentId: agentId,
          orderItemId: input.orderItemId,
          code: input.code || " ",
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


    //api to change shipping status after otp verify from agent side
    deliveryStatusAddDeliveryAgent: async (parent, { input }, { req }, info) => {

      try {

        // check delivery agent login or not

        const deliveryAgentData = await verifyDeliveryAgent(req)

        if (!deliveryAgentData) {

          throw new GraphQLError("Unauthorized", {
            extensions: {
              code: "UNAUTHORIZED",
              errors: []
            },
          });

        }

        const agentId = new Types.ObjectId(deliveryAgentData?.id)


        const options = {

          deliveryAgentId: agentId,
          orderItemId: input.orderItemId,
          pymentType: input.paymentMode || "",
          deliveryStatus: input.deliveryStatus,
          remarks: input.remarks || ""
        }

        await deliveryAgentService.orderDelivedbyAgent(options)

        return {

          status: true,
          msg: "order delivery status updated"
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


    uploadReturnProductImageByAgent: async (parent, { input, image }, { req }, info) => {
      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);


      console.log(input);

      let returnProduct = [];

      let orderProductId: Types.ObjectId = input?.orderProductId;

      const existingOrderProduct = await orderProductModel.findById(orderProductId);
      if (!existingOrderProduct) {
        throw new GraphQLError("Order product not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      if (image) {
        try {
          for (let images of image) {

            const { createReadStream, filename, mimetype, encoding } = await images;
            const key = spaceService.getFileKey(filePaths.retrunProductImage, filename, []);
            const stream = createReadStream();
            const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

            returnProduct.push({
              fileType: "PUBLIC",
              fileURL: file.location,
              mimeType: mimetype,
              originalName: filename
            });
          }
        } catch (error) {
          throw new GraphQLError("image upload failed", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
          });
        }
      }



      const result = await orderProductModel.findByIdAndUpdate(orderProductId, { returnProductImageUploadByAgent: returnProduct }, { new: true })

      if (!result) {
        throw new GraphQLError("Unable to upload return product image", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          }
        })
      }

      return {
        message: "return product image uploaded successfully",
      }

    },

    uploadWarrantyProductImageByAgent: async (parent, { input, image }, { req }, info) => {
      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);


      console.log(input);

      let warrantyProduct = [];

      let claimRequestId: Types.ObjectId = input?.claimRequestId;

      const existingClaimRequest = await warrantyClaimModel.findById(claimRequestId);

      if (!existingClaimRequest) {
        throw new GraphQLError("Warranty Claim not found!!Try Again!!!", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      if (image) {
        try {
          for (let images of image) {

            const { createReadStream, filename, mimetype, encoding } = await images;
            const key = spaceService.getFileKey(filePaths.warrantyProductImage, filename, []);
            const stream = createReadStream();
            const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

            warrantyProduct.push({
              fileType: "PUBLIC",
              fileURL: file.location,
              mimeType: mimetype,
              originalName: filename
            });
          }
        } catch (error) {
          throw new GraphQLError("image upload failed", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
          });
        }
      }

      const result = await warrantyClaimModel.findByIdAndUpdate(claimRequestId, { productImageUploadByAgent: warrantyProduct }, { new: true })

      if (!result) {
        throw new GraphQLError("Unable to upload waranty product image", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          }
        })
      }

      return {
        message: "product image uploaded successfully",
      }

    },

    updateDeliveredMapLocation: async (parent, { input }, { req }, info) => {
      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

      let orderProductId: Types.ObjectId = input?.orderProductId;
      let mapLocation: string = input?.mapLocation;

      const existingOrderProduct = await orderProductModel.findById(orderProductId);
      if (!existingOrderProduct) {
        throw new GraphQLError("Order product not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      const result = await orderProductModel.findByIdAndUpdate(orderProductId, { deliveredMapLocation: mapLocation }, { new: true })

      if (!result) {
        throw new GraphQLError("Unable to update deliverd Map location", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          }
        })
      }

      return {
        message: " product deliverd location updated successfully",
      }

    },

    updateReplacementDeliveredLocation: async (parent, { input }, { req }, info) => {
      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

      let claimRequestId: Types.ObjectId = input?.claimRequestId;
      let mapLocation: string = input?.mapLocation;

      const existingClaimRequest = await warrantyClaimModel.findById(claimRequestId);
      if (!existingClaimRequest) {
        throw new GraphQLError(" claim request not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      const result = await warrantyClaimModel.findByIdAndUpdate(claimRequestId, { replacementDeliveredLocation: mapLocation }, { new: true })

      if (!result) {
        throw new GraphQLError("Unable to update deliverd Map location", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          }
        })
      }

      return {
        message: " product deliverd location updated successfully",
      }

    },


    resetPassword: async (parent, { input }, { req }, info) => {
      try {
        // Verify that the request is made by a valid delivery agent
        console.log("called")
        await verifyDeliveryAgent(req);
        const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

        console.log(agentId)
        console.log("agent verified")

        const newPassword: string = input?.newPassword;

        // Validate the input password
        if (!newPassword || newPassword.trim().length < 6) {
          throw new GraphQLError("Password must be at least 6 characters long", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        // Find the delivery agent in the database
        const existingAgent = await deliveryAgentModel.findById(agentId);
        if (!existingAgent) {
          throw new GraphQLError("Agent not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        console.log("existingAgent", existingAgent)

        // Hash and set the new password
        await existingAgent.setHash!(newPassword);

        // Save the updated agent record to the database
        await existingAgent.save();

        return {
          success: true,
          message: "Password reset successfully",
        };
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to reset password", {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },



  },

  Query: {

    //to get agent's pending return orders list
    getPendingReturnsByAgent: async (parent, { input }, { req }, info) => {
      console.log("called")
      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);


      const page: number = input?.page || 0;
      const limit: number = input?.limit || Infinity;

      if (!agentId) {
        throw new GraphQLError("All Fields are required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!Types.ObjectId.isValid(agentId)) {
        throw new GraphQLError("Invalid Agent ID format", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const returnFilter: Record<string, any> = {
        returndeliveryAgentId: agentId
      };

      if (input.returnStatus) {
        returnFilter.returnStatus = input.returnStatus;
      }

      const today = new Date();
      returnFilter.returnOrderAssignedOn = {
        $gte: startOfDay(today),
        $lte: endOfDay(today),
      };

      console.log("returnFilter", returnFilter)

      try {

        const { records, totalCount } = await orderProductService.getReturnOrderProductWithFilters(
          returnFilter,
          {},
          { lean: true, page, limit },
        );


        console.log(records)
        console.log(totalCount)

        return {
          records,
          totalCount,
          page,
          totalPages: Math.ceil(totalCount / limit),
        };

      } catch (error: any) {
        throw new GraphQLError(error.message || "Error fetching Delivery Agent return orders", {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },

    //to get assigned pending warranty pickups by agent

    getPendingWarrantyPickupsByAgent: async (parent, { input }, { req }, info) => {
      console.log("called")
      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);


      const page: number = input?.page || 0;
      const size: number = input?.size || 100;
      const options: any = {
        page: page,
        size: size
      }

      if (!agentId) {
        throw new GraphQLError("All Fields are required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!Types.ObjectId.isValid(agentId)) {
        throw new GraphQLError("Invalid Agent ID format", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const claimFilter: Record<string, any> = {
        deliveryAgentId: agentId
      };

      if (input?.claimStatus) {
        claimFilter.claimStatus = input.claimStatus;
      }

      const today = new Date();
      claimFilter.deliveryAgentAssignedOn = {
        $gte: startOfDay(today),
        $lte: endOfDay(today),
      };

      console.log("claimFilter", claimFilter)

      try {

        const response = await warrantyClaimService.getPendingWarrantyPickupsByAgent(
          options,
          claimFilter
        );

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
        });
      }

    },


    //to get all history of warranty pickups by agent 

    getHistoryOfWarrantyPickupsByAgent: async (parent, { input }, { req }, info) => {
      console.log("called")
      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);


      const page: number = input?.page || 0;
      const size: number = input?.size || 100;
      const options: any = {
        page: page,
        size: size
      }

      if (!agentId) {
        throw new GraphQLError("All Fields are required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!Types.ObjectId.isValid(agentId)) {
        throw new GraphQLError("Invalid Agent ID format", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const claimFilter: Record<string, any> = {
        deliveryAgentId: agentId
      };

      if (input?.claimStatus) {
        claimFilter.claimStatus = input.claimStatus;
      }

      // const today = new Date();
      // claimFilter.deliveryAgentAssignedOn = {
      //   $gte: startOfDay(today),
      //   $lte: endOfDay(today),
      // };

      console.log("claimFilter", claimFilter)

      try {

        const response = await warrantyClaimService.getPendingWarrantyPickupsByAgent(
          options,
          claimFilter
        );

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
        });
      }
    },


    //to get deatils of warranty pickups in agent portal

    getDetailsOfWarrantyPickupsByAgent: async (parent, { input }, { req }, info) => {
      // await verifyDeliveryAgent(req);
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
        const response = await warrantyClaimService.getDetailsOfWarrantyPickupsByAgent(claimRequestId)
        console.log("response", response)
        return response.records[0]
      } catch (error: any) {
        throw new GraphQLError(error, {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        })
      }
    },

    //to get all governorates and villages

    getLocationsData: async (parent, { }, { req }, info) => {
      console.log("called")
      console.log("locations", locations)
      return locations.governorates;
    },


    //get delivery agent details by admin
    getDeliveryAgent: async (parent, { input }, { req }, info) => {
      // await verifyAdmin(req);

      console.log(input)
      const { agentId, startDate, endDate, type } = input;

      const page: number = input?.page || 0;
      const limit: number = input?.limit || Infinity;

      if (!agentId) {
        throw new GraphQLError("All Fields are required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!Types.ObjectId.isValid(agentId)) {
        throw new GraphQLError("Invalid Agent ID format", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }


      // Construct dynamic filter for settlement history
      const settlementHistoryFilter: Record<string, any> = {};



      if (startDate) {
        const normalizedStartDate = moment.utc(startDate).toDate(); // Parse startDate in UTC
        settlementHistoryFilter.createdAt = { $gte: normalizedStartDate };
      }

      if (endDate) {
        const normalizedEndDate = moment.utc(endDate).endOf('day').toDate(); // Parse endDate in UTC
        settlementHistoryFilter.createdAt = {
          ...settlementHistoryFilter.createdAt,
          $lte: normalizedEndDate,
        };
      }


      if (type) {
        settlementHistoryFilter.type = type;
      }


      try {
        // Fetch the delivery agent by agentId
        const deliveryAgent = await deliveryAgentService.findDeliveryAgentWithFilters(
          { _id: agentId },
          {
            _id: 1,
            fullName: 1,
            contactNumber: 1,
            userID: 1,
            agentType: 1,
            vendorID: 1,
            isActive: 1,
            isAvailable: 1,
            licence: 1,
            lastSettlementID: 1,
            wallet: 1,
            ID: 1,
            governorate: 1,
            village: 1,
            governorateID: 1,
            villageID: 1
          },
          { lean: true, page, limit },
          settlementHistoryFilter
        );



        if (!deliveryAgent) {
          throw new GraphQLError("Delivery Agent not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        // Fetch total count of settlementHistory for pagination metadata
        const totalSettlementHistory = await deliveryAgentService.countSettlementHistory(agentId, settlementHistoryFilter);

        return {
          deliveryAgent,
          totalItems: totalSettlementHistory,
          currentPage: page,
          totalPages: Math.ceil(totalSettlementHistory / limit),
        }

      } catch (error: any) {
        throw new GraphQLError(error.message || "Error fetching Delivery Agent", {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },

    //get delivery agent return order list from admin side

    getDeliveryAgentReturnOrder: async (parent, { input }, { req }, info) => {
      // TODO: 1.usin agent id filter asigned order from orderproduct model 
      //return all data 
      //3. add pagination/filter
      // await verifyAdmin(req);
      const { agentId } = input;

      const page: number = input?.page || 0;
      const limit: number = input?.limit || Infinity;
      const date = input?.date

      if (!agentId) {
        throw new GraphQLError("All Fields are required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!Types.ObjectId.isValid(agentId)) {
        throw new GraphQLError("Invalid Agent ID format", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const returnFilter: Record<string, any> = {
        returndeliveryAgentId: agentId
      };

      if (input.returnStatus) {
        returnFilter.returnStatus = input.returnStatus;
      }

      if (input.date) {
        returnFilter.returnOrderAssignedOn = {
          $gte: startOfDay(date),
          $lte: endOfDay(date),
        };
      }


      console.log("returnFilter", returnFilter)

      try {

        const { records, totalCount } = await orderProductService.getReturnOrderProductWithFilters(
          returnFilter,
          {},
          { lean: true, page, limit },
        );


        console.log(records)
        console.log(totalCount)

        return {
          records,
          totalCount,
          page,
          totalPages: Math.ceil(totalCount / limit),
        };

      } catch (error: any) {
        throw new GraphQLError(error.message || "Error fetching Delivery Agent return orders", {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },


    //get delivery agent warranty call list from admin side

    getDeliveryAgentWarrantyCall: async (parent, { input }, { req }, info) => {

      try {

        const { agentId } = input;

        const page: number = input?.page || 0;
        const limit: number = input?.limit || Infinity;
        const date = input?.date

        if (!agentId) {
          throw new GraphQLError("All Fields are required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const returnFilter: Record<string, any> = {
          deliveryAgentId: agentId
        };

        if (input.claimStatus) {
          returnFilter.claimStatus = input.claimStatus;
        }

        if (input.date) {
          returnFilter.deliveryAgentAssignedOn = {
            $gte: startOfDay(date),
            $lte: endOfDay(date),
          };
        }


        const { records, totalCount } = await deliveryAgentService.getDeliveryAgentWarrantyCall(returnFilter, {}, { lean: true, page, limit })
        return {
          records,
          totalCount,
          page,
          totalPages: Math.ceil(totalCount / limit),
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



    //get delivery agent return order list from agent side

    getAssignedReturnOrderByAgent: async (parent, { input }, { req }, info) => {
      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);


      const page: number = input?.page || 0;
      const limit: number = input?.limit || Infinity;

      if (!agentId) {
        throw new GraphQLError("All Fields are required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!Types.ObjectId.isValid(agentId)) {
        throw new GraphQLError("Invalid Agent ID format", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const returnFilter: Record<string, any> = {
        returndeliveryAgentId: agentId
      };

      if (input.returnStatus) {
        returnFilter.returnStatus = input.returnStatus;
      }


      console.log("returnFilter", returnFilter)

      try {

        const { records, totalCount } = await orderProductService.getReturnOrderProductWithFilters(
          returnFilter,
          {},
          { lean: true, page, limit },
        );


        console.log(records)
        console.log(totalCount)

        return {
          records,
          totalCount,
          page,
          totalPages: Math.ceil(totalCount / limit),
        };

      } catch (error: any) {
        throw new GraphQLError(error.message || "Error fetching Delivery Agent return orders", {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },

    //get delivery agent details in  agent dashboard
    getDeliveryAgentByAgent: async (parent, { input }, { req }, info) => {
      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

      const { startDate, endDate, type } = input;

      const page: number = input?.page || 1;
      const limit: number = input?.limit || Infinity;

      if (!agentId) {
        throw new GraphQLError("Agent ID is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!Types.ObjectId.isValid(agentId)) {
        throw new GraphQLError("Invalid Agent ID format", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Construct dynamic filter for settlement history
      const settlementHistoryFilter: Record<string, any> = {};

      if (startDate) {
        const normalizedStartDate = moment.utc(startDate).toDate(); // Parse startDate in UTC
        settlementHistoryFilter.createdAt = { $gte: normalizedStartDate };
      }

      if (endDate) {
        const normalizedEndDate = moment.utc(endDate).endOf('day').toDate(); // Parse endDate in UTC
        settlementHistoryFilter.createdAt = {
          ...settlementHistoryFilter.createdAt,
          $lte: normalizedEndDate,
        };
      }

      if (type) {
        settlementHistoryFilter.type = type;
      }


      try {
        // Fetch the delivery agent by agentId
        const deliveryAgent = await deliveryAgentService.findDeliveryAgentWithFilters(
          { _id: agentId },
          {
            _id: 1,
            fullName: 1,
            contactNumber: 1,
            userID: 1,
            agentType: 1,
            vendorID: 1,
            isActive: 1,
            isAvailable: 1,
            licence: 1,
            wallet: 1,
            ID: 1,
          },
          { lean: true, page, limit },
          settlementHistoryFilter
        );

        if (!deliveryAgent) {
          throw new GraphQLError("Delivery Agent not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        const totalSettlementHistory = await deliveryAgentService.countSettlementHistory(agentId, settlementHistoryFilter);

        return {
          deliveryAgent,
          totalItems: totalSettlementHistory,
          currentPage: page,
          totalPages: Math.ceil(totalSettlementHistory / limit),
        }

      } catch (error: any) {
        throw new GraphQLError(error.message || "Error fetching Delivery Agent", {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },

    // get all delivery agent data 
    async getAllAgentData(parent, { input }, { req }, info): Promise<any> {
      // await verifyAdmin(req)
      try {

        console.log("req", input)

        const page: number = input?.page || 0;
        const size: number = input?.size || 10;

        const options: any = {

          page,
          size,
          isActive: input?.isActive,
          agentType: input?.agentType,
          search: input?.search,
          settlement: input?.settlement
        }
        console.log(options);
        const result = await deliveryAgentService.viewAllDeliveryAgents(options)
        console.log("result = ", result)
        return result
      } catch (error) {
        throw new GraphQLError("Unable find all delivery agents", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });
      }
    },

    //get all settlement history by admin
    getSettlementHistoryByAdmin: async (parent, { }, { req }, info) => {
      await verifyAdmin(req);
      try {
        const result = await deliveryAgentService.getSettlementHistoryByAdmin({});

        if (!result || result.length === 0) {
          throw new GraphQLError("No settlements found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return result;

      } catch (error: any) {
        throw new GraphQLError("Error fetching settlements", {
          extensions: { code: "INTERNAL_SERVER_ERROR", details: error.message },
        });
      }
    },


    //to get agent's settlement history in admin portal
    getAgentSettlementHistory: async (parent, { input }, { req }, info) => {
      const { agentId, startDate, endDate, type } = input;

      const page: number = input?.page || 1;
      const limit: number = input?.limit || Infinity;

      if (!agentId) {
        throw new GraphQLError("Agent ID is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!Types.ObjectId.isValid(agentId)) {
        throw new GraphQLError("Invalid Agent ID format", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }



      // Construct dynamic filter for settlement history
      const settlementHistoryFilter: Record<string, any> = {};

      if (startDate) {
        const normalizedStartDate = moment.utc(startDate).toDate(); // Parse startDate in UTC
        settlementHistoryFilter.createdAt = { $gte: normalizedStartDate };
      }

      if (endDate) {
        const normalizedEndDate = moment.utc(endDate).endOf('day').toDate(); // Parse endDate in UTC
        settlementHistoryFilter.createdAt = {
          ...settlementHistoryFilter.createdAt,
          $lte: normalizedEndDate,
        };
      }

      if (type) {
        settlementHistoryFilter.type = type;
      }


      try {
        const result = await settlementModel
          .find({ agentId, ...settlementHistoryFilter })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        if (!result) {
          throw new GraphQLError("No settlements found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        const totalSettlements = await settlementModel.countDocuments({
          agentId,
          ...settlementHistoryFilter,
        });


        return {
          settlements: result,
          totalItems: totalSettlements,
          currentPage: page,
          totalPages: Math.ceil(totalSettlements / limit),
        };

      } catch (error: any) {
        throw new GraphQLError("Error fetching settlements", {
          extensions: { code: "INTERNAL_SERVER_ERROR", details: error.message },
        });
      }
    },

    //to get agent's settlemnt history in agent dashboard

    getAgentSettlementHistoryByAgent: async (parent, { input }, { req }, info) => {
      await verifyDeliveryAgent(req);
      const agentId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

      const type: string | undefined = input?.type ?? undefined;

      if (!agentId) {
        throw new GraphQLError("Agent ID is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!Types.ObjectId.isValid(agentId)) {
        throw new GraphQLError("Invalid Agent ID format", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      try {

        const query: any = { agentId: agentId };
        if (type) {
          query.type = type;
        }


        const result = await settlementModel.find(query).sort({ createdAt: -1 });

        if (!result) {
          throw new GraphQLError("No settlements found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return result;

      } catch (error: any) {
        throw new GraphQLError("Error fetching settlements", {
          extensions: { code: "INTERNAL_SERVER_ERROR", details: error.message },
        });
      }
    },

    // delivery agent port assigned order list

    getAssignedOrderByAgentProfile: async (parent, { input }, { req }, info) => {

      try {

        //  delivery agent verfy

        const deliveryAgentData = await verifyDeliveryAgent(req)

        if (!deliveryAgentData) {

          throw new GraphQLError("Unauthorized", {
            extensions: {
              code: "UNAUTHORIZED",
              errors: []
            },
          });

        }

        console.log("agent data", deliveryAgentData)

        const agentId = new Types.ObjectId(deliveryAgentData?.id)

        const options = {

          _id: agentId,
          page: input?.page || 0,
          size: input?.size || 10,
          shippingStatus: input?.shippingStatus
        }



        const result = await deliveryAgentService.getAssignedOrderByDeliveryAgent(options)

        return result



      } catch (error: any) {

        console.log("error ", error)

        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          },
        });

      }
    },

    //to get pending orders of agent in agent dashboard

    getTodayAssignedOrderByAgentProfile: async (parent, { input }, { req }, info) => {

      try {

        //  delivery agent verfy

        const deliveryAgentData = await verifyDeliveryAgent(req)

        if (!deliveryAgentData) {

          throw new GraphQLError("Unauthorized", {
            extensions: {
              code: "UNAUTHORIZED",
              errors: []
            },
          });

        }

        console.log("agent data", deliveryAgentData)

        const agentId = new Types.ObjectId(deliveryAgentData?.id)

        const options = {

          _id: agentId,
          page: input?.page || 0,
          size: input?.size || 10,
          shippingStatus: input?.shippingStatus
        }



        const result = await deliveryAgentService.getTodayAssignedOrderByDeliveryAgent(options)
        console.log("result ", result)

        return result



      } catch (error: any) {

        console.log("error ", error)

        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          },
        });

      }
    },


    // get one agent assigned order full data admin port 

    getAssignedOrderByDeliveryAgent: async (parent, { input }, { req }, info) => {


      await verifyAdmin(req)


      try {
        // admin verfy


        console.log("req")

        // check input

        if (!input?._id) {

          throw new GraphQLError("invalied delivery boy id", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: [],
            },
          });


        }

        const options = {

          _id: input._id,
          page: input?.page || 0,
          size: input?.size || 10,
          shippingStatus: input?.shippingStatus,
          date: input?.date
        }

        const result = await deliveryAgentService.getAssignedOrderByDeliveryAgent(options)
        console.log(result)

        return result


      } catch (error) {

        throw new GraphQLError("Error for fetching order details", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });

      }


    },

    // to get return order bundles of agent in admin side

    getAssignedReturnOrderBundleByDeliveryAgent: async (parent, { input }, { req }, info) => {
      try {

        if (!input?._id) {
          throw new GraphQLError("invalied delivery boy id", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: [],
            },
          });
        }

        const options = {
          _id: input._id,
          page: input?.page || 0,
          size: input?.size || 10,
          startDate: input?.startDate || "",
          endDate: input?.endDate || ""
        }

        const result = await deliveryAgentService.getAssignedReturnOrderBundleByDeliveryAgent(options)
        return result

      } catch (error: any) {
        console.log("ERROR = ", error)
        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });
      }
    },

    // get warranty calls  bundles of agent in admin side


    getAssignedWarrantyCallDeliveryAgent: async (parent, { input }, { req }, info) => {

      try {

        if (!input?._id) {
          throw new GraphQLError("invalied delivery boy id", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: [],
            },
          });
        }

        const options = {
          _id: input._id,
          page: input?.page || 0,
          size: input?.size || 10,
          startDate: input?.startDate || "",
          endDate: input?.endDate || ""
        }

        const result = await deliveryAgentService.getAssignedWarrantyCallDeliveryAgent(options)

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




    //to get order bundles of agent in admin side

    getAssignedOrderBundleByDeliveryAgent: async (parent, { input }, { req }, info) => {
      try {
        console.log(req, " = REQ")
        // await verifyAdmin(req)

        // check input
        if (!input?._id) {
          throw new GraphQLError("invalied delivery boy id", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: [],
            },
          });
        }

        const options = {
          _id: input._id,
          page: input?.page || 0,
          size: input?.size || 10,
          startDate: input?.startDate || "",
          endDate: input?.endDate || ""
        }

        const result = await deliveryAgentService.getAssignedOrderBundleByDeliveryAgent(options)
        console.log(result, " = RESULT")

        return result

      } catch (error: any) {
        console.log("ERROR = ", error)
        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });
      }

    },


    // delivery agent port assigned order detail view
    getAssignedeOrderDeatilsByAgentProfile: async (parent, { input }, { req }, info) => {

      try {


        // const deliveryAgentData = await verifyDeliveryAgent(req)

        // if (!deliveryAgentData) {

        //   throw new GraphQLError("Unauthorized", {
        //     extensions: {
        //       code: "UNAUTHORIZED",
        //       errors: []
        //     },
        //   });

        // }

        // input check

        if (!input._id) {

          throw new GraphQLError("Error for fetching order details", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: []
            },
          });
        }

        const orderProductsId = new Types.ObjectId(input._id)
        const result = await deliveryAgentService.getAssignedeOrderDeatilsByAgentProfile(orderProductsId)
        console.log("RESULT assigned= ", result)
        return result;


      } catch (error: any) {


        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          },
        });


      }
    },


    // admin customiz order assign to delivery agent time agent data get

    getDeliveryAgentlistCustomizOrderAssigen: async (parent, { input }, { req }, info) => {

      // verify admin

      // await verifyAdmin(req)

      try {

        const options = {

          deliveryAgentType: input?.deliveryAgentType || " ",
          vendorID: input?.vendorID || undefined,
          villageID: input?.villageID || "",
          governorateID: input?.governorateID || ""
        }
        console.log(options, 'INPUT OPTIONS')
        const result = await deliveryAgentService.getDeliveryAgentlistCustomizOrderAssigen(options)

        return result

      } catch (error: any) {

        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          },
        });
      }
    },

    getActivityLogOfAgent: async (parent, { input }, { req }, info) => {
      //  await verifyDeliveryAgent(req);
      try {
        // const adminId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);
        const agentId = input.agentId;
        const date = input?.date

        const matchObj: any = { performedBy: agentId };

        if (date) {
          const startDate = new Date(date);
          const endDate = new Date(date);
          endDate.setHours(23, 59, 59, 999);

          matchObj.createdAt = { $gte: startDate, $lte: endDate };
        }

        const result = await deliveryAgentService.getActivityLogOfAgent(agentId, matchObj)
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
    }


  }
}









