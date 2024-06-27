/**
 * Represents an ObjectIdInvoker responsible for invoking methods from ObjectIdBoundary.
 * @class
 */
class ObjectIdInvoker {
  /**
   * Create an ObjectIdInvoker.
   * @constructor
   * @param {ObjectIdBoundary} objectId - The instance of ObjectIdBoundary.
   */
  constructor(objectId) {
    this.objectId = objectId;
  }

  /**
   * Checks if this ObjectIdInvoker is equal to another object.
   * @param {ObjectIdInvoker} other - The object to compare with.
   * @returns {boolean} True if the objects are equal, false otherwise.
   */
  equals(other) {
    if (this === other) return true;
    if (other === null || this.constructor !== other.constructor) return false;
    return this.objectId.equals(other.objectId);
  }
}

/**
 * Exporting the ObjectIdInvoker class for further use by other modules if needed.
 * @type {ObjectIdInvoker}
 */
export default ObjectIdInvoker;
