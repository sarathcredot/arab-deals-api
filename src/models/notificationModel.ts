


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

        type:String,
        enum: ["low_stock", "out_of_stock", "new_order", "return_order"],
      },
      view:{
        type:[Schema.ObjectId]
      }
    },
    {
        timestamps:true
    }
)

const notificationModel=model(collections.NOTIFICATION,notificationSchema);

export {notificationModel}
