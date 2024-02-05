import { adminService, jwtService, spaceService, userService, otpService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./userValidator";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifySuperAdmin, verifyAdmin, verifyUser } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";

export const userResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {
    userLoginOtp: async (parent, { input }, { req }, info) => {
      await validateInput(validators.userNumberValidator, req);
      const mobileNumber: string = input.mobileNumber;
      const user = await userService.findUserWithFilters({ mobileNumber: mobileNumber }, {}, {});
      // let authname = "";
      // if (user) {
      //   authname = "USER_LOGIN_MOBILE_OTP";
      // }

      if (user?.isBlocked) {
        throw new GraphQLError("User is Blocked", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }
      const mobileOtp = await otpService.generateOtp();
      if (!mobileOtp) {
        throw new GraphQLError('OTP generation failed', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let options = {
        name: "USER_LOGIN_MOBILE_OTP",
        metadata: {
          code: mobileOtp.code,
          expiresAt: mobileOtp.expiresAt,
          mobileNumber,
        },
        isVerified: false
      };

      const otpCreation = await otpService.createOtp(options);
      if (!otpCreation) {
        throw new GraphQLError('OTP Db creation failed', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      // integrate msg91 here


      const response = {
        message: "OTP generated",
        mobileNumber: mobileNumber
      }
      return response;
    },


    userBlock: async (parent, { input }, { req }, info) => {
      try {
        await validateInput(validators.userBlockValidator, req);
        await verifyAdmin(req);

        // const user= await userService.
        const _id: Types.ObjectId = new Types.ObjectId(input._id);
        const filter = { _id };
        const update = {
          isBlocked: input.isBlocked,
          token: ""
        }

        const result = await userService.findOneAndUpdateUser(filter, update, {});
        if (!result) {
          throw new GraphQLError("User not found", {
            extensions: {
              code: "BAD_REQUEST",
              errors: [],
            },
          });
        }
        const response = {
          message: "User Blocked successfully",
        };
        return response;
      }
      catch (error) {
        throw error;
      }
    },

    userVerifyOtp: async (parent, { input }, { req }, info) => {
      await validateInput(validators.userOtpValidator, req);
      const code: string = input.code;
      let otpVerification = await otpService.findOtpRecordWithFilters({ 'metadata.code': code }, {}, {});
      if (!otpVerification) {
        throw new GraphQLError('Verification failed. Invalid OTP.', {
          extensions: {
            code: "",
            errors: [],
          },
        });
      }
      if (!otpVerification.metadata || !otpVerification.metadata.expiresAt) {
        throw new Error('Invalid OTP metadata');
      }
      let expirationTime: Date = new Date(otpVerification?.metadata.expiresAt);
      let checkOtpExpired = await otpService.isOtpExpired(expirationTime)

      if (checkOtpExpired) {
        throw new Error("Expired OTP");
      }
      otpVerification.isVerified = true;

      const result = await otpVerification.save();

      let token = "";
      let userId;

      const existingUser = await userService.findUserWithFilters({ mobileNumber: result?.metadata?.mobileNumber }, {}, { lean: true })

      if (!existingUser) {
        const user = await userService.createUser({ mobileNumber: result?.metadata?.mobileNumber });
        if (!user) {
          throw new GraphQLError('User Db creation failed', {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: []
            }
          });
        }

        token = await jwtService.createUserJWT(user._id!.toString());

        if (!token) {
          throw new GraphQLError('Token generation failed', {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: []
            }
          });
        }

        user.token = token;
        userId = user._id;

        // Save the user object
        await user.save();

      } else {
        token = await jwtService.createUserJWT(existingUser._id!.toString());
        userId = existingUser._id;
      }

      const response = {
        userId: userId?.toString(),
        message: "OTP verified",
        token: token
      }
      return response;
    },


    // Edit vendor profile
    updateUserProfile: async (parent, { input }, { req }, info) => {
      try {
        // await verifyUser(req);
        await validateInput(validators.userUpdateProfileValidator, req);

        const userId: Types.ObjectId = new Types.ObjectId(input._id);

        const user = await userService.findUserWithFilters({ _id: userId }, {}, {});
        if (!user) {
          throw new GraphQLError('Vendor not found', {
            extensions: {
              code: 'BAD_REQUEST',
              errors: [],
            },
          });
        }

        if (input.email) {
          user.email = input.email.toLowerCase();
        }

        if (input.firstName) {
          user.firstName = input.firstName;
        }

        if (input.lastName) {
          user.lastName = input.lastName;
        }

        if (input.displayName) {
          user.displayName = input.displayName;
        }

        if (input.address) {
          user.address = input.address;
        }

        if (input.countryCode) {
          user.countryCode = input.countryCode;
        }

        if (input.mobileNumber) {
          user.mobileNumber = input.mobileNumber;
        }

        if (input.isBlocked !== null) {
          user.isBlocked = input.isBlocked;
        }

        if (input.houseNumber) {
          user.houseNumber = input.houseNumber;
        }

        if (input.streetName) {
          user.streetName = input.streetName;
        }

        if (input.city) {
          user.city = input.city;
        }

        if (input.pincode) {
          user.pincode = input.pincode;
        }

        if (input.country) {
          user.country = input.country;
        }

        // if (input.password) {
        //   await user.setHash!(input.password);
        // }

        const result = await user.save();

        const response = {
          updatedRecord: result.toObject(),
          message: 'Vendor successfully updated',
        };

        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },

  Query: {
    async getUsersByAdmin(parent, { input }, { req }, info) {

      try {

        //Validate Input
        await validateInput(validators.usersQueryValidator, req);
        // await verifyAdmin(req);

        const page: number = input?.page || 0;
        const size: number = input?.size || 10;
        const isBlocked: Boolean | null = input?.isBlocked ?? null;
        const query: string = input?.query ? input.query.replace(/[^0-9a-zA-Z]/g, ' ') : '';

        const options: userService.IUsersOptions = {
          page,
          size,
          isBlocked,
          query
        }

        const result = await userService.getUsersByAdminWithFilters(options);

        const response = {
          maxRecords: result.maxRecords,
          records: result.records
        }
        return response;
      } catch (error) {
        throw error;
      }

    },

    async getUserRecordByAdmin(parent, { input }, { req }, info) {

      try {
        await validateInput(validators.userQueryValidator, req);

        const _id: Types.ObjectId = new Types.ObjectId(input._id);

        const result = await userService.findUserWithFilters({ _id }, {}, {});
        if (!result) {
          throw new GraphQLError("INTERNAL_SERVER_ERROR", {
            extensions: {
              code: "",
              errors: [],
            },
          });
        }

        const response = {
          record: result.toObject(),
          message: "User fetched succesfully"
        }

        return response;

      } catch (error) {
        console.log(error);
        throw error;
      }

    }
  }
};

