import mongoose from "mongoose";

/**
 * Mongoose schema for representing a Subject.
 * @type
 */
const SubjectSchema = new mongoose.Schema(
  {
    /**
     * The subjectId field.
     * @type {String}
     */
    subjectId: {
      type: String,
      required: true,
      unique: true,
    },
    /**
     * The name of the subject.
     * @type {String}
     */
    name: {
      type: String,
      required: true,
    },
  },
  /**
   * Additional options for the schema.
   */
  { timestamps: true }
);

/**
 * Mongoose model based on the SubjectSchema.
 * @type {Model}
 */
const SubjectModel = mongoose.model("Subject", SubjectSchema);

/**
 * Exporting the SubjectModel for further use by other modules if needed.
 * @type {Model}
 */
export default SubjectModel;
