import { adminService, jwtService, spaceService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./adminValidator";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifySuperAdmin, verifyAdmin } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";

export const adminResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {
    createSuperAdmin: async (parent, { input, image }, { req }, info) => {

      await validateInput(validators.SuperAdminCreateValidator, req);

      let profilePic: adminService.FileData | null = null;
      let email: string = input.email.toLowerCase();
      let fullName: string = input.fullName;
      let password: string = input.password;


      if (image) {
        const { createReadStream, filename, mimetype, encoding } = await image;
        const key = spaceService.getFileKey(filePaths.adminProfile, filename, []);
        const stream = createReadStream();
        const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

        profilePic = {
          fileType: "PUBLIC",
          fileURL: file.location,
          mimeType: mimetype,
          originalName: filename
        }
      }

      const existingAdmin = await adminService.findAdminWithFilters({ email: email }, { _id: 1, email: 1 }, { lean: true });
      if (existingAdmin) {
        throw new GraphQLError('Admin with this email already exists', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }


      let newAdminData: adminService.IAdmin = {
        email,
        fullName,
        accType: "SUPER_ADMIN",
      }

      if (profilePic) {
        newAdminData.profilePic = profilePic;
      }
      const result = await adminService.createAdmin(newAdminData, password);

      if (!result) {
        throw new GraphQLError("Unable to create admin", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let response = {
        _id: result._id!.toString()
      };
      return response;
    },

    createSubAdmin: async (parent, { input, image }, { req }, info) => {

      await verifySuperAdmin(req);
      await validateInput(validators.SubAdminCreateValidator, req);

      let profilePic: adminService.FileData | null = null;
      let email: string = input.email.toLowerCase();
      let password: string = input.password;
      let fullName: string = input.fullName;

      if (image) {
        const { createReadStream, filename, mimetype, encoding } = await image;
        const key = spaceService.getFileKey(filePaths.adminProfile, filename, []);
        const stream = createReadStream();
        const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

        profilePic = {
          fileType: "PUBLIC",
          fileURL: file.location,
          mimeType: mimetype,
          originalName: filename
        }
      }

      const existingAdmin = await adminService.findAdminWithFilters({ email: email }, { _id: 1, email: 1 }, { lean: true });
      if (existingAdmin) {
        throw new GraphQLError('Admin with this email already exists', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let newAdminData: adminService.IAdmin = {
        email,
        accType: "SUB_ADMIN",
        fullName,
      }

      if (profilePic) {
        newAdminData.profilePic = profilePic;
      }


      const result = await adminService.createAdmin(newAdminData, password);

      if (!result) {
        throw new GraphQLError("Unable to create admin", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let response = {
        _id: result._id!.toString()
      }

      return response;

    },

    loginAdmin: async (parent, { input }, { req }, info) => {

      console.log("login req")

      await validateInput(validators.adminLoginValidator, req);

      const email: string = input.email.toLowerCase();
      const password: string = input.password;

      const admin = await adminService.findAdminWithFilters({ email: email }, {}, {});

      if (!admin) {
        console.log("login req","no accout")
        throw new GraphQLError("Invalid Account", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }
      else if (admin.isBlocked) {
        console.log("login req","block accout")
        throw new GraphQLError("Admin Blocked", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }
      else if (! await admin.verifyHash?.(password)) {
        console.log("login req","no ac")
        throw new GraphQLError("Invalid Account", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }

      let token = await jwtService.createAdminJWT(admin._id!.toString());

      admin.token = token;

      await admin.save();

      const response = adminService.loginAdmin(admin);

      return response;
    },

    updateAdminProfile: async (parent, { input, image }, { req }, info) => {
      try {
        await validateInput(validators.AdminUpdateValidator, req);
        await verifyAdmin(req);

        const _id: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

        const admin = await adminService.getAdminWithId(_id);
        if (!admin) {
          throw new GraphQLError("INTERNAL_SERVER_ERROR", {
            extensions: {
              code: "",
              errors: [],
            },
          });
        }

        let adminPic: adminService.FileData | null = null;

        if (image) {
          const { createReadStream, filename, mimetype, encoding } = await image;
          const key = spaceService.getFileKey(filePaths.adminProfile, filename, []);
          const stream = createReadStream();
          const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

          adminPic = {
            fileType: "PUBLIC",
            fileURL: file.location,
            mimeType: mimetype,
            originalName: filename
          }
        }

        if (input.fullName) {
          const trimmedFullName = input.fullName.trim();
          if (admin.fullName !== trimmedFullName) {
            admin.fullName = trimmedFullName;
          }
        }

        if (input.email) {
          const trimmedEmail = input.email.trim().toLowerCase();

          if (admin.email !== trimmedEmail) {
            const isEmailExists = await adminService.findAdminWithFilters(
              { email: trimmedEmail },
              { _id: 1, email: 1 },
              { lean: true }
            );

            if (isEmailExists) {
              throw new GraphQLError('Admin with this email already exists', {
                extensions: {
                  code: 'BAD_REQUEST',
                  errors: [],
                },
              });
            }

            admin.email = trimmedEmail;
          }
        }

        if (input.password) {
          if (await admin.verifyHash?.(input.password)) {
            throw new GraphQLError("You entered same password", {
              extensions: {
                code: "BAD_REQUEST",
                errors: []
              }
            });
          }
          await admin.setHash!(input.password);
        }

        if (adminPic) {
          admin.profilePic = adminPic;
        }

        // Update admin
        const result = await admin.save();

        if (!result) {
          throw new GraphQLError("Admin profile updatation failed", {
            extensions: {
              code: "BAD_REQUEST",
              errors: [],
            },
          });
        }

        const response = {
          _id: result?._id?.toString() || "",
          message: "Admin profile updated successfully",
        };
        return response;
      } catch (error) {
        throw error;
      }
    },


    // create deliveryagent config


    cretaeDeliveryAgentConfig: async (parent, { input }, { req }, info) => {


      try {

        const limit=input.limit || 0

        await adminService.cretaeDeliveryAgentConfig(limit)

       return{

          status:true,
          msg:""
       }
          

      } catch (error:any) {
         
        throw new GraphQLError("INTERNAL_SERVER_ERROR", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }


    },

    
    updateDeliveryAgentConfig:async(parent, { input }, { req }, info)=>{
          // await verifyAdmin(req)

            try {
              const {deliveryLimit,returnLimit,_id}=input 

               await adminService.updateDeliveryAgentConfig({deliveryLimit ,returnLimit ,_id})  
               
               return{

                   status:true,
                   msg:""
               }
              
            } catch (error:any) {
              
              throw new GraphQLError("INTERNAL_SERVER_ERROR", {
                extensions: {
                  code: "BAD_REQUEST",
                  errors: []
                }
              });
            }
    },

   









    logoutAdmin: async (parent, { }, { req }, info) => {
      await verifyAdmin(req);
      await adminService.logoutAdmin(req.authAccount._id);
      const response = {
        message: "logout successful"
      }
      return response;
    }


  },

  Query: {
    async getAdminRecord(parent, { }, { req }, info) {
      await verifyAdmin(req);

      try {
        const _id: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

        const admin = await adminService.getAdminRecordWithId(_id, {
          _id: 1, fullName: 1, email: 1, "profilePic._id": 1, "profilePic.fileURL": 1, accType: 1,
          isBlocked: 1
        });
        if (!admin) {
          throw new GraphQLError("INTERNAL_SERVER_ERROR", {
            extensions: {
              code: "",
              errors: [],
            },
          });
        }
        const response = {
          record: admin
        }

        return response;

      } catch (error) {
        console.log(error);
        throw error;
      }

    },

    getAllDeliveryAgentConfig:async(parent, {},{ req }, info)=>{

      try {

       const result = await adminService.getAllDeliveryAgentConfig()

       return result
       
      } catch (error) {
       
       throw new GraphQLError("INTERNAL_SERVER_ERROR", {
         extensions: {
           code: "BAD_REQUEST",
           errors: []
         }
       });
      }
},
  },
};

