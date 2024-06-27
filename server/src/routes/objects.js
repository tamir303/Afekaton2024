import express from "express";
import objectsController from "../controllers/objectsController.js";
import ObjectBoundary from "../boundaries/object/ObjectBoundary.js";

const router = express.Router();

/**
 * Route for creating new object
 * @name POST objects/
 * @function
 * @param {Object} req - Express request object formed as ObjectBoundary.
 * @param {Object} res - Express response object.
 * @returns {Object<ObjectBoundary>} JSON response as ObjectBoundary structure containing user details.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.post("/", async (req, res) => {
  objectsController.createObject(req, res);
});

/**
 * Route for getting specific object.
 * @name GET objects/:internalObjectId
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object formed as ObjectBoundary.
 * @returns {ObjectBoundary} An Array of JSON object structured as ObjectBoundary form.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.get("/:internalObjectId", async (req, res) => {
  objectsController.getObject(req, res);
});

/**
 * Route for getting all objects, the retrieval is depened the presmissions of the user.
 * @name GET objects?email=example@org.com&platform=userPlatform
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response formed as ObjectBoundary array.
 * @returns {[Object]} An Array of JSON object structured as ObjectBoundary form.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.get("/", async (req, res) => {
  objectsController.getAllObjects(req, res);
});

/**
 * Route for deleting all objects (only accessible to Admins).
 * @name DELETE objects?email=adminEmail&platform=adminPlatform
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response containing deletion status.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.delete("/", async (req, res) => {
  objectsController.deleteAllObjects(req, res);
});

/**
 * Route for binding two objects one to another.
 * @note Except Participnats, any user can us this API.
 * @name PUT objects/internalObjectId/bind?email=example@demo.org&platform=userPlatform
 * @function
 * @param {Object} req - Express request object formed as ObjectBoundary.
 * @param {Object} res - Express response object.
 * @returns {Object} An empty JSON reposne.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.put("/:internalObjectId/bind", async (req, res) => {
  objectsController.bindNewChild(req, res);
});

/**
 * Route for unbinding two objects one to another.
 * @note Except Participnats, any user can us this API.
 * @name PUT objects/internalObjectId/unbind?email=example@demo.org&platform=userPlatform
 * @function
 * @param {Object} req - Express request object formed as ObjectBoundary.
 * @param {Object} res - Express response object.
 * @returns {Object} An empty JSON reposne.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.put("/:internalObjectId/unbind", async (req, res) => {
  objectsController.unbindChild(req, res);
});

/**
 * Route for updating an object.
 * @note Except Participnats, any user can update any objects.
 * @name PUT objects/internalObjectid?email=example@demo.org&platform=userPlatform
 * @function
 * @param {Object} req - Express request object formed as ObjectBoundary.
 * @param {Object} res - Express response object.
 * @returns {Object} An empty JSON reposne.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.put("/:internalObjectId", async (req, res) => {
  objectsController.updateObject(req, res);
});

/**
 * Route for getting all children objects of specific object, the retrieval is depened the presmissions of the user.
 * @name GET objects/internalObjectId/children?email=example@org.com&platform=userPlatform
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object formed as ObjectBoundary array.
 * @returns {[ObjectBoundary]} An Array of JSON object structured as ObjectBoundary form.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.get("/:internalObjectId/children", async (req, res) => {
  objectsController.getAllChildren(req, res);
});

/**
 * Route for getting all parents objects of specific object, the retrieval is depened the presmissions of the user.
 * @name GET objects/internalObjectId/parents?email=example@org.com&platform=userPlatform
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object formed as ObjectBoundary array.
 * @returns {[ObjectBoundary]} An Array of JSON object structured as ObjectBoundary form.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.get("/:internalObjectId/parents", async (req, res) => {
  objectsController.getAllParents(req, res);
});

/**
 * Route for getting all children objects of specific object, the retrieval is depened the presmissions of the user.
 * @name GET objects/internalObjectId/children/targetType/targetAlias?email=example@org.com&platform=userPlatform
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object formed as ObjectBoundary array.
 * @returns {[ObjectBoundary]} An Array of JSON object structured as ObjectBoundary form.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.get("/:internalObjectId/children/:type/:alias", async (req, res) => {
  objectsController.getChildrenByTypeAndAlias(req, res);
});

/**
 * Route for getting all parents objects of specific object, the retrieval is depened the presmissions of the user.
 * @name GET objects/internalObjectId/parents?email=example/targetType/targetAlias@org.com&platform=userPlatform
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object formed as ObjectBoundary array.
 * @returns {[ObjectBoundary]} An Array of JSON object structured as ObjectBoundary form.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.get("/:internalObjectId/parents/:type/:alias", async (req, res) => {
  objectsController.getParentsByTypeAndAlias(req, res);
});

/**
 * Route for getting all objects by certain type, the retrieval is depened the presmissions of the user.
 * @name GET objects/type/someType/?email=example@org.com&platform=userPlatform
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object formed as ObjectBoundary array.
 * @returns {[Object]} An Array of JSON object structured as ObjectBoundary form.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.get("/type/:targetType", async (req, res) => {
  objectsController.getAllObjectsByType(req, res);
});

/**
 * Route for getting all objects by certain type, the retrieval is depened the presmissions of the user.
 * @name GET objects/type/distinct/someType/?email=example@org.com&platform=userPlatform
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object formed as ObjectBoundary.
 * @returns {Object} A JSON object structured as ObjectBoundary form.
 * @throws {import("http-errors").HttpError} JSON response containing Http error message.
 */
router.get("/type/distinct/:targetType", async (req, res) => {
  objectsController.getSpecificObjectByType(req, res);
});

export default router;
