import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { vendorModel } from '../models';
import { collections } from "../configs";

export interface FileData {
  _id?: string,
  fileType?: string,
  fileURL?: string,
  mimeType?: string,
  originalName?: string,
  createdAt?: string
}

export interface MobileOtpData {
  code?: string
  expiresAt?: string
}

export interface IVendor {
  _id?: string;
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  profilePic?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  isBlocked?: boolean;
  isKycCompleted?: boolean;
  brands?: Types.ObjectId[],
  categories?: Types.ObjectId[],
}

export interface IVendorDocument extends Document {
  _id?: Types.ObjectId;
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  profilePic?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  isBlocked?: boolean;
  isKycCompleted?: boolean;
  brands?: Types.ObjectId[],
  categories?: Types.ObjectId[],
  token?: string,

}

export interface IVendorLoginResponse {
  _id: string;
  token: string;
}

export interface IVendorProjection {
  _id?: 1;
  fullName?: 1;
  email?: 1;
  mobileNumber?: 1;
  isBlocked?: 1;
  isKycCompleted?: 1;
  brands?: 1,
  categories?: 1,
  "profilePic._id"?: 1;
  "profilePic.fileType"?: 1;
  "profilePic.fileURL"?: 1;
  "profilePic.mimeType"?: 1;
  "profilePic.originalName"?: 1;
  "profilePic.createdAt"?: 1;
}

export interface IVendorWithKycData {
  _id?: string;
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  isBlocked?: string;
  isKycCompleted?: boolean;
  outletId?: string;
  outletName?: string;
  outletStatus?: string;
  companyId?: string;
  companyName?: string;
  companyStatus?: string
}

export interface IVendorWithKycDetails {
  _id?: string;
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  isBlocked?: string;
  isKycCompleted?: boolean;
  outletId?: string;
  outletName?: string;
  outletStatus?: string;
  companyId?: string;
  companyName?: string;
  companyStatus?: string
  brands?: Types.ObjectId[],
  categories?: Types.ObjectId[],
  profilePic?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
}

export interface IVendorRecordsResponse {
  records: Array<IVendorWithKycData>,
  maxRecords: number
}


export interface IVendorsRecordsOptions {
  page: number,
  size: number,
  isKycCompleted: boolean,
}


export interface IVendorsRecordsResponse {
  records: Array<IVendor>,
  maxRecords: number
}

// export interface IVendorsWithKycRecordsResponse {
//   records: Array<IVendorKYCData>,
//   maxRecords: number
// }

export const createVendor = async (vendorData: IVendor): Promise<IVendorDocument | null> => {
  let vendor: IVendorDocument = new vendorModel(vendorData);
  // await vendor.setHash!(password);
  return await vendor.save();
};


export const findOneAndUpdatevendor = async (filters: FilterQuery<IVendor>, update: UpdateQuery<IVendor>, options: QueryOptions): Promise<Document | null> => {
  return await vendorModel.findOneAndUpdate(filters, update, options);
}

export const findVendorWithFilters = async (filters: FilterQuery<IVendor>, projection: ProjectionFields<IVendor>, options: QueryOptions): Promise<IVendorDocument | null> => {
  return await vendorModel.findOne(filters, projection, options);
}


export const loginVendor = (vendor: IVendorDocument): IVendorLoginResponse => {
  return {
    _id: vendor._id?.toString() || "",
    token: vendor.token || "",
  }
}

// export const getVendorsRecordsWithFilters = async (options: IVendorsRecordsOptions): Promise<IVendorsRecordsResponse> => {

//   console.log("options: ", options)
//   let pipeline: PipelineStage[] = [];

//   pipeline.push(
//     {
//       $match: {
//         isBlocked: false
//       }
//     },
//     {
//       $sort: { _id: -1 }
//     },
//     {
//       $facet: {
//         metadata: [
//           {
//             $group: {
//               _id: null,
//               total: { $sum: 1 }
//             }
//           }
//         ],
//         data: [
//           {
//             $skip: options.page * options.size
//           },
//           {
//             $limit: options.size
//           },
//           {
//             $project: options.projection
//           }
//         ]
//       }
//     },
//     {
//       $project: {
//         maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
//         data: 1
//       }
//     }
//   );

//   const result = await vendorModel.aggregate(pipeline);
//   console.log(result)
//   let response = {
//     records: [],
//     maxRecords: 0
//   };
//   if (result.length) {
//     response.records = result[0].data || [];
//     response.maxRecords = result[0].maxRecords || 0;
//   }

//   return response;
// }

export const getvendorRecordWithId = async (id: Types.ObjectId): Promise<IVendorDocument | null> => {
  const result = await vendorModel.findById(id);
  return result;
}

export const getVendorRecordByAdminWithId = async (vendorId: Types.ObjectId): Promise<IVendorWithKycDetails> => {
  let pipeline: PipelineStage[] = [
    {
      $match: {
        _id: new Types.ObjectId(vendorId)
      }
    },
    {
      $lookup: {
        from: collections.VENDOR_OUTLETS,
        localField: '_id',
        foreignField: 'vendorId',
        as: 'outlet'
      }
    },
    {
      $unwind: {
        path: '$outlet',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: collections.VENDOR_COMPANIES,
        localField: '_id',
        foreignField: 'vendorId',
        as: 'company'
      }
    },
    {
      $unwind: {
        path: '$company',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        fullName: 1,
        email: 1,
        mobileNumber: 1,
        isBlocked: 1,
        isKycCompleted: 1,
        brands: 1,
        categories: 1,
        companyId: '$company._id',
        companyName: '$company.companyName',
        companyStatus: '$company.status',
        outletId: '$outlet._id',
        outletName: '$outlet.outletName',
        outletStatus: '$outlet.status',
        "profilePic._id": 1,
        "profilePic.fileType": 1,
        "profilePic.fileURL": 1,
        "profilePic.mimeType": 1,
        "profilePic.originalName": 1,
        "profilePic.createdAt": 1,
      }
    }
  ];

  const result = await vendorModel.aggregate(pipeline);
  return result[0];
};

export const getVendorRecordByVendorWithId = async (vendorId: Types.ObjectId): Promise<IVendorWithKycDetails> => {
  let pipeline: PipelineStage[] = [
    {
      $match: {
        _id: new Types.ObjectId(vendorId)
      }
    },
    {
      $lookup: {
        from: collections.VENDOR_OUTLETS,
        localField: '_id',
        foreignField: 'vendorId',
        as: 'outlet'
      }
    },
    {
      $unwind: {
        path: '$outlet',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: collections.VENDOR_COMPANIES,
        localField: '_id',
        foreignField: 'vendorId',
        as: 'company'
      }
    },
    {
      $unwind: {
        path: '$company',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        fullName: 1,
        email: 1,
        mobileNumber: 1,
        isBlocked: 1,
        isKycCompleted: 1,
        companyId: '$company._id',
        companyName: '$company.companyName',
        companyStatus: '$company.status',
        outletId: '$outlet._id',
        outletName: '$outlet.outletName',
        outletStatus: '$outlet.status'
      }
    }
  ];

  const result = await vendorModel.aggregate(pipeline);
  return result[0];
};

export const getVendorRecordKycStatusById = async (vendorId: Types.ObjectId): Promise<IVendorWithKycDetails> => {
  let pipeline: PipelineStage[] = [
    {
      $match: {
        _id: new Types.ObjectId(vendorId)
      }
    },
    {
      $lookup: {
        from: collections.VENDOR_OUTLETS,
        localField: '_id',
        foreignField: 'vendorId',
        as: 'outlet'
      }
    },
    {
      $unwind: {
        path: '$outlet',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: collections.VENDOR_COMPANIES,
        localField: '_id',
        foreignField: 'vendorId',
        as: 'company'
      }
    },
    {
      $unwind: {
        path: '$company',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        isBlocked: 1,
        isKycCompleted: 1,
        companyStatus: '$company.status',
        outletStatus: '$outlet.status'
      }
    }
  ];

  const result = await vendorModel.aggregate(pipeline);
  return result[0];
};

export const getVendorRecordsWithFilters = async (options: IVendorsRecordsOptions): Promise<IVendorRecordsResponse> => {
  let pipeline: PipelineStage[] = [
    {
      $match: {
        isKycCompleted: options.isKycCompleted
      }
    },
    {
      $sort: { _id: -1 }
    },
    {
      $lookup: {
        from: collections.VENDOR_OUTLETS,
        localField: '_id',
        foreignField: 'vendorId',
        as: 'outlet'
      }
    },
    {
      $unwind: {
        path: '$outlet',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: collections.VENDOR_COMPANIES,
        localField: '_id',
        foreignField: 'vendorId',
        as: 'company'
      }
    },
    {
      $unwind: {
        path: '$company',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $facet: {
        metadata: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 }
            }
          }
        ],
        data: [
          {
            $skip: options.page * options.size
          },
          {
            $limit: options.size
          },
          {
            $project: {
              _id: 1,
              fullName: 1,
              email: 1,
              mobileNumber: 1,
              isBlocked: 1,
              isKycCompleted: 1,
              companyId: '$company._id',
              companyName: '$company.companyName',
              companyStatus: '$company.status',
              outletId: '$outlet._id',
              outletName: '$outlet.outletName',
              outletStatus: '$outlet.status'
            }
          }
        ]
      }
    },
    {
      $project: {
        maxRecords: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
        data: 1
      }
    }
  ];

  const result = await vendorModel.aggregate(pipeline);

  let response = {
    records: [],
    maxRecords: 0
  };

  if (result.length) {
    response.records = result[0].data || [];
    response.maxRecords = result[0].maxRecords || 0;
  }

  return response;

};



// export const getCategorizedKYCs = async (options: QueryOptions): Promise<IVendorsWithKycRecordsResponse> => {

//   let inputStatus = options.status;
//   let checkStatus = {};
//   if (inputStatus === "DEFAULT") {
//     checkStatus = {}
//   } else if (inputStatus === "COMPLETED") {
//     checkStatus = {
//       $and: [
//         { 'companyDetails.status': inputStatus },
//         { 'businessOutlet.status': inputStatus },
//         { 'sellingProduct.status': inputStatus }
//       ]
//     }
//   } else {
//     checkStatus = {
//       $or: [
//         { 'companyDetails.status': inputStatus },
//         { 'businessOutlet.status': inputStatus },
//         { 'sellingProduct.status': inputStatus }
//       ]
//     }
//   }

//   let pipeline: PipelineStage[] = [];

//   pipeline.push(
//     {
//       $match: checkStatus,
//     },
//     {
//       $lookup: {
//         from: collections.VENDORS,
//         localField: 'vendorId',
//         foreignField: '_id',
//         as: 'vendor'
//       }
//     },
//     {
//       $unwind: '$vendor'
//     },
//     {
//       $project: {
//         _id: 1,
//         vendorId: '$vendor._id',
//         email: '$vendor.email',
//         fullName: '$vendor.fullName',
//         mobileNumber: '$vendor.mobileNumber',
//         country: '$vendor.country',
//         brand: '$vendor.brand',
//         isBlocked: '$vendor.isBlocked',
//         companyName: '$vendor.companyName',
//         kycStatus: {
//           $cond: {
//             if: '$isKycCompleted',
//             then: 'COMPLETED',
//             else: 'PENDING'
//           }
//         },
//         companyStatus: '$companyDetails.status',
//         businessOutletStatus: '$businessOutlet.status',
//         sellingProductStatus: '$sellingProduct.status'
//       }
//     },
//     {
//       $facet: {
//         metadata: [
//           {
//             $group: {
//               _id: null,
//               total: { $sum: 1 }
//             }
//           }
//         ],
//         data: [
//           {
//             $skip: options.page * options.size
//           },
//           {
//             $limit: options.size
//           }
//         ]
//       }
//     },
//     {
//       $project: {
//         maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
//         data: 1
//       }
//     }
//   );

//   const result = await vendorKycModel.aggregate(pipeline);

//   let response = {
//     records: [],
//     maxRecords: 0
//   };
//   if (result.length) {
//     response.records = result[0].data || [];
//     response.maxRecords = result[0].maxRecords || 0;
//   }

//   return response;
// };








