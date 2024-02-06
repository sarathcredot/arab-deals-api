import { userShippingAddressModel } from "../models";
import { Types, Document, QueryOptions, PipelineStage, ProjectionFields, FilterQuery, UpdateQuery, AnyObject } from "mongoose";



export interface IShippingAddress {
    _id?: Types.ObjectId;
    userId?: Types.ObjectId;
    firstname?: string;
    email?: string;
    mobile?: string;
    country?: string;
    houseNumber?: string;
    streetName?: string;
    apartment?: string;
    suite?: string;
    unit?: string;
    city?: string;
    postCode?: string;
    companyName?: string;
    vatNumber?: string;
    isDefault?: boolean;
}


export interface IShippingAddressDocument extends Document {
    _id?: Types.ObjectId;
    userId?: Types.ObjectId;
    firstname?: string;
    email?: string;
    mobile?: string;
    country?: string;
    houseNumber?: string;
    streetName?: string;
    apartment?: string;
    suite?: string;
    unit?: string;
    city?: string;
    postCode?: string;
    isDefault?: boolean;
    companyName?: string;
    vatNumber?: string;
}





export const createShippingAddress = async (record: IShippingAddress): Promise<IShippingAddressDocument> => {
    return await userShippingAddressModel.create(record);
}

export const getShippingAddressWithFilters = async (filters: FilterQuery<IShippingAddress> = {}, projection: ProjectionFields<IShippingAddress> = {}, options: QueryOptions = {}): Promise<IShippingAddressDocument | null> => {
    return await userShippingAddressModel.findOne(filters, projection, options);
}

export const getAllShippingAddressWithFilters = async (filters: FilterQuery<IShippingAddress> = {}, projection: ProjectionFields<IShippingAddress> = {}, options: QueryOptions = {}): Promise<IShippingAddressDocument[] | []> => {
    return await userShippingAddressModel.find(filters, projection, options);
}

export const updateShipingAddress = async (_id: Types.ObjectId, updateQuery: UpdateQuery<IShippingAddress>, options: QueryOptions = {}): Promise<IShippingAddressDocument | null> => {
    return await userShippingAddressModel.findByIdAndUpdate(_id, updateQuery, options);
}


