// import { adminService, jwtService, spaceService, userService, otpService } from "../../services";
// import { Resolvers } from "../../_generated_/resolvers-types";
// import { GraphQLUpload } from "graphql-upload-ts";
// import * as validators from "./userValidator";
// import path from "path";
// import { createWriteStream } from 'fs';
// import { GraphQLError } from "graphql";
// import { validateInput, verifySuperAdmin, verifyAdmin, verifyUser, verifyMobileUser } from "../../middlewares";
// import { filePaths } from "../../configs";
// import { Types } from "mongoose";

// export const userResolver: Resolvers = {
//   Upload: GraphQLUpload,
//   Mutation: {
//     userLoginOtp: async (parent, { input }, { req }, info) => {
//       await validateInput(validators.userNumberValidator, req);
//       const mobileNumber: string = input.mobileNumber;
//       const user = await userService.findUserWithFilters({ mobileNumber: mobileNumber }, {}, {});

//       if (user?.isBlocked) {
//         throw new GraphQLError("User is Blocked", {
//           extensions: {
//             code: "BAD_REQUEST",
//             errors: []
//           }
//         });
//       }
//       const mobileOtp = await otpService.generateOtp();
//       if (!mobileOtp) {
//         throw new GraphQLError('OTP generation failed', {
//           extensions: {
//             code: "INTERNAL_SERVER_ERROR",
//             errors: []
//           }
//         });
//       }

//       let options = {
//         name: "USER_LOGIN_MOBILE_OTP",
//         metadata: {
//           code: mobileOtp.code,
//           expiresAt: mobileOtp.expiresAt,
//           mobileNumber,
//           device: "WEB"
//         },
//         isVerified: false
//       };

//       const otpCreation = await otpService.createOtp(options);
//       if (!otpCreation) {
//         throw new GraphQLError('OTP Db creation failed', {
//           extensions: {
//             code: "INTERNAL_SERVER_ERROR",
//             errors: []
//           }
//         });
//       }

//       // integrate msg91 here


//       const response = {
//         message: "OTP generated",
//         mobileNumber: mobileNumber,
//         _id: otpCreation._id
//       }
//       return response;
//     },

//     // Mobile user login
//     userLoginOtpInMobile: async (parent, { input }, { req }, info) => {
//       await validateInput(validators.userMobileNumberValidator, req);
//       const mobileNumber: string = input.mobileNumber;
//       const user = await userService.findUserWithFilters({ mobileNumber: mobileNumber }, {}, {});

//       if (user?.isBlocked) {
//         throw new GraphQLError("User is Blocked", {
//           extensions: {
//             code: "BAD_REQUEST",
//             errors: []
//           }
//         });
//       }
//       const mobileOtp = await otpService.generateOtp();
//       if (!mobileOtp) {
//         throw new GraphQLError('OTP generation failed', {
//           extensions: {
//             code: "INTERNAL_SERVER_ERROR",
//             errors: []
//           }
//         });
//       }

//       let options = {
//         name: "USER_LOGIN_MOBILE_OTP",
//         metadata: {
//           code: mobileOtp.code,
//           expiresAt: mobileOtp.expiresAt,
//           mobileNumber,
//           device: "MOBILE"
//         },
//         isVerified: false
//       };

//       const otpCreation = await otpService.createOtp(options);
//       if (!otpCreation) {
//         throw new GraphQLError('OTP Db creation failed', {
//           extensions: {
//             code: "INTERNAL_SERVER_ERROR",
//             errors: []
//           }
//         });
//       }

//       // integrate msg91 here


//       const response = {
//         message: "OTP generated",
//         mobileNumber: mobileNumber,
//         _id: otpCreation._id
//       }
//       return response;
//     },
//     userVerifyOtp: async (parent, { input }, { req }, info) => {
//       await validateInput(validators.userOtpValidator, req);
//       const code: string = input.code;
//       let otpVerification = await otpService.findOtpRecordWithFilters({ 'metadata.code': code, _id: input._id, 'metadata.device': "WEB" }, {}, {});
//       if (!otpVerification) {
//         throw new GraphQLError('Verification failed. Invalid OTP.', {
//           extensions: {
//             code: "",
//             errors: [],
//           },
//         });
//       }
//       if (!otpVerification.metadata || !otpVerification.metadata.expiresAt) {
//         throw new Error('Invalid OTP metadata');
//       }

//       let checkOtpExpired = await otpService.isOtpExpired(otpVerification.metadata.expiresAt)

//       if (checkOtpExpired) {
//         throw new Error("Expired OTP");
//       }

//       let user = await userService.findUserWithFilters({ mobileNumber: otpVerification?.metadata?.mobileNumber }, {}, {})

//       if (!user) {
//         user = await userService.createUser({ mobileNumber: otpVerification?.metadata?.mobileNumber });
//       }
//       let token = await jwtService.createUserJWT(user._id!.toString());
//       user.token = token;

//       await user.save();

//       await otpService.deleteOtpRecord(otpVerification._id);

//       const response = {
//         userId: user._id?.toString(),
//         message: "OTP verified",
//         token: token
//       }
//       return response;
//     },

//     // Mobile user verfy
//     userVerifyOtpInMobile: async (parent, { input }, { req }, info) => {
//       await validateInput(validators.userMobileOtpValidator, req);
//       const code: string = input.code;
//       let otpVerification = await otpService.findOtpRecordWithFilters({ 'metadata.code': code, _id: input._id, 'metadata.device': "MOBILE" }, {}, {});
//       if (!otpVerification) {
//         throw new GraphQLError('Verification failed. Invalid OTP.', {
//           extensions: {
//             code: "",
//             errors: [],
//           },
//         });
//       }
//       if (!otpVerification.metadata || !otpVerification.metadata.expiresAt) {
//         throw new Error('Invalid OTP metadata');
//       }

//       let checkOtpExpired = await otpService.isOtpExpired(otpVerification.metadata.expiresAt)

//       if (checkOtpExpired) {
//         throw new Error("Expired OTP");
//       }

//       let user = await userService.findUserWithFilters({ mobileNumber: otpVerification?.metadata?.mobileNumber }, {}, {})

//       if (!user) {
//         user = await userService.createUser({ mobileNumber: otpVerification?.metadata?.mobileNumber });
//       }
//       let token = await jwtService.createUserJWT(user._id!.toString());
//       user.mobileToken = token;

//       await user.save();

//       await otpService.deleteOtpRecord(otpVerification._id);

//       const response = {
//         userId: user._id?.toString(),
//         message: "OTP verified",
//         token: token
//       }
//       return response;
//     },

//     userBlock: async (parent, { input }, { req }, info) => {
//       try {
//         await verifyAdmin(req);
//         await validateInput(validators.userBlockValidator, req);

//         // const user= await userService.
//         const _id: Types.ObjectId = new Types.ObjectId(input._id);
//         const filter = { _id };
//         const update = {
//           isBlocked: input.isBlocked,
//           token: ""
//         }

//         const result = await userService.findOneAndUpdateUser(filter, update, {});
//         if (!result) {
//           throw new GraphQLError("User not found", {
//             extensions: {
//               code: "BAD_REQUEST",
//               errors: [],
//             },
//           });
//         }
//         const response = {
//           message: "User Blocked successfully",
//         };
//         return response;
//       }
//       catch (error) {
//         throw error;
//       }
//     },

//     // Edit user profile
//     updateUserProfile: async (parent, { input }, { req }, info) => {

//       try {
//         await verifyUser(req);
//         await validateInput(validators.userUpdateProfileValidator, req);

//         const userId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

//         const user = await userService.findUserWithFilters({ _id: userId }, {}, {});
//         if (!user) {
//           throw new GraphQLError('User not found', {
//             extensions: {
//               code: 'BAD_REQUEST',
//               errors: [],
//             },
//           });
//         }

//         if (input.email) {
//           const trimmedEmail = input.email.trim().toLowerCase();

//           if (user.email !== trimmedEmail) {
//             const isEmailExists = await userService.findUserWithFilters(
//               { email: trimmedEmail },
//               { _id: 1, email: 1 },
//               { lean: true }
//             );

//             if (isEmailExists) {
//               throw new GraphQLError('User with this email already exists', {
//                 extensions: {
//                   code: 'BAD_REQUEST',
//                   errors: [],
//                 },
//               });
//             }

//             user.email = trimmedEmail;
//           }
//         }

//         if (input.firstName) {
//           user.firstName = input.firstName;
//         }

//         if (input.lastName) {
//           user.lastName = input.lastName;
//         }

//         if (input.displayName) {
//           user.displayName = input.displayName;
//         }


//         await user.save();

//         const response = {
//           message: 'user successfully updated',
//         };

//         return response;
//       } catch (error) {
//         console.error(error);
//         throw error;
//       }
//     },

//     updateUserProfileByAdmin: async (parent, { input }, { req }, info) => {

//       try {
//         await verifyAdmin(req);
//         await validateInput(validators.userUpdateProfileByAdminValidator, req);

//         let { _id, firstName, lastName, displayName, mobileNumber, isBlocked, email } = input;

//         const user = await userService.findUserWithFilters({ _id: _id }, {}, {});
//         if (!user) {
//           throw new GraphQLError('User not found', {
//             extensions: {
//               code: 'BAD_REQUEST',
//               errors: [],
//             },
//           });
//         }

//         if (email) {
//           const trimmedEmail = email.trim().toLowerCase();

//           if (user.email !== trimmedEmail) {
//             const isUserExists = await userService.findUserWithFilters(
//               { email: trimmedEmail },
//               { _id: 1 },
//               { lean: true }
//             );

//             if (isUserExists) {
//               throw new GraphQLError('User with this email already exists', {
//                 extensions: {
//                   code: 'BAD_REQUEST',
//                   errors: [],
//                 },
//               });
//             }

//             user.email = trimmedEmail;
//           }
//         }

//         if (mobileNumber) {

//           if (user.mobileNumber !== mobileNumber) {
//             const isUserExists = await userService.findUserWithFilters(
//               { mobileNumber: mobileNumber },
//               { _id: 1 },
//               { lean: true }
//             );

//             if (isUserExists) {
//               throw new GraphQLError('User with this mobile number already exists', {
//                 extensions: {
//                   code: 'BAD_REQUEST',
//                   errors: [],
//                 },
//               });
//             }

//             user.mobileNumber = mobileNumber;
//           }
//         }


//         if (firstName) {
//           user.firstName = firstName;
//         }

//         if (lastName) {
//           user.lastName = lastName;
//         }

//         if (displayName) {
//           user.displayName = displayName;
//         }

//         if (isBlocked === true || isBlocked === false) {
//           user.isBlocked = isBlocked;
//           if (user.isBlocked) {
//             user.token = `${Date.now}`;
//           }
//         }

//         await user.save();

//         const response = {
//           message: 'user successfully updated',
//         };

//         return response;
//       } catch (error) {
//         console.error(error);
//         throw error;
//       }
//     },
//     //Mobile Edit user profile
//     updateUserProfileInMobile: async (parent, { input }, { req }, info) => {
//       try {
//         await verifyMobileUser(req);
//         await validateInput(validators.userMobileUpdateProfileValidator, req);

//         const userId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

//         const user = await userService.findUserWithFilters({ _id: userId }, {}, {});
//         if (!user) {
//           throw new GraphQLError('User not found', {
//             extensions: {
//               code: 'BAD_REQUEST',
//               errors: [],
//             },
//           });
//         }

//         if (input.email) {
//           const trimmedEmail = input.email.trim().toLowerCase();

//           if (user.email !== trimmedEmail) {
//             const isEmailExists = await userService.findUserWithFilters(
//               { email: trimmedEmail },
//               { _id: 1, email: 1 },
//               { lean: true }
//             );

//             if (isEmailExists) {
//               throw new GraphQLError('User with this email already exists', {
//                 extensions: {
//                   code: 'BAD_REQUEST',
//                   errors: [],
//                 },
//               });
//             }

//             user.email = trimmedEmail;
//           }
//         }

//         if (input.firstName) {
//           user.firstName = input.firstName;
//         }

//         if (input.lastName) {
//           user.lastName = input.lastName;
//         }

//         if (input.displayName) {
//           user.displayName = input.displayName;
//         }


//         await user.save();

//         const response = {
//           message: 'user successfully updated',
//         };

//         return response;
//       } catch (error) {
//         console.error(error);
//         throw error;
//       }
//     },

//     logoutUser: async (parent, { }, { req }, info) => {
//       await verifyUser(req);
//       const userId = req.authAccount._id;
//       await userService.logoutUser(userId);
//       const response = {
//         _id: userId
//       }
//       return response;
//     },

//     logoutMobileUser: async (parent, { }, { req }, info) => {
//       await verifyMobileUser(req);
//       const userId = req.authAccount._id;
//       await userService.logoutUser(userId);
//       const response = {
//         _id: userId
//       }
//       return response;
//     }
//   },

//   Query: {
//     async getUsersByAdmin(parent, { input }, { req }, info) {

//       try {

//         //Validate Input
//         await validateInput(validators.usersQueryValidator, req);
//         await verifyAdmin(req);

//         const page: number = input?.page || 0;
//         const size: number = input?.size || 10;
//         const isBlocked: Boolean | null = input?.isBlocked ?? null;
//         const query: string = input?.query ? input.query.replace(/[^0-9a-zA-Z]/g, ' ') : '';

//         const options: userService.IUsersOptions = {
//           page,
//           size,
//           isBlocked,
//           query
//         }

//         const result = await userService.getUsersByAdminWithFilters(options);

//         const response = {
//           maxRecords: result.maxRecords,
//           records: result.records
//         }
//         return response;
//       } catch (error) {
//         throw error;
//       }

//     },

//     async getUserRecordByAdmin(parent, { input }, { req }, info) {

//       try {
//         await verifyAdmin(req);
//         await validateInput(validators.userQueryValidator, req);

//         const _id: Types.ObjectId = new Types.ObjectId(input._id);

//         const result = await userService.findUserWithFilters({ _id }, {}, {});
//         if (!result) {
//           throw new GraphQLError("INTERNAL_SERVER_ERROR", {
//             extensions: {
//               code: "",
//               errors: [],
//             },
//           });
//         }

//         const response = {
//           record: result.toObject(),
//           message: "User fetched succesfully"
//         }

//         return response;

//       } catch (error) {
//         console.log(error);
//         throw error;
//       }

//     },
//     async getUserRecord(parent, { }, { req }, info) {

//       try {
//         await verifyUser(req);

//         const _id: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

//         const result = await userService.findUserWithFilters(
//           { _id },
//           {
//             email: 1, firstName: 1,
//             lastName: 1, displayName: 1,
//             mobileNumber: 1, _id: 1,
//           },
//           {});
//         if (!result) {
//           throw new GraphQLError("INTERNAL_SERVER_ERROR", {
//             extensions: {
//               code: "",
//               errors: [],
//             },
//           });
//         }

//         const response = {
//           record: result.toObject(),
//           message: "User fetched succesfully"
//         }

//         return response;

//       } catch (error) {
//         console.log(error);
//         throw error;
//       }

//     },

//     //Mobile fetch user
//     async getUserRecordInMobile(parent, { }, { req }, info) {

//       try {
//         await verifyMobileUser(req);

//         const _id: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

//         const result = await userService.findUserWithFilters(
//           { _id },
//           {
//             email: 1, firstName: 1,
//             lastName: 1, displayName: 1,
//             mobileNumber: 1, _id: 1,
//           },
//           {});
//         if (!result) {
//           throw new GraphQLError("INTERNAL_SERVER_ERROR", {
//             extensions: {
//               code: "",
//               errors: [],
//             },
//           });
//         }

//         const response = {
//           record: result.toObject(),
//           message: "User fetched succesfully"
//         }

//         return response;

//       } catch (error) {
//         console.log(error);
//         throw error;
//       }
//     }
//   }
// };









// my updation 




import { adminService, jwtService, spaceService, userService, otpService, orderProductService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./userValidator";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifySuperAdmin, verifyAdmin, verifyUser, verifyMobileUser } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";
import { userModel } from "../../models/userModel";

export const userResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {
    userLoginOtp: async (parent, { input }, { req }, info) => {
      await validateInput(validators.userNumberValidator, req);
      const mobileNumber: string = input.mobileNumber;
      const user = await userService.findUserWithFilters({ mobileNumber: mobileNumber }, {}, {});

      if (user?.isBlocked) {
        throw new GraphQLError("User is Blocked", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }

      if (user?.isDeleted) {
        throw new GraphQLError("User is Deleted", {
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
          device: "WEB"
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
        mobileNumber: mobileNumber,
        _id: otpCreation._id
      }
      return response;
    },

    // Mobile user login
    userLoginOtpInMobile: async (parent, { input }, { req }, info) => {
      await validateInput(validators.userMobileNumberValidator, req);
      const mobileNumber: string = input.mobileNumber;
      const user = await userService.findUserWithFilters({ mobileNumber: mobileNumber }, {}, {});

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
          device: "MOBILE"
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
        mobileNumber: mobileNumber,
        _id: otpCreation._id
      }
      return response;
    },
    userVerifyOtp: async (parent, { input }, { req }, info) => {
      await validateInput(validators.userOtpValidator, req);
      const code: string = input.code;
      let otpVerification = await otpService.findOtpRecordWithFilters({ 'metadata.code': code, _id: input._id, 'metadata.device': "WEB" }, {}, {});
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

      let checkOtpExpired = await otpService.isOtpExpired(otpVerification.metadata.expiresAt)

      if (checkOtpExpired) {
        throw new Error("Expired OTP");
      }

      let user = await userService.findUserWithFilters({ mobileNumber: otpVerification?.metadata?.mobileNumber }, {}, {})

      if (!user) {
        user = await userService.createUser({ mobileNumber: otpVerification?.metadata?.mobileNumber });
      }
      let token = await jwtService.createUserJWT(user._id!.toString());
      user.token = token;

      await user.save();

      await otpService.deleteOtpRecord(otpVerification._id);

      const response = {
        userId: user._id?.toString(),
        message: "OTP verified",
        token: token
      }
      return response;
    },

    // Mobile user verfy
    userVerifyOtpInMobile: async (parent, { input }, { req }, info) => {
      await validateInput(validators.userMobileOtpValidator, req);
      const code: string = input.code;
      let otpVerification = await otpService.findOtpRecordWithFilters({ 'metadata.code': code, _id: input._id, 'metadata.device': "MOBILE" }, {}, {});
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

      let checkOtpExpired = await otpService.isOtpExpired(otpVerification.metadata.expiresAt)

      if (checkOtpExpired) {
        throw new Error("Expired OTP");
      }

      let user = await userService.findUserWithFilters({ mobileNumber: otpVerification?.metadata?.mobileNumber }, {}, {})

      if (!user) {
        user = await userService.createUser({ mobileNumber: otpVerification?.metadata?.mobileNumber });
      }
      let token = await jwtService.createUserJWT(user._id!.toString());
      user.mobileToken = token;

      await user.save();

      await otpService.deleteOtpRecord(otpVerification._id);

      const response = {
        userId: user._id?.toString(),
        message: "OTP verified",
        token: token
      }
      return response;
    },

    userBlock: async (parent, { input }, { req }, info) => {
      try {
        await verifyAdmin(req);
        await validateInput(validators.userBlockValidator, req);

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

    // Edit user profile
    updateUserProfile: async (parent, { input }, { req }, info) => {

      try {
        await verifyUser(req);
        await validateInput(validators.userUpdateProfileValidator, req);

        const userId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

        const user = await userService.findUserWithFilters({ _id: userId }, {}, {});
        if (!user) {
          throw new GraphQLError('User not found', {
            extensions: {
              code: 'BAD_REQUEST',
              errors: [],
            },
          });
        }

        if (input.email) {
          const trimmedEmail = input.email.trim().toLowerCase();

          if (user.email !== trimmedEmail) {
            const isEmailExists = await userService.findUserWithFilters(
              { email: trimmedEmail },
              { _id: 1, email: 1 },
              { lean: true }
            );

            if (isEmailExists) {
              throw new GraphQLError('User with this email already exists', {
                extensions: {
                  code: 'BAD_REQUEST',
                  errors: [],
                },
              });
            }

            user.email = trimmedEmail;
          }
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


        await user.save();

        const response = {
          message: 'user successfully updated',
        };

        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    updateUserProfileByAdmin: async (parent, { input }, { req }, info) => {

      try {
        await verifyAdmin(req);
        await validateInput(validators.userUpdateProfileByAdminValidator, req);

        let { _id, firstName, lastName, displayName, mobileNumber, isBlocked, email } = input;

        const user = await userService.findUserWithFilters({ _id: _id }, {}, {});
        if (!user) {
          throw new GraphQLError('User not found', {
            extensions: {
              code: 'BAD_REQUEST',
              errors: [],
            },
          });
        }

        if (email) {
          const trimmedEmail = email.trim().toLowerCase();

          if (user.email !== trimmedEmail) {
            const isUserExists = await userService.findUserWithFilters(
              { email: trimmedEmail },
              { _id: 1 },
              { lean: true }
            );

            if (isUserExists) {
              throw new GraphQLError('User with this email already exists', {
                extensions: {
                  code: 'BAD_REQUEST',
                  errors: [],
                },
              });
            }

            user.email = trimmedEmail;
          }
        }

        if (mobileNumber) {

          if (user.mobileNumber !== mobileNumber) {
            const isUserExists = await userService.findUserWithFilters(
              { mobileNumber: mobileNumber },
              { _id: 1 },
              { lean: true }
            );

            if (isUserExists) {
              throw new GraphQLError('User with this mobile number already exists', {
                extensions: {
                  code: 'BAD_REQUEST',
                  errors: [],
                },
              });
            }

            user.mobileNumber = mobileNumber;
          }
        }


        if (firstName) {
          user.firstName = firstName;
        }

        if (lastName) {
          user.lastName = lastName;
        }

        if (displayName) {
          user.displayName = displayName;
        }

        if (isBlocked === true || isBlocked === false) {
          user.isBlocked = isBlocked;
          if (user.isBlocked) {
            user.token = `${Date.now}`;
          }
        }

        await user.save();

        const response = {
          message: 'user successfully updated',
        };

        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    //Mobile Edit user profile
    updateUserProfileInMobile: async (parent, { input }, { req }, info) => {
      try {
        await verifyMobileUser(req);
        await validateInput(validators.userMobileUpdateProfileValidator, req);

        const userId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

        const user = await userService.findUserWithFilters({ _id: userId }, {}, {});
        if (!user) {
          throw new GraphQLError('User not found', {
            extensions: {
              code: 'BAD_REQUEST',
              errors: [],
            },
          });
        }

        if (input.email) {
          const trimmedEmail = input.email.trim().toLowerCase();

          if (user.email !== trimmedEmail) {
            const isEmailExists = await userService.findUserWithFilters(
              { email: trimmedEmail },
              { _id: 1, email: 1 },
              { lean: true }
            );

            if (isEmailExists) {
              throw new GraphQLError('User with this email already exists', {
                extensions: {
                  code: 'BAD_REQUEST',
                  errors: [],
                },
              });
            }

            user.email = trimmedEmail;
          }
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


        await user.save();

        const response = {
          message: 'user successfully updated',
        };

        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    logoutUser: async (parent, { }, { req }, info) => {
      await verifyUser(req);
      const userId = req.authAccount._id;
      await userService.logoutUser(userId);
      const response = {
        _id: userId
      }
      return response;
    },

    logoutMobileUser: async (parent, { }, { req }, info) => {
      await verifyMobileUser(req);
      const userId = req.authAccount._id;
      await userService.logoutUser(userId);
      const response = {
        _id: userId
      }
      return response;
    },

    accountDeleteByUser: async (parent, {input}, { req }, info) => {
      //TODO: check if user exist // throw error 
      //add  a field for isDeleted for soft delete 
      //when user deleted then set isDeleted to true
      //set all orders of user to cancelled

      await verifyUser(req);
      const userId = req.authAccount._id;
      console.log("input",input)

      const isDeleted=input.isDeleted;
      const deleteReason:string | undefined | null=input?.deleteReason

      const user=await userModel.findById(userId);
      if(!user){
        throw new GraphQLError('User not found', {
          extensions: {
            code: 'BAD_REQUEST',
            errors: [],
          },
        });
      }

      if(user.isBlocked){
        throw new GraphQLError('Your Account is blocked', {
          extensions: {
            code: 'BAD_REQUEST',
            errors: [],
          },
        });
      }

      if(user.isDeleted){
        throw new GraphQLError('Your Account is Already Deleted', {
          extensions: {
            code: 'BAD_REQUEST',
            errors: [],
          },
        });
        }


      // Perform soft delete by updating the isDeleted field

      const updateUser= await userService.accountDeleteByUser(userId,isDeleted,deleteReason);

      if(!updateUser){  
        throw new GraphQLError('Something Went Wrong!!Account Not Deleted', {
          extensions: {
            code: 'BAD_REQUEST',
            errors: [],
          },
      })
    }

      // Cancel all active orders of the user
      const orderStatusUpdate=await userService.updateOrdersByUserId(userId,{shippingStatus:"CANCELED"} );

      if(!updateUser){  
        throw new GraphQLError('Something Went Wrong!!Orders Not Canceled', {
          extensions: {
            code: 'BAD_REQUEST',
            errors: [],
          },
        })
      }

      console.log("updateduser",updateUser)


      const response = {
         success:true,
         message:"Account Deleted Successfully"  
      }
      
      return response;
    }


  },
  Query: {
    async getUsersByAdmin(parent, { input }, { req }, info) {

      try {

        //Validate Input
        await validateInput(validators.usersQueryValidator, req);
        await verifyAdmin(req);

        const page: number = input?.page || 0;
        const size: number = input?.size || 10;
        const isBlocked: Boolean | null = input?.isBlocked ?? null;
        const isDeleted: Boolean | null = input?.isDeleted ?? null;
        const query: string = input?.query ? input.query.replace(/[^0-9a-zA-Z]/g, ' ') : '';

        const options: userService.IUsersOptions = {
          page,
          size,
          isBlocked,
          isDeleted,
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
        await verifyAdmin(req);
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

    },
    async getUserRecord(parent, { }, { req }, info) {

      try {
        await verifyUser(req);

        const _id: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

        const result = await userService.findUserWithFilters(
          { _id },
          {
            email: 1, firstName: 1,
            lastName: 1, displayName: 1,
            mobileNumber: 1, _id: 1,
          },
          {});
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

    },

    //Mobile fetch user
    async getUserRecordInMobile(parent, { }, { req }, info) {

      try {
        await verifyMobileUser(req);

        const _id: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

        const result = await userService.findUserWithFilters(
          { _id },
          {
            email: 1, firstName: 1,
            lastName: 1, displayName: 1,
            mobileNumber: 1, _id: 1,
          },
          {});
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

