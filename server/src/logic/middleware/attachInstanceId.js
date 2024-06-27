/**
 * Module: attachInstaceId.js
 * Description: Docker utility functions for managing containers, volumes, and images.
 * Author: Shoval Shabi
 */

import { v4 as uuidv4 } from "uuid"; // Import uuidv4 for generating instance ID

// Generate unique instance ID
const instanceId = uuidv4();

/**
 * Middleware function to attach instance ID to response headers.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const attachInstanceId = (req, res, next) => {
  res.setHeader("X-Instance-ID", instanceId);
  next();
};

// Export the instance ID and middleware function
export { instanceId, attachInstanceId };
