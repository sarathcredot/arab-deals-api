

import { jwtService, spaceService, otpService, deliveryAgentService, orderProductService, roleService, notificationService } from "../../services";

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
import { notificationModel } from "../../models/notificationModel"






export const notificationResolver: Resolvers = {


  Mutation: {

    addNotificationViewPersonId: async (parent, { input }, { req }, info) => {


      await verifyAdmin(req)

      try {

        const options = {
          id: req.authAccount._id,
          notificationId: input.notificationId

        }

        notificationService.addNotificationViewPersonId(options)

        return {

          status: true,
          msg: ""

        }

      } catch (error: any) {

        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          },
        });

      }
    },


    addRemoveMarkNotification: async (parent, { input }, { req }, info) => {

      await verifyAdmin(req)

      try {

        const options = {

          notificationId: input.notificationId,
          userId: req.authAccount._id
        }


        await notificationService.addRemoveMarkNotification(options)

        return {

          status: true,
          msg: ""
        }


      } catch (error: any) {

        throw new GraphQLError(error, {

          extensions: {
            code: "INTERNAL_SERVER_ERRORs",
            errors: []
          },
        });

      }
    }






  },


  Query: {

    getAllNotification: async (parent, { }, { req }, info) => {

      await verifyAdmin(req)

      try {

        const userId = req.authAccount._id
        const token = await jwtService.getAuthTokenFromHeaders(req)
        const decodeToken = await jwtService.verifyAdminJWT(token)
        const userPermissions: any[] = decodeToken?.role
        const finalResult: any[] = []
        let unReadCount=0



        const result = await notificationService.getAllNotification()

        if (decodeToken.accType === "SUPER_ADMIN") {


          for (let i = 0; i < result.length; i++) {

            if (result[i].view.length === 0) {

              finalResult.push(result[i])
              unReadCount++
             

            } else {


              if (result[i]?.view?.some((item: any) => item.id?.toString() !== userId?.toString())) {

                finalResult.push(result[i])
                unReadCount++
                
              }


              if (result[i]?.view?.some((item: any) => item.id?.toString() === userId?.toString() && item?.remove === false)) {

                console.log("not remove")
                finalResult.push(result[i])
                


              }

            }

          }

          



          return {

            allNotification:finalResult,
            unReadCount:unReadCount

          }


        } else {


          for (let i = 0; i < result.length; i++) {


            if (result[i].view.length === 0) {

              for (let elm of result[i].permissions) {

                if (userPermissions.includes(elm)) {

                  finalResult.push(result[i])
                  unReadCount++
                  break;

                }
              }

            } else {

              if (result[i]?.view?.some((item: any) => item.id?.toString() !== userId?.toString())) {


                for (let elm of result[i].permissions) {

                  if (userPermissions.includes(elm)) {

                    finalResult.push(result[i])
                    unReadCount++
                    break;

                  }
                }

              }


              if (result[i]?.view?.some((item: any) => item.id?.toString() === userId?.toString() && item?.remove === false)) {


                for (let elm of result[i].permissions) {

                  if (userPermissions.includes(elm)) {

                    finalResult.push(result[i])
                    break;

                  }
                }


              }

            }


          }

          console.log(finalResult.length)
          return {

            allNotification:finalResult,
            unReadCount:unReadCount

          }

        }


      } catch (error: any) {

        console.log("error", error)

        throw new GraphQLError(error, {

          extensions: {
            code: "INTERNAL_SERVER_ERRORs",
            errors: []
          },
        });
      }
    }


  }

}






