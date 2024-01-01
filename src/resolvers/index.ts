import { mergeResolvers } from '@graphql-tools/merge';
import { Resolvers } from 'src/_generated_/resolvers-types';
import { productResolver } from "./productResolver/productResolver";
import { categoryResolver } from "./categoryResolver/categoryResolver";
import { adminResolver } from "./adminResolver/adminResolver";
import { vendorResolver } from "./vendorResolver/vendorResolver";
import { otpResolver } from "./otpResolver/otpResolver";
import { brandResolver } from "./brandResolver/brandResolver";




export const resolvers: Resolvers = mergeResolvers(
    [
        productResolver,
        categoryResolver,
        adminResolver,
        vendorResolver,
        otpResolver,
        brandResolver,
    ]
);