import { Schema, model } from "mongoose";
import { collections } from "../configs";

const userShippingAddressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: collections.USERS,
    },
    firstname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: "Kuwait",
    },
    houseNumber: {
      type: String,
      // required: true,
      default:""
    },
    streetName: {
      type: String,
      // required: true,
      default:""
    },
    apartment: {
      type: String,
      default:""
    },
    suite: {
      type: String,
      default:""
    },
    unit: {
      type: String,
      default:""
    },
    city: {
      type: String,
      // required: true,
      default:""
    },
    postCode: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      required: true,
      default: false,
    },
    governorate: {
      type: String,
      required: true,
    },
    village: {
      type: String,
      required: true,
    },
    governorateID: {
      type: String,
      required: true,
    },
    villageID: {
      type: String,
      required: true,
    },
    address:{
       
        type:String,
        require:true
    },
    label:{
      type:String,
      require:true
    }
  },
  {
    _id: true,
    timestamps: true,
  }
);

const userShippingAddressModel = model(
  collections.USER_SHIPPING_ADDRESS,
  userShippingAddressSchema
);

export { userShippingAddressModel };
