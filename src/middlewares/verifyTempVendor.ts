import { Request } from "express";
import { GraphQLError } from "graphql";
import { tempVendorJwtService, tempVendorAuthService } from "../services";

interface CustomRequest extends Request {
    authAccount?: {
        _id: string,
        temporaryMobileOtp: string | { code?: string; expiresAt?: string };
    };
}

export const verifyTempVendor = async (req: CustomRequest) => {
    try {
        let token = await tempVendorJwtService.getTempVendorAuthTokenFromHeaders(req);
        if (!token) {
            throw new Error("Token not found");
        }

        let decoded = await tempVendorJwtService.verifyTempVendorJWT(token);
        if (!decoded || !decoded.id) {
            throw new Error("Invalid token");
        }
        console.log("decoded: ", decoded.id)

        let tempVendor = await tempVendorAuthService.findTempVendorWithFilters(
            { _id: decoded.id, temporaryVendorAuthToken: token, isVerified: false },
            { _id: 1 , temporaryMobileOtp: 1},
            { lean: true }
        );

        if (!tempVendor) {
            throw new Error("tempVendor not found");
        }

        req.authAccount = {
            _id: tempVendor._id?.toString() || "",
            temporaryMobileOtp: tempVendor.temporaryMobileOtp || "",
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
