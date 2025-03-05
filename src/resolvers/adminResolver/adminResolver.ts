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
import { adminModel, vendorModel, deliveryAgentConfigModel } from './../../models';


export const adminResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {

    // create super admin and sub admin 
    createAdmin: async (parent, { input, image }, { req }, info) => {
 
      await verifySuperAdmin(req)
      await validateInput(validators.AdminCreateValidator, req);
      try {

        const adminId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);
        const admin=await adminModel.findById(adminId)

        // input validation 
        let profilePic: adminService.FileData | null = null;
        let email: string = input?.email.toLowerCase();
        let fullName: string = input?.fullName;
        let password: string = input?.password;
        let accType: string = input?.accType;

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

        const newAdminData: any = {
          createdBy:admin?._id,
          fullName,
          email,
          accType,
        }

        // check this admin is sub Admin or super admin

        if (accType === "SUB_ADMIN") {

          newAdminData.role = input.role
        }

        if (profilePic) {
          newAdminData.profilePic = profilePic;
        }


        await adminService.createAdmin(newAdminData, password);

        return {
          status: true,
          msg: "Account created successfully"
        }


      } catch (error: any) {

        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });
      }

    },


    // suspend admin

    suspendAdmin: async (parent, { input }, { req }, info) => {

      await verifySuperAdmin(req)
      try {

        await adminModel.findByIdAndUpdate({ _id: input?.id }, {

          $set: {
            isBlocked: input?.status
          }
        })

        if(input?.status){
           
          return {

            status: true,
            msg: " This admin account deactivate successfully "
          }
  
        }else{

          return {

            status: true,
            msg: "This admin account activate successfully"
          }
        }

       
      } catch (error) {

        throw new GraphQLError("INTERNAL_SERVER_ERROR", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });

      }
    },



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

      console.log(input, 'INPUT ADMIN LOGIN')

      const admin = await adminService.findAdminWithFilters({ email: email }, {}, {});

      console.log(admin, " = ADMIN");
      if (!admin) {
        console.log("login req", "no accout")
        throw new GraphQLError("Invalid Account", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }
      else if (admin.isBlocked) {
        console.log("login req", "block accout")
        throw new GraphQLError("Admin Blocked", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }
      else if (! await admin.verifyHash?.(password)) {
        console.log("login req", "no ac")
        throw new GraphQLError("Invalid Account", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }
      console.log('PASSWORD CHECK = ', await admin.verifyHash?.(password),)

      const tokenData = {

        id: admin._id!.toString(),
        accType: admin?.accType || "",
        role: admin?.role || []

      }

      if (admin.accType === "SUB_ADMIN") {

        const id = new Types.ObjectId(admin?._id)
        const result = await adminService.getSubAdminAllPermissions(id)
        tokenData.role = result?.allPermissions

      }

      let token = await jwtService.createAdminJWT(tokenData);




      console.log(token, 'ADMIN TOKEN ')
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

    // delete admin account 

    deleteAdminAccount: async (parent, { input }, { req }, info) => {

      await verifySuperAdmin(req)
      try {

        await adminModel.findByIdAndDelete({ _id: input?.id })

        return {

          status: true,
          msg: "admin account deleted successfully"
        }

      } catch (error) {

        throw new GraphQLError("INTERNAL_SERVER_ERROR", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }
    },


    // edit admin account

    editAdminAccount: async (parent, { input,image }, { req }, info) => {

      // await verifySuperAdmin(req)
      await validateInput(validators.AdminEditValidator, req);


      try {

        let profilePic: adminService.FileData | null = null;
        let email: string = input?.email.toLowerCase();
        let fullName: string = input?.fullName;
        let accType: string = input?.accType

         const admindata=await adminModel.findById({_id:input?.id})

         if(!admindata){
          
          throw new GraphQLError('Account not found', {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: []
            }
          });
         }

         const isEmailExists=await adminModel.findOne({email:email})

         console.log("input id",input.id.toString())

         console.log("email exit",isEmailExists?._id.toString())

         if(isEmailExists && isEmailExists._id.toString()!==input?.id.toString()){

           console.log("exit")

          throw new GraphQLError('Admin with this email already exists', {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
              errors: []
            }
          });
        
        }

        

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

        const updateAdminData: any = {
          id:input.id,
          fullName,
          email,
          accType,
          role:[]
        }


        if (accType === "SUB_ADMIN") {

          updateAdminData.role = input.role
        }

        if (profilePic) {
          updateAdminData.profilePic = profilePic;
        }


        
        await adminService.updateAdminDetails(updateAdminData)
        
          
          return{

              status:true,
              msg:"Admin details updated successfully "
          }
  


      } catch (error:any) {

        throw new GraphQLError(error, {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });
      }
    },




    // create deliveryagent config


    cretaeDeliveryAgentConfig: async (parent, { input }, { req }, info) => {

    await verifyAdmin(req)
      try {

        const limit = input.limit || 0

        await adminService.cretaeDeliveryAgentConfig(limit)

        return {

          status: true,
          msg: ""
        }


      } catch (error: any) {

        throw new GraphQLError("INTERNAL_SERVER_ERROR", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }


    },


    updateDeliveryAgentConfig: async (parent, { input }, { req }, info) => {
     
      await verifyAdmin(req)

      try {
        const { deliveryLimit, returnLimit, _id ,warrantyCalllimit} = input

        await adminService.updateDeliveryAgentConfig({ deliveryLimit, returnLimit, _id , warrantyCalllimit})

        return {

          status: true,
          msg: ""
        }

      } catch (error: any) {

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

    getAllDeliveryAgentConfig: async (parent, { }, { req }, info) => {

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


    getAllAdminData: async (parent, { input }, { req }, info) => {

      //  await verifySuperAdmin(req)
      try {

        const page: number = input?.page || 0;
        const size: number = input?.size || 10;

        const options: any = {
          page,
          size,
          isBlocked: input?.isBlocked,
          search: input?.search
        }

        const result = await adminService.getAllAdminsDetails(options)
        console.log("result = ", result)

        return result;

      } catch (error: any) {

        throw new GraphQLError("INTERNAL_SERVER_ERROR", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });

      }


    },

    getOneAdminDetails: async (parent, { input }, { req }, info) => {


         await verifySuperAdmin(req)  

      try {

        const result = await adminService.getOneAdminDetails(input?._id)

        return result;

      } catch (error) {

        throw new GraphQLError("INTERNAL_SERVER_ERROR", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: [],
          },
        });
      }
    },

    getActivityLogOfAdmin:async(parent,{input},{req},info)=>{
      await verifyAdmin(req)
      try {
        // const adminId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);
        const adminId=input.adminId;
        const date=input?.date

        const matchObj: any = { performedBy: adminId };

        if (date) {
          const startDate = new Date(date);
          const endDate = new Date(date);
          endDate.setHours(23, 59, 59, 999); 
      
          matchObj.createdAt = { $gte: startDate, $lte: endDate };
        }
        

        const result = await adminService.getActivityLogOfAdmin(adminId,matchObj)
        console.log("result",result)
        return result   

      } catch (error) {
        throw new GraphQLError("Unable find data", {
          extensions: {
              code: "BAD_REQUEST",
              errors: [],
          },
      })
      }
    }
  
  },
};

