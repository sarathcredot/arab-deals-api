import {  jwtService, spaceService, otpService,deliveryAgentService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import path from "path";
import { createWriteStream } from 'fs';
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
   
    }
}