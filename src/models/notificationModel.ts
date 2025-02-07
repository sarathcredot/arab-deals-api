


import {Schema,model} from "mongoose"
import {collections} from "../configs"



const notificationSchema=new Schema({

    message:{
        type:String,
     },
     permissions:{
        type:[String],
        enum:""
     },
     orderId:{
 
          type:String
        
      },
      productId:{

           type:Schema.ObjectId
      },
      type:{

        type:String
      }
    },
    {
        timestamps:true
    }
)

const notificationModel=model(collections.NOTIFICATION,notificationSchema);

export {notificationModel}
