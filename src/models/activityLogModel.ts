import { Schema, model } from "mongoose";
import { collections } from "../configs";



const activityLogSchema = new Schema(
    {
        actionType: {
            type: String, 
            enum: ["ORDER", "RETURN", "WARRANTY","PRODUCT"],
            required: true 
            },
        action: { 
            type: String, 
            required: true 
        },
        performedBy: { 
            type: Schema.Types.ObjectId, 
            required: true 
        },
        performedByRole: { 
            type: String, 
            enum: ["SUB_ADMIN", "SUPER_ADMIN","AGENT","USER","VENDOR"], 
            required: true 
        },
        referenceId: {
             type: Schema.Types.ObjectId, 
             required: true 
            }, 
        details: { 
            type: String
         }, 
    },
    {
        timestamps: true
    }
);


const activityLogModel = model(collections.ACTIVITY_LOGS, activityLogSchema);


export {activityLogModel}