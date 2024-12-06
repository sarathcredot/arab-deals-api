import { jwtService, spaceService, otpService, deliveryAgentService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";


interface EditAgentResult {
  flag: boolean;
}

export const deliveryAgentResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {

    // Vendor creation from admin side
    createDeliveryAgent: async (parent, { input }, { req }, info) => {
      await verifyAdmin(req);
      let fullName: string = input.fullName;
      let contactNumber: string = input.contactNumber;
      let agentType: string = input.agentType;
      let vendorID: string | undefined = input?.vendorID;

      let response = {
        message: "Vendor successfully created",
      };

      return response;
    },

   // delivery agent data edit 
    editDeliveryAgentData: async (parent, { input }, { req }, info): Promise<boolean> => {

        const result:EditAgentResult = await deliveryAgentService.editAgentData(input)

      if (result.flag) {

        return true  // agent data edited

      } else {

        return false  // agent data edit failed
      }


    },


  },

  Query: {

    

   // get all delivery agent data 
    async getAllAgentData(): Promise<any> {


      try {

        const result = await deliveryAgentService.viewAllDeliveryAgents()

        return result

      } catch (error) {

        console.log("error")

      }


    }

  }







};
