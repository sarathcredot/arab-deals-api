import { vendorService, jwtService, spaceService, vendorCompanyService, vendorOutletService, vendorJwtService, otpService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifyAdmin, verifyVendor } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";

export const deliveryAgentResolver: Resolvers = {
  Upload: GraphQLUpload,
  Mutation: {

    
  },

  Query: {
   
  },
};

