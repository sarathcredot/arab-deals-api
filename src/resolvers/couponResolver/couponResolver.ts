import { jwtService, spaceService, otpService, deliveryAgentService, orderProductService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor, verifyDeliveryAgent } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";
import { deliveryAgentModel } from "../../models/deliveryAgentModel";
import { error } from "console";





export const couponResolver: Resolvers = {
     Upload: GraphQLUpload,
     Mutation:{
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
     }
}