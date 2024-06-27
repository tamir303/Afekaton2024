/**
 * Module: app.js
 * Description: Configures and initializes the Express application.
 * Author: Shoval Shabi
 */

// Import required modules
import express from "express";
import { PORT } from "./config/env.js";
import createCustomLogger from "./config/logger.js"; // Import the configured logger
import { connectToDatabase } from "./config/database.js"; // Import the function to connect to the database
import path from "path"; // Import the path identification for logging purposes
import { instanceId } from "./logic/middleware/attachInstanceId.js"; // Import generated instaceId and the attachInstaceId middleware
import {
  setupMiddleware,
  attachCustomMiddleware,
} from "./logic/middleware/setupMiddleware.js";
import { mountRoutes } from "./routes/setupRoutes.js";
// Create an instance of Express application
const app = express();

//Logger configuration for the app module
const logger = createCustomLogger({
  moduleFilename: path.parse(new URL(import.meta.url).pathname).name,
  logToFile: true,
  logLevel: process.env.INFO_LOG,
  logRotation: true,
});

// Configure middleware - standard and custom-made
setupMiddleware(app);
attachCustomMiddleware(app);

// Mount routes
mountRoutes(app);

// Connect to the MongoDB database
connectToDatabase()
  .then(() => {
    // Start the server
    app.listen(PORT, () => {
      // Log a message indicating server startup along with the instance ID
      logger.info(
        `Server is running on port ${PORT}. Instance ID: ${instanceId}`
      );
    });
  })
  .catch((error) => {
    // Log an error if database connection fails
    logger.error(`MongoDB connection error: ${error}`);
    // Exit the process with failure status
    process.exit(1);
  });

// Export the Express application
export default app;
