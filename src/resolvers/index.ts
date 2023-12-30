import { mergeResolvers } from '@graphql-tools/merge';
import { Resolvers } from 'src/_generated_/resolvers-types';
import { productResolver } from "./productResolver/productResolver";
import { categoryResolver } from "./categoryResolver/categoryResolver";
import { adminResolver } from "./adminResolver/adminResolver";
import { vendorResolver } from "./vendorResolver/vendorResolver";
import { otpResolver } from "./otpResolver/otpResolver";
import { kycResolver } from "./kycResolver/kycResolver";
import { brandResolver } from "./brandResolver/brandResolver";




export const resolvers: Resolvers = mergeResolvers(
    [
        productResolver,
        categoryResolver,
        adminResolver,
        vendorResolver,
        otpResolver,
        kycResolver,
        brandResolver,
    ]
);