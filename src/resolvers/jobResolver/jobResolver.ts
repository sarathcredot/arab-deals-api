import { jobQueueService, jwtService, orderProductService, orderService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import * as validators from "./jobValidator";
import path from "path";
import { createWriteStream } from 'fs';
import { GraphQLError } from "graphql";
import { validateInput, verifySuperAdmin, verifyAdmin, verifyVendor } from "../../middlewares";
import { filePaths } from "../../configs";
import { Types } from "mongoose";
import moment from "moment";



const SERVER_URL = process.env.SERVER_URL;

const EXPORT_FOLDER = path.join(path.dirname(path.dirname(path.dirname(__dirname))), "exports");


export const jobResolver: Resolvers = {
    Query: {
        getJobsQueue: async (parent, { input }, { req }, info) => {

            await verifyAdmin(req);
            await validateInput(validators.getJobsValidator, req);

            const { page, size, name } = input;

            let options: jobQueueService.IGetJobsOptions = { page: 0, size: 10, name: '' };

            if (page) {
                options.page = page;
            }
            if (size) {
                options.size = size;
            }
            if (name) {
                options.name = name;
            }

            const response = await jobQueueService.getJobs(options);
            return response;
        },

        getVendorJobsQueue: async (parent, { input }, { req }, info) => {

            await verifyVendor(req);
            await validateInput(validators.getJobsValidator, req);

            const { page, size, name } = input;

            let options: jobQueueService.IGetJobsOptions = { page: 0, size: 10, name: '' };

            if (page) {
                options.page = page;
            }
            if (size) {
                options.size = size;
            }
            if (name) {
                options.name = name;
            }
            const response = await jobQueueService.getJobs(options);
            return response;
        },

        getAdminDownloadToken: async (parent, { input }, { req }, info) => {
            await verifyAdmin(req);
            await validateInput(validators.getAdminDownloadTokenValidator, req);
            const { _id } = input;

            const job = await jobQueueService.getJob({ _id: _id }, {}, { lean: true });

            if (!job || !job.metadata || !job.metadata.filePath) {
                throw new GraphQLError("Record not found", {
                    extensions: {
                        code: "BAD_REQUEST",
                        errors: [],
                    },
                });
            }
            const token = await jwtService.createFileDownloadJWT(job?.metadata?.filePath);
            const response = {
                url: `${SERVER_URL}/file?token=${token}`
            }
            return response;
        },

        getVendorDownloadToken: async (parent, { input }, { req }, info) => {
            await verifyVendor(req);
            await validateInput(validators.getAdminDownloadTokenValidator, req);
            const { _id } = input;

            const job = await jobQueueService.getJob({ _id: _id }, {}, { lean: true });

            if (!job || !job.metadata || !job.metadata.filePath) {
                throw new GraphQLError("Record not found", {
                    extensions: {
                        code: "BAD_REQUEST",
                        errors: [],
                    },
                });
            }
            const token = await jwtService.createFileDownloadJWT(job?.metadata?.filePath);
            const response = {
                url: `${SERVER_URL}/file?token=${token}`
            }
            return response;
        }
    },
    Mutation: {
        exportAdminOrders: async (parent, { input }, { req }, info) => {

            await verifyAdmin(req);
            await validateInput(validators.exportAdminOrdersValidator, req);

            let filters: orderService.IOrdersOptions = { page: 0, size: 10 };

            if (input._id) {
                filters._id = input._id;
            }
            if (input.userId) {
                filters.userId = input.userId;
            }
            if (input.orderId) {
                filters.orderId = input.orderId;
            }
            if (input.paymentMode) {
                filters.paymentMode = input.paymentMode;
            }
            if (input.orderStatus) {
                filters.orderStatus = input.orderStatus;
            }
            if (input.postCode) {
                filters.postCode = input.postCode;
            }
            if (input.startDate) {
                filters.startDate = moment(input.startDate).toDate();
            }
            if (input.endDate) {
                filters.endDate = moment(input.endDate).toDate();
            }
            if (input.page) {
                filters.page = input.page;
            }
            if (input.size) {
                filters.size = input.size;
            }


            setTimeout(async () => {

                const job = {
                    name: "ORDER_EXPORT",
                    status: "IN_PROGRESS",
                    userType: "ADMIN",
                    metadata: {
                    }
                }
                const record = await jobQueueService.createJob(job);

                const filename = await orderService.exportAdminOrdersWithFilters(filters, EXPORT_FOLDER);

                if (filename) {
                    record.status = "COMPLETED";
                    record.metadata = {
                        filePath: `exports/${filename}`
                    }
                }
                else {
                    record.status = "FAILED";
                }
                await record.save();

            }, 1000);


            const response = {
                message: "export successful"
            }
            return response;
        },
        exportVendorOrders: async (parent, { input }, { req }, info) => {

            await verifyVendor(req);
            await validateInput(validators.exportAdminOrdersValidator, req);

            const vendorId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

            let filters: orderService.IOrdersOptions = { page: 0, size: 10 };

            filters.vendorId = vendorId;

            if (input._id) {
                filters._id = input._id;
            }
            if (input.userId) {
                filters.userId = input.userId;
            }
            if (input.orderId) {
                filters.orderId = input.orderId;
            }
            if (input.paymentMode) {
                filters.paymentMode = input.paymentMode;
            }
            if (input.orderStatus) {
                filters.orderStatus = input.orderStatus;
            }
            if (input.postCode) {
                filters.postCode = input.postCode;
            }
            if (input.startDate) {
                filters.startDate = moment(input.startDate).toDate();
            }
            if (input.endDate) {
                filters.endDate = moment(input.endDate).toDate();
            }
            if (input.page) {
                filters.page = input.page;
            }
            if (input.size) {
                filters.size = input.size;
            }


            setTimeout(async () => {

                const job = {
                    name: "ORDER_EXPORT",
                    status: "IN_PROGRESS",
                    vendorId: vendorId,
                    userType: "VENDOR",
                    metadata: {
                    }
                }
                const record = await jobQueueService.createJob(job);

                const filename = await orderService.exportVendorOrdersWithFilters(filters, EXPORT_FOLDER);

                if (filename) {
                    record.status = "COMPLETED";
                    record.metadata = {
                        filePath: `exports/${filename}`
                    }
                }
                else {
                    record.status = "FAILED";
                }
                await record.save();

            }, 1000);


            const response = {
                message: "export successful"
            }
            return response;
        },
        exportAdminShippingProducts: async (parent, { input }, { req }, info) => {

            await verifyAdmin(req);
            await validateInput(validators.exportAdminOrderShippingProductsValidator, req);

            let filters: orderProductService.IShippingProductsOptions = { page: 0, size: 10, sort: "" };

            if (input._id) {
                filters._id = input._id;
            }
            if (input.userId) {
                filters.userId = input.userId;
            }
            if (input.orderId) {
                filters.orderId = input.orderId;
            }
            if (input.vendorId) {
                filters.vendorId = input.vendorId;
            }
            if (input.itemId) {
                filters.itemId = input.itemId;
            }
            if (input.productId) {
                filters.productId = input.productId;
            }
            if (input.skuId) {
                filters.skuId = input.skuId;
            }
            if (input.paymentMode) {
                filters.paymentMode = input.paymentMode;
            }
            if (input.paymentStatus) {
                filters.paymentStatus = input.paymentStatus;
            }
            if (input.shippingStatus) {
                filters.shippingStatus = input.shippingStatus;
            }
            if (input.orderStartDate) {
                filters.orderStartDate = moment(input.orderStartDate).toDate();
            }
            if (input.orderEndDate) {
                filters.orderEndDate = moment(input.orderEndDate).toDate();
            }
            if (input.shippingStartDate) {
                filters.shippingStartDate = moment(input.shippingStartDate).toDate();
            }
            if (input.shippingEndDate) {
                filters.shippingEndDate = moment(input.shippingEndDate).toDate();
            }
            if (input.deliveryStartDate) {
                filters.deliveryStartDate = moment(input.deliveryStartDate).toDate();
            }
            if (input.deliveryEndDate) {
                filters.deliveryEndDate = moment(input.deliveryEndDate).toDate();
            }
            if (input.cancelledStartDate) {
                filters.cancelledStartDate = moment(input.cancelledStartDate).toDate();
            }
            if (input.cancelledEndDate) {
                filters.cancelledEndDate = moment(input.cancelledEndDate).toDate();
            }
            if (input.courierId) {
                filters.courierId = input.courierId;
            }
            if (input.invoiceNumber) {
                filters.invoiceNumber = input.invoiceNumber;
            }
            if (input.page) {
                filters.page = input.page;
            }
            if (input.size) {
                filters.size = input.size;
            }
            if (input.sort) {
                filters.sort = input.sort;
            }


            setTimeout(async () => {

                const job = {
                    name: "SHIPPING_EXPORT",
                    status: "IN_PROGRESS",
                    userType: "ADMIN",
                    metadata: {
                    }
                }
                const record = await jobQueueService.createJob(job);

                const filename = await orderProductService.exportShippingProducts(filters, EXPORT_FOLDER);

                if (filename) {
                    record.status = "COMPLETED";
                    record.metadata = {
                        filePath: `exports/${filename}`
                    }
                }
                else {
                    record.status = "FAILED";
                }
                await record.save();

            }, 1000);

            const response = {
                message: "export successful"
            }
            return response;
        },
        exportVendorShippingProducts: async (parent, { input }, { req }, info) => {

            await verifyVendor(req);
            await validateInput(validators.exportAdminOrderShippingProductsValidator, req);
            const vendorId: Types.ObjectId = new Types.ObjectId(req.authAccount._id);

            let filters: orderProductService.IShippingProductsOptions = { page: 0, size: 10, sort: "" };

            filters.vendorId = vendorId;

            if (input._id) {
                filters._id = input._id;
            }
            if (input.userId) {
                filters.userId = input.userId;
            }
            if (input.orderId) {
                filters.orderId = input.orderId;
            }
            if (input.vendorId) {
                filters.vendorId = input.vendorId;
            }
            if (input.itemId) {
                filters.itemId = input.itemId;
            }
            if (input.productId) {
                filters.productId = input.productId;
            }
            if (input.skuId) {
                filters.skuId = input.skuId;
            }
            if (input.paymentMode) {
                filters.paymentMode = input.paymentMode;
            }
            if (input.paymentStatus) {
                filters.paymentStatus = input.paymentStatus;
            }
            if (input.shippingStatus) {
                filters.shippingStatus = input.shippingStatus;
            }
            if (input.orderStartDate) {
                filters.orderStartDate = moment(input.orderStartDate).toDate();
            }
            if (input.orderEndDate) {
                filters.orderEndDate = moment(input.orderEndDate).toDate();
            }
            if (input.shippingStartDate) {
                filters.shippingStartDate = moment(input.shippingStartDate).toDate();
            }
            if (input.shippingEndDate) {
                filters.shippingEndDate = moment(input.shippingEndDate).toDate();
            }
            if (input.deliveryStartDate) {
                filters.deliveryStartDate = moment(input.deliveryStartDate).toDate();
            }
            if (input.deliveryEndDate) {
                filters.deliveryEndDate = moment(input.deliveryEndDate).toDate();
            }
            if (input.cancelledStartDate) {
                filters.cancelledStartDate = moment(input.cancelledStartDate).toDate();
            }
            if (input.cancelledEndDate) {
                filters.cancelledEndDate = moment(input.cancelledEndDate).toDate();
            }
            if (input.courierId) {
                filters.courierId = input.courierId;
            }
            if (input.invoiceNumber) {
                filters.invoiceNumber = input.invoiceNumber;
            }
            if (input.page) {
                filters.page = input.page;
            }
            if (input.size) {
                filters.size = input.size;
            }
            if (input.sort) {
                filters.sort = input.sort;
            }


            setTimeout(async () => {

                const job = {
                    name: "SHIPPING_EXPORT",
                    status: "IN_PROGRESS",
                    vendorId: vendorId,
                    userType: "VENDOR",
                    metadata: {
                    }
                }
                const record = await jobQueueService.createJob(job);

                const filename = await orderProductService.exportShippingProducts(filters, EXPORT_FOLDER);

                if (filename) {
                    record.status = "COMPLETED";
                    record.metadata = {
                        filePath: `exports/${filename}`
                    }
                }
                else {
                    record.status = "FAILED";
                }
                await record.save();

            }, 1000);

            const response = {
                message: "export successful"
            }
            return response;
        },
    },
}