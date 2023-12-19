import { Schema, model } from "mongoose";
import argon2 from "argon2";
import { collections } from "../configs";
// import axios from "axios";


const mobileOtp = new Schema(
    {
        code: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: String,
            required: true,
        },
    },
    {
        _id: true,
        timestamps: true
    }
);

const fileSchema = new Schema(
    {
        fileType: {
            type: String,
            enum: ["PRIVATE", "PUBLIC"],
            default: "PUBLIC",
            required: true
        },
        fileURL: {
            type: String,
            required: true
        },
        mimeType: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        }
    },
    {
        _id: true,
        timestamps: true
    }
);

const vendorSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            required: true,
            lowercase: true,
        },
        mobileNumber: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        brand: {
            type: String,
        },
        profilePic: fileSchema,
        hash: {
            type: String,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        token: {
            type: String,
        },
        companyName: {
            type: String,
        },
        businessOutletName: {
            type: String,
        },
        crNumber: {
            type: String,
        },
        crLicence: {
            type: String,
        },
        businessLicence: {
            type: String,
        },
        chamberOfCommerceCertificate: {
            type: String,
        },
        companyType: {
            type: String,
        },
        businessAddress: {
            type: String,
        },
        contactPerson: {
            name: {
                type: String,
            },
            phoneNumber: {
                type: String,
            },
            designation: {
                type: String,
            },
        },
        exteriorImage: fileSchema,
        interiorImage: fileSchema,
        sellingProductDetails: {
            type: String,
        },
        sellingProductBrands: {
            type: String,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

vendorSchema.methods.setHash = async function (password: string): Promise<void> {
    try {
        this.hash = await argon2.hash(password);
    } catch (error) {
        return Promise.reject(error);
    }
};

vendorSchema.methods.verifyHash = async function (password: string): Promise<boolean> {
    try {
        return await argon2.verify(this.hash, password);
    } catch (error) {
        return Promise.reject(error);
    }
};


vendorSchema.methods.setMobileOtp = async function (password: string): Promise<void> {
    try {
        this.mobileOtp = await argon2.hash(password);
    } catch (error) {
        return Promise.reject(error);
    }
}

// vendorSchema.methods.sendMobileOtp = async function (mobileNumber: string, otp: string): Promise<void> {

//     const smsEndpoint = "https://your-sms-service-api/send";

//     try {
//       // Make an HTTP POST request to the SMS service API
//       const response = await axios.post(smsEndpoint, {
//         to: mobileNumber,
//         message: `Your OTP is: ${otp}`,
//       });

//       if (response.status === 200) {
//         console.log(`SMS sent successfully to ${mobileNumber}`);
//       } else {
//         console.error(`Failed to send SMS. Status: ${response.status}`);
//       }
//     } catch (error) {
//     //   console.error(`Error sending SMS: ${error.message}`);
//       throw error;
//     }
//   },

vendorSchema.methods.verifyMobileOtp = async function (otp: string): Promise<boolean> {
    try {
        return await argon2.verify(this.mobileOtp, otp);
    } catch (error) {
        return Promise.reject(error);
    }
}


const vendorModel = model(collections.VENDORS, vendorSchema);

export { vendorModel };
