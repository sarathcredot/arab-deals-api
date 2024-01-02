import { vendorOutletModel } from "../models";
import { Types, Document, QueryOptions, FilterQuery, ProjectionFields, PipelineStage } from "mongoose";

export interface FileData {
    _id?: string,
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string,
    createdAt?: string
  }


// export interface IVendorCompany {
//     _id?: string;
//     vendorId?: Types.ObjectId;
//     companyName?: string;
//     companyType?: string;
//     crLicense?: {
//       fileType?: string,
//       fileURL?: string,
//       mimeType?: string,
//       originalName?: string
//     };
//     cooCertificate?: {
//       fileType?: string,
//       fileURL?: string,
//       mimeType?: string,
//       originalName?: string
//     };
//     crNumber?: string,
//     status?: string;
//     remarks?: string[];
// }

export interface IVendorOutlet{
    _id?: string;
    vendorId?: Types.ObjectId;
    outletName?: string;
    country?: string;
    district?: string;
    village?: string;
    address?: string;
    outletLicense?: {
      fileType?: string,
      fileURL?: string,
      mimeType?: string,
      originalName?: string
    };
    interiorImage?: {
      fileType?: string,
      fileURL?: string,
      mimeType?: string,
      originalName?: string
    };
    exteriorImage?: {
      fileType?: string,
      fileURL?: string,
      mimeType?: string,
      originalName?: string
    };
    contactPersonName?: string,
    contactPersonDesignation?: string,
    contactPersonNumber?: string,
    status?: string;
    remarks?: string[];
  }

export interface IVendorOutletDocument extends Document {
    _id?: string,
    vendorId?: Types.ObjectId;
    companyName?: string;
    companyType?: string;
    crLicense?: {
      fileType?: string,
      fileURL?: string,
      mimeType?: string,
      originalName?: string
    };
    cooCertificate?: {
      fileType?: string,
      fileURL?: string,
      mimeType?: string,
      originalName?: string
    };
    crNumber?: string,
    status?: string;
    remarks?: string[];
}

export interface IVendorOutletRecordsProjection {
    _id?: 1;
    vendorId?: 1;
    companyName?: 1;
    companyType?: 1;
    crNumber?: 1,
    status?: 1;
    remarks?: 1;
    "crLicense._id"?: 1,
    "crLicense.fileType"?: 1,
    "crLicense.fileURL"?: 1,
    "crLicense.mimeType"?: 1,
    "crLicense.originalName"?: 1,
    "crLicense.createdAt"?: 1,
    "cooCertificate._id"?: 1,
    "cooCertificate.fileType"?: 1,
    "cooCertificate.fileURL"?: 1,
    "cooCertificate.mimeType"?: 1,
    "cooCertificate.originalName"?: 1,
    "cooCertificate.createdAt"?: 1,
    createdAt?: 1,
    updatedAt?: 1,
}

export interface IVendorCompanyOptions {
    page: number,
    size: number,
    projection: IVendorOutletRecordsProjection
}

export interface IVendorCompanyRecordResponse {
    records: Array<IVendorOutlet>,
    maxRecords: number
}

export const createVendorOutletRecord = async (record: IVendorOutlet): Promise<Document | null> => {
    return await vendorOutletModel.create(record);
}


export const getVendorOutletRecordWithId = async (id: Types.ObjectId): Promise<IVendorOutletDocument | null> => {
    return await vendorOutletModel.findById(id);
}

export const getVendorOutletRecordWithFilters = async (filters = {}, projection: ProjectionFields<IVendorOutlet>, options = {}): Promise<IVendorOutlet | null> => {
    return await vendorOutletModel.findOne(filters, projection, options);
}


export const getVendorOutletRecordWithFilter = async (filters = {}, projection: string = "", options: QueryOptions = {}) => {
    return await vendorOutletModel.find(filters, projection, options);
}

// export const getVendorCompanyRecordsWithFilters = async (options: IVendorCompanyOptions): Promise<IVendorCompanyOptions> => {


//     let pipeline: PipelineStage[] = [];

//     pipeline.push(
//         {
//             $match: {
//                 isBlocked: false
//             }
//         },
//         {
//             $sort: { _id: -1 }
//         },
//         {
//             $facet: {
//                 metadata: [
//                     {
//                         $group: {
//                             _id: null,
//                             total: { $sum: 1 }
//                         }
//                     }
//                 ],
//                 data: [
//                     {
//                         $skip: options.page * options.size
//                     },
//                     {
//                         $limit: options.size
//                     },
//                     {
//                         $project: options.projection
//                     }
//                 ]
//             }
//         },
//         {
//             $project: {
//                 maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
//                 data: 1
//             }
//         }
//     );

//     const result = await vendorOutletModel.aggregate(pipeline);
//     let response = {
//         records: [],
//         maxRecords: 0
//     };
//     if (result.length) {
//         response.records = result[0].data || [];
//         response.maxRecords = result[0].maxRecords || 0;
//     }

//     return response;
// }


export const deleteOutletRecord = async (filter: FilterQuery<IVendorOutlet>): Promise<IVendorOutletDocument | null> => {
    return await vendorOutletModel.findOneAndDelete(filter);
};