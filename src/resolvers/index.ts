import { mergeResolvers } from '@graphql-tools/merge';
import { Resolvers } from 'src/_generated_/resolvers-types';
import { productResolver } from "./productResolver/productResolver";
import { cmsResolver } from "./cmsResolver/cmsResolver";
import { cms2Resolver } from "./cms2Resolver/cms2Resolver";
import { colorResolver } from "./colorResolver/colorResolver";
import { sizeResolver } from "./sizeResolver/sizeResolver";
import { categoryResolver } from "./categoryResolver/categoryResolver";
import { adminResolver } from "./adminResolver/adminResolver";
import { vendorResolver } from "./vendorResolver/vendorResolver";




export const resolvers: Resolvers = mergeResolvers(
    [
        productResolver,
        cmsResolver,
        cms2Resolver,
        colorResolver,
        sizeResolver,
        categoryResolver,
        adminResolver,
        vendorResolver
    ]
);