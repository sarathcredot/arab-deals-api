import { GraphQLError } from "graphql";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const vendorSecretKey: string = process.env.VENDOR_JWT_SECRET || "";

// Vendor JWT Services

export const getVendorAuthTokenFromHeaders = (req: Request): string => {
    console.log(req)
    try {
        const { headers: { authorization } } = req;
        console.log("authorization ", authorization)

        if (authorization && authorization.split(" ")[0] === "Bearer") {
            const token = authorization.split(" ")[1];
            console.log("token ", token)
            return token;
        } else {
            throw new GraphQLError("Unauthorized", {
                extensions: {
                    code: "UNAUTHORIZED",
                    errors: []
                }
            });
        }
    } catch (error) {
        throw error;
    }
}

export const createVendorJWT = (id: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const token = jwt.sign({ id }, vendorSecretKey, { expiresIn: "1hr" });
            resolve(token);
        } catch (e) {
            reject(new GraphQLError("JWT error", {
                extensions: {
                    code: "INTERNAL_SERVER_ERROR",
                    errors: []
                }
            }));
        }
    });
};

export const verifyVendorJWT = (token: string): JwtPayload => {
    return new Promise((resolve, reject) => {
        try {
            const decoded = jwt.verify(token, vendorSecretKey, { ignoreExpiration: true });
            resolve(decoded);
        } catch (e) {
            reject(new GraphQLError("JWT error", {
                extensions: {
                    code: "INTERNAL_SERVER_ERROR",
                    errors: []
                }
            }));
        }
    });
}


