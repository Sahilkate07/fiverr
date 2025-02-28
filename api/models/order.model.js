import mongoose from "mongoose";
const { Schema } = mongoose;

const OrderSchema = new Schema(
  {
    gigId: {
      type: Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    img: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['Processing', 'Completed', 'Cancelled'],
      default: 'Processing'
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", OrderSchema);
