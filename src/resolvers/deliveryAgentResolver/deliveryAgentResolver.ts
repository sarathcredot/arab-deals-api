



import {} from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLUpload } from "graphql-upload-ts";
// import * as validators from "./userValidator";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifySuperAdmin, verifyAdmin, verifyUser, verifyMobileUser } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";

export const deliveryAgentResolver = {
  Upload: GraphQLUpload,
  Mutation: {
   
  },

  Query: {
   
     
  }
};
