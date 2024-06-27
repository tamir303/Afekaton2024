import mongoose from "mongoose";

/**
 * Mongoose schema for representing a UserBoundaryObject.
 * @type
 */
const UserBoundarySchema = new mongoose.Schema(
  {
    /**
     * The userId field containing platform and email information concatenated by '$' and will look this:"example@email.org$platformKind".
     * The email of the Researcher it will be "examle@email.com",
     * and for Participant from prolific it will be "58dbb652520ca20001e87f23@email.prolific.co" which is fictive.
     * Regular Particpant will have will have an email similar to the Researcher email.
     * The platform is where the request came from, whether from Experiment module or Experiment Builder platform
     * @type {String}
     */
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    /**
     * The role of the user.
     * @type {String}
     */
    role: {
      type: String,
      required: true,
    },
    /**
     * The username of the user.
     * @type {String}
     */
    username: {
      type: String,
      required: true,
      min: 3,
      max: 50,
    },
    /**
     * Additional details of the user as a JSON object.
     * @type {Object}
     */
    userDetails: {
      type: Object,
      required: true,
      default: {},
    },
  },
  /**
   * Additional options for the schema.
   */
  { timestamps: true }
);

/**
 * Mongoose model based on the UserBoundarySchema.
 * @type {Model}
 */
const UserModel = mongoose.model("User", UserBoundarySchema);

/**
 * Exporting the UserModel for further use by other modules if needed.
 * @type {Model}
 */
export default UserModel;
