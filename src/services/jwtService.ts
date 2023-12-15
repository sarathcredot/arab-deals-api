import { GraphQLError } from "graphql";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const adminSecretKey: string = process.env.ADMIN_JWT_SECRET || "";
const vendorSecretKey: string = process.env.VENDOR_JWT_SECRET || "";

// Admin JWT Services
export const getAuthTokenFromHeaders = (req: Request): string => {
    try {
        const { headers: { authorization } } = req;
        if (authorization && authorization.split(" ")[0] === "Bearer") {
            const token = authorization.split(" ")[1];

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

export const createAdminJWT = (id: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const token = jwt.sign({ id }, adminSecretKey, { expiresIn: "1hr" });
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

export const verifyAdminJWT = (token: string): JwtPayload => {
    return new Promise((resolve, reject) => {
        try {
            const decoded = jwt.verify(token, adminSecretKey, { ignoreExpiration: true });
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


// Vendor JWT Services
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


