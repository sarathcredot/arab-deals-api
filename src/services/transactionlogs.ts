
import {Types} from "mongoose"
import {settlementModel,deliveryAgentModel}from "../models"


type TransactionDataType={

    agentId:Types.ObjectId
    amount:number
    remarks?:string
    orderId:Types.ObjectId
    
}

export const orderDeliverytimeTransactionLogs=async(data:TransactionDataType)=>{

          return new Promise(async(resolve,reject)=>{

                   try {
  
                     // find delivery agent details

                     const deliveryAgent:any=await deliveryAgentModel.findById({_id:data.agentId})

                       // find delivery agent total ammount in hand 
                      let deliveryAgentCashinHand=deliveryAgent.wallet.cashInHand 

                      deliveryAgentCashinHand=parseFloat(deliveryAgentCashinHand)

                      const balanceAmout=deliveryAgentCashinHand+data.amount

                      const obj={

                        type:"COLLECTED",
                        agentId:data.agentId,
                        amount:data.amount,
                        totalAmount:deliveryAgentCashinHand,
                        balance:deliveryAgentCashinHand+balanceAmout,
                        orderId:data.orderId,
                        remarks:data.remarks

                        
                    }

                    const final =new settlementModel(obj)
                  const res=await final.save()

                  if(res){
                      
                      await deliveryAgentModel.findByIdAndUpdate({_id:data.agentId},{

                           $push:{
                              
                             settlementHistory:res._id
                           }
                      })

                      resolve({flag:true})
                  }

                   
                             
                    
                   } catch (error) {
                    
                         reject()
                   }
          })
}