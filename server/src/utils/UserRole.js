/**
 * Represents the available roles within the system.
 * @enum {string}
 */
const Roles = {
  /**
   * Represents the 'Admin' role.
   * @type {string}
   */
  ADMIN: "Admin",

  /**
   * Represents the 'Participant' role.
   * @type {string}
   */
  PARTICIPANT: "Participant",

  /**
   * Represents the 'Researcher' role.
   * @type {string}
   */
  RESEARCHER: "Researcher",
};

/**
 * Exporting the Roles enumeration for further use by other modules if needed.
 * @type {Roles}
 */
export default Roles;
