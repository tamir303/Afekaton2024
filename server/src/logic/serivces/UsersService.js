/**
 * Module: UserService.js
 * Description: Handles user-related operations like creating, updating, and deleting users.
 * Author: Shoval Shabi
 */

import mongoose from "mongoose"; // Import Mongoose for interacting with MongoDB
import UserBoundary from "../../boundaries/user/UserBoundary.js"; // Import UserBoundary for defining user data for the communication layer
import UserModel from "../../models/UserModel.js"; // Import UserModel for interacting with the user database model
import userConverter from "../converters/UserConverter.js"; // Import userConverter for converting user data formats
import createHttpError from "http-errors"; // Import createHttpError for generating HTTP error responses
import Roles from "../../utils/UserRole.js"; // Import Roles for defining user roles and permissions
import bcrypt from "bcrypt"; // Import bcrypt for hashing passwords
import jwt from "jsonwebtoken"; // Import jwt for handling JSON Web Tokens
import createCustomLogger from "../../config/logger.js"; // Import the configured logger for logging user-related activities
import path from "path"; // Import path for identifying file paths, used for logging purposes
import dayjs from "dayjs";

// Import the Error class from the mongoose module
const { Error } = mongoose;

//Logger configuration fo the UserService module
const logger = createCustomLogger({
  moduleFilename: path.parse(new URL(import.meta.url).pathname).name,
  logToFile: true,
  logLevel: process.env.INFO_LOG,
  logRotation: true,
});

/**
 * @description User Service handles user-related operations like creating, updating, and deleting users.
 */
const userService = {
  /**
   * Creates a new user.
   * @async
   * @function
   * @param {UserBoundary} reqUserBoundary - The user details to create a new user.
   * @returns {Promise<UserBoundary>} The created user details after saving it within the database.
   * @throws {Error} Throws an error if the user creation process encounters any issues.
   */
  createUser: async (reqUserBoundary) => {
    console.log(reqUserBoundary)
    if (
      !reqUserBoundary.userId.email ||
      !reqUserBoundary.userId.platform ||
      !reqUserBoundary.role ||
      !reqUserBoundary.userDetails
    ) {
      logger.error(`A user tried to signup with illeagal credentials`);
      throw new createHttpError.BadRequest(
        "Some of the user credentials are undefined"
      );
    }

    if (
      !reqUserBoundary.userId ||
      reqUserBoundary.userId.email.length === 0 ||
      reqUserBoundary.userId.platform === 0
    ) {
      logger.error(
        "User has entered email or platform name as an empty string"
      );
      throw new createHttpError.BadRequest(
        "Email or platform name cannot be an empty string"
      );
    }

    const existingUser = await UserModel.findOne({
      userId:
        reqUserBoundary.userId.email + "$" + reqUserBoundary.userId.platform,
    });

    if (existingUser) {
      logger.info(
        `The user already exits with the credentials email:${reqUserBoundary.userId.email} paltform:${reqUserBoundary.userId.platform}`
      );
      return userService.login(reqUserBoundary);
    }

    const userModel = userConverter.toModel(reqUserBoundary);

    return userModel
      .then(() => {
        userModel.save();
        logger.info(
          `Saved user [${userModel.userId}] successfully to database`
        );
      })
      .catch((error) => {
        if (error instanceof Error.ValidationError) {
          logger.error(
            `Invalid input, some of the fields for creating new user are missing"`
          );
          throw new createHttpError.BadRequest(
            "Invalid input, some of the fields for creating new user are missing"
          );
        }
        throw error;
      })
      .then(() => ({ body: userConverter.toBoundary(userModel) }));
  },
  /**
   * Logs in a user.
   * @async
   * @function
   * @param {UserBoundary} reqUserBoundary - The user details for login.
   * @returns {Promise<{ token: string, userBoundary: UserBoundary }>} The JWT token and user details.
   * @throws {Error} Throws an error if the login process encounters any issues.
   */
  login: async (reqUserBoundary) => {
    console.log(reqUserBoundary)
    if (
      !reqUserBoundary.userId.email ||
      !reqUserBoundary.userId.platform ||
      !reqUserBoundary.role ||
      !reqUserBoundary.userDetails
    ) {
      logger.error(`A user tried to sign in with illeagal credentials`);
      throw new createHttpError.BadRequest(
        "Some of the user credentials are undefined"
      );
    }

    if (
      !reqUserBoundary.userId ||
      reqUserBoundary.userId.email.length === 0 ||
      reqUserBoundary.userId.platform === 0
    ) {
      logger.error(
        "User has entered email or platform name as an empty string"
      );
      throw new createHttpError.BadRequest(
        "Email or platform name cannot be an empty string"
      );
    }

    const existingUserModel = await UserModel.findOne({
      userId:
        reqUserBoundary.userId.email + "$" + reqUserBoundary.userId.platform,
    });

    /* In case that none particpant with special authrizations tries to log in wihout signup first
     * The Client will have two seperate logins, one for authorized users with special premissions such
     * as Admin and Reseacher, which there users will have to go through signup and then login, the Particpants
     * in other case will have to go everytimy by signup, if they are exist the server will return them
     */
    if (!existingUserModel) {
      logger.error(
        `User with userId ${
          reqUserBoundary.userId.email + "$" + reqUserBoundary.userId.platform
        } does not exists`
      );
      throw new createHttpError.NotFound("User does not exists");
    }

    return userConverter.toBoundary(existingUserModel)
  },
  /**
   * Updates a user's information.
   * @async
   * @function
   * @param {string} userEmail - The email of the user.
   * @param {string} userPlatform - The platform of the user.
   * @param {UserBoundary} updateUser - The user details to update.
   * @returns {Promise<UserBoundary>} The updated user details.
   * @throws {Error} Throws an error if the update process encounters any issues.
   */
  updateUser: async (userEmail, userPlatform, updateUser) => {
    if (userEmail.length === 0 || userPlatform.platform === 0) {
      logger.error(
        `A user tried to edit his information with illeagal credentials`
      );
      throw new createHttpError.BadRequest(
        "Email or platform name cannot be an empty string"
      );
    }

    const existingUserModel = await UserModel.findOne({
      userId: userEmail + "$" + userPlatform,
    });

    if (!existingUserModel) {
      logger.error(
        `User with userId ${userEmail + "$" + userPlatform} does not exists`
      );
      throw new createHttpError.NotFound("User does not exists");
    }

    if (updateUser.username && updateUser.username.length > 0)
      existingUserModel.username = updateUser.username;

    if (updateUser.userDetails) {
      const additionalDetails = updateUser.userDetails;
      if (additionalDetails.hasOwnProperty("password")) {
        const salt = await bcrypt.genSalt();
        additionalDetails.password = await bcrypt.hash(
          additionalDetails.password,
          salt
        );
      }
      existingUserModel.userDetails = {
        ...existingUserModel.userDetails,
        ...additionalDetails,
      };
    }
    existingUserModel.save();
    logger.info(
      `User with userId ${existingUserModel.userId} successfully updated his information`
    );
    return userConverter.toBoundary(existingUserModel);
  },
  /**
   * Gets all users (only accessible to Admins).
   * @async
   * @function
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user making the request.
   * @returns {Promise<UserModel[]>} An array of user models.
   * @throws {Error} Throws an error if the request encounters any issues.
   */
  getAllUsers: async ()  => {
      return UserModel.find();
  },
  /**
   * Deletes all users (only accessible to Admins).
   * @async
   * @function
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user making the request.
   * @returns {Promise<{ n: number, deletedCount: number, ok: number }>} Deletion status.
   * @throws {Error} Throws an error if the request encounters any issues.
   */
  deleteAllUsers: async (userEmail, userPlatform) => {
    const existingUserModel = await UserModel.findOne({
      userId: userEmail + "$" + userPlatform,
    });

    if (!existingUserModel) {
      logger.error(
        `User with userId ${userEmail + "$" + userPlatform} does not exists`
      );
      throw new createHttpError.NotFound("User does not exists");
    }

    if (existingUserModel.role === Roles.ADMIN) {
      const usersArr = await UserModel.deleteMany();
      logger.info(
        `User with userId ${existingUserModel.userId} successfully deleted all users`
      );
      return usersArr;
    } else {
      logger.error(
        `User with userId ${
          userEmail + "$" + userPlatform
        } tried to delete all users without while he is not authorized`
      );
      throw new createHttpError.Forbidden(
        "You are not allowed to make this request"
      );
    }
  },
};

/**
 * Exporting the userService object for further use by other modules if needed.
 * @type {Object}
 */
export default userService;
