import SubjectBoundary from "../../boundaries/subject/SubjectBoundary.js"; // Import SubjectBoundary class
import SubjectModel from "../../models/SubjectModel.js"; // Import SubjectModel class
import createHttpError from "http-errors"; // Import createHttpError for HTTP error handling

// Define an object for subject conversion operations
const subjectConverter = {
  /**
   * Converts a SubjectModel instance to a SubjectBoundary instance.
   *
   * @param {SubjectModel} subjectModel - The SubjectModel instance to convert.
   * @returns {SubjectBoundary} The converted SubjectBoundary instance.
   * @throws {createHttpError.BadRequest} If the subjectModel is invalid.
   */
  toBoundary: (subjectModel) => {
    if (!subjectModel || !subjectModel.subjectId || !subjectModel.name) {
      throw new createHttpError.BadRequest("Invalid subject data");
    }

    // Create a new SubjectBoundary using data from SubjectModel
    const subjectBoundary = new SubjectBoundary(
      subjectModel.subjectId,
      subjectModel.name
    );

    // Return the SubjectBoundary instance
    return subjectBoundary;
  },

  /**
   * Converts a SubjectBoundary instance to a SubjectModel instance.
   *
   * @param {SubjectBoundary} subjectBoundary - The SubjectBoundary instance to convert.
   * @returns {SubjectModel} The converted SubjectModel instance.
   * @throws {createHttpError.BadRequest} If the subjectBoundary is invalid.
   */
  toModel: (subjectBoundary) => {
    if (!subjectBoundary || !subjectBoundary.subjectId || !subjectBoundary.name) {
      throw new createHttpError.BadRequest("Invalid subject data");
    }

    // Create a new SubjectModel using data from SubjectBoundary
    const subjectModel = new SubjectModel({
      subjectId: subjectBoundary.subjectId,
      name: subjectBoundary.name,
    });

    // Return the SubjectModel instance
    return subjectModel;
  },
};

// Export the subjectConverter object for use in other modules
export default subjectConverter;
