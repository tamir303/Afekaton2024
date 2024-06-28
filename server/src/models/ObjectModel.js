import mongoose from "mongoose";

/**
 * Mongoose schema for representing an ObjectBoundary object.
 * @class
 */
const ObjectSchema = new mongoose.Schema(
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
     * The type of the object boundary.
     * @type {String}
     */
    type: {
      type: String,
      required: true,
    },
    /**
     * Whether the object boundary is active.
     * @type {Boolean}
     */
    active: {
      type: Boolean,
      required: true,
    },
    /**
     * A reference to the user who created the object boundary.
     * @type {mongoose.Schema}
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /**
     * Details of the object boundary as a JSON object.
     * @type {Object}
     */
    objectDetails: {
      type: Object,
      required: true,
    },
    /**
     * An array of references to children object boundaries.
     * @type {Array}
     */
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ObjectEntity",
        default: [],
        required: true,
      },
    ],
    /**
     * An array of references to parent object boundaries.
     * @type {Array}
     */
    parents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ObjectEntity",
        default: [],
        required: true,
      },
    ],
  },
  /**
   * Additional options for the schema.
   */
  { timestamps: true }
);

/**
 * Mongoose model based on the ObjectSchema schema.
 * @type {Model}
 */
const ObjectModel = mongoose.model("Object", ObjectSchema);

/**
 * Exporting the ObjectModel for further use by other modules if needed.
 * @type {Model}
 */
export default ObjectModel;
