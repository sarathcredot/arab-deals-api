import { Schema, model } from "mongoose";
import { collections } from "../configs";
import argon2 from "argon2";

const userSchema = new Schema(
  {

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    displayName: {
      type: String,
    },

    countryCode: {

      type: String,
      required: true
    },

    mobileNumber: {
      type: String,
      unique: true,
      required: true
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deleteReason: {
      type: String
    },
    token: {
      type: String,
    },
    mobileToken: {
      type: String
    }
  },
  {
    _id: true,
    timestamps: true
  }
)


const userModel = model(collections.USERS, userSchema);

export { userModel };
