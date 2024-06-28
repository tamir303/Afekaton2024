import express from "express";
import subjectController from "../controllers/subjectController.js";

const router = express.Router();

//NOTE: This route cannot use the objects route because any particiapnt could access to the methods, if they cracked the credentials of an admin user

/**
 * Route for creating new object
 * @name POST participants/objects/
 * @function
 * @param {Object} req - Express request object formed as UserBoundary.
 * @param {Object} res - Express response object.
 * @returns {Object<ObjectBoundary>} JSON response as ObjectBoundary structure containing user details.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.get("/", async (req, res) => {
    subjectController.getAllSubjects(req, res);
});
export default router;
