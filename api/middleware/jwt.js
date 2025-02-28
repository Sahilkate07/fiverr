import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const verifyToken = (req, res, next) => {
  try {
    let token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    console.log("🔍 Checking Token:", token ? "Present" : "Not Found");

    if (!token) {
      console.log("❌ No Token Found! User not authenticated.");
      return next(createError(401, "You are not authenticated!"));
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        console.log("❌ Token Verification Error:", err.message);
        
        if (err.name === "TokenExpiredError") {
          return next(createError(403, "Session expired. Please log in again."));
        } else if (err.name === "JsonWebTokenError") {
          return next(createError(403, "Invalid token. Access denied!"));
        } else {
          return next(createError(403, "Token is not valid!"));
        }
      }

      req.userId = decoded.id;
      req.isSeller = decoded.isSeller;

      console.log("✅ Token Verified! User ID:", req.userId);
      next();
    });
  } catch (error) {
    console.error("❌ Unexpected Token Verification Error:", error);
    return next(createError(500, "Internal Server Error"));
  }
};
