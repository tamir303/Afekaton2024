import ObjectIdBoundary from "./ObjectIdBoundary.js";
import UserIdInvoker from "../../utils/Invokers/UserIdInvoker.js";
import Location from "../../utils/Location.js";

/**
 * Represents a ObjectBoundary that contains information about an object within the  platform.
 * @class
 */
class ObjectBoundary {
  /**
   * Create a ObjectBoundary.
   * @constructor
   * @param {String} objectId - The ID of the object boundary.
   * @param {String} type - The type of the object boundary.
   * @param {String} alias - The alias of the object boundary.
   * @param {Boolean} active - Whether the object boundary is active.
   * @param {Date} creationTimestamp - The creation timestamp of the object boundary,
   * can be undefined before data base insertion
   * @param {Date} modificationTimestamp - The creation timestamp of the object boundary,
   * can be undefined before data base insertion
   * @param {Location} location - The location of the object boundary.
   * @param {String} createdBy - The user ID who created the object boundary.
   * @param {Object} objectDetails - Details of the object boundary as a JSON object.
   */
  constructor(
    objectId,
    type,
    alias,
    active,
    creationTimestamp,
    modificationTimestamp,
    location,
    createdBy,
    objectDetails
  ) {
    /**
     * The ID of the object boundary.
     * @type {ObjectIdBoundary}
     */
    this.objectId = objectId;

    /**
     * The type of the object boundary.
     * @type {String}
     */
    this.type = type;

    /**
     * The alias of the object boundary.
     * @type {String}
     */
    this.alias = alias;

    /**
     * Whether the object boundary is active.
     * @type {Boolean}
     */
    this.active = active;

    /**
     * The creation timestamp of the object boundary.
     * @type {Date}
     */
    this.creationTimestamp = creationTimestamp;

    /**
     * The modification timestamp of the object boundary.
     * @type {Date}
     */
    this.modificationTimestamp = modificationTimestamp;

    /**
     * The location of the object boundary.
     * @type {Location}
     */
    this.location = location;

    /**
     * The user ID who created the object boundary.
     * @type {UserIdInvoker}
     */
    this.createdBy = createdBy;

    /**
     * Details of the object boundary as a JSON object.
     * @type {Object}
     */
    this.objectDetails = objectDetails;
  }

  /**
   * Checks if this ObjectBoundary is equal to another object.
   * @param {ObjectBoundary} other - The object to compare with.
   * @returns {Boolean} True if the objects are equal, false otherwise.
   */
  equals(other) {
    if (this === other) return true;
    if (other === null || this.constructor !== other.constructor) return false;
    return this.objectId.equals(other.objectId);
  }
}

/**
 * Exporting the ObjectBoundary class for further use by other modules if needed.
 * @type {ObjectBoundary}
 */
export default ObjectBoundary;
