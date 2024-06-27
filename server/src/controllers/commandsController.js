import CommandBoundary from "../boundaries/object/ObjectIdBoundary.js";
import commandsService from "../logic/serivces/CommandsService.js";

const commandsController = {
  /**
   * Controller function for creating a new command.
   * @param {Object} req - Express request object formed as CommandBoundary.
   * @param {Object} res - Express response object.
   */
  createCommand: async (req, res) => {
    try {
      const reqCommandBoundary = new CommandBoundary();

      //Getting the body of the request containing the ObjectBoundary data and assigning it to the ObjectBoundary instance
      Object.assign(reqCommandBoundary, req.body);
      const resCommandBoundary = await commandsService.invokeCommand(
        reqCommandBoundary
      );
      res.status(201).json(resCommandBoundary);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during command creation.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },

  /**
   * Controller function for getting all commands.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  getAllCommands: async (req, res) => {
    try {
      const userEmail = req.query.email;
      const userPlatform = req.query.platform;
      const DBResponse = await commandsService.getAllCommands(
        userEmail,
        userPlatform
      );
      res.status(200).json(DBResponse);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during command retrieval.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },

  /**
   * Controller function for deleting all commands (only accessible to Admins).
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  deleteAllCommands: async (req, res) => {
    const userEmail = req.query.email;
    const userPlatform = req.query.platform;
    try {
      const DBResponse = await commandsService.deleteAllCommands(
        userEmail,
        userPlatform
      );
      res.status(200).json(DBResponse);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during command deletion.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },
};

export default commandsController;
