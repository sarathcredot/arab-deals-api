import { orderProductService, spaceService } from "../../services";
import { Resolvers } from "../../_generated_/resolvers-types";
import * as validators from "./fileValidator";
import { GraphQLError } from "graphql";
import { verifyUser, verifyAdmin, validateInput } from "../../middlewares";



export const fileResolver: Resolvers = {
    Mutation: {

        getAdminSignedFileUrl: async (parent, { input }, { req }, info) => {

            await verifyAdmin(req);
            await validateInput(validators.getAdminSignedUrlValidator, req);

            const url = await spaceService.createSignedURL(input.fileURL, input.mimeType);

            const response = {
                url: url
            }

            return response;
        },
        getUserIvoiceSignedUrl: async (parent, { input }, { req }, info) => {

            await verifyUser(req);
            await validateInput(validators.getUserInvoiceSignedUrlValidator, req);

            const record = await orderProductService.getOrderProductWithId(input._id, { invoice: 1 }, { lean: true });

            if (!record || !record.invoice?.fileURL) {
                throw new GraphQLError("Invoice not found", {
                    extensions: {
                        code: "BAD_REQUEST",
                        errors: [],
                    },
                });
            }

            const url = await spaceService.createSignedURL(record.invoice.fileURL, record.invoice?.mimeType);

            const response = {
                url: url
            }

            return response;
        }
    },
};


