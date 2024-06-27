import ObjectBoundary from "../../boundaries/object/ObjectBoundary.js"; // Import ObjectBoundary class
import UserIdBoundary from "../../boundaries/user/UserIdBoundary.js";
import ObjectModel from "../../models/ObjectModel.js"; // Import ObjectModel
import createHttpError from "http-errors"; // Import createHttpError for HTTP error handling
import Location from "../../utils/Location.js"; // Import Location class
import UserModel from "../../models/UserModel.js"; // Import UserModel
import UserIdInvoker from "../../utils/Invokers/UserIdInvoker.js"; // Import UserIdInvoker class
import ObjectIdBoundary from "../../boundaries/object/ObjectIdBoundary.js"; // Import ObjectIdBoundary class

const objectConverter = {
  toBoundary: async (objectModel) => {
    const internalId = objectModel._id;
    const platform = objectModel.platform;
    const objectIdBoundary = new ObjectIdBoundary(platform, internalId);

    const creationTimestamp = new Date(objectModel.createdAt);
    const modificationTimestamp = new Date(objectModel.updatedAt);

    const location = new Location(
      objectModel.location.lat,
      objectModel.location.lng
    );

    const userModel = await UserModel.findOne({ _id: objectModel.createdBy });

    if (!userModel) throw new createHttpError.NotFound("User does not exists");

    //splitArr[0] = "example@email.org" splitArr[1] = "platformKind"
    const splitArr = userModel.userId.split("$");

    const userIdBoundary = new UserIdBoundary(splitArr[1], splitArr[0]);

    const userIdInvoker = new UserIdInvoker(userIdBoundary);

    const objectBoundary = new ObjectBoundary(
      objectIdBoundary,
      objectModel.type,
      objectModel.alias,
      objectModel.active,
      creationTimestamp,
      modificationTimestamp,
      location,
      userIdInvoker,
      objectModel.objectDetails
    );

    // Return the ObjectBoundary instance
    return objectBoundary;
  },

  toModel: async (objectBoundary) => {
    const userEmail = objectBoundary.createdBy.userId.email;
    const userPlatform = objectBoundary.createdBy.userId.platform;

    const userModel = await UserModel.findOne({
      userId: userEmail + "$" + userPlatform,
    });

    if (!userModel) throw new createHttpError.NotFound("User does not exist");

    const objectModel = new ObjectModel({
      platform: userPlatform,
      type: objectBoundary.type,
      alias: objectBoundary.alias,
      active: objectBoundary.active,
      location: objectBoundary.location,
      createdBy: userModel._id,
      objectDetails: objectBoundary.objectDetails,
      children: [],
      parents: [],
    });

    // Return the ObjectModel instance
    return objectModel;
  },
};

// Export the objectConverter object for use in other modules
export default objectConverter;
