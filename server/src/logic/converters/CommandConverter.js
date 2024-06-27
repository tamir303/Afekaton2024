import UserIdBoundary from "../../boundaries/user/UserIdBoundary.js";
import ObjectModel from "../../models/ObjectModel.js"; // Import ObjectModel class
import ObjectIdBoundary from "../../boundaries/object/ObjectIdBoundary.js";
import CommandModel from "../../models/CommandModel.js"; // Import CommandModel class
import createHttpError from "http-errors"; // Import createHttpError for HTTP error handling
import UserModel from "../../models/UserModel.js";
import UserIdInvoker from "../../utils/Invokers/UserIdInvoker.js";
import CommandIdBoundary from "../../boundaries/command/CommandIdBoundary.js";
import CommandBoundary from "../../boundaries/command/CommandBoundary.js";
import ObjectIdInvoker from "../../utils/Invokers/ObjectIdinvoker.js";

const commandConverter = {
  toBoundary: async (commandModel) => {
    const internalId = commandModel._id;
    const platform = commandModel.platform;
    const commandIdBoundary = new CommandIdBoundary(platform, internalId);

    const creationTimestamp = new Date(commandModel.createdAt);

    const userModel = await UserModel.findOne({ _id: commandModel.invokedBy });

    if (!userModel) throw new createHttpError.NotFound("User does not exists");

    //splitArr[0] = "example@email.org" splitArr[1] = "platformKind"
    const splitArr = userModel.userId.split("$");

    const userIdBoundary = new UserIdBoundary(splitArr[1], splitArr[0]);

    const userIdInvoker = new UserIdInvoker(userIdBoundary);

    const objectModel = await ObjectModel.findOne({
      _id: commandModel.targetObject,
    });

    if (!objectModel)
      throw new createHttpError.NotFound("Object does not exists");

    const objectIdBoundary = new ObjectIdBoundary(
      objectModel.platform,
      objectModel._id
    );

    const objectIdInvoker = new ObjectIdInvoker(objectIdBoundary);

    const commandBoundary = new CommandBoundary(
      commandIdBoundary,
      commandModel.command,
      objectIdInvoker,
      creationTimestamp,
      userIdInvoker,
      commandModel.commandAttributes
    );

    // Return the commandBoundary instance
    return commandBoundary;
  },

  toModel: async (commandBoundary) => {
    const userEmail = commandBoundary.invokedBy.userId.email;
    const userPlatform = commandBoundary.invokedBy.userId.platform;

    const userModel = await UserModel.findOne({
      userId: userEmail + "$" + userPlatform,
    });

    const commandModel = new CommandModel({
      platform: userPlatform,
      command: commandBoundary.command,
      targetObject: commandBoundary.targetObject.objectId.internalObjectId, //The internal ObjectId is already stored in this parameter
      invokedBy: userModel._id,
      commandAttributes: commandBoundary.commandAttributes,
    });

    // Return the ObjectModel instance
    return commandModel;
  },
};

// Export the commandConverter object for use in other modules
export default commandConverter;
