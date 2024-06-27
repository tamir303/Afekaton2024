/**
 * Represents a UserIdBoundary for a UserBoundary object.
 * @class
 */
class UserIdBoundary {
  /**
   * Create a UserIdBoundary.
   * @constructor
   * @param {string} platform - The platform of the user.
   * @param {string} email - The email of the user.
   */
  constructor(platform, email) {
    /**
     * The platform of the user.
     * @type {string}
     */
    this.platform = platform;

    /**
     * The email of the user.
     * @type {string}
     */
    this.email = email;
  }

  /**
   * Checks if this UserIdBoundary is equal to another object.
   * @param {UserIdBoundary} other - The object to compare with.
   * @returns {boolean} True if the objects are equal, false otherwise.
   */
  equals(other) {
    if (this === other) return true;
    if (other === null || this.constructor !== other.constructor) return false;
    return this.email === other.email;
  }
}

/**
 * Exporting the UserIdBoundary class for further use by other modules if needed.
 * @type {UserIdBoundary}
 */
export default UserIdBoundary;
