import express from "express";
import entryController from "../controllers/entryController.js";
import UserBoundary from "../boundaries/user/UserBoundary.js";

const router = express.Router();

/**
 * Route for user registration.
 * @name POST entry/register
 * @function
 * @param {Object} req - Express request object formed as UserBoundary.
 * @param {Object} res - Express response object.
 * @returns {Object<UserBoundary>} JSON response as UserBoundary structure containing user details.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.post("/register", async (req, res) => {
  entryController.registerUser(req, res);
});

/**
 * Route for user login.
 * @name POST entry/login
 * @function
 * @param {Object} req - Express request object formed as UserBoundary.
 * @param {Object} res - Express response object.
 * @returns {Object<UserBoundary>} JSON response of token and UserBoundary structure for the
 * user details in case the user is not Particpant, otherwise there will be no JWT token.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.post("/login", async (req, res) => {
  entryController.loginUser(req, res);
});

/**
 * Route for verifying user.
 * @name POST entry/verify?email=someEmailExample
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} Express response object that contains the verification code.
 * user details in case the user is not Particpant, otherwise there will be no JWT token.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.post("/verify", async (req, res) => {
  entryController.veirfyUser(req, res);
});

/**
 * Route for updating researcher information.
 * @name PUT entry/:email/:platform
 * @function
 * @param {Object} req - Express request object formed as UserBoundary.
 * @param {Object} res - Express response object.
 * @returns {Object} An empty JSON reposne.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.put("/:email/:platform", async (req, res) => {
  entryController.updateUser(req, res);
});

export default router;
