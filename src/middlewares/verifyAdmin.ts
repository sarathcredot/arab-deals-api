import { Request, Response, NextFunction } from "express";
import { GraphQLError } from "graphql";
import { jwtService, adminService } from "../services";
import { Types } from "mongoose";

interface CustomRequest extends Request {
    authAccount: {
        _id: Types.ObjectId;
        accType: string;
    };
}

export const verifyAdmin = async (req: CustomRequest) => {
    try {
        let token = await jwtService.getAuthTokenFromHeaders(req);
        if (!token) {
            throw new Error("Token not found");
        }

        let decoded = await jwtService.verifyAdminJWT(token);
        if (!decoded || !decoded.id) {
            throw new Error("Invalid token");
        }

        let admin = await adminService.findAdminWithFilters(
            { _id: decoded.id, token: token, isBlocked: false, accType: { $in: ["SUPER_ADMIN", "SUB_ADMIN"] } },
            { _id: 1, accType: 1 },
            { lean: true }
        );

        if (!admin) {
            throw new Error("Admin not found");
        }

        req.authAccount = {
            _id: admin._id!,
            accType: admin.accType || "",
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
