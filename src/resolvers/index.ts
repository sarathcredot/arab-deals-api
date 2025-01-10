import { mergeResolvers } from '@graphql-tools/merge';

import { Resolvers } from 'src/_generated_/resolvers-types';
import { productResolver } from "./productResolver/productResolver";
import { categoryResolver } from "./categoryResolver/categoryResolver";
import { adminResolver } from "./adminResolver/adminResolver";
import { vendorResolver } from "./vendorResolver/vendorResolver";
import { brandResolver } from "./brandResolver/brandResolver";
import { vendorCompanyResolver } from "./vendorCompanyResolver/vendorCompanyResolver";
import { vendorOutletResolver } from "./vendorOutletResolver/vendorOutletResolver";
import { attributeResolver } from "./attributeResolver/attributeResolver";
import { attributeValueResolver } from "./attributeValueResolver/attributeValueResolver";
import { userResolver } from "./userResolver/userResolver";
import { cartResolver } from "./cartResolver/cartResolver";
import { cmsResolver } from "./cmsResolver/cmsResolver";
import { wishListResolver } from "./wishListResolver/wishListResolver";
import { userShippingAddressResolver } from "./userShipingAddressResolver/userShippingAddressResolver";
import { orderResolver } from "./orderResolver/orderResolver";
import { countryResolver } from "./countryResolver/countryResolver";
import { fileResolver } from "./fileResolver/fileResolver";
import { dashboardResolver } from "./dashboardResolver/dashboardResolver";
import { jobResolver } from "./jobResolver/jobResolver";
import { scalarTypeResolver } from "./scalarTypeResolver/scalarTypeReolver";
import { settingsResolver } from "./settingsResolver/settingsResolver";
import {deliveryAgentResolver} from './deliveryAgentResolver/deliveryAgentResolver'
import {couponResolver}  from './couponResolver/couponResolver'




export const resolvers: Resolvers = mergeResolvers(
    [
        scalarTypeResolver,
        productResolver,
        categoryResolver,
        adminResolver,
        vendorResolver,
        brandResolver,
        vendorCompanyResolver,
        vendorOutletResolver,
        attributeResolver,
        attributeValueResolver,
        userResolver,
        cartResolver,
        cmsResolver,
        wishListResolver,
        userShippingAddressResolver,
        orderResolver,
        countryResolver,
        fileResolver,
        dashboardResolver,
        jobResolver,
        settingsResolver,
        deliveryAgentResolver,
        couponResolver
     
    ]
);