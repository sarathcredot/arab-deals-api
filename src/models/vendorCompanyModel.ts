import { Schema, model } from "mongoose";
import { collections } from "../configs";

const fileSchema = new Schema(
  {
    fileType: {
      type: String,
      enum: ["PRIVATE"],
      default: "PRIVATE",
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

const companySchema = new Schema(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: collections.VENDORS,
      unique: true
    },
    companyName: {
      type: String,
    },
    companyType: {
      type: String,
    },
    crNumber: {
      type: String
    },
    crLicense: {
      type: fileSchema
    },
    cooCertificate: {  // Chamber of commerce
      type: fileSchema
    },
    status: {
      type: String,
      required: true,
      index: true,
      enum: ["PENDING", "UNDER_VERIFICATION", "COMPLETED", "REJECTED"],
      default: "PENDING"
    },
    remarks: {
      type: [String],
      default: []
    },
  },
  {
    _id: true,
    timestamps: true
  }
)


const vendorCompanyModel = model(collections.VENDOR_COMPANIES, companySchema);

export { vendorCompanyModel };



