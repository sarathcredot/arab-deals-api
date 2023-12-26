import { Schema, model } from "mongoose";
import { collections } from "../configs";


const tempVendorSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        mobileNumber: {
            type: String,
            required: true,
        }, 

    },
    {
        timestamps: true,
    }
);


const tempVendorAuthModel = model(collections.TEMP_VENDOR, tempVendorSchema);

export { tempVendorAuthModel };
