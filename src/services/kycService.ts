import { UpdateWriteOpResult, FilterQuery, QueryOptions, UpdateQuery, Document, Types, PipelineStage } from 'mongoose';
import { KYCModel } from '../models';
import { collections } from "../configs";

export interface FileData {
  _id?: string,
  fileType?: string,
  fileURL?: string,
  mimeType?: string,
  originalName?: string,
  createdAt?: string
}
export interface ICompanyDetails {
  sectionName?: string;
  name?: string;
  type?: string;
  crNumber?: string;
  crLicence?: string;
  status?: string;
  remarks?: string[];
  companyLicenceImage?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
}

export interface ISellingProduct {
  sectionName?: string;
  discription?: string;
  brand?: string;
  status?: string;
  remarks?: string[];
  sellingProductImage?: FileData[]
}

export interface IBusinessOutlet {
  sectionName?: string;
  name?: string;
  address?: string;
  interiorImage?:  {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  exteriorImage?:  {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  status?: string;
  remarks?: string[];
}
export interface IKYC {
  _id?: string;
  vendorId?: string;
  companyDetails?: ICompanyDetails;
  businessOutlet?: IBusinessOutlet;
  sellingProduct?: ISellingProduct;
  isKycCompleted?: boolean;
}

export interface IKYCDocument extends Document{
  _id?: Types.ObjectId;
  vendorId?: Types.ObjectId;
  companyDetails?: {
    sectionName?: string;
    name?: string;
    type?: string;
    crNumber?: string;
    crLicence?: string;
    status?: string;
    remarks?: string[];
    companyLicenceImage?: {
      fileType?: string,
      fileURL?: string,
      mimeType?: string,
      originalName?: string
    };
  }
  businessOutlet?: IBusinessOutlet;
  sellingProduct?: ISellingProduct;
  isKycCompleted?: boolean;
}

export interface ImageData {
  fileType?: string;
  fileURL?: string;
  mimeType?: string;
  originalName?: string;
}

export interface ISubmitKYCResponse {
  _id: string;
  message: string;
}

export interface IKYCProjection {
  _id?: 1;
  vendorId?: 1;
  companyDetails?: {
    sectionName?: 1;
    name?: 1;
    type?: 1;
    crNumber?: 1;
    crLicence?: 1;
    status?: 1;
    remarks?: 1;
    companyLicenceImage?: {
      fileType?: 1;
      fileURL?: 1;
      mimeType?: 1;
      originalName?: 1;
    };
  };
  businessOutlet?: {
    sectionName?: 1;
    name?: 1;
    address?: 1;
    interiorImage?: {
      fileType?: 1;
      fileURL?: 1;
      mimeType?: 1;
      originalName?: 1;
    };
    exteriorImage?: {
      fileType?: 1;
      fileURL?: 1;
      mimeType?: 1;
      originalName?: 1;
    };
    status?: 1;
    remarks?: 1;
  };
  sellingProduct?: {
    sectionName?: 1;
    discribtion?: 1;
    brand?: 1;
    status?: 1;
    remarks?: 1;
    sellingProductImage?: 1;
  };
  isKycCompleted?: 1;
}

export interface IKycRecordsOptions {
  page: number,
  size: number,
  projection: IKYCProjection
}

export interface IKycRecordsResponse {
  records: Array<IKYC>,
  maxRecords: number
}

export const createKYC = async (kycDataInput: IKYC): Promise<Document | null> => {
  let kycData = new KYCModel(kycDataInput);
  return await kycData.save();
};

export const findOneAndUpdateKYC = async (filters: FilterQuery<IKYC>, update: UpdateQuery<IKYC>, options: QueryOptions): Promise<Document | null> => {
  return await KYCModel.findOneAndUpdate(filters, update, options);
};

export const findKYCWithFilters = async (filters: FilterQuery<IKYC>,projection: IKYCProjection,options: QueryOptions): Promise<IKYCDocument | null> => {
  return await KYCModel.findOne(filters, projection, options);
};

export const getKycRecordWithId = async (id: Types.ObjectId): Promise<Document | null> => {
  const result = await KYCModel.findById(id);
  return result;
}

export const getAllKycRecordsWithFilters = async (options: IKycRecordsOptions): Promise<IKycRecordsResponse> => {


  let pipeline: PipelineStage[] = [];

  pipeline.push(
      {
          $sort: { _id: -1 }
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
                      $project: options.projection
                  }
              ]
          }
      },
      {
          $project: {
              maxRecords: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
              data: 1
          }
      }
  );

  const result = await KYCModel.aggregate(pipeline);
  let response = {
      records: [],
      maxRecords: 0
  };
  if (result.length) {
      response.records = result[0].data || [];
      response.maxRecords = result[0].maxRecords || 0;
  }

  return response;
}
  
export const updateAllRecordsWithIsKycCompleted = async (): Promise<UpdateWriteOpResult> => {
      const conditions = {
        $or: [
          { 'companyDetails.status': 'COMPLETED' },
          { 'businessOutlet.status': 'COMPLETED' },
          { 'sellingProduct.status': 'COMPLETED' }
        ]
      };

      const result = await KYCModel.updateMany(conditions, {
        $set: { isKycCompleted: true }
      });

      console.log(result)

  return result;
}

  
  
  
  
  
  