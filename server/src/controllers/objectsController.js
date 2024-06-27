import ObjectBoundary from "../boundaries/object/ObjectBoundary.js";
import objectsService from "../logic/serivces/ObjectsService.js";
import ObjectIdBoundary from "../boundaries/object/ObjectIdBoundary.js";

const objectsController = {
  /**
   * Controller function for creating a new object
   * @param {Object} req - Express request object formed as UserBoundary.
   * @param {Object} res - Express response object.
   */
  createObject: async (req, res) => {
    try {
      const reqObjectBoundary = new ObjectBoundary();

      /*Getting the body of the request containing the ObjectBoundary data and assigning it to the ObjectBoundary instance*/
      Object.assign(reqObjectBoundary, req.body);
      const resUserBoundary = await objectsService.createObject(
        reqObjectBoundary
      );
      res.status(201).json(resUserBoundary);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during object creation.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },

  /**
   * Controller function for getting a specific object.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  getObject: async (req, res) => {
    try {
      const internalObjectId = req.params.internalObjectId;
      const userEmail = req.query.email;
      const userPlatform = req.query.platform;
      const DBResponse = await objectsService.getObject(
        internalObjectId,
        userEmail,
        userPlatform
      );
      res.status(200).json(DBResponse);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during object retrieval.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },

  /**
   * Controller function for getting all objects, the retrieval is depened the presmissions of the user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  getAllObjects: async (req, res) => {
    try {
      const userEmail = req.query.email;
      const userPlatform = req.query.platform;
      const DBResponse = await objectsService.getAllObjects(
        userEmail,
        userPlatform
      );
      res.status(200).json(DBResponse);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during object retrieval.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },

  /**
   * Controller function for deleting all objects (only accessible to Admins).
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  deleteAllObjects: async (req, res) => {
    const userEmail = req.query.email;
    const userPlatform = req.query.platform;
    try {
      const DBResponse = await objectsService.deleteAllObjects(
        userEmail,
        userPlatform
      );
      res.status(200).json(DBResponse);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during object deletion.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },

  /**
   * Controller function for binding two objects one to another.
   * @param {Object} req - Express request object formed as UserBoundary.
   * @param {Object} res - Express response object.
   */
  bindNewChild: async (req, res) => {
    try {
      const internalObjectid = req.params.internalObjectId;
      const userEmail = req.query.email;
      const userPlatform = req.query.platform;

      /*Getting the body of the request containing the ObjectBoundary data and assigning it to the ObjectBoundary instance*/
      const reqObjectIdBoundary = new ObjectIdBoundary();
      Object.assign(reqObjectIdBoundary, req.body.objectId);
      await objectsService.bindNewChild(
        internalObjectid,
        userEmail,
        userPlatform,
        reqObjectIdBoundary
      );
      res.status(200).send();
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during object binding.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },

  /**
   * Controller function for unbinding two objects one from another.
   * @param {Object} req - Express request object formed as UserBoundary.
   * @param {Object} res - Express response object.
   */
  unbindChild: async (req, res) => {
    try {
      const internalObjectid = req.params.internalObjectId;
      const userEmail = req.query.email;
      const userPlatform = req.query.platform;
      const reqObjectIdBoundary = new ObjectIdBoundary();

      /*Getting the body of the request containing the ObjectBoundary data and assigning it to the ObjectBoundary instance*/
      Object.assign(reqObjectIdBoundary, req.body.objectId);
      await objectsService.unbindChild(
        internalObjectid,
        userEmail,
        userPlatform,
        reqObjectIdBoundary
      );
      res.status(200).send();
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during object unbinding.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },

  /**
   * Controller function for updating an object.
   * @param {Object} req - Express request object formed as UserBoundary.
   * @param {Object} res - Express response object.
   */
  updateObject: async (req, res) => {
    try {
      const internalObjectId = req.params.internalObjectId;
      const userEmail = req.query.email;
      const userPlatform = req.query.platform;
      const reqObjectBoundary = new ObjectBoundary();

      /*Getting the body of the request containing the ObjectBoundary data and assigning it to the ObjectBoundary instance*/
      Object.assign(reqObjectBoundary, req.body);
      await objectsService.updateObject(
        userEmail,
        userPlatform,
        internalObjectId,
        reqObjectBoundary
      );
      res.status(200).send();
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during object update.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },

  /**
   * Controller function for getting all children objects of specific object, the retrieval depends on the permissions of the user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  getAllChildren: async (req, res) => {
    try {
      const internalObjectId = req.params.internalObjectId;
      const userEmail = req.query.email;
      const userPlatform = req.query.platform;
      const DBResponse = await objectsService.getAllChildren(
        internalObjectId,
        userEmail,
        userPlatform
      );
      res.status(200).json(DBResponse);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during children retrieval.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },

  /**
   * Controller function for getting all parents objects of specific object, the retrieval depends on the permissions of the user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  getAllParents: async (req, res) => {
    try {
      const internalObjectId = req.params.internalObjectId;
      const userEmail = req.query.email;
      const userPlatform = req.query.platform;
      const DBResponse = await objectsService.getAllParents(
        internalObjectId,
        userEmail,
        userPlatform
      );
      res.status(200).json(DBResponse);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during parents retrieval.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },
  /**
   * Controller function for getting all children objects of specific object and filtering them by specific type and alias, the retrieval depends on the permissions of the user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  getChildrenByTypeAndAlias: async (req, res) => {
    try {
      const internalObjectId = req.params.internalObjectId;
      const type = req.params.type;
      const alias = req.params.alias;
      const userEmail = req.query.email;
      const userPlatform = req.query.platform;

      const DBResponse = await objectsService.getChildrenByTypeAndAlias(
        internalObjectId,
        userEmail,
        userPlatform,
        type,
        alias
      );
      res.status(200).json(DBResponse);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during children retrieval by type and alias.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },

  /**
   * Controller function for getting all parents objects of specific object and filtering them by specific type and alias, the retrieval depends on the permissions of the user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  getParentsByTypeAndAlias: async (req, res) => {
    try {
      const internalObjectId = req.params.internalObjectId;
      const type = req.params.type;
      const alias = req.params.alias;
      const userEmail = req.query.email;
      const userPlatform = req.query.platform;

      const DBResponse = await objectsService.getParentsByTypeAndAlias(
        internalObjectId,
        userEmail,
        userPlatform,
        type,
        alias
      );
      res.status(200).json(DBResponse);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during parents retrieval by type and alias.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },

  /**
   * Controller function for getting all objects by certain type, the retrieval depends on the permissions of the user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  getAllObjectsByType: async (req, res) => {
    try {
      const userEmail = req.query.email;
      const userPlatform = req.query.platform;
      const targetType = req.params.targetType;
      const DBResponse = await objectsService.getAllObjectsByType(
        targetType,
        userEmail,
        userPlatform
      );
      res.status(200).json(DBResponse);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during type-based retrieval.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },
  /**
   * Controller function for getting all objects by certain type, the retrieval depends on the permissions of the user.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  getSpecificObjectByType: async (req, res) => {
    try {
      const userEmail = req.query.email;
      const userPlatform = req.query.platform;
      const targetType = req.params.targetType;
      const DBResponse = await objectsService.getSpecificObjectByType(
        targetType,
        userEmail,
        userPlatform
      );
      res.status(200).json(DBResponse);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during type-based retrieval.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },
};

export default objectsController;
