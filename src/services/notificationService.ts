import { notificationModel } from "../models/notificationModel";
import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator, } from "mongoose";

export interface INotification {
    message: string;
    permissions: string[];
    orderId?: string;
    productId?: Types.ObjectId;
    type: string;
    title: string;
}


export const createNotification = async (record: INotification): Promise<any> => {
    return await notificationModel.create(record);   
}



export const addNotificationViewPersonId = async ({ notificationId, id }: { notificationId: Types.ObjectId, id: Types.ObjectId }) => {

    return new Promise(async (resolve, reject) => {

        try {

            const data = {

                id,
                remove: false
            }

            const viewExit = await notificationModel.findOne({ _id: notificationId, "view.id": id })

            if (viewExit) {

                console.log("view exit")
                resolve(true)

            } else {

                await notificationModel.findByIdAndUpdate({ _id: notificationId }, {

                    $push: {
                        
                        view: data
                    }
                })
                resolve(true)

            }





        } catch (error) {

            reject()
        }
    })
}


export const getAllNotification = async (): Promise<any> => {


    return new Promise(async (resolve, reject) => {


        try {


            const result = await notificationModel.find()
            .sort({createdAt:-1})

            resolve(result)


        } catch (error) {

            reject()
        }
    })

}



export const addRemoveMarkNotification = async ({ notificationId, userId }: { notificationId: Types.ObjectId, userId: Types.ObjectId }): Promise<any> => {


    return new Promise(async (resolve, reject) => {

        try {


            await notificationModel.findOneAndUpdate({ _id: new Types.ObjectId(notificationId), "view.id": new Types.ObjectId(userId) }, {

                $set: {

                    "view.$.remove": true
                }
            })

            resolve(true)



        } catch (error: any) {

            console.log("err", error.message)

            reject()
        }
    })
}

