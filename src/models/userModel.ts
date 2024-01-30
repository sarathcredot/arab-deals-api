import { Schema, model } from "mongoose";
import { collections } from "../configs";
import argon2 from "argon2";

const userSchema = new Schema(
  {

    email: {
      type: String,
      trim: true,
      unique: true,
      // required: true,
      lowercase: true,
    },
    firstName: {
      type: String,
      // required: true
    },
    lastName: {
      type: String,
      // required: true
    },
    displayName: {
      type: String,
      // required: true
    },
    address: {
      type: String,
      // required: true
    },
    countryCode: {
      type: String,
      // required: true,
    },
    mobileNumber: {
      type: String,
      // required: true,
      unique: true,
    },
    hash: {
      type: String,
      // required: true,
    },
    // profilePic: fileSchema,
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

userSchema.index({ mobileNumber: "text" });

userSchema.methods.setHash = async function (password: string): Promise<void> {
  try {
    this.hash = await argon2.hash(password);
  } catch (error) {
    return Promise.reject(error);
  }
}

userSchema.methods.verifyHash = async function (password: string): Promise<boolean> {
  try {
    return await argon2.verify(this.hash, password);
  } catch (error) {
    return Promise.reject(error);
  }
}

const userModel = model(collections.USERS, userSchema);

export { userModel };
