import { Resolvers } from "../../_generated_/resolvers-types";
import { GraphQLScalarType, Kind } from "graphql";
import { Types } from "mongoose";

import { GraphQLUpload } from "graphql-upload-ts";



const ObjectIdScalar = new GraphQLScalarType({
    name: 'ObjectId',
    description: 'Mongoose ObjectId scalar type',
    parseValue(value) {
        // Parse the incoming value from the client input variables
        const stringValue = String(value);
        if (Types.ObjectId.isValid(stringValue)) {
            return new Types.ObjectId(stringValue);
        }
        throw new Error('Invalid ObjectId format');

    },
    serialize(value) {
        // Serialize the value before sending it to the client
        if (value instanceof Types.ObjectId) {
            return value.toHexString(); // Convert ObjectId to its hexadecimal string representation
        }
        throw new Error('Invalid ObjectId instance');
    },
    parseLiteral(ast) {
        // Parse the value from the client query
        if (ast.kind === Kind.STRING) {
            if (Types.ObjectId.isValid(ast.value)) {
                return new Types.ObjectId(ast.value); // If it's a valid ObjectId string, convert it to ObjectId
            }
            throw new Error('Invalid ObjectId format');
        }
        return null;
    },
});


const dateScalar = new GraphQLScalarType({
    name: 'Date',
    description: 'Custom scalar type for dates',
    parseValue(value) {
        const stringValue = String(value);
        const date = new Date(stringValue);
        if (!isNaN(date.getTime())) {
            return date;
        }
        return null;
    },
    serialize(value) {
        if (value instanceof Date) {
            return value.toISOString();
        }
        throw new Error('Invalid Date instance');
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
            return new Date(ast.value);
        }
        return null; // Invalid input
    },
});




export const scalarTypeResolver: Resolvers = {
    Upload: GraphQLUpload,
    ObjectId: ObjectIdScalar,
    Date: dateScalar
};

