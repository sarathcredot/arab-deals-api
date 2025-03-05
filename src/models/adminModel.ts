import { Schema, model } from "mongoose";
import { collections } from "../configs";
import argon2 from "argon2";

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


const adminSchema = new Schema(
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
    profilePic: fileSchema,
    hash: {
      type: String,
      required: true,
    },
    accType: {
      type: String,
      enum: ['SUPER_ADMIN', 'SUB_ADMIN'],
      required: true,
    },
    role:[{
      type: Schema.Types.ObjectId,
      ref: collections.ROLES
    }],
    createdBy:{
      type: Schema.Types.ObjectId
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
    },
  },

  {
    _id: true,
    timestamps: true
  }
)

adminSchema.methods.setHash = async function (password: string): Promise<void> {
  try {
    this.hash = await argon2.hash(password);
  } catch (error) {
    return Promise.reject(error);
  }
}

adminSchema.methods.verifyHash = async function (password: string): Promise<boolean> {
  try {
    return await argon2.verify(this.hash, password);
  } catch (error) {
    return Promise.reject(error);
  }
}

const adminModel = model(collections.ADMINS, adminSchema);

export { adminModel };
