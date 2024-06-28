/**
 * Module: env.js
 * Description: Loads environment variables from .env files using dotenv-flow, also can be injected from the CLI by cross-env module from
 * package.json file scripts.
 * Provides access to environment variables such as PORT and MONGO_URL.
 * Author: Shoval Shabi
 */

import dotenv from "dotenv-flow"; // Import the dotenv-flow package for loading environment variables
import createCustomLogger from "./logger.js"; // Import the logger module
import path from "path"; // Import the path identification for logging purposes

// Load environment variables from .env files
dotenv.config();

//Creating tailored logger for environment variables setup
const logger = createCustomLogger({
  moduleFilename: path.parse(new URL(import.meta.url).pathname).name,
  loggingFileName: true,
  logLevel: process.env.INFO_LOG,
  logRotation: true,
});

// Log a message indicating that environment variables are being loaded
logger.info("Loading environment variables");

/**
 * Constant: PORT
 * Description: Represents the port number on which the server will listen.
 * Defaults to 6001 if not specified in the environment variables.
 * @type {number}
 */
export const PORT = process.env.PORT || 6001;

// Log the port number being used by the server
logger.info(`Server Port: ${PORT}`);

/**
 * Constant: MONGO_HOST_TYPE
 * Description: Represents the type of the host wether is dokcerized or localhost, if dockerized then it will inject the container name
 * via cross-env otherwise it will be used as localhost
 * Defaults to localhost if not specified in the environment variables.
 * @type {string}
 */
const MONGO_HOST_TYPE = process.env.MONGO_HOST_TYPE || "localhost";

/**
 * Constant: MONGO_PORT
 * Description: Represents the type port of MongoDB.
 * Defaults to 27017 if not specified in the environment variables.
 * @type {number}
 */
const MONGO_PORT = process.env.MONGO_PORT || 27017;

/**
 * Constant: DB_NAME
 * Description: Represents the name of the the database in mongo wdepending on the NODE_ENV parameter, it will be injected via cross-env module
 * from package.json - scripts.
 * Defaults to localhost if not specified in the environment variables.
 * @type {string}
 */
const DB_NAME = process.env.DB_NAME || "test";

/**
 * Constant: MONGO_URL
 * Description: Represents the MongoDB connection URL.
 * Retrieved from the environment variables.
 * @type {string}
 */
export const MONGO_URL = "mongodb+srv://tamir:D6qvYDHWuo4mCG4l@test.7ql57vq.mongodb.net/?retryWrites=true&w=majority&appName=test"

// Log the MongoDB connection URL being used
logger.info(`MongoDB URL: ${MONGO_URL}`);
