

import { PipelineStage, FilterQuery, ProjectionFields, QueryOptions, Document, Types, Model, UpdateQuery, BooleanExpressionOperator } from "mongoose";
import { deliveryAgentModel } from '../models'
import { collections } from "../configs";

export interface IDeliveryAgent {
  _id?: Types.ObjectId;
  fullName: string;
  contactNumber: string;
  userID: string;
  password: string;
  agentType: string;
  isActive: Boolean;
  vendorID?: Types.ObjectId;
}

type Editrespo = {

  flag: boolean
}


// all delivery agent details find 
export const viewAllDeliveryAgents = async (): Promise<IDeliveryAgent[] | []> => {

  return new Promise(async (resolve, reject) => {

    try {

      const allData = await deliveryAgentModel.find()

      resolve(allData)

    } catch (error) {

      reject()
    }

  })

}



// delivery agent data edit 

export const editAgentData = async (data: any): Promise<Editrespo> => {


  return new Promise(async (resolve, reject) => {

    try {

      await deliveryAgentModel.findByIdAndUpdate({ _id: data._id }, {

        $set: {

          fullName: data.fullName,
          contactNumber: data.contactNumber,
          userID: data.userID,
          vendorID: data.vendorID,
          agentType: data.agentType,
        }
      })

      resolve({ flag: true })

    } catch (error) {


      reject({ flag: false })
    }
  })
}
