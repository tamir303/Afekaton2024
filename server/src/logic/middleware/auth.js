import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

/**
 * Middleware function to verify JWT token in a cookie.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @throws {createHttpError.Forbidden} If the JWT token is missing.
 * @throws {createHttpError.Unauthorized} If the JWT token is expired or verification fails.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const jwtCookie = req.cookies.jwt;

    if (!jwtCookie) {
      throw new createHttpError.Forbidden("Access denied, missing token");
    }

    jwt.verify(jwtCookie, process.env.JWT_SECRET, (err, verified) => {
      if (err && err.name === "TokenExpiredError") {
        // The token has expired
        res.clearCookie("jwt");
        throw new createHttpError.Unauthorized("Token has expired");
      } else if (err) {
        // Another error occurred during verification, verification has been failed
        throw new createHttpError.Unauthorized("Token verification failed");
      } else {
        // The token is valid
        req.user = verified;
        next();
      }
    });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

/**
 * Function to set a JWT token in a cookie.
 * @param {Object} req - Express response object.
 * @param {Object} res - Express response object.
 * @param {string} token - JWT token to be set.
 * @param {Date} expiration - Expiration date of the cookie.
 */
export const setCookieIfNeeded = (req, res, token, expiration) => {
  const isProduction = process.env.NODE_ENV === "production";
  if (!req.cookies.jwt) {
    res.cookie("jwt", token, {
      expires: expiration, // Sent as Date object after the service operation
      httpOnly: isProduction,
      secure: process.env.NODE_ENV === "prod", // Set to true in production
      sameSite: isProduction ? "None" : "Lax", // Allowing Cross-Origin requests
    });
  }
};
