import { Schema, model } from "mongoose";
import { collections } from "../configs";

const fileSchema = new Schema(
  {
    fileType: {
      type: String,
      enum: ["PRIVATE"],
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

const companySchema = new Schema(
  {
    sectionName: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    crNumber: {
      type: String,
      required: true
    },
    crLicence: {
      type: String,
      required: true
    },
    companyProofStatus: {
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
    companyLicenceImage: fileSchema
  },
  {
    _id: true,
    timestamps: true
  }
);

const businessOutletSchema = new Schema(
  {
    sectionName: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    interiorImage: fileSchema,
    exteriorImage: fileSchema,
    businessOutletProofStatus: {
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
);

const sellingProductSchema = new Schema(
  {
    sectionName: {
      type: String,
      required: true
    },
    discribtion: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    sellingProductProofStatus: {
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
    sellingProductImage: fileSchema,
  },
  {
    _id: true,
    timestamps: true
  }
);


const KYCSchema = new Schema(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: collections.VENDORS,
      index: true
  },
    companyDetails: companySchema,
    businessOutlet: businessOutletSchema,
    sellingProduct: sellingProductSchema
  },
  
  {
    _id: true,
    timestamps: true
  }
)


const KYCModel = model(collections.ADMINS, KYCSchema);

export { KYCModel };
