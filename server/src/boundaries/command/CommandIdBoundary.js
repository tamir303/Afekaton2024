/**
 * Represents a CommandIdBoundary that contains information about platform, and internal object ID.
 * @class
 */
class CommandIdBoundary {
  /**
   * Create a CommandIdBoundary.
   * @constructor
   * @param {string} platform - The platform parameter of the command identifier.
   * @param {string} internalCommandId - The internal object ID parameter of the command identifier.
   */
  constructor(platform, internalCommandId) {
    /**
     * The platform parameter of the command identifier.
     * @type {string}
     */
    this.platform = platform;

    /**
     * The internal object ID parameter of the command identifier.
     * @type {string}
     */
    this.internalCommandId = internalCommandId;
  }

  /**
   * Checks if this CommandIdBoundary is equal to another object.
   * @param {CommandIdBoundary} other - The object to compare with.
   * @returns {boolean} True if the objects are equal, false otherwise.
   */
  equals(other) {
    if (this === other) return true;
    if (other === null || this.constructor !== other.constructor) return false;
    return (
      this.platform === other.platform &&
      this.internalCommandId === other.internalCommandId
    );
  }
}

/**
 * Exporting the CommandIdBoundary class for further use by other modules if needed.
 * @type {CommandIdBoundary}
 */
export default CommandIdBoundary;
