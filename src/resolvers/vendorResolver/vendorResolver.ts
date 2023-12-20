import { vendorService, jwtService, spaceService, otpService, tempVendorAuthService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import * as validators from "./vendorValidator";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";

export const vendorResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {

    // Vendor full form registartion
    createVendor: async (parent, { input, image }, { req }, info) => {
      await verifyAdmin(req);
      await validateInput(validators.VendorCreateValidator, req);
      let email: string = input.email.toLowerCase();

      const isEmailExists = await vendorService.findVendorWithFilters({ email: email }, { _id: 1, email: 1 }, { lean: true });
      if (isEmailExists) {
        throw new GraphQLError('This email already exists', {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let fullName: string = input.fullName;
      let password: string = input.password;
      let mobileNumber: string = input.mobileNumber;
      let country: string = input.country;
      let companyName: string = input.companyName;


      let profilePic: vendorService.FileData | null = null;

      if (image) {
        const { createReadStream, filename, mimetype, encoding } = await image;
        const key = spaceService.getFileKey(filePaths.vendorImage, filename, []);
        const stream = createReadStream();
        const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

        profilePic = {
          fileType: "PUBLIC",
          fileURL: file.location,
          mimeType: mimetype,
          originalName: filename
        }
      }

      // TODO: Need to remove this , only for testing with dummy data
      // vendorImages = [{
      //   fileType: "PUBLIC",
      //   fileURL: "https://credot-dev-space.blr1.digitaloceanspaces.com/collins/sandbox2/…",
      //   mimeType: "application/octet-stream",
      //   originalName: "WIN_20231023_20_38_57_Pro.jpg"
      // },
      // {
      //   fileType: "PUBLIC",
      //   fileURL: "https://credot-dev-space.blr1.digitaloceanspaces.com/collins/sandbox2/…",
      //   mimeType: "application/octet-stream",
      //   originalName: "WIN_20231023_20_38_56_Pro.jpg"
      // },
      // {
      //   fileType: "PUBLIC",
      //   fileURL: "https://credot-dev-space.blr1.digitaloceanspaces.com/collins/sandbox2/…",
      //   mimeType: "application/octet-stream",
      //   originalName: "WIN_20231023_20_38_53_Pro.jpg"
      // }]



      let newVendorData: vendorService.IVendor = {
        email,
        fullName,
        mobileNumber,
        companyName,
      };


      const result = await vendorService.createVendor(newVendorData, password);

      if (!result) {
        throw new GraphQLError("Unable to create vendor", {
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
            errors: []
          }
        });
      }

      let response = {
        _id: result._id!.toString(),
        message: "Vendor created successfully"
      };

      return response;
    },

    vendorAccountApproval: async (parent, { input }, { req }, info) => {
      await verifyAdmin(req);
      await validateInput(validators.vendorProfileApprovalValidator, req);

      const _id: Types.ObjectId = new Types.ObjectId(input._id);
      const approvalStatus: boolean | undefined = input.approvalStatus?.valueOf();
      const vendor: vendorService.IVendorDocument | null = await vendorService.getvendorRecordWithId(_id);

      if (!vendor) {
        throw new GraphQLError("Record not found", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }

      if (approvalStatus !== undefined) {
        vendor.isApproved = approvalStatus;
      }

      await vendor.save();

      const response = {
        _id: vendor._id?.toString(),
        message: "Vendor profile approved successfully"
      }

      return response;
    },

    // Vendor login 
    loginVendor: async (parent, { input }, { req }, info) => {

      await validateInput(validators.vendorLoginValidator, req);
      const email: string = input.email.toLowerCase();
      const password: string = input.password;

      const vendor = await vendorService.findVendorWithFilters({ email: email }, {}, {});
      if (!vendor) {
        throw new GraphQLError("Invalid Account", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }
      // TODO: Need to remove after confirm isVerifies feild is not adding in vendor db
      // else if (!vendor.isVerified) {
      //   throw new GraphQLError("Vendor not verified by admin", {
      //     extensions: {
      //       code: "BAD_REQUEST",
      //       errors: []
      //     }
      //   });
      // }
      else if (vendor.isBlocked) {
        throw new GraphQLError("Vendor Blocked", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }
      else if (! await vendor.verifyHash?.(password)) {
        throw new GraphQLError("Invalid Account", {
          extensions: {
            code: "BAD_REQUEST",
            errors: []
          }
        });
      }

      let token = await jwtService.createVendorJWT(vendor._id!.toString());

      vendor.token = token;

      await vendor.save();

      const response = vendorService.loginVendor(vendor);

      return response;
    },

    // updateVendorProfile: async (parent, { input, images, fileMap }, { req }, info) => {
    //   try {
    //     // Validate input and check admin permissions
    //     await validateInput(validators.VendorUpdateValidator, req);
    //     // await verifyAdmin(req);

    //     const vendorId: Types.ObjectId = new Types.ObjectId(input._id);

    //     const vendor = await vendorService.findVendorWithFilters({ _id: vendorId }, {}, {});
    //     if (!vendor) {
    //       throw new GraphQLError('Vendor not found', {
    //         extensions: {
    //           code: 'BAD_REQUEST',
    //           errors: [],
    //         },
    //       });
    //     }

    //     if (input.email) {
    //       vendor.email = input.email.toLowerCase();
    //     }

    //     vendor.fullName = input.fullName;
    //     vendor.mobileNumber = input.mobileNumber;
    //     vendor.country = input.country;
    //     vendor.brand = input.brand;
    //     vendor.companyName = input.companyName;
    //     vendor.businessOutletName = input.businessOutletName;
    //     vendor.crNumber = input.crNumber;
    //     vendor.crLicence = input.crLicence;
    //     vendor.businessLicence = input.businessLicence;
    //     vendor.chamberOfCommerceCertificate = input.chamberOfCommerceCertificate;
    //     vendor.companyType = input.companyType;
    //     vendor.businessAddress = input.businessAddress;
    //     vendor.contactPerson = {
    //       name: input.contactPerson.name,
    //       phoneNumber: input.contactPerson.phoneNumber,
    //       designation: input.contactPerson.designation,
    //     };
    //     vendor.sellingProductDetails = input.sellingProductDetails;
    //     vendor.sellingProductBrands = input.sellingProductBrands;

    //     // Update vendor images
    //     images = images || [];

    //     let vendorImages: tempVendorAuthService.FileData[] = [];

    //     for (let image of images) {
    //       const { createReadStream, filename, mimetype } = await image;

    //       const key = spaceService.getFileKey(filePaths.vendorImage, filename, []);

    //       const stream = createReadStream();

    //       const file = await spaceService.publicFileUpload(key, mimetype, { mimetype: mimetype }, stream);

    //       vendorImages.push({
    //         fileType: 'PUBLIC',
    //         fileURL: file.location,
    //         mimeType: mimetype,
    //         originalName: filename,
    //       });
    //     }

    //     fileMap = fileMap || {};
    //     console.log(fileMap)


    //     let vendorImagesName = ["profilePic", "exteriorImage", "interiorImage"];
    //     vendorImagesName.forEach((imageName) => {
    //       if (fileMap[imageName] != null && fileMap[imageName] >= 0) {
    //         switch (imageName) {
    //           case "profilePic":
    //             vendor.profilePic = vendorImages[fileMap[imageName]];
    //             break;

    //           case "exteriorImage":
    //             vendor.exteriorImage = vendorImages[fileMap[imageName]];
    //             break;

    //           case "interiorImage":
    //             vendor.interiorImage = vendorImages[fileMap[imageName]];
    //             break;

    //           default:
    //         }
    //       }
    //     });

    //     await vendor.save();

    //     const response = {
    //       _id: vendor?._id?.toString(),
    //       message: 'Vendor successfully updated',
    //     };

    //     return response;
    //   } catch (error) {
    //     console.error(error);
    //     throw error;
    //   }
    // },

  },

  Query: {
    // Fetch all vendors records
    async getAllVendorsRecordsByAdmin(parent, { input }, { req }, info) {
      try {
        await validateInput(validators.getAllVendorsRecordsValidator, req);
        await verifyAdmin(req);

        const page: number = input?.page || 0;
        const size: number = input?.size || 10;
        let projection: vendorService.IVendorProjection = { _id: 1 };

        const selectedFields = info?.fieldNodes[0]?.selectionSet?.selections || [];
        for (const selection of selectedFields) {
          if (selection.kind === "Field" && selection.name.value == "records") {

            let selectionSet = selection.selectionSet || { selections: [] };
            for (let item of selectionSet.selections) {
              if (item.kind === "Field") {
                const fieldName = item.name.value;
                if (["images"].includes(fieldName)) {
                  let selectionSet = item.selectionSet || { selections: [] };
                  for (let item2 of selectionSet.selections) {
                    if (item2.kind === "Field") {
                      const subField = item2.name.value;
                      const path = `${fieldName}.${subField}`;
                      projection[path as keyof vendorService.IVendorProjection] = 1;
                    }
                  }
                }
                else {
                  projection[fieldName as keyof vendorService.IVendorProjection] = 1;
                }
              }
            }
          }
        }


        const options: vendorService.IVendorsRecordsOptions = {
          page,
          size,
          projection,
        }

        // Fetch all vendors records
        const result = await vendorService.getVendorsRecordsWithFilters(options);
        const response = {
          records: result.records,
          maxRecords: result.maxRecords,
          message: "Vendors records fetched successfully",
        };
        return response;
      } catch (error) {
        throw error;
      }
    },

    // Fetch each vendors records
    async getVendorRecordByAdmin(parent, { input }, { req }, info) {
      await verifyAdmin(req);

      try {
        await validateInput(validators.getVendorRecordValidator, req);

        const _id: Types.ObjectId = new Types.ObjectId(input._id);

        const result = await vendorService.getvendorRecordWithId(_id);

        if (!result) {
          throw new GraphQLError("Record not found", {
            extensions: {
              code: "BAD_REQUEST",
              errors: []
            }
          });
        }

        const response = {
          record: result,
          message: "Vendor record fetched successfully",
        }

        return response;

      } catch (error) {
        throw error;
      }

    },
  },
};

