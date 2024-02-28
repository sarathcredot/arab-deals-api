import { Request } from "express";
import { GraphQLError } from "graphql";
import { vendorJwtService, vendorService } from "../services";
import { Types } from "mongoose";

interface CustomRequest extends Request {
    authAccount?: {
        _id: Types.ObjectId,
        accType: string
    };
}

export const verifyVendor = async (req: CustomRequest) => {
    try {
        let token = await vendorJwtService.getVendorAuthTokenFromHeaders(req);
        if (!token) {
            throw new Error("Token not found");
        }

        let decoded = await vendorJwtService.verifyVendorJWT(token);
        if (!decoded || !decoded.id) {
            throw new Error("Invalid token");
        }

        let tempVendor = await vendorService.findVendorWithFilters(
            { _id: decoded.id, token: token, isBlocked: false },
            { _id: 1 },
            { lean: true }
        );

        if (!tempVendor) {
            throw new Error("Vendor not found");
        }

        req.authAccount = {
            _id: tempVendor._id!,
            accType: "VENDOR"
        };

    } catch (error) {
        console.log(error);
        const errorMessage = (error as Error).message || "An error occurred";
        throw new GraphQLError("Unauthorized", {
            extensions: {
                code: "UNAUTHORIZED",
                errors: [{ message: errorMessage }],
            },
        });
    }
};
