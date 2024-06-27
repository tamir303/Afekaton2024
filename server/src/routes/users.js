import express from "express";
import EntryController from "../controllers/entryController.js";
import UserBoundary from "../boundaries/user/UserBoundary.js";

const router = express.Router();

/**
 * Route for getting users information.
 * @name GET researchers/:email/:platform
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {[UserBoundary]} An Array of JSON object structured as UserBoundary form.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.get("/:email/:platform", async (req, res) => {
  researchersController.getAllUsers(req, res);
});

/**
 * Route for deleting all users (only accessible to Admins).
 * @name DELETE researchers/:email/:platform
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response containing deletion status.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.delete("/:email/:platform", async (req, res) => {
  researchersController.deleteAllUsers(req, res);
});

export default router;
