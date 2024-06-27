/**
 * Module: CommandsService.js
 * Description: Handles command-related operations like creating, updating, and deleting commands, and also running them.
 * The commands meant to be complex and meanigful for execution.
 * Author: Shoval Shabi
 */
import mongoose from "mongoose"; // Importing mongoose for MongoDB operations
import UserModel from "../../models/UserModel.js"; // Importing the User Model
import userConverter from "../converters/UserConverter.js"; // Importing the User Converter for data conversion
import createHttpError from "http-errors"; // Importing createHttpError for HTTP error handling
import Roles from "../../utils/UserRole.js"; // Importing Roles enum for user roles
import CommandBoundary from "../../boundaries/command/CommandBoundary.js"; // Importing CommandBoundary for command operations
import CommandModel from "../../models/CommandModel.js"; // Importing the Command Model
import commandConverter from "../converters/CommandConverter.js"; // Importing the Command Converter for data conversion
import createCustomLogger from "../../config/logger.js"; // Import the configured logger for logging user-related activities
import path from "path"; // Import path for identifying file paths, used for logging purposes

const { Error } = mongoose; // Import the Error class from mongoose for handling database errors

//Logger configuration fo the ObjectService module
const logger = createCustomLogger({
  moduleFilename: path.parse(new URL(import.meta.url).pathname).name,
  logToFile: true,
  logLevel: process.env.INFO_LOG,
  logRotation: true,
});

/**
 * @description Command Service handles executing operations that require more complex requests or algorithmic solutions.
 */
const commandsService = {
  /**
   * Creates a new command and executes it.
   * @note Only Researcher and Admin are allowed to perfoem this method.
   * @async
   * @function
   * @param {CommandBoundary} reqCommandBoundary - The command details to for creation and execution.
   * @returns {Promise<CommandBoundary>} The created command details after saving it within the database and fulfilling it.
   * @throws {Error} Throws an error if the user creation process encounters any issues.
   */
  invokeCommand: async (reqCommandBoundary) => {
    const commandModel = await commandConverter.toModel(reqCommandBoundary);

    const existingUser = userConverter.toBoundary(
      await UserModel.findOne({ _id: commandModel.invokedBy })
    );

    if (!existingUser) {
      logger.error(
        `User with userId ${
          reqCommandBoundary.invokedBy.userId.email +
          "$" +
          reqCommandBoundary.invokedBy.userId.platform
        } does not exists`
      );
      throw new createHttpError.NotFound("User not found");
    }

    return commandModel
      .validate()
      .then(commandHandler.runCommand(commandModel))
      .then(async () => {
        await commandModel.save();
        logger.info(
          `The user ${
            reqCommandBoundary.invokedBy.userId.email +
            "$" +
            reqCommandBoundary.invokedBy.userId.platform
          } successfully created a command and excuted it`
        );
      })
      .catch((error) => {
        if (error instanceof Error.ValidationError) {
          logger.error(
            `Invalid input, some of the fields for invoking command are missing`
          );
          throw new createHttpError.BadRequest(
            "Invalid input, some of the fields for invoking command are missing"
          );
        }
        throw error;
      })
      .then(() => commandConverter.toBoundary(commandModel));
  },
  /**
   * Gets all commands, accessible to Admin and Researcher.
   * Researcher and Admin are allowed to retrieve all the objects without any activation restriction, differently from
   * Paraticipant that allowed to retrieve only active objects.
   * @async
   * @function
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user making the request.
   * @returns {Promise<CommandBoundary[]>} An array of user models.
   * @throws {Error} Throws an error if the request encounters any issues.
   */
  getAllCommands: async (userEmail, userPlatform) => {
    const existingUser = await UserModel.findOne({
      userId: userEmail + "$" + userPlatform,
    });

    if (!existingUser) {
      logger.error(
        `User with userId ${userEmail + "$" + userPlatform} does not exists`
      );
      throw new createHttpError.NotFound("User not found");
    }

    if (existingUser.role === Roles.ADMIN) {
      const allObjectsArr = await CommandModel.find();
      return Promise.all(
        allObjectsArr.map((object) => commandConverter.toBoundary(object))
      )
        .then((resArr) => {
          logger.info(
            `The user ${
              userEmail + "$" + userPlatform
            } successfully retrieved all the commands`
          );
          return resArr;
        })
        .catch((error) => {
          logger.error(
            `User with userId ${
              userEmail + "$" + userPlatform
            } encountered some errors while retrieving all the commands`
          );
          throw new createHttpError.BadRequest(error);
        });
    }
    logger.error(
      `The user ${
        userEmail + "$" + userPlatform
      } is not allowed to fetch all the commands`
    );
    throw new createHttpError.Forbidden(
      "User is not allowed to perform this request"
    );
  },
  /**
   * Deletes all Commands (only accessible to Admins).
   * @async
   * @function
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user making the request.
   * @returns {Promise<{ n: number, deletedCount: number, ok: number }>} Deletion status.
   * @throws {Error} Throws an error if the request encounters any issues.
   */
  deleteAllCommands: async (userEmail, userPlatform) => {
    const existingUser = await UserModel.findOne({
      userId: userEmail + "$" + userPlatform,
    });

    if (!existingUser) {
      logger.error(
        `User with userId ${userEmail + "$" + userPlatform} does not exists`
      );
      throw new createHttpError.NotFound("User not found");
    }

    if (existingUser.role === Roles.ADMIN) {
      const allCommandsArr = await CommandModel.deleteMany();
      logger.info(
        `The user ${
          userEmail + "$" + userPlatform
        } successfully deleted all the comamnds`
      );
      return allCommandsArr;
    }
    throw new createHttpError.Forbidden(
      "You are not allowed to make this request"
    );
  },
};

const commandHandler = {
  runCommand: async (commandModel) => {
    logger.info(`Executing the command ${commandModel.command} ...`);
    switch (commandModel.command) {
      case "GetRelatedProducers":
        console.log("Get all producers with related");
        break;
      default:
        logger.error(
          `The server is unfamilliar with the comamnd ${commandModel.command}`
        );
        createHttpError.BadRequest(
          `The server is unfamilliar with the comamnd ${commandModel.command}`
        );
        break;
    }
    logger.info(`Finshed executing the command ${commandModel.command}`);
  },
};

/**
 * Exporting the commandsService object for further use by other modules if needed.
 * @type {Object}
 */
export default commandsService;
