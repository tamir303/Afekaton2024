import express from "express";
import CommandBoundary from "../boundaries/object/ObjectIdBoundary.js";
import commandsController from "../controllers/commandsController.js";

const router = express.Router();

/**
 * Route for creating new command, after the creation found out as successful the command will be executed and will be stord within the database.
 * @name POST objects/
 * @function
 * @param {Object} req - Express request object formed as CommandBoundary.
 * @param {Object} res - Express response object.
 * @returns {Object<CommandBoundary>} JSON response as CommandBoundary structure containing user details.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.post("/", async (req, res) => {
  commandsController.createCommand(req, res);
});

/**
 * Route for getting all commands, the retrieval is depened the presmissions of the user.
 * @name GET commands?email=example@org.com&platform=userPlatform
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {[CommandBoundary]} An Array of JSON object structured as CommandBoundary form.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.get("/", async (req, res) => {
  commandsController.getAllCommands(req, res);
});

/**
 * Route for deleting all commands (only accessible to Admins).
 * @name DELETE commands?email=example@org.com&platform=userPlatform
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response containing deletion status.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.delete("/", async (req, res) => {
  commandsController.deleteAllCommands(req, res);
});

export default router;
