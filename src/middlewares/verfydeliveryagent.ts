import { Request, Response, NextFunction } from "express";
import { GraphQLError } from "graphql";
import { jwtService, adminService, userService } from "../services";
import { Types } from "mongoose";

interface CustomRequest extends Request {
    authAccount?: {
        _id: Types.ObjectId;
      
        // Add other properties as needed
    };
}

export const verifyDeliveryAgent = async (req: CustomRequest) => {
    try {
        let token = await jwtService.getAuthTokenFromHeaders(req);
        if (!token) {
            throw new Error("Token not found");
        }

        let decoded = await jwtService.verifyDeliveryAgentJWT(token);
        if (!decoded || !decoded.id) {
            throw new Error("Invalid token");
        }

        // let   deliveryAgent = await userService.findUserWithFilters(
        //     { _id: decoded.id, isBlocked: false },
        //     { _id: 1 },
        //     { lean: true }
        // );

        
        // if (!deliveryAgent) {
        //     throw new Error("User not found");
        // }

        req.authAccount = {
            _id: decoded.id !
           
        };
        console.log("REQ = ",req)
       return decoded

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
