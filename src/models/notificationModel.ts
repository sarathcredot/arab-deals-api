
import {Schema,model} from "mongoose"
import {collections} from "../configs"



const notificationSchema=new Schema({

    message:{
        type:String,
     },
     title:{
      type:String,
     },
     permissions:{
        type:[String],
        enum:[ "dashboard","users","vendors","delivery-boys","settlement","kyc","coupons","product","brands","category","assign-attribute","attributes","orders","shipping-orders","return-orders","refund-orders","cmslisting","settings" ]
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
