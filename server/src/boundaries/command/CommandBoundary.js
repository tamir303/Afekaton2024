import CommandIdBoundary from "./CommandIdBoundary.js";
import ObjectIdInvoker from "../../utils/Invokers/ObjectIdinvoker.js";
import UserIdInvoker from "../../utils/Invokers/UserIdInvoker.js";
/**
 * Represents a CommandBoundary that contains information about a command executed by a user on a mini app object.
 * @class
 */
class CommandBoundary {
  /**
   * Create a CommandBoundary.
   * @constructor
   * @param {CommandIdBoundary} commandId - The ID of the command boundary.
   * @param {String} command - The command string.
   * @param {String} targetObject - The ID of the target object.
   * @param {Date} invocationTimestamp - The time when the command was invoked.
   * @param {String} invokedBy - The ID of the user who invoked the command.
   * @param {Object} commandAttributes - The attributes of the command.
   */
  constructor(
    commandId,
    command,
    targetObject,
    invocationTimestamp,
    invokedBy,
    commandAttributes
  ) {
    /**
     * The ID of the command boundary.
     * @type {CommandIdBoundary}
     */
    this.commandId = commandId;

    /**
     * The command string.
     * @type {string}
     */
    this.command = command;

    /**
     * The ID of the target object.
     * @type {ObjectIdInvoker}
     */
    this.targetObject = targetObject;

    /**
     * The time when the command was invoked.
     * @type {Date}
     */
    this.invocationTimestamp = invocationTimestamp;

    /**
     * The ID of the user who invoked the command.
     * @type {UserIdInvoker}
     */
    this.invokedBy = invokedBy;

    /**
     * The attributes of the command.
     * @type {Object.<string, any>}
     */
    this.commandAttributes = commandAttributes;
  }

  /**
   * Checks if this CommandBoundary is equal to another object.
   * @param {CommandBoundary} other - The object to compare with.
   * @returns {boolean} True if the objects are equal, false otherwise.
   */
  equals(other) {
    if (this === other) return true;
    if (other === null || this.constructor !== other.constructor) return false;
    return (
      this.commandId.equals(other.commandId) &&
      this.command === other.command &&
      this.targetObject.equals(other.targetObject) &&
      this.invocationTimestamp.getTime() ===
        other.invocationTimestamp.getTime() &&
      this.invokedBy.equals(other.invokedBy)
    );
  }
}

/**
 * Exporting the CommandBoundary class for further use by other modules if needed.
 * @type {CommandBoundary}
 */
export default CommandBoundary;
