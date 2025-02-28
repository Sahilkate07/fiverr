import stripePackage from "stripe";
import Order from "../models/order.model.js";
import Gig from "../models/gig.model.js";
import dotenv from "dotenv";

dotenv.config();

// Ensure STRIPE_SECRET_KEY is defined
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("❌ Stripe secret key is missing in environment variables!");
}

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

/**
 * ✅ Create a Payment Intent
 */
export const intent = async (req, res) => {
  try {
    console.log("🔄 Processing payment for Gig ID:", req.params.id);

    if (!req.userId) {
      return res.status(403).json({ error: "Unauthorized access!" });
    }

    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ error: "Gig not found!" });
    }

    const amount = gig.price * 100; // Convert to cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: { 
        gigId: gig._id.toString(), 
        userId: req.userId.toString(),
        title: gig.title
      },
    });

    console.log("✅ Payment Intent Created:", paymentIntent.id);
    res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      currency: "usd"
    });

  } catch (error) {
    console.error("❌ Stripe Payment Intent Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to create payment intent." });
  }
};

/**
 * ✅ Confirm Payment and Create Order
 */
export const confirm = async (req, res) => {
  try {
    const { gigId, paymentIntentId } = req.body;

    console.log("🔄 Starting order confirmation process:", {
      gigId,
      paymentIntentId,
      userId: req.userId
    });

    // Validate required fields
    if (!req.userId) {
      return res.status(403).json({ error: "Unauthorized access!" });
    }

    if (!gigId || !paymentIntentId) {
      return res.status(400).json({ error: "Missing gigId or paymentIntentId" });
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log("Payment intent status:", paymentIntent.status);
    
    if (!paymentIntent) {
      return res.status(400).json({ error: "Invalid payment intent." });
    }

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ 
        error: `Payment is not successful. Status: ${paymentIntent.status}` 
      });
    }

    // Get gig details
    const gig = await Gig.findById(gigId);
    if (!gig) {
      console.error("❌ Gig not found:", gigId);
      return res.status(404).json({ error: "Gig not found!" });
    }

    // Create or update order using findOneAndUpdate
    const orderData = {
      gigId: gig._id,
      title: gig.title,
      price: gig.price,
      img: gig.cover,
      sellerId: gig.userId,
      buyerId: req.userId,
      paymentIntentId,
      status: "Processing"
    };

    const savedOrder = await Order.findOneAndUpdate(
      { paymentIntentId }, // find by payment intent
      orderData, // update data
      { 
        new: true, // return updated document
        upsert: true, // create if doesn't exist
        setDefaultsOnInsert: true // use schema defaults for new documents
      }
    );

    console.log("✅ Order created/updated successfully:", savedOrder._id);

    res.status(201).json({
      message: "Order confirmed successfully!",
      order: savedOrder
    });

  } catch (error) {
    console.error("❌ Order Confirmation Error:", error);
    res.status(500).json({
      error: "Failed to confirm order.",
      details: error.message,
      code: error.code
    });
  }
};

/**
 * ✅ Get User Orders
 */
export const getOrders = async (req, res) => {
  try {
    console.log("🔍 Fetching orders for User ID:", req.userId);

    if (!req.userId) {
      return res.status(403).json({ error: "Unauthorized access!" });
    }

    const filter = req.isSeller
      ? { sellerId: req.userId }
      : { buyerId: req.userId };

    const orders = await Order.find(filter)
      .populate("gigId")
      .populate("sellerId", "username email")
      .populate("buyerId", "username email")
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      console.log("⚠️ No orders found for user:", req.userId);
      return res.status(404).json({ error: "No orders found" });
    }

    console.log("✅ Orders retrieved:", orders.length);
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error Fetching Orders:", error.message);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
};

/**
 * ✅ Check if order exists for payment intent
 */
export const checkOrder = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment intent ID is required" });
    }

    const existingOrder = await Order.findOne({ paymentIntentId });
    
    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(existingOrder);
  } catch (error) {
    console.error("❌ Check Order Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
