import { jwtService, spaceService, otpService, deliveryAgentService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import path from "path";
import * as validators from "./deliveryAgentValidator";
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";
import { deliveryAgentModel, settlementModel } from "src/models";
import { error } from "console";


interface EditAgentResult {
  flag: boolean;
}

type DeliveryLoginData = {


  userID: string;
  contactNumber: string;
  password: string;

}

type OrderAssignDeliveryAgentInput = {

  orderItemId: Types.ObjectId
  deliveryAgentId: Types.ObjectId
  deliveryAgentName: string
}





export const deliveryAgentResolver: Resolvers = {

  Upload: GraphQLUpload,
  Mutation: {

    // delivery agent creation from admin side
    createDeliveryAgent: async (parent, { input, image }, { req }, info) => {
      // await verifyAdmin(req);
      await validateInput(validators.deliveryAgentCreateByAdminValidator, req);

      let fullName: string = input.fullName;
      let contactNumber: string = input.contactNumber;
      let userID: string = input.userID;
      let password: string = input.password;
      let agentType: string = input.agentType;
      let vendorID: Types.ObjectId = input?.vendorID;
      let licence: deliveryAgentService.FileData | undefined;

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

      if (!licence) {
        throw new GraphQLError("Licence file is required", {
          extensions: {
            code: "BAD_REQUEST",
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
          }
        } catch (error) {
          throw new GraphQLError("License upload failed", {
            extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
          });
        }
      }

      let newDeliveryAgentData: deliveryAgentService.IDeliveryAgent = {
        fullName,
        contactNumber,
        userID,
        password,
        agentType,
        vendorID,
        licence
      };

      // Create the delivery agent record in the database
      const result = await deliveryAgentService.createDeliveryAgent(newDeliveryAgentData, password);

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
    suspendDeliveryAgent: async (parent, { input }, { req }, info) => {
      await verifyAdmin(req);
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

    createSettlement:async(parent, { input }, { req }, info) =>{
      //  await verifyAdmin(req);

       const {agentId,amount}=input;
       const remarks: string | undefined = input?.remarks ?? undefined;

       try {
        // Check if the delivery agent exists
        const existingAgent = await deliveryAgentService.findDeliveryAgentWithFilters(
          { _id: agentId },
          { _id: 1, wallet:1 },
          { lean: false }
        );

        if (!existingAgent) {
          throw new GraphQLError("Delivery Agent not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }
       
        if(existingAgent.wallet.cashInHand < amount){
          throw new GraphQLError("Insufficient funds. The agent does not have enough money for this settlement.", {
            extensions: { code: "BAD_REQUEST" },
          });
        }


        let settlementData: deliveryAgentService.ISettlement = {
          type:"SETTLED",agentId,amount,remarks,totalAmount:existingAgent.wallet.cashInHand,balance:existingAgent.wallet.cashInHand-amount
        };

        const result = await deliveryAgentService.createSettlement(settlementData,agentId);

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


    editSettlement:async(parent, { input }, { req }, info) =>{
      //  await verifyAdmin(req);

       const { settlementId, amount } = input;
       const remarks: string | undefined = input?.remarks ?? undefined;

       try {

        const existingSettlement = await deliveryAgentService.findSettlementtWithFilters(
          { _id: settlementId },
          { _id: 1, type:1,agentId:1,amount:1,date:1,remarks:1,totalAmount:1,balance:1},
          { lean: false });


        if (!existingSettlement) {
          throw new GraphQLError("Settlement not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

                // Check if the delivery agent exists
                const existingAgent = await deliveryAgentService.findDeliveryAgentWithFilters(
                  { _id: existingSettlement.agentId },
                  { _id: 1, wallet:1 },
                  { lean: false }
                );

                if (!existingAgent) {
                  throw new GraphQLError("Delivery Agent not found", {
                    extensions: { code: "NOT_FOUND" },
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
                type:"SETTLED",
                agentId:existingSettlement.agentId ,
                remarks,
                balance: existingAgent.wallet.cashInHand - walletAdjustment,
              };

              const result = await deliveryAgentService.editSettlement(settlementId, updatedSettlementData, walletAdjustment,existingSettlement.agentId);

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
    editDeliveryAgentData: async (parent, { input }, { req }, info): Promise<boolean> => {

      await verifyAdmin(req);

      // delivery agent edit input validation
      await validateInput(validators.deliveryAgentEditByAdminValidator, req);

      if (!input._id) {

        throw new GraphQLError("Agent ID is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });

      } else {

        const result: EditAgentResult = await deliveryAgentService.editAgentData(input)

        if (result.flag) {

          return true  // agent data edited

        } else {

          throw new GraphQLError("Unable to edit delivery agent", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: [],
            },
          });

          // agent data edit failed
        }

      }

    },

    // delivery agent login 

    loginDeliveryAgent: async (parent, { input }, { req }, info): Promise<any> => {

      // agent login 
      const result: any = await deliveryAgentService.loginDeliveryAgent(input as DeliveryLoginData)

      if (result.login) {

        const token = await jwtService.createDeliveryAgentLoginJWT({ id: result._id, userID: result.userId })

        console.log(result)

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







    },

    // order assign to delivery agent 

    orderAssignDeliveryAgent: async (parent, { input }, { req }, info) => {

     try {

       // input validation
       await validateInput(validators.orderAssignDeliveryAgentValidator, req)
      
       const result: any = await deliveryAgentService.orderAssignDeliveryAgent(input as OrderAssignDeliveryAgentInput)
 
       if (result.flag) {
 
         return true // order assign to delivery agent 
 
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

    orderDelivedbyAgent:async(parent, { input }, { req }, info)=>{

      
           

            return true
    }


  },



  Query: {

    getDeliveryAgent: async (parent, { input }, { req }, info) => {

      const { agentId } = input;

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
            licence:1
          },
          { lean: true }
        );

        if (!deliveryAgent) {
          throw new GraphQLError("Delivery Agent not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return deliveryAgent;

      } catch (error: any) {
        throw new GraphQLError(error.message || "Error fetching Delivery Agent", {
          extensions: { code: "INTERNAL_SERVER_ERROR", errors: [error] },
        });
      }
    },

    // get all delivery agent data 
    async getAllAgentData(): Promise<any> {


      try {

        const result = await deliveryAgentService.viewAllDeliveryAgents()

        return result

      } catch (error) {

        throw new GraphQLError("Unable ind all delivery agents", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });



      }


    },



    getSettlementHistoryByAdmin: async () => {
      try {
        const result = await deliveryAgentService.getSettlementHistoryByAdmin({});
    
        if (!result || result.length === 0) {
          throw new GraphQLError("No settlements found", {
            extensions: { code: "NOT_FOUND" },
          });
        }
    
        return result;

      } catch (error:any) {
        throw new GraphQLError("Error fetching settlements", {
          extensions: { code: "INTERNAL_SERVER_ERROR", details: error.message },
        });
      }
    }
    
  }


}









