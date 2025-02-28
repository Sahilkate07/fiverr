import Gig from "../models/gig.model.js";
import createError from "../utils/createError.js";
import jwt from "jsonwebtoken";

// Create a new gig (Only sellers can create)
export const createGig = async (req, res, next) => {
  try {
    // Get user ID from the request (set by verifyToken middleware)
    if (!req.userId) {
      return next(createError(403, "You must be authenticated!"));
    }

    // Check if user is a seller
    if (!req.isSeller) {
      return next(createError(403, "Only sellers can create gigs!"));
    }

    const newGig = new Gig({
      userId: req.userId,
      ...req.body,
    });

    try {
      const savedGig = await newGig.save();
      res.status(201).json(savedGig);
    } catch (err) {
      next(createError(500, "Failed to save gig: " + err.message));
    }
  } catch (err) {
    next(err);
  }
};

// Delete a gig (Only the owner can delete)
export const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return next(createError(404, "Gig not found!"));
    }
    
    if (gig.userId.toString() !== req.userId) {
      return next(createError(403, "You can delete only your gig!"));
    }

    await Gig.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Gig has been deleted!" });
  } catch (err) {
    next(err);
  }
};

// Get a single gig by ID
export const getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return next(createError(404, "Gig not found!"));
    }
    res.status(200).json(gig);
  } catch (err) {
    next(err);
  }
};

// Get all gigs (Filter by sellerId, category, price, search, etc.)
export const getGigs = async (req, res, next) => {
  const { sellerId, cat, min, max, search, sort } = req.query;

  const filters = {
    ...(sellerId && { userId: sellerId }), // Filter gigs by seller's user ID
    ...(cat && { cat }),
    ...((min || max) && {
      price: {
        ...(min && { $gte: min }),
        ...(max && { $lte: max }),
      },
    }),
    ...(search && { title: { $regex: search, $options: "i" } }),
  };

  try {
    const gigs = await Gig.find(filters).sort({ [sort]: -1 });
    res.status(200).json(gigs);
  } catch (err) {
    next(err);
  }
};
