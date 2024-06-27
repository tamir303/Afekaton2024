/**
 * Represents a geographic location with latitude and longitude coordinates.
 * @class
 */
class Location {
  /**
   * Create a Location instance with latitude and longitude coordinates.
   * @constructor
   * @param {number} lat - The latitude coordinate.
   * @param {number} lng - The longitude coordinate.
   */
  constructor(lat, lng) {
    /**
     * The latitude coordinate of the location.
     * @type {number}
     */
    this.lat = lat;

    /**
     * The longitude coordinate of the location.
     * @type {number}
     */
    this.lng = lng;
  }

  /**
   * Checks if this Location is equal to another object.
   * @param {Location} other - The object to compare with.
   * @returns {boolean} True if the objects have the same latitude and longitude, false otherwise.
   */
  equals(other) {
    // If the two objects are the same, they are considered equal
    if (this === other) return true;

    // If the other object is null or has a different constructor, they are not equal
    if (other === null || this.constructor !== other.constructor) return false;

    // Compare latitude and longitude values to determine equality
    return this.lat === other.lat && this.lng === other.lng;
  }
}

/**
 * Exporting the Location class for use by other modules if needed.
 * @type {Location}
 */
export default Location;
