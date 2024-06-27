/**
 * Represents an ObjectIdBoundary.
 * @class
 */
class ObjectIdBoundary {
  /**
   * Constructs an ObjectIdBoundary instance.
   * @constructor
   * @param {String} platform - The platform of the object.
   * @param {String} internalObjectId - The internal object ID, can be undefined before data base insertion
   */
  constructor(platform, internalObjectId) {
    /**
     * The platform of the object.
     * @type {String}
     */
    this.platform = platform;

    /**
     * The internal object ID.
     * @type {String}
     */
    this.internalObjectId = internalObjectId;
  }

  /**
   * Checks if this ObjectIdBoundary is equal to another object.
   * @param {ObjectIdBoundary} other - The object to compare with.
   * @returns {Boolean} True if the objects are equal, false otherwise.
   */
  equals(other) {
    if (this === other) return true;
    if (other === null || this.constructor !== other.constructor) return false;
    return (
      this.platform === other.platform &&
      this.internalObjectId === other.internalObjectId
    );
  }
}

/**
 * Exporting the ObjectIdBoundary class for further use by other modules if needed.
 * @type {ObjectIdBoundary}
 */
export default ObjectIdBoundary;
