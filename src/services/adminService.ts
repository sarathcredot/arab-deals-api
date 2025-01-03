import { FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { adminModel, vendorModel ,deliveryAgentConfigModel} from '../models';

export interface FileData {
  _id?: string,
  fileType?: string,
  fileURL?: string,
  mimeType?: string,
  originalName?: string,
  createdAt?: string
}

export interface IAdmin {
  _id?: string;
  email?: string;
  hash?: string,
  accType?: string;
  isBlocked?: boolean;
  fullName?: string;
  profilePic?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
}

export interface IAdminDocument extends Document {
  _id?: Types.ObjectId;
  email?: string;
  hash?: string,
  accType?: string;
  isBlocked?: boolean;
  fullName?: string;
  token?: string;
  profilePic?: {
    fileType?: string,
    fileURL?: string,
    mimeType?: string,
    originalName?: string
  };
  verifyHash?(password: string): Promise<boolean>;
  setHash?(password: string): Promise<void>;

}

export interface IAdminLoginResponse {
  _id: string;
  token: string;
}

export interface IAdminProjection {
  _id?: 1,
  email?: 1,
  hash?: 1,
  accType?: 1,
  isBlocked?: 1,
  fullName?: 1,
  "profilePic._id"?: 1,
  "profilePic.fileType"?: 1,
  "profilePic.fileURL"?: 1,
  "profilePic.mimeType"?: 1,
  "profilePic.originalName"?: 1,
  "profilePic.createdAt"?: 1,
}




export const createAdmin = async (adminData: IAdmin, password: string): Promise<IAdminDocument | null> => {
  let admin: IAdminDocument = new adminModel(adminData);
  await admin.setHash!(password);
  return await admin.save();
};


export const findOneAndUpdateAdmin = async (filters: FilterQuery<IAdmin>, update: UpdateQuery<IAdmin>, options: QueryOptions): Promise<Document | null> => {
  return await adminModel.findOneAndUpdate(filters, update, options);
}

export const findAdminWithFilters = async (filters: FilterQuery<IAdmin>, projection: ProjectionFields<IAdmin>, options: QueryOptions): Promise<IAdminDocument | null> => {
  return await adminModel.findOne(filters, projection, options);
}


export const loginAdmin = (admin: IAdminDocument): IAdminLoginResponse => {
  return {
    _id: admin._id?.toString() || "",
    token: admin.token || "",
  }
}

export const getAdminWithId = async (id: Types.ObjectId, projection: IAdminProjection = {}, options: QueryOptions = {}): Promise<IAdminDocument | null> => {
  const result = await adminModel.findById(id, projection, options);
  return result;
}

export const getAdminRecordWithId = async (id: Types.ObjectId, projection: IAdminProjection = {}, options: QueryOptions = {}): Promise<IAdmin | null> => {
  return await adminModel.findById(id, projection, options);
}

export const logoutAdmin = async (id: Types.ObjectId): Promise<void> => {
  await adminModel.findByIdAndUpdate(id, { $set: { token: `${Date.now()} token` } })
}



export const cretaeDeliveryAgentConfig=async(limit:number):Promise<any>=>{

         return new Promise(async(resolve,reject)=>{

                 try {

                  const options={

                    orderAssignLimit:limit
                  }

                   const final=new deliveryAgentConfigModel(options)
                  await final.save()
                   resolve({})
                  
                 } catch (error) {
                   
                     reject(error)
                 }  
         })
}

export const updateDeliveryAgentConfig=async(data:{deliveryLimit:number,_id:Types.ObjectId,returnLimit:number}):Promise<any>=>{

  return new Promise(async(resolve,reject)=>{

          try {

             
            await deliveryAgentConfigModel.findByIdAndUpdate({_id:data._id},{

                  $set:{
                        orderAssignLimit:data.deliveryLimit,
                        returnOrderAssignLimit:data.returnLimit
                  }
                   
            },{upsert:true})
           
            resolve({})
           
          } catch (error) {
            
              reject(error)
          }  
  })
}


export const getAllDeliveryAgentConfig=async():Promise<any>=>{

  return new Promise(async(resolve,reject)=>{

          try {

             
          const result = await deliveryAgentConfigModel.findOne()
           
            resolve(result)
           
          } catch (error) {
            
              reject(error)
          }  
  })
}









