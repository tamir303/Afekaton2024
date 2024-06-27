/**
 * Represents an ObjectBoundary that contains information about an object within the platform.
 * @class
 */
class ObjectBoundary {
  constructor(
    objectId,
    type,
    alias,
    active,
    createdBy,
    objectDetails,
    location,
    creationTimestamp,
    modificationTimestamp
  ) {
    this.objectId = objectId;
    this.type = type;
    this.alias = alias;
    this.active = active;
    this.createdBy = createdBy;
    this.objectDetails = objectDetails;
    this.location = location;
    this.creationTimestamp = creationTimestamp;
    this.modificationTimestamp = modificationTimestamp;
  }

  /**
   * Checks if this ObjectBoundary is equal to another object.
   * @param {ObjectBoundary} other - The object to compare with.
   * @returns {boolean} True if the objects are equal, false otherwise.
   */
  equals(other) {
    if (this === other) return true;
    if (other === null || this.constructor !== other.constructor) return false;
    return this.objectId.equals(other.objectId);
  }
}

export { ObjectBoundary };
