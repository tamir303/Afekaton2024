import mongoose from "mongoose";

/**
 * Mongoose schema for representing a CommandBoundary object.
 * @class
 */
const CommandSchema = new mongoose.Schema(
  {
    /**
     * The platform of the object.
     * @type {String}
     */
    platform: {
      type: String,
      required: true,
    },
    /**
     * The command string.
     * @type {String}
     */
    command: {
      type: String,
      required: true,
      validate: {
        validator: (value) => {
          return Object.keys(value).length > 0;
        },
        message: () => `Command attributes cannot be empty.`,
      },
    },
    /**
     * A reference to the target object.
     * @type {mongoose.Schema.Model}
     */
    targetObject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ObjectBoundary",
      required: true,
    },
    /**
     * A reference to the user who invoked the command.
     * @type {mongoose.Schema.Model}
     */
    invokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /**
     * The attributes of the command.
     * @type {Object}
     */
    commandAttributes: {
      type: Object,
      required: true,
    },
  },
  /**
   * Additional options for the schema.
   */
  { timestamps: true }
);

/**
 * Mongoose model based on the CommandSchema schema.
 * @type {Model}
 */
const CommandModel = mongoose.model("Command", CommandSchema);

/**
 * Exporting the CommandModel for further use by other modules if needed.
 * @type {Model}
 */
export default CommandModel;
