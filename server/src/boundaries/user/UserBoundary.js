import UserIdBoundary from "./UserIdBoundary.js";
/**
 * Represents a UserBoundary object of the Collector's users.
 * @class
 */
class UserBoundary {
  /**
   * Create a UserBoundary.
   * @constructor
   * @param {string} platform - The platform that user uses
   * @param {string} email - The email that belongs to the user
   * @param {string} role - The role of the user.
   * @param {string} username - The username of the user.
   * @param {Object} userDetails - Additional data about the user.
   */
  constructor(platform, email, role, username, userDetails) {
    /**
     * The UserIdBoundary instance of the user.
     * @type {UserIdBoundary}
     */
    this.userId = new UserIdBoundary(platform, email);

    /**
     * The role of the user.
     * @type {string}
     */
    this.role = role;

    /**
     * The username of the user.
     * @type {string}
     */
    this.username = username;

    /**
     * The username of the user.
     * @type {Object}
     */
    this.userDetails = userDetails;
  }

  /**
   * Checks if this UserBoundary is equal to another object.
   * @param {UserBoundary} other - The object to compare with.
   * @returns {boolean} True if the objects are equal, false otherwise.
   */
  equals(other) {
    if (this === other) return true;
    if (other === null || this.constructor !== other.constructor) return false;
    return this.userId.equals(other.userId);
  }
}

/**
 * Exporting the UserBoundary class for further use by other modules if needed.
 * @type {UserBoundary}
 */
export default UserBoundary;
