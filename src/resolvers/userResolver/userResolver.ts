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

      const user = await userService.createUser({ mobileNumber: result?.metadata?.mobileNumber });
      if (!user) {
        throw new GraphQLError('User Db creation failed', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      const token = await jwtService.createUserJWT(user._id!.toString());

      if (!token) {
        throw new GraphQLError('Token generation failed', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      user.token = token;

      await user.save();

      const response = {
        message: "OTP verified",
        token: token
      }
      return response;
    },

    // createUser: async (parent, { input }, { req }, info) => {

    //   await validateInput(validators.createUserValidator, req);

    //   let email: string = input.email;
    //   let mobileNumber: string = input.mobileNumber;
    //   let gender: string = input.gender;
    //   let age: string = input.age;

    //   let newUserData: userService.IUser = {
    //     email,
    //     mobileNumber,
    //     gender,
    //     age,

    //   };

    //   const existingUserPhoneNumber = await userService.findUserWithFilters({ mobileNumber: mobileNumber }, {}, {});

    //   if (existingUserPhoneNumber) {
    //     throw new GraphQLError("Phone number already taken", {
    //       extensions: {
    //         code: "INTERNAL_SERVER_ERROR",
    //         errors: []
    //       }
    //     });
    //   }
    //   const existingUserEmail = await userService.findUserWithFilters({ email: email }, {}, {});

    //   if (existingUserEmail) {
    //     throw new GraphQLError("Email already taken", {
    //       extensions: {
    //         code: "INTERNAL_SERVER_ERROR",
    //         errors: []
    //       }
    //     });
    //   }

    //   const user = await userService.createUser(newUserData);

    //   if (!user) {
    //     throw new GraphQLError("Unable to create user", {
    //       extensions: {
    //         code: "INTERNAL_SERVER_ERROR",
    //         errors: []
    //       }
    //     });
    //   }
    //   let token = await jwtService.createUserJWT(user._id!.toString());
    //   user.token = token;
    //   await user.save();
    //   const response = {
    //     _id: user._id!.toString(),
    //     message: "User created",
    //     token: token
    //   }
    //   return response
    // }
    // Edit vendor profile
    updateUserProfile: async (parent, { input }, { req }, info) => {
      try {
        await verifyUser(req);
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

        if (input.password) {
          if (await user.verifyHash?.(input.password)) {
            throw new GraphQLError("You entered same password", {
              extensions: {
                code: "BAD_REQUEST",
                errors: []
              }
            });
          }
          await user.setHash!(input.password);
        }

        await user.save();

        const response = {
          _id: user?._id?.toString(),
          message: 'Vendor successfully updated',
        };

        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },

  // Query: {
  //   async getUsersByAdmin(parent, { input }, { req }, info) {

  //     try {

  //       //Validate Input
  //       await validateInput(validators.usersQueryValidator, req);
  //       await verifyAdmin(req);

  //       const page: number = input?.page || 0;
  //       const size: number = input?.size || 10;
  //       const isBlocked: Boolean | null = input?.isBlocked ?? null;
  //       const query: string = input?.query ? input.query.replace(/[^0-9a-zA-Z]/g, ' ') : '';

  //       const options: userService.IUsersOptions = {
  //         page,
  //         size,
  //         isBlocked,
  //         query
  //       }

  //       const result = await userService.getUsersByAdminWithFilters(options);

  //       const response = {
  //         maxRecords: result.maxRecords,
  //         records: result.records
  //       }
  //       return response;
  //     } catch (error) {
  //       throw error;
  //     }

  //   },
  // }
};

