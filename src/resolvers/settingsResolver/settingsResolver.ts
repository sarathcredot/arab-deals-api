import { orderProductService, orderService, settingsService, spaceService, userShippingAddressService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import * as validators from "./settingsValidator";
import { GraphQLError } from "graphql";
import { verifyUser, verifyAdmin, validateInput } from "../../middlewares";
import { Types } from "mongoose";
import moment from "moment";
import { filePaths } from "../../configs";



export const settingsResolver: Resolvers = {
    Mutation: {

        updatePaymentSettings: async (parent, { input }, { req }, info) => {
            // await verifyAdmin(req);
            await validateInput(validators.updatePaymentConfigValidator, req);

            let paymentSettings = await settingsService.getPaymentConfig({}, { sort: { _id: 1 } });

            if (!paymentSettings) {
                paymentSettings = await settingsService.createPaymentConfig({ onlinePayment: false, cod: false });
            }

            if (input.onlinePayment === true || input.onlinePayment === false) {
                paymentSettings.onlinePayment = input.onlinePayment;
            }
            if (input.cod === true || input.cod === false) {
                paymentSettings.cod = input.cod;
            }

            await paymentSettings.save();

            const response = {
                onlinePayment: paymentSettings.onlinePayment,
                cod: paymentSettings.cod
            }

            return response;
        },
        updateShippingSettings: async (parent, { input }, { req }, info) => {

            // await verifyAdmin(req);
            await validateInput(validators.updateShippingConfigValidator, req);


            const shippingCharge = parseInt(input.shippingCharge?.toString() || "");
            const freeShippingThreshold = parseInt(input.freeShippingThreshold?.toString() || "");
            const returnPeriod = parseInt(input.returnPeriod?.toString() || "");


            let shippingSettings = await settingsService.getShippingConfig({}, { sort: { _id: 1 } });

            if (!shippingSettings) {
                shippingSettings = await settingsService.createShippingConfig({ shippingCharge: 0, freeShippingThreshold: 100, returnPeriod: 0 });
            }

            if (!isNaN(shippingCharge) && shippingCharge >= 0) {
                shippingSettings.shippingCharge = shippingCharge;
            }
            if (!isNaN(freeShippingThreshold) && freeShippingThreshold >= 0) {
                shippingSettings.freeShippingThreshold = freeShippingThreshold;
            }
            if (!isNaN(returnPeriod) && returnPeriod >= 0) {
                shippingSettings.returnPeriod = returnPeriod;
            }

            await shippingSettings.save();

            const response = {
                shippingCharge: shippingSettings.shippingCharge,
                freeShippingThreshold: shippingSettings.freeShippingThreshold,
                returnPeriod: shippingSettings.returnPeriod
            }

            return response;
        }
    },
    Query: {
        getPaymentSettings: async (parent, { }, { req }, info) => {

            await verifyAdmin(req);
            let paymentSettings = await settingsService.getPaymentConfig({}, { sort: { _id: 1 } });
            if (!paymentSettings) {
                paymentSettings = await settingsService.createPaymentConfig({ onlinePayment: false, cod: false });
            }

            const response = {
                onlinePayment: paymentSettings.onlinePayment,
                cod: paymentSettings.cod
            }

            return response;

        },
        getShippingSettings: async (parent, { }, { req }, info) => {

            await verifyAdmin(req);
            let shippingSettings = await settingsService.getShippingConfig({}, { sort: { _id: 1 } });
            if (!shippingSettings) {
                shippingSettings = await settingsService.createShippingConfig({ shippingCharge: 0, freeShippingThreshold: 100, returnPeriod: 0 });
            }
            const response = {
                shippingCharge: shippingSettings.shippingCharge,
                freeShippingThreshold: shippingSettings.freeShippingThreshold,
                returnPeriod: shippingSettings.returnPeriod
            }

            return response;

        }

    }
};

