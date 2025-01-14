import { FilterQuery, PipelineStage, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { orderProductModel, userModel } from '../models';


export interface IUser {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  mobileNumber?: string;
  isBlocked?: boolean;
  token?: string;
  mobileToken?: string;
}

export interface IUserDocument extends Document {
  _id?: Types.ObjectId;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  mobileNumber?: string;
  isBlocked?: boolean;
  isDeleted?: boolean;
  token?: string;
  mobileToken?: string;
}

export interface IGeneralResponse {
  message: string
}

export interface IUsersOptions {
  page: number,
  size: number,
  isBlocked: Boolean | null,
  query: string
}

export interface IUsersResponse {
  records: Array<IUser>,
  maxRecords: number
}

export interface IUsersProjection {
  _id?: 1,
  email: 1,
  firstName: 1,
  lastName: 1,
  displayName: 1,
  mobileNumber: 1,
  isBlocked: 1,

}



export const findUserWithFilters = async (filters: FilterQuery<IUser>, projection: ProjectionFields<IUser>, options: QueryOptions): Promise<IUserDocument | null> => {
  return await userModel.findOne(filters, projection, options);
}


export const createUser = async (userData: IUser): Promise<IUserDocument> => {
  let user: IUserDocument = new userModel(userData);
  return await user.save();
};


export const findOneAndUpdateUser = async (filters: FilterQuery<IUser>, update: UpdateQuery<IUser>, options: QueryOptions): Promise<IGeneralResponse | null> => {
  return await userModel.findOneAndUpdate(filters, update, options);
}


export const getUsersByAdminWithFilters = async (options: IUsersOptions): Promise<IUsersResponse> => {


  let pipeline: PipelineStage[] = [];

  if (options.query) {
    let query = options.query || '';
    const regexQuery = new RegExp(query, 'i');
    pipeline.push(
      { $match: { mobileNumber: { $regex: regexQuery } } }
    );
  }

  if (options.isBlocked != null) {

    pipeline.push(
      {
        $match: {
          isBlocked: options.isBlocked
        }
      }
    )
  }
  pipeline.push(
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
              email: 1,
              firstName: 1,
              lastName: 1,
              displayName: 1,
              mobileNumber: 1,
              isBlocked: 1,
            }
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

  const result = await userModel.aggregate(pipeline);

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


export const logoutUser = async (userId: Types.ObjectId): Promise<IUserDocument | null> => {
  return await userModel.findByIdAndUpdate(userId, { $set: { token: `Token-${Date.now()}` } });
}


export const accountDeleteByUser = async (userId: Types.ObjectId,isDeleted: boolean): Promise<IUserDocument | null> => {
  return await userModel.findByIdAndUpdate(userId, 
    { $set: { isDeleted: isDeleted ,deletedAt: new Date() ,token:""} },
    { new: true }
  );
}

export const updateOrdersByUserId = async (userId: Types.ObjectId,updateStatus:any): Promise<any> => {
      // Define the shipping statuses to filter
  const shippingStatusesToCancel = ["PENDING", "PACKAGE_IN_PROGRESS", "SHIPPED"];
  
  // Update orders that match the user ID and the specified shipping statuses
  return await orderProductModel.updateMany(
    {
      userId,
      shippingStatus: { $in: shippingStatusesToCancel } // Match orders with these shipping statuses
    },
    updateStatus // Set the new status 
  );
}









