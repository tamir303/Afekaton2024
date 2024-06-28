import SubjectModel from "../models/SubjectsModel.js";

const subjectController = {
    /**
     * Controller function for creating a new object
     * @param {Object} req - Express request object formed as UserBoundary.
     * @param {Object} res - Express response object.
     */
    getAllSubjects: async (req, res) => {
        const DBRES = await SubjectModel.find();
        res.status(200).json(DBRES);
    }
}

export default subjectController