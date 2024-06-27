import UserIdBoundary from "../../boundaries/user/UserIdBoundary.js";
/**
 * Represents a UserIdInvoker that encapsulates a UserIdBoundary object.
 * This class represents an infornation about the user who invoked a command or some obejct
 * @class
 */
class UserIdInvoker {
  /**
   * Create a UserIdInvoker.
   * @constructor
   * @param {UserIdBoundary} userId - The UserIdBoundary object to be encapsulated.
   */
  constructor(userId) {
    /**
     * The UserIdBoundary object that this class encapsulates.
     * @type {UserIdBoundary}
     */
    this.userId = userId;
  }

  /**
   * Checks if this UserIdInvoker is equal to another object.
   * @param {UserIdInvoker} other - The object to compare with.
   * @returns {Boolean} True if the objects are equal, false otherwise.
   */
  equals(other) {
    if (this === other) return true;
    if (other === null || this.constructor !== other.constructor) return false;
    return this.userId.equals(other.userId);
  }
}

/**
 * Exporting the UserIdInvoker class for further use by other modules if needed.
 * @type {UserIdInvoker}
 */
export default UserIdInvoker;
