import UserBoundary from "../../boundaries/user/UserBoundary.js"; // Import UserBoundary class
import UserModel from "../../models/UserModel.js"; // Import UserModel class
import Roles from "../../utils/UserRole.js"; // Import Roles enumeration
import createHttpError from "http-errors"; // Import createHttpError for HTTP error handling

// Define an object for user conversion operations
const userConverter = {
  /**
   * Converts a UserModel instance to a UserBoundary instance.
   *
   * @param {UserModel} userModel - The UserModel instance to convert.
   * @returns {UserBoundary} The converted UserBoundary instance.
   * @throws {createHttpError.BadRequest} If an invalid user role is encountered.
   */
  toBoundary: (userModel) => {
    // Extract the user's role from the UserModel
    const role = userModel.role;

    // Check if the role is a valid role defined in the Roles enum
    if (!Object.values(Roles).includes(role)) {
      throw new createHttpError.BadRequest("Invalid user role");
    }

    //splitArr[0] = "example@email.org" splitArr[1] = "platformKind"
    const splitArr = userModel.userId.split("$");

    // Create a new UserBoundary using data from UserModel
    const userBoundary = new UserBoundary(
      splitArr[1],
      splitArr[0],
      userModel.role,
      userModel.username,
      userModel.userDetails
    );

    // Return the UserBoundary instance
    return userBoundary;
  },

  /**
   * Converts a UserBoundary instance to a UserModel instance.
   *
   * @param {UserBoundary} userBoundary - The UserBoundary instance to convert.
   * @returns {UserModel} The converted UserModel instance.
   * @throws {createHttpError.BadRequest} If an invalid user role is encountered.
   */
  toModel: (userBoundary) => {
    // Extract the role from UserBoundary
    const role = userBoundary.role;

    // Create an invertedRoles object to map role names to enum values
    const invertedRoles = Object.fromEntries(
      Object.entries(Roles).map(([key, value]) => [value, key])
    );

    // Get the mapped role value from the Roles enum using the invertedRoles object
    const mappedRole = Roles[invertedRoles[role]];

    // Check if the mapped role is valid
    if (!mappedRole) {
      throw new createHttpError.BadRequest("Invalid user role");
    }

    // Create a new UserModel using data from UserBoundary
    const userModel = new UserModel({
      //The userId will be constructed as "example@email.org$platformKind" for both of the users
      userId: userBoundary.userId.email + "$" + userBoundary.userId.platform,
      role: mappedRole, // Use the mapped role value
      username: userBoundary.username,
      userDetails: userBoundary.userDetails,
    });

    // Return the UserModel instance
    return userModel;
  },
};

// Export the userConverter object for use in other modules
export default userConverter;
