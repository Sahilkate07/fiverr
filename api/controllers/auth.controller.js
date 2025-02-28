// auth.controller.js - Fixes storing user image and seller status
import dotenv from "dotenv";
dotenv.config();

import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const { username, email, password, country, phone, desc, isSeller, img } = req.body;

    if (!username || !email || !password || !country || !phone || !desc) {
      return next(createError(400, "All fields are required!"));
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return next(createError(400, "Username already exists"));
    }

    const hash = bcrypt.hashSync(password, 10);

    const newUser = new User({
      username,
      email,
      password: hash,
      country,
      phone,
      desc,
      isSeller,
      img: img || "",
    });

    console.log("New user registered:", newUser);
    await newUser.save();
    res.status(201).json({ message: "🎉 User registered successfully!" });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    console.log("Login Request:", req.body);

    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return next(createError(404, "User not found!"));
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return next(createError(400, "Wrong password!"));
    }

    if (!process.env.JWT_KEY) {
      return next(createError(500, "Server error: Missing JWT secret."));
    }

    // Log user data for debugging
    console.log("User found:", {
      id: user._id,
      username: user.username,
      isSeller: user.isSeller
    });

    const token = jwt.sign(
      { id: user._id, isSeller: user.isSeller },
      process.env.JWT_KEY,
      { expiresIn: "1d" }
    );

    // Convert Mongoose document to plain object and remove password
    const userObject = user.toObject();
    delete userObject.password;

    console.log("Response data:", {
      user: userObject,
      token: token ? "present" : "missing"
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    }).status(200).json({
      user: userObject,
      token,
      message: "✅ Login successful!"
    });
  } catch (err) {
    console.error("Login Error:", err);
    next(err);
  }
};


export const logout = (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "🚪 Logout successful!" });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ message: "❌ Failed to log out.", error: err.message });
  }
};
