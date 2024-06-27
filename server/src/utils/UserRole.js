/**
 * Represents the available roles within the system.
 * @enum {string}
 */
const Roles = {
  /**
   * Represents the 'smartUpStudent' role.
   * @type {string}
   */
  smartUpStudent: "smartUpStudent",

  /**
   * Represents the 'studentOver80' role.
   * @type {string}
   */
  studentOver80: "studentOver80",

  /**
   * Represents the 'gradStudent' role.
   * @type {string}
   */
  gradStudent: "gradStudent",

  /**
   * Represents the 'external' role.
   * @type {string}
   */
  external: "external",

  /**
   * Represents the 'regular' role.
   * @type {string}
   */
  regular: "regular",
};

/**
 * Exporting the Roles enumeration for further use by other modules if needed.
 * @type {Roles}
 */
export default Roles;
