import { notificationModel } from "../models/notificationModel";
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, } from "mongoose";

export interface INotification {
    message: string;
    permissions: string[];
    orderId?: string;
    productId?: Types.ObjectId;
    type: string;
    title:string;
}


export const createNotification = async (record: INotification): Promise<any> => {
    return await notificationModel.create(record);   
}

export const addNotificationViewPersonId=async({notificationId,id}:{notificationId:Types.ObjectId,id:Types.ObjectId})=>{

        return new Promise(async(resolve,reject)=>{

               try {
          
                 await notificationModel.findByIdAndUpdate({_id:notificationId},{

                        $push:{
                            view:id
                        }
                 })
                    resolve(true)
                
               } catch (error) {
                
                   reject()
               }
        })
}


export const getAllNotification=async(): Promise<any> =>{


          return new Promise(async(resolve,reject)=>{

              
                try {
                    

                const result=await notificationModel.find()

             resolve(result)


                } catch (error) {
                    
                    reject()
                }
          })

}

