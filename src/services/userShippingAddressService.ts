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
    governorate?:string;
    village?:string;
    governorateID?:string;
    villageID?:string;
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
    governorate?:string;
    village?:string;
    governorateID?:string;
    villageID?:string;
    postCode?: string;
    isDefault?: boolean;
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

export const deleteShipingAddress = async (filter: FilterQuery<IShippingAddress>): Promise<IShippingAddressDocument | null> => {
    return await userShippingAddressModel.findOneAndDelete(filter);
};

export const updateManyShippingAddresses = async (filters: FilterQuery<IShippingAddress>, updateQuery: UpdateQuery<IShippingAddress>, options: QueryOptions = {}): Promise<any> => {
    return await userShippingAddressModel.updateMany(filters, updateQuery, options);
};

export const updateDefaultShipingAddress = async (userId: Types.ObjectId, _id: Types.ObjectId): Promise<void> => {

    let updatePipeline = [
        {
            $set: {
                isDefault: {
                    $cond: [
                        { $eq: ["$_id", _id] },
                        true,
                        false
                    ]
                }
            }
        }
    ]
    await userShippingAddressModel.updateMany({ userId: userId }, updatePipeline);
}

