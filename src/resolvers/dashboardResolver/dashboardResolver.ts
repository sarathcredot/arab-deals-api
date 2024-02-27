import { dashboardService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import * as validators from "./dashboardValidator";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifySuperAdmin, verifyAdmin } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";


export const dashboardResolver: Resolvers = {
    Mutation: {

    },
    Query: {
        getDashboardlUsersSummary: async (parent, { }, { req }, info) => {

            await verifyAdmin(req);

            const result = await dashboardService.getDashboardUsersSummary();

            const response: dashboardService.IGetDashboardUsersSummary = result[0];

            return response;
        },
        getDashboardUsersGraph: async (parent, { input }, { req }, info) => {

            await verifyAdmin(req);
            await validateInput(validators.getDashboardUsersGraphValidator, req);

            let { startDate, endDate, graphType } = input;

            let options: dashboardService.IGetDashboardUsersGraphOptions = {
                startDate,
                endDate,
                graphType: graphType || ""
            }

            const result = await dashboardService.getDashboardUsersGraph(options);

            let response: { x: string[], y1: number[] } = {
                y1: [],
                x: []
            };

            if (result && result.length && result[0] && typeof result[0] === 'object') {
                response.y1 = Object.values(result[0]);
                response.x = Object.keys(result[0]);
            }

            return response;
        },
        getDashboardOrderSummary: async (parent, { }, { req }, info) => {

            await verifyAdmin(req);

            const result = await dashboardService.getDashboardOrderSummary();

            const response: dashboardService.IGetDashboardOrderSummary = result[0];

            return response;
        },
        getDashboardOrdersGraph: async (parent, { input }, { req }, info) => {

            await verifyAdmin(req);
            await validateInput(validators.getDashboardOrdersGraphValidator, req);

            let { startDate, endDate, graphType } = input;

            let options: dashboardService.IGetDashboardOrdersGraphOptions = {
                startDate,
                endDate,
                graphType: graphType || ""
            }

            const result = await dashboardService.getDashboardOrdersGraph(options);

            let response: { x: string[], y1: number[] } = {
                y1: [],
                x: []
            };

            if (result && result.length && result[0] && typeof result[0] === 'object') {
                response.y1 = Object.values(result[0]);
                response.x = Object.keys(result[0]);
            }

            return response;
        },
        getDashboardOrdersPieChartData: async (parent, { input }, { req }, info) => {

            await verifyAdmin(req);
            await validateInput(validators.getDashboardOrdersPieChartDataValidator, req);

            let { startDate, endDate } = input;


            let options: dashboardService.IGetDashboardOrdersPieChartDataOptions = {
                startDate,
                endDate
            }

            const result = await dashboardService.getDashboardOrderPieChartData(options);

            let response: dashboardService.IGetDashboardOrderPiechartData = {};

            if (result && result.length && result[0] && typeof result[0] === 'object') {
                response = { ...result[0] };
            }

            return response;
        },
        getDashboardReturnedOrdersPieChartData: async (parent, { input }, { req }, info) => {

            await verifyAdmin(req);
            await validateInput(validators.getDashboardReturnedOrdersPieChartDataValidator, req);

            let { startDate, endDate } = input;


            let options: dashboardService.IGetDashboardReturnedOrdersPieChartDataOptions = {
                startDate,
                endDate
            }

            const result = await dashboardService.getDashboardReturnedOrdersPieChartData(options);

            let response: dashboardService.IGetDashboardReturnedOrderPiechartData = {};

            if (result && result.length && result[0] && typeof result[0] === 'object') {
                response = { ...result[0] };
            }

            return response;
        },
        getDashboardReturnedOrderSummary: async (parent, { }, { req }, info) => {

            await verifyAdmin(req);

            const result = await dashboardService.getDashboardReturnedOrderSummary();

            const response: dashboardService.IGetDashboardReturnedOrderSummary = result[0];

            return response;
        },
        getDashboardRefundOrdersSummary: async (parent, { }, { req }, info) => {

            await verifyAdmin(req);

            const result = await dashboardService.getDashboardRefundOrderSummary();

            const response: dashboardService.IGetDashboardRefundOrderSummary = result[0];

            return response;
        },
        getDashboardRefundOrdersPieChartData: async (parent, { input }, { req }, info) => {

            await verifyAdmin(req);
            await validateInput(validators.getDashboardRefundOrdersPieChartDataValidator, req);

            let { startDate, endDate } = input;


            let options: dashboardService.IGetDashboardRefundOrdersPieChartDataOptions = {
                startDate,
                endDate
            }

            const result = await dashboardService.getDashboardRefundOrdersPieChartData(options);

            let response: dashboardService.IGetDashboardRefundOrderPiechartData = {};

            if (result && result.length && result[0] && typeof result[0] === 'object') {
                response = { ...result[0] };
            }

            return response;
        },
        getDashboardOrdersAmountPieChartData: async (parent, { input }, { req }, info) => {

            await verifyAdmin(req);
            await validateInput(validators.getDashboardOrdersAmountPieChartDataValidator, req);

            let { startDate, endDate } = input;


            let options: dashboardService.IGetDashboardOrdersAmountPieChartDataOptions = {
                startDate,
                endDate
            }

            const result = await dashboardService.getDashboardOrderAmountPieChartData(options);

            let response: dashboardService.IGetDashboardOrderAmountPiechartData = {};

            if (result && result.length && result[0] && typeof result[0] === 'object') {
                response = { ...result[0] };
            }

            return response;
        },
        getDashboardShippingChargePieChartData: async (parent, { input }, { req }, info) => {

            await verifyAdmin(req);
            await validateInput(validators.getDashboardShippingChargePieChartDataValidator, req);

            let { startDate, endDate } = input;


            let options: dashboardService.IGetDashboardShippingChargePieChartDataOptions = {
                startDate,
                endDate
            }

            const result = await dashboardService.getDashboardShippingChargePieChartData(options);

            let response: dashboardService.IGetDashboardShippingChargePiechartData = {};

            if (result && result.length && result[0] && typeof result[0] === 'object') {
                response = { ...result[0] };
            }

            return response;
        },
    },
};


