/**
 * Module: ObjectService.js
 * Description: Handles object-related operations like creating, updating, and deleting objects, and also attaching objects
 * Author: Shoval Shabi
 */
import mongoose from "mongoose"; // Import mongoose for interacting with MongoDB
import UserModel from "../../models/UserModel.js"; // Import the UserModel for database operations related to users
import userConverter from "../converters/UserConverter.js"; // Import the userConverter for converting user objects between different formats
import createHttpError from "http-errors"; // Import createHttpError for creating HTTP error objects
import Roles from "../../utils/UserRole.js"; // Import Roles for defining user roles and permissions
import ObjectModel from "../../models/ObjectModel.js"; // Import ObjectModel for database operations related to objects
import objectConverter from "../converters/ObjectBoundaryConverter.js"; // Import the objectConverter for converting object objects between different formats
import ObjectBoundary from "../../boundaries/object/ObjectBoundary.js"; // Import ObjectBoundary for defining the structure of object objects
import createCustomLogger from "../../config/logger.js"; // Import the configured logger for logging user-related activities
import CommandsService from "./CommandsService.js";
import path from "path";
import CommandBoundary from "../../boundaries/command/CommandBoundary.js"; // Import path for identifying file paths, used for logging purposes

const { Error } = mongoose; // Import the Error class from mongoose for handling database errors

//Logger configuration fo the ObjectService module
const logger = createCustomLogger({
  moduleFilename: path.parse(new URL(import.meta.url).pathname).name,
  logToFile: true,
  logLevel: process.env.INFO_LOG,
  logRotation: true,
});

/**
 * @description Object Service handles object-related operations like creating, updating, and deleting objects, and also attaching objects
 * one to another.
 */
const objectsService = {
  /**
   * Creates a new object.
   * @async
   * @function
   * @param {UserBoundary} reqUserBoundary - The user details to create a new user.
   * @returns {Promise<ObjectBoundary>} The created user details after saving it within the database.
   * @throws {Error} Throws an error if the user creation process encounters any issues.
   */
  createObject: async (reqObjectBoundary) => {
    if (!reqObjectBoundary) {
      logger.error("There is no object to create");
      throw new createHttpError.BadRequest("There is no object to create");
    }

    //Checking for undefined properties, alias, creationTimestamp,modificationTimestamp and location are optional
    if (
      !reqObjectBoundary.type ||
      !reqObjectBoundary.active === undefined ||
      !reqObjectBoundary.createdBy ||
      !reqObjectBoundary.createdBy.userId.platform ||
      !reqObjectBoundary.createdBy.userId.email ||
      !reqObjectBoundary.objectDetails
    ) {
      logger.error("Some of the objects properties are undefined");
      throw new createHttpError.BadRequest(
        "Some of the objects properties are undefined"
      );
    }

    const objectModel = await objectConverter.toModel(reqObjectBoundary);

    const existingUser = userConverter.toBoundary(
      await UserModel.findOne({ _id: objectModel.createdBy._id })
    );

    if (!existingUser) {
      logger.error(
        `User with userId ${
          reqObjectBoundary.createdBy.userId.email
          } does not exists`
      );
      throw new createHttpError.NotFound("User not found");
    }

    if (reqObjectBoundary.active && existingUser.role === Roles.regular) {
      logger.info("User requesting help");
      await CommandsService.invokeCommand(
          new CommandBoundary({
            command: "GetRelatedProducers",
            targetObject: reqObjectBoundary.objectId,
            invokedBy: existingUser.userId,
            commandAttributes: reqObjectBoundary.objectDetails.get("subjects")
          })
      )

      throw new createHttpError.Forbidden(
        `The user ${existingUser.username} does not allowed to create this kind of objects`
      );
    }

    return objectModel
      .validate()
      .then(async () => {
        await objectModel.save();
        logger.info(
          `The user ${
            reqObjectBoundary.createdBy.userId.email +
            "$" +
            reqObjectBoundary.createdBy.userId.platform
          } successfully created an object`
        );
      })
      .catch((error) => {
        if (error instanceof Error.ValidationError) {
          logger.error(
            `Invalid input, some of the fields for creating new object are missing`
          );
          throw new createHttpError.BadRequest(
            "Invalid input, some of the fields for creating new object are missing"
          );
        }
        throw error;
      })
      .then(() => objectConverter.toBoundary(objectModel));
  },
  /**
   * Updates an object.
   * @async
   * @function
   * @param {string} internalObjectId - The internal object id of the object.
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user.
   * @param {ObjectBoundary} objectToUpdate - The fields that user provide to update.
   * @returns {undefined}
   * @throws {Error} Throws an error if the update process encounters any issues.
   */
  updateObject: async (
    userEmail,
    userPlatform,
    internalObjectId,
    objectToUpdate
  ) => {
    //TODO: need to fix the creation of a new document as well for users maybe happens when converted!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const existingUser = userConverter.toBoundary(
      await UserModel.findOne({
        userId: userEmail + "$" + userPlatform,
      })
    );

    if (!existingUser) {
      logger.error(
        `User with userId ${userEmail + "$" + userPlatform} does not exists`
      );
      throw new createHttpError.NotFound("User not found");
    }

    if (existingUser.role === Roles.PARTICIPANT) {
      logger.warn(
        `User with userId: ${existingUser.userId.email} with role: ${existingUser.role} tried to update an object while he is not allowed to`
      );
      throw new createHttpError.Forbidden(
        `The user ${existingUser.username} not allowed to update objects`
      );
    }

    if (!mongoose.Types.ObjectId.isValid(internalObjectId)) {
      // Handle the case where internalObjectId is not a valid ObjectId
      logger.error(
        `InternalObjectId is not a valid ObjectId:${internalObjectId}`
      );
      throw new createHttpError.NotFound(
        "InternalObjectId is not a valid ObjectId"
      );
    }

    const existingObject = await ObjectModel.findOne({ _id: internalObjectId });

    if (!existingObject) {
      logger.error(
        `Object does not exists with internalObjectId:${internalObjectId}`
      );
      throw new createHttpError.NotFound("Object does not exists");
    }

    if (objectToUpdate.type != null) {
      if (objectToUpdate.type.length === 0) {
        logger.error(
          `The user ${existingUser.userId.email} tried to update an object type should with an empty string`
        );
        throw new createHttpError.Forbidden(
          "Object type should not be an empty string"
        );
      }
      existingObject.type = objectToUpdate.type;
    }

    if (objectToUpdate.alias != null) {
      if (objectToUpdate.alias.length === 0) {
        logger.error(
          `The user ${existingUser.userId.email} tried to update an object alias should with an empty string`
        );
        throw new createHttpError.Forbidden(
          "Object alias should not be an empty string"
        );
      }
      existingObject.alias = objectToUpdate.alias;
    }

    if (objectToUpdate.active !== null)
      existingObject.active = objectToUpdate.active;

    if (objectToUpdate.creationTimestamp) {
      logger.error(
        `The user ${existingUser.userId.email} tried to update an object creation timestamp`
      );
      throw new createHttpError.Forbidden(
        "Creation timestamp cannot be changed"
      );
    }

    if (objectToUpdate.location) {
      if (objectToUpdate.location.lat)
        existingObject.location.lat = objectToUpdate.location.lat;

      if (objectToUpdate.location.lng)
        existingObject.location.lng = objectToUpdate.location.lng;
    }

    if (objectToUpdate.objectDetails) {
      existingObject.objectDetails = {
        ...existingObject.objectDetails,
        ...objectToUpdate.objectDetails,
      };
    }

    existingObject
      .validate()
      .then(async () => {
        await existingObject.save();
        logger.info(
          `Successfully updtated an object with internalObjectId:${internalObjectId} by the user ${existingUser.userId.email}`
        );
      })
      .catch((error) => {
        if (error instanceof Error.ValidationError) {
          log.error(
            `Invalid input, some of the fields for updating new object are missing for updating object with internalObjectId:${internalObjectId}`
          );
          throw new createHttpError.BadRequest(
            "Invalid input, some of the fields for updating new object are missing"
          );
        }
        throw error;
      });
  },
  /**
   * Get the designated object.
   * @async
   * @function
   * @param {String} internalObjectId - The internal object id.
   * @param {String} userEmail - The user email.
   * @param {String} userPlatform - The user platform.
   * @returns {Promise<ObjectBoundary>} An object boundary.
   * @throws {Error} Throws an error if the retrieval process encounters any issues.
   */
  getObject: async (internalObjectId, userEmail, userPlatform) => {
    const existingUser = await UserModel.findOne({
      userId: userEmail + "$" + userPlatform,
    });

    if (!existingUser) {
      logger.error(
        `User with userId ${userEmail + "$" + userPlatform} does not exists`
      );
      throw new createHttpError.NotFound("User not found");
    }

    if (!mongoose.Types.ObjectId.isValid(internalObjectId)) {
      // Handle the case where internalObjectId is not a valid ObjectId
      logger.error(
        `InternalObjectId is not a valid ObjectId:${internalObjectId}`
      );
      throw new createHttpError.NotFound(
        "InternalObjectId is not a valid ObjectId"
      );
    }

    const existingObject = await ObjectModel.findOne({ _id: internalObjectId });

    if (!existingObject) {
      logger.error(
        `Object does not exists with internalObjectId:${internalObjectId}`
      );
      throw new createHttpError.NotFound("Object does not exists");
    }

    if (existingUser.role === Roles.PARTICIPANT && !existingObject.active) {
      logger.error(
        `User with userId ${existingUser.userId.email} tried to retrieve an inactive object`
      );
      throw new createHttpError.Forbidden(
        `The user ${existingUser.userId.email} is not allowed to retrieve this object`
      );
    }

    logger.info(
      `User with userId ${existingUser.userId.email} successfully retrieved an object with internalObjectId ${internalObjectId}`
    );

    return objectConverter.toBoundary(existingObject);
  },
  /**
   * Gets all objects, accessible to any user.
   * Researcher and Admin are allowed to retrieve all the objects without any activation restriction, differently from
   * Paraticipant that allowed to retrieve only active objects.
   * @async
   * @function
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user making the request.
   * @returns {Promise<ObjectBoundary[]>} An array of user models.
   * @throws {Error} Throws an error if the request encounters any issues.
   */
  getAllObjects: async (userEmail, userPlatform) => {
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
      const allObjectsArr = await ObjectModel.find();
      logger.info(
        `User with userId ${existingUser.userId.email} successfully retrieved all objects`
      );
      return Promise.all(
        allObjectsArr.map((object) => objectConverter.toBoundary(object))
      )
        .then((resArr) => {
          logger.info(
            `The user ${
              userEmail + "$" + userPlatform
            } successfully retrieved all the objects`
          );
          return resArr;
        })
        .catch((error) => {
          logger.error(
            `User with userId ${
              userEmail + "$" + userPlatform
            } encountered some errors while retrieving all the objects`
          );
          throw new createHttpError.BadRequest(error);
        });
    } else {
      logger.error(
        `User with userId ${existingUser.userId.email} tried to retrieve all objects while he is not allowed to`
      );
      throw new createHttpError.Forbidden(
        `The user ${existingUser.userId.email} is not allowed to retrieve all objects`
      );
    }
  },
  /**
   * Deletes all objects (only accessible to Admins).
   * @async
   * @function
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user making the request.
   * @returns {Promise<{ n: number, deletedCount: number, ok: number }>} Deletion status.
   * @throws {Error} Throws an error if the request encounters any issues.
   */
  deleteAllObjects: async (userEmail, userPlatform) => {
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
      const allObjectsArr = await ObjectModel.deleteMany();
      logger.info(
        `User with userId ${existingUser.userId.email} successfully deleted all objects`
      );
      return allObjectsArr;
    } else {
      logger.error(
        `User with userId ${existingUser.userId.email} tried to delete all objects while he is not allowed to`
      );
      throw new createHttpError.Forbidden(
        "You are not allowed to make this request"
      );
    }
  },
  /**
   * Binds between two objects (accessible to any user except Participant).
   * @async
   * @function
   * @param {string} internalObjectId - The internal objectId of the parent object
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user making the request.
   * @param {string} objectIdBoundary - The object id boundary of the child object.
   * @returns {undefined}
   * @throws {Error} Throws an error if the request encounters any issues.
   */
  bindNewChild: async (
    internalObjectId,
    userEmail,
    userPlatform,
    objectIdBoundary
  ) => {
    const existingUser = await UserModel.findOne({
      userId: userEmail + "$" + userPlatform,
    });

    if (!existingUser) {
      logger.error(
        `User with userId ${userEmail + "$" + userPlatform} does not exists`
      );
      throw new createHttpError.NotFound("User not found");
    }

    if (!mongoose.Types.ObjectId.isValid(objectIdBoundary.internalObjectId)) {
      // Handle the case where internalObjectId is not a valid ObjectId
      logger.error(
        `Child internalObjectId is not a valid ObjectId:${objectIdBoundary.internalObjectId}`
      );
      throw new createHttpError.NotFound(
        "InternalObjectId is not a valid ObjectId"
      );
    }

    const childObj = await ObjectModel.findOne({
      _id: objectIdBoundary.internalObjectId,
    });

    if (!childObj) {
      logger.error(
        `Child object does not exists with internalObjectId:${objectIdBoundary.internalObjectId}`
      );
      throw new createHttpError.NotFound("Child object does not exists");
    }

    if (!mongoose.Types.ObjectId.isValid(internalObjectId)) {
      // Handle the case where internalObjectId is not a valid ObjectId
      logger.error(
        `Parent internalObjectId is not a valid ObjectId:${internalObjectId}`
      );
      throw new createHttpError.NotFound(
        "InternalObjectId is not a valid ObjectId"
      );
    }

    const parentObj = await ObjectModel.findOne({ _id: internalObjectId });

    if (!parentObj) {
      logger.error(
        `Parent object does not exists with internalObjectId:${internalObjectId}`
      );
      throw new createHttpError.NotFound("Parent object does not exists");
    }

    if (
      existingUser.role === Roles.PARTICIPANT &&
      (!parentObj.active || !childObj.active)
    ) {
      logger.error(
        `User with userId ${existingUser.userId.email} tried to bind one object to another while one of them is inactive`
      );
      throw new createHttpError.Forbidden(
        "You are not allowed to make this request"
      );
    }

    parentObj.children.push(childObj);
    childObj.parents.push(parentObj);

    await childObj.save();
    await parentObj.save();
    logger.info(
      `User with userId ${existingUser.userId.email} successfully bind parent object:${internalObjectId} to a child object:${objectIdBoundary.internalObjectId} and vice versa`
    );
  },
  /**
   * Unbinds between two objects (accessible to any user except Participant).
   * @async
   * @function
   * @param {string} internalObjectId - The internal objectId of the parent object
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user making the request.
   * @param {string} objectIdBoundary - The object id boundary of the child object.
   * @returns {undefined}
   * @throws {Error} Throws an error if the request encounters any issues.
   */
  unbindChild: async (
    internalObjectId,
    userEmail,
    userPlatform,
    objectIdBoundary
  ) => {
    const existingUser = await UserModel.findOne({
      userId: userEmail + "$" + userPlatform,
    });

    if (!existingUser) {
      logger.error(
        `User with userId ${userEmail + "$" + userPlatform} does not exists`
      );
      throw new createHttpError.NotFound("User not found");
    }

    if (existingUser.role === Roles.PARTICIPANT) {
      logger.error(
        `User with userId ${existingUser.userId.email} tried to bind one object to another while he is not allowed to`
      );
      throw new createHttpError.Forbidden(
        "You are not allowed to make this request"
      );
    }

    if (!mongoose.Types.ObjectId.isValid(objectIdBoundary.internalObjectId)) {
      // Handle the case where internalObjectId is not a valid ObjectId
      logger.error(
        `Child internalObjectId is not a valid ObjectId:${objectIdBoundary.internalObjectId}`
      );
      throw new createHttpError.NotFound(
        "InternalObjectId is not a valid ObjectId"
      );
    }

    if (!mongoose.Types.ObjectId.isValid(internalObjectId)) {
      // Handle the case where internalObjectId is not a valid ObjectId
      logger.error(
        `Parent internalObjectId is not a valid ObjectId:${internalObjectId}`
      );
      throw new createHttpError.NotFound(
        "InternalObjectId is not a valid ObjectId"
      );
    }

    // Unbind child object from parent
    await ObjectModel.findByIdAndUpdate(internalObjectId, {
      $pull: { children: objectIdBoundary.internalObjectId },
    });

    // Unbind parent object from child
    await ObjectModel.findByIdAndUpdate(objectIdBoundary.internalObjectId, {
      $pull: { parents: internalObjectId },
    });

    logger.info(
      `User with userId ${existingUser.userId.email} successfully unbind parent object:${internalObjectId} to a child object:${objectIdBoundary.internalObjectId} and vice versa`
    );
  },
  /**
   * Gets all the children objects of certain object, accessible to any user.
   * Researcher and Admin are allowed to retrieve all the objects without any activation restriction, differently from
   * Paraticipant that allowed to retrieve only active objects.
   * @async
   * @function
   * @param {string} internalObjectId - The internal objectId of the parent object
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user making the request.
   * @returns {Promise<ObjectBoundary[]>} An array of user models.
   * @throws {Error} Throws an error if the request encounters any issues.
   */
  getAllChildren: async (internalObjectId, userEmail, userPlatform) => {
    const existingUser = await UserModel.findOne({
      userId: userEmail + "$" + userPlatform,
    });

    if (!existingUser) {
      logger.error(
        `User with userId ${userEmail + "$" + userPlatform} does not exists`
      );
      throw new createHttpError.NotFound("User not found");
    }

    if (!mongoose.Types.ObjectId.isValid(internalObjectId)) {
      // Handle the case where internalObjectId is not a valid ObjectId
      logger.error(
        `Parent internalObjectId is not a valid ObjectId:${internalObjectId}`
      );
      throw new createHttpError.NotFound(
        "InternalObjectId is not a valid ObjectId"
      );
    }

    const parentObj = await ObjectModel.findOne({ _id: internalObjectId });

    if (!parentObj) {
      logger.error(
        `Parent object does not exists with internalObjectId:${internalObjectId}`
      );
      throw new createHttpError.NotFound("Object does not exists");
    }

    if (existingUser.role === Roles.PARTICIPANT) {
      logger.info(
        `User with userId ${existingUser.userId.email} successfully retrieved all children objects of parent object:${internalObjectId}`
      );
      return Promise.all(
        parentObj.children.map(async (objectId) => {
          const childObj = await ObjectModel.findOne({
            _id: objectId,
            active: true,
          });
          return childObj;
        })
      ).then(async (objects) => {
        const filteredObjects = objects.filter((object) => object !== null); // Filtering the objects that didn't matched the requirements in this case it is active flag
        return Promise.all(
          filteredObjects.map(
            async (object) => await objectConverter.toBoundary(object)
          )
        );
      });
    } else {
      logger.info(
        `User with userId ${existingUser.userId.email} successfully retrieved all children objects of parent object:${internalObjectId} which are inactive`
      );
      return Promise.all(
        parentObj.children
          .map(async (objectId) => {
            const childObj = await ObjectModel.findOne({ _id: objectId });
            return childObj;
          })
          .map(async (object) => objectConverter.toBoundary(await object))
      ); // Awaiting the object to be retrieved by mongoose
    }
  },
  /**
   * Gets all the parents objects of certain object, accessible to any user.
   * Researcher and Admin are allowed to retrieve all the objects without any activation restriction, differently from
   * Paraticipant that allowed to retrieve only active objects.
   * @async
   * @function
   * @param {string} internalObjectId - The internal objectId of the child object
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user making the request.
   * @returns {Promise<ObjectBoundary[]>} An array of user models.
   * @throws {Error} Throws an error if the request encounters any issues.
   */
  getAllParents: async (internalObjectId, userEmail, userPlatform) => {
    const existingUser = await UserModel.findOne({
      userId: userEmail + "$" + userPlatform,
    });

    if (!existingUser) {
      logger.error(
        `User with userId ${userEmail + "$" + userPlatform} does not exists`
      );
      throw new createHttpError.NotFound("User not found");
    }

    if (!mongoose.Types.ObjectId.isValid(internalObjectId)) {
      // Handle the case where internalObjectId is not a valid ObjectId
      logger.error(
        `Child internalObjectId is not a valid ObjectId:${internalObjectId}`
      );
      throw new createHttpError.NotFound(
        "InternalObjectId is not a valid ObjectId"
      );
    }

    const childObj = await ObjectModel.findOne({ _id: internalObjectId });

    if (!childObj) {
      logger.error(
        `Child object does not exists with internalObjectId:${internalObjectId}`
      );
      throw new createHttpError.NotFound("Object does not exists");
    }

    if (existingUser.role === Roles.PARTICIPANT) {
      return Promise.all(
        childObj.parents.map(async (objectId) => {
          const parentObj = await ObjectModel.findOne({
            _id: objectId,
            active: true,
          });
          return parentObj;
        })
      ).then(async (objects) => {
        const filteredObjects = objects.filter((object) => object !== null); // Filtering the objects that didn't matched the requirements in this case it is active flag
        return Promise.all(
          filteredObjects.map(
            async (object) => await objectConverter.toBoundary(object)
          )
        )
          .then((resArr) => {
            logger.info(
              `User with userId ${existingUser.userId.email} successfully retrieved all parents objects of child object:${internalObjectId}`
            );
            return resArr;
          })
          .catch((error) => {
            logger.error(
              `User with userId ${existingUser.userId.email} encountered some errors while retrieving all the parents objects`
            );
            throw new createHttpError.BadRequest(error);
          });
      });
    } else {
      return Promise.all(
        childObj.parents
          .map(async (objectId) => {
            const parentObj = await ObjectModel.findOne({ _id: objectId });
            return parentObj;
          })
          .map(async (object) => objectConverter.toBoundary(await object))
      )
        .then((resArr) => {
          logger.info(
            `User with userId ${existingUser.userId.email} successfully retrieved all parents objects of child object:${internalObjectId} which are inactive`
          );
          return resArr;
        })
        .catch((error) => {
          logger.error(
            `User with userId ${existingUser.userId.email} encountered some errors while retrieving all the parents objects which are inactive`
          );
          throw new createHttpError.BadRequest(error);
        }); // Awaiting the object to be retrieved by mongoose
    }
  },
  /**
   * Gets all the objects of certain type, accessible to any user.
   * Researcher and Admin are allowed to retrieve all the objects without any activation restriction, differently from
   * Paraticipant that allowed to retrieve only active objects.
   * @async
   * @function
   * @param {string} targetType - The desired type of the objects
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user making the request.
   * @returns {Promise<ObjectBoundary[]>} An array of user models.
   * @throws {Error} Throws an error if the request encounters any issues.
   */
  getAllObjectsByType: async (targetType, userEmail, userPlatform) => {
    const existingUser = await UserModel.findOne({
      userId: userEmail + "$" + userPlatform,
    });

    if (!existingUser) {
      logger.error(
        `User with userId ${userEmail + "$" + userPlatform} does not exists`
      );
      throw new createHttpError.NotFound("User not found");
    }

    if (existingUser.role === Roles.PARTICIPANT) {
      const allObjType = await ObjectModel.find({
        type: targetType,
        active: true,
      });
      return Promise.all(
        allObjType.map(async (object) =>
          objectConverter.toBoundary(await object)
        )
      )
        .then((resArr) => {
          logger.info(
            `User with userId ${existingUser.userId.email} successfully retrieved all objects of by type:${targetType} which are inactive`
          );
          return resArr;
        })
        .catch((error) => {
          logger.error(
            `User with userId ${existingUser.userId.email} encountered some errors while retrieving all the type objects which are inactive`
          );
          throw new createHttpError.BadRequest(error);
        }); // Awaiting the object to be retrieved by mongoose
    }
    const allObjType = await ObjectModel.find({ type: targetType });
    return Promise.all(
      allObjType.map(async (object) => objectConverter.toBoundary(await object))
    )
      .then((resArr) => {
        logger.info(
          `User with userId ${existingUser.userId.email} successfully retrieved all objects of by type:${targetType}`
        );
        return resArr;
      })
      .catch((error) => {
        logger.error(
          `User with userId ${existingUser.userId.email} encountered some errors while retrieving all the type objects`
        );
        throw new createHttpError.BadRequest(error);
      }); // Awaiting the object to be retrieved by mongoose
  },
  /**
   * Gets a object of distinct type, accessible to any user.
   * Researcher and Admin are allowed to retrieve objects without any activation restriction, differently from
   * Paraticipant that allowed to retrieve only active objects.
   * @async
   * @function
   * @param {string} targetType - The desired type of the objects, must be a distinct
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user making the request.
   * @returns {Promise<ObjectBoundary>} An array of user models.
   * @throws {Error} Throws an error if the request encounters any issues.
   */
  getSpecificObjectByType: async (targetType, userEmail, userPlatform) => {
    const existingUser = await UserModel.findOne({
      userId: userEmail + "$" + userPlatform,
    });

    if (!existingUser) {
      logger.error(
        `User with userId ${userEmail + "$" + userPlatform} does not exist`
      );
      throw new createHttpError.NotFound("User not found");
    }

    let object;
    if (existingUser.role === Roles.PARTICIPANT) {
      object = await ObjectModel.findOne({ type: targetType, active: true });
    } else {
      object = await ObjectModel.findOne({ type: targetType });
    }

    if (!object) {
      logger.error(`No object found for type: ${targetType}`);
      throw new createHttpError.NotFound(
        "No object found for the specified type"
      );
    }

    try {
      const res = await objectConverter.toBoundary(object);

      logger.info(
        `User with userId ${existingUser.userId.email} successfully retrieved object by type: ${targetType}`
      );

      return res;
    } catch (error) {
      logger.error(
        `User with userId ${existingUser.userId.email} encountered some errors while retrieving an object by type: ${targetType}`
      );
      throw new createHttpError.BadRequest(error);
    }
  },
  /**
   * Gets all children objects of a certain type and alias for a specific parent object, accessible to any user.
   * Researchers and Admins are allowed to retrieve all objects without any activation restriction, unlike
   * Participants who are only allowed to retrieve active objects.
   * @async
   * @function
   * @param {string} internalObjectId - The internal objectId of the parent object
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user making the request.
   * @param {string} type - The type of the child objects to filter.
   * @param {string} alias - The alias of the child objects to filter.
   * @returns {Promise<ObjectBoundary[]>} An array of object bounderies.
   * @throws {Error} Throws an error if the request encounters any issues.
   */
  getChildrenByTypeAndAlias: async (
    internalObjectId,
    userEmail,
    userPlatform,
    type,
    alias
  ) => {
    // First, retrieve all children using the core method
    const allChildren = await objectsService.getAllChildren(
      internalObjectId,
      userEmail,
      userPlatform
    );

    // Then, filter the children based on type and alias
    const filteredChildren = allChildren.filter(
      (child) => child.type === type && child.alias === alias
    );

    logger.info(
      `User with email ${userEmail} successfully retrieved child objects by type: ${type} and alias: ${alias}`
    );

    return filteredChildren;
  },
  /**
   * Gets all parents objects of a certain type and alias for a specific parent object, accessible to any user.
   * Researchers and Admins are allowed to retrieve all objects without any activation restriction, unlike
   * Participants who are only allowed to retrieve active objects.
   * @async
   * @function
   * @param {string} internalObjectId - The internal objectId of the parent object
   * @param {string} userEmail - The email of the user making the request.
   * @param {string} userPlatform - The platform of the user making the request.
   * @param {string} type - The type of the child objects to filter.
   * @param {string} alias - The alias of the child objects to filter.
   * @returns {Promise<ObjectBoundary[]>} An array of object bounderies.
   * @throws {Error} Throws an error if the request encounters any issues.
   */
  getParentsByTypeAndAlias: async (
    internalObjectId,
    userEmail,
    userPlatform,
    type,
    alias
  ) => {
    // First, retrieve all parents using the core method
    const allParents = await objectsService.getAllParents(
      internalObjectId,
      userEmail,
      userPlatform
    );

    // Then, filter the parents based on type and alias
    const filteredParents = allParents.filter(
      (parent) => parent.type === type && parent.alias === alias
    );

    logger.info(
      `User with email ${userEmail} successfully retrieved parents objects by type: ${type} and alias: ${alias}`
    );

    return filteredParents;
  },
};

/**
 * Exporting the objectsService object for further use by other modules if needed.
 * @type {Object}
 */
export default objectsService;
