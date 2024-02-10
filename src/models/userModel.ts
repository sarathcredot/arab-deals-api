import { Schema, model } from "mongoose";
import { collections } from "../configs";
import argon2 from "argon2";

const userSchema = new Schema(
  {

    email: {
      type: String,
      trim: true,
      lowercase: true,
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
    mobileNumber: {
      type: String,
      unique: true,
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


const userModel = model(collections.USERS, userSchema);

export { userModel };
