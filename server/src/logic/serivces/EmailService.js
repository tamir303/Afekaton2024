/**
 * Module: EmailService.js
 * Description: Handles verification of users by sending OTP emails.
 * Author: Shoval Shabi
 */

import nodemailer from "nodemailer"; // Import Nodemailer for sending SMTP verification
import createCustomLogger from "../../config/logger.js"; // Import the configured logger for logging user-related activities
import path from "path"; // Import path for identifying file paths, used for logging purposes
import createHttpError from "http-errors";

//Logger configuration fo the UserService module
const logger = createCustomLogger({
  moduleFilename: path.parse(new URL(import.meta.url).pathname).name,
  logToFile: true,
  logLevel: process.env.INFO_LOG,
  logRotation: true,
});

// Create a Nodemailer transporter --- THIS SHOULD BE USED BY SOME SORT OF EMAIL PROVIDER ---
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service provider
  auth: {
    user: process.env.EMAIL_SOURCE, // Your email address
    pass: process.env.EMAIL_APP_PASS, // Your email password
  },
});

const generateVerificationCode = () => {
  // Generate a random 6-digit number
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * @description Email Service handles verifications for users before inal registering to the service.
 */
const emailService = {
  /**
   * Send a verification email a new user.
   * @async
   * @function
   * @param {string} emailDest - The destination email of the user.
   * @returns {Object} the actual verification code for client validation, exception for failure of sending the email
   * @throws {Error} Throws an error if the user creation process encounters any issues.
   */
  sendVerificationCode: async (emailDest) => {
    try {
      if (!emailDest) {
        logger.error(`The email for sending verification is invalid`);
        throw new createHttpError.BadRequest(
          "The email for sending verification code is invalid"
        );
      }

      const verificationCode = generateVerificationCode();
      // Send email
      const info = await transporter.sendMail({
        from: process.env.EMAIL_SOURCE, // Sender email address
        to: emailDest, // Recipient email address
        subject: "Signup Verification - Experiment Collector", // Email subject
        text: `Your verification code is: ${verificationCode}`, // Plain text body
      });
      logger.info(`Email sent with id ${info.messageId} sent to ${emailDest}`);
      return { verificationCode: verificationCode.toString() }; // Email sent successfully
    } catch (error) {
      switch (error.code) {
        case "EENVELOPE":
          logger.error(`There is no existant email called ${emailDest}`);
          error = createHttpError.BadRequest(
            `The email ${emailDest} for sending verification code is invalid`
          );
          break;
        case "ENOTFOUND":
          logger.error(
            `SMTP server not found. Please check your email server settings.`
          );
          error = createHttpError.BadRequest(
            `There is no available SMTP server for verification at the moment`
          );
          break;
        default:
          logger.error("Error sending email:", error);
          break;
      }
      throw error;
    }
  },
};

/**
 * Exporting the emailService object for further use by other modules if needed.
 * @type {Object}
 */
export default emailService;
