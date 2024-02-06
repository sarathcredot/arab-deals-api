import { Schema, model } from "mongoose";
import { collections } from "../configs";
import argon2 from "argon2";

const userSchema = new Schema(
  {

    email: {
      type: String,
      trim: true,
      // unique: true,
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
      required: true,
      default: false,
    },
    token: {
      type: String,
    },
    houseNumber: {
      type: String,
      // required: true,
    },
    streetName: {
      type: String,
      // required: true,
    },
    city: {
      type: String,
      // required: true,
    },
    pincode: {
      type: String,
      // required: true,
    },
    country: {
      type: String,
      // required: true,
    },
  },

  {
    _id: true,
    timestamps: true
  }
)


const userModel = model(collections.USERS, userSchema);

export { userModel };
