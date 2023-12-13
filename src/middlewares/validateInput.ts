import { Request } from "express";
import { ValidationChain, validationResult } from "express-validator";
import { GraphQLError } from "graphql";


export const validateInput = async (validationChain: ValidationChain[], req: Request) => {
    await Promise.all(validationChain.map(validation => validation(req, {}, (err) => { })));
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
        throw new GraphQLError("BAD_REQUEST", {
            extensions: {
                code: "BAD_REQUEST",
                errors: errors.array()
            }
        });
    }
}