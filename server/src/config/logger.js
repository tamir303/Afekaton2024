/**
 * Module: logger.js
 * Description: Configures a logger using Winston library for logging.
 * Author: Shoval Shabi
 */

// Import required modules from Winston
import { createLogger, format, transports } from "winston";
import strftime from "strftime"; // Import strftime for custom date formatting
import winstonDailyRotateFile from "winston-daily-rotate-file"; // Import DailyRotateFile for log rotation

// Destructure format object
const { combine, timestamp, printf } = format;

/**
 * Function: logFormat
 * Description: Define the log format.
 * @param {string} level - The log level.
 * @param {string} message - The log message.
 * @param {Date} timestamp - The timestamp of the log message.
 * @param {string} moduleFilename - The filename of the module where the log originated.
 * @returns {string} - The formatted log message.
 */
const logFormat = printf(({ level, message, timestamp, moduleFilename }) => {
  const formattedTimestamp = strftime(
    "%d/%b/%Y:%H:%M:%S %z",
    new Date(timestamp)
  ); // Format the timestamp
  return `[${moduleFilename}] [${formattedTimestamp}] ${level.toUpperCase()}: ${message}`; // Format the log message
});

/**
 * Function: createCustomLogger
 * Description: Create a custom logger.
 * @param {string} moduleFilename - The filename of the module where the logger is created.
 * @param {string} [logToFile=false] - Whether to enable logging to a file (optional).
 * @param {string} [logLevel='info'] - The logging level for both console and file if loggingFileName is supplied (optional). Possible values are:
 *                                      - error
 *                                      - warn
 *                                      - info
 *                                      - http
 *                                      - verbose
 *                                      - debug
 *                                      - silly
 * @param {boolean} [logRotation=false] - Whether to enable log rotation (optional).
 * @returns {Object} - The configured logger object.
 */
const createCustomLogger = ({
  moduleFilename,
  logToFile = false,
  logLevel = "info",
  logRotation = false,
}) => {
  const transportsArray = [
    // Log to the console
    new transports.Console({
      level: logLevel,
    }),
  ];

  // Add file transport if logToFile is supplied
  if (logToFile) {
    const baseLogsPath = "./logs";
    // Define log rotation options
    const fileTransportOptions = {
      dirname: `${baseLogsPath}/${process.env.NODE_ENV}/${moduleFilename}`, // Specify the directory for log files based on environment (test/dev/prod)
      filename: `${moduleFilename}-%DATE%.log`, // Filename with date stamp from the date pattern down below
      datePattern: "DD-MMM-YYYY", // Use your desired date pattern
      maxSize: "20m", // File's storage will be up to 20MB
      level: "warn", // the baseline necessary information that should stored in file logs
    };

    // Add log rotation if enabled
    if (logRotation) {
      (fileTransportOptions.frequency = "custom"),
        (fileTransportOptions.maxFiles = "14d"), // Retain log files for two weeks (14 days)
        (fileTransportOptions.auditFile = `${baseLogsPath}/${process.env.NODE_ENV}/${moduleFilename}/audit.json`), // Specify an audit file for rotation tracking
        transportsArray.push(new winstonDailyRotateFile(fileTransportOptions));
    } else {
      // If log rotation is disabled, use regular file transport
      transportsArray.push(new transports.File(fileTransportOptions));
    }
  }

  return createLogger({
    level: logLevel, // Set the minimum logging level
    format: combine(
      timestamp(), // Add timestamp to logs
      format((info) => {
        info.moduleFilename = moduleFilename;
        return info;
      })(), // Add filename to logs
      logFormat // Apply custom log format
    ),
    transports: transportsArray,
  });
};

// Export the createCustomLogger function
export default createCustomLogger;
