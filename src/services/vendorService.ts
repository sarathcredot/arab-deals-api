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
  countryCode?: string;
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
  countryCode?: string;
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
  countryCode?: 1,
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
  countryCode?: string;
  mobileNumber?: string;
  isBlocked?: string;
  brands?: Types.ObjectId[];
  categories?: Types.ObjectId[];
  isKycCompleted?: boolean;
  profilePic?: {
    _id?: string;
    fileType?: string;
    fileURL?: string;
    mimeType?: string;
    originalName?: string;
    createdAt?: number;
  };
  companyId?: string;
  companyName?: string;
  companyStatus?: string;
  companyType?: string; // Assuming this field exists in your data
  companyCrNumber?: string; // Assuming this field exists in your data
  companyCrLicense?: {
    _id?: string;
    fileType?: string;
    fileURL?: string;
    mimeType?: string;
    originalName?: string;
    createdAt?: number;
  };
  CompanyCooCertificate?: {
    _id?: string;
    fileType?: string;
    fileURL?: string;
    mimeType?: string;
    originalName?: string;
    createdAt?: number;
  };
  companyRemarks?: [string]; 
  outletId?: string;
  outletName?: string;
  outletStatus?: string;
  outletCountry?: string; 
  outletDistrict?: string; 
  outletVillage?: string; 
  outletAddress?: string; 
  outletLicense?: {
    _id?: string;
    fileType?: string;
    fileURL?: string;
    mimeType?: string;
    originalName?: string;
    createdAt?: number;
  };
  interiorImage?: {
    _id?: string;
    fileType?: string;
    fileURL?: string;
    mimeType?: string;
    originalName?: string;
    createdAt?: number;
  };
  exteriorImage?: {
    _id?: string;
    fileType?: string;
    fileURL?: string;
    mimeType?: string;
    originalName?: string;
    createdAt?: number;
  };
  outletContactPersonName?: string;
  outletContactPersonNumber?: string;
  outletContactPersonDesignation?: string;
  outletRemarks?: [string];
}


export interface IVendorRecordsResponse {
  records: Array<IVendorWithKycData>,
  maxRecords: number
}


export interface IVendorsRecordsByAdminOptions {
  page: number,
  size: number,
  isKycCompleted: boolean | null,
}

export interface IVendorsRecordsByVendorOptions {
  page: number,
  size: number,
  isKycCompleted: boolean | null,
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

export const getVendorAllKycRecordByVendorWithId = async (vendorId: Types.ObjectId): Promise<IVendorWithKycDetails> => {
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
        brands: 1,
        categories: 1,
        isKycCompleted: 1,
        "profilePic._id": 1,
        "profilePic.fileType": 1,
        "profilePic.fileURL": 1,
        "profilePic.mimeType": 1,
        "profilePic.originalName": 1,
        "profilePic.createdAt": 1,
        companyId: '$company._id',
        companyName: '$company.companyName',
        companyType: '$company.companyType',
        companyCrNumber: '$company.crNumber',
        "companyCrLicense._id": "$company.crLicense._id",
        "companyCrLicense.fileType": "$company.crLicense.fileType",
        "companyCrLicense.fileURL": "$company.crLicense.fileURL",
        "companyCrLicense.mimeType": "$company.crLicense.mimeType",
        "companyCrLicense.originalName": "$company.crLicense.originalName",
        "companyCrLicense.createdAt": "$company.crLicense.createdAt",
        "companyCooCertificate._id": "$company.cooCertificate._id",
        "companyCooCertificate.fileType": "$company.cooCertificate.fileType",
        "companyCooCertificate.fileURL": "$company.cooCertificate.fileURL",
        "companyCooCertificate.mimeType": "$company.cooCertificate.mimeType",
        "companyCooCertificate.originalName": "$company.cooCertificate.originalName",
        "companyCooCertificate.createdAt": "$company.cooCertificate.createdAt",
        companyStatus: '$company.status',
        companyRemarks: '$company.remark',
        outletId: '$outlet._id',
        outletName: '$outlet.outletName',
        outletCountry: '$outlet.country',
        outletDistrict: '$outlet.district',
        outletVillage: '$outlet.village',
        outletAddress: '$outlet.address',
        "outletLicense._id": "$outlet.outletLicense._id",
        "outletLicense.fileType": "$outlet.outletLicense.fileType",
        "outletLicense.fileURL": "$outlet.outletLicense.fileURL",
        "outletLicense.mimeType": "$outlet.outletLicense.mimeType",
        "outletLicense.originalName": "$outlet.outletLicense.originalName",
        "outletLicense.createdAt": "$outlet.outletLicense.createdAt",
        "outletInteriorImage._id": "$outlet.outletInteriorImage._id",
        "outletInteriorImage.fileType": "$outlet.interiorImage.fileType",
        "outletInteriorImage.fileURL": "$outlet.interiorImage.fileURL",
        "outletInteriorImage.mimeType": "$outlet.interiorImage.mimeType",
        "outletInteriorImage.originalName": "$outlet.interiorImage.originalName",
        "outletInteriorImage.createdAt": "$outlet.interiorImage.createdAt",
        "outletExteriorImage._id": "$outlet.exteriorImage._id",
        "outletExteriorImage.fileType": "$outlet.exteriorImage.fileType",
        "outletExteriorImage.fileURL": "$outlet.exteriorImage.fileURL",
        "outletExteriorImage.mimeType": "$outlet.exteriorImage.mimeType",
        "outletExteriorImage.originalName": "$outlet.exteriorImage.originalName",
        "outletExteriorImage.createdAt": "$outlet.exteriorImage.createdAt",
        outletContactPersonName: '$outlet.contactPersonName',
        outletContactPersonNumber: '$outlet.contactPersonNumber',
        outletContactPersonDesignation: '$outlet.contactPersonDesignation',
        outletStatus: '$outlet.status',
        outletRemarks: '$outlet.remark',
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

export const getVendorRecordsByAdminWithFilters = async (options: IVendorsRecordsByAdminOptions): Promise<IVendorRecordsResponse> => {


  let pipeline: PipelineStage[] = [];

  if (options.isKycCompleted != null) {
    pipeline.push({
      $match: {
        isKycCompleted: options.isKycCompleted  // filter with status
      }
    });
  }

  pipeline.push(

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
  );

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


export const getVendorRecordsByVendorWithFilters = async (options: IVendorsRecordsByVendorOptions): Promise<IVendorRecordsResponse> => {

  let pipeline: PipelineStage[] = [];

  if (options.isKycCompleted != null) {
    pipeline.push({
      $match: {
        isKycCompleted: options.isKycCompleted  // filter with status
      }
    });
  }

  pipeline.push(

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
  );

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







