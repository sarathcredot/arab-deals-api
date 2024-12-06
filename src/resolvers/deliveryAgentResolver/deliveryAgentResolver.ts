import {  jwtService, spaceService, otpService,deliveryAgentService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import path from "path";
import * as validators from "./deliveryAgentValidator";
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";
import { deliveryAgentModel } from "src/models";

export const deliveryAgentResolver: Resolvers = {
    Upload: GraphQLUpload,
    Mutation: {
  
      // delivery agent creation from admin side
      createDeliveryAgent: async (parent, { input }, { req }, info) => {
        // await verifyAdmin(req);
        await validateInput(validators.deliveryAgentCreateByAdminValidator, req);

        let fullName: string = input.fullName;
        let contactNumber: string = input.contactNumber;
        let userID: string = input.userID;
        let password: string = input.password;
        let agentType: string = input.agentType;
        let vendorID: Types.ObjectId = input?.vendorID;

        console.log(input)
  
       // Check if userid already exists
       const isUserExists = await deliveryAgentService.findDeliveryAgentWithFilters(
        { userID },
        { _id: 1 }, 
        { lean: true }
      );

      if (isUserExists) {
        throw new GraphQLError("UserID already exists", {
          extensions: {
            code: "USER_ALREADY_EXISTS",
            errors: [],
          },
        });
      }

       // Check if the contactNumber already exists
       const existingContact = await deliveryAgentService.findDeliveryAgentWithFilters(
        { contactNumber },
        { _id: 1 },
        { lean: true }

      );
      if (existingContact) {
        throw new GraphQLError("Contact number already taken", {
          extensions: {
            code: "CONTACT_NUMBER_ALREADY_EXISTS",
            errors: [],
          },
        });
      }

      let newDeliveryAgentData: deliveryAgentService.IDeliveryAgent = {
        fullName,
        contactNumber,
        userID,
        password,
        agentType,
        vendorID,
      };

       // Create the delivery agent record in the database
       const result = await deliveryAgentService.createDeliveryAgent(newDeliveryAgentData,password);

       if (!result) {
        throw new GraphQLError("Unable to create delivery agent", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });
      }

      return {
        _id: result._id, 
        message: "Delivery Agent successfully created",
      };

      },
       
      // delivery agent suspension from admin side
      suspendDeliveryAgent:async (parent, { input }, { req }, info) =>{
         await verifyAdmin(req);
         const { agentId } = input;

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
          );
      
          if (!updatedAgent) {
            throw new GraphQLError("Unable to update Delivery Agent status", {
              extensions: { code: "INTERNAL_SERVER_ERROR" },
            });
          }
      
          return {
            _id: updatedAgent._id,
            message:"Delivery agent suspended sucsessfully"
          };
        } catch (error:any) {
            throw new GraphQLError(error.message || "Error suspending Delivery Agent", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
          });
        }
      }
   
    }
}