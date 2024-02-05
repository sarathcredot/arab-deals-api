import { Request, Response, NextFunction } from "express";
import { GraphQLError } from "graphql";
import { jwtService, adminService, userService } from "../services";

interface CustomRequest extends Request {
    authAccount?: {
        _id: string;
      
        // Add other properties as needed
    };
}

export const verifyUser = async (req: CustomRequest) => {
    try {
        let token = await jwtService.getAuthTokenFromHeaders(req);
        if (!token) {
            throw new Error("Token not found");
        }

        let decoded = await jwtService.verifyUserJWT(token);
        if (!decoded || !decoded.id) {
            throw new Error("Invalid token");
        }

        let user = await userService.findUserWithFilters(
            { _id: decoded.id, isBlocked: false },
            { _id: 1 },
            { lean: true }
        );

        
        if (!user) {
            throw new Error("User not found");
        }

        req.authAccount = {
            _id: user._id?.toString() || "",
           
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
