import { mergeResolvers } from '@graphql-tools/merge';
import { Resolvers } from 'src/_generated_/resolvers-types';
import { productResolver } from "./productResolver/productResolver";
import { categoryResolver } from "./categoryResolver/categoryResolver";
import { adminResolver } from "./adminResolver/adminResolver";
import { vendorResolver } from "./vendorResolver/vendorResolver";
import { otpResolver } from "./otpResolver/otpResolver";
import { brandResolver } from "./brandResolver/brandResolver";
import { vendorCompanyResolver } from "./vendorCompanyResolver/vendorCompanyResolver";
import { vendorOutletResolver } from "./vendorOutletResolver/vendorOutletResolver";
import { attributeResolver } from "./attributeResolver/attributeResolver";
import { attributeValueResolver } from "./attributeValueResolver/attributeValueResolver";




export const resolvers: Resolvers = mergeResolvers(
    [
        productResolver,
        categoryResolver,
        adminResolver,
        vendorResolver,
        otpResolver,
        brandResolver,
        vendorCompanyResolver,
        vendorOutletResolver,
        attributeResolver,
        attributeValueResolver,
    ]
);