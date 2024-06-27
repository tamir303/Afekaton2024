import userService from "../logic/serivces/UsersService.js";
import emailService from "../logic/serivces/EmailService.js";
import UserBoundary from "../boundaries/user/UserBoundary.js";
import { setCookieIfNeeded } from "../logic/middleware/auth.js";

const entryController = {
  /**
   * Controller function for user registration.
   * @param {Object} req - Express request object formed as UserBoundary.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Promise representing the registration process.
   */
  registerUser: async (req, res) => {
    const userData = req.body; // Getting the body of the request containing the NewUserBoundary data
    try {
      const reqUserBoundary = new UserBoundary(
        userData.platform,
        userData.email,
        userData.role,
        userData.username,
        userData.userDetails
      );
      const DBResponse = await userService.createUser(reqUserBoundary);
      if (DBResponse.hasOwnProperty("jwtToken")) {
        setCookieIfNeeded(
          req,
          res,
          DBResponse.jwtToken,
          DBResponse.expirationCookie
        );
      }
      res.status(201).json(DBResponse.body);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during user registration.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },

  /**
   * Controller function for user login.
   * @param {Object} req - Express request object formed as UserBoundary.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Promise representing the login process.
   */
  loginUser: async (req, res) => {
    const userData = req.body; // Getting the body of the request containing the NewUserBoundary data
    try {
      const reqUserBoundary = new UserBoundary(
        userData.platform,
        userData.email,
        userData.role,
        userData.username,
        userData.userDetails
      );
      const DBResponse = await userService.login(reqUserBoundary);
      if (DBResponse.hasOwnProperty("jwtToken")) {
        setCookieIfNeeded(
          req,
          res,
          DBResponse.jwtToken,
          DBResponse.expirationCookie
        );
      }
      res.status(200).json(DBResponse.body);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during user login.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },
  /**
   * Controller function for genereting OTP verification password login.
   * @param {Object} req - Express request object formed as UserBoundary.
   * @param {Object} res - Express response object that contains the verification code.
   * @returns {Promise<void>} Promise representing the verification code.
   */
  veirfyUser: async (req, res) => {
    try {
      const email = req.query.email; // Getting the body of the request containing the NewUserBoundary data
      const smtpRes = await emailService.sendVerificationCode(email);
      res.status(200).json(smtpRes);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during sending verification code.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },
  /**
   * Controller function for updating researcher information.
   * @param {Object} req - Express request object formed as UserBoundary.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Promise representing the user update process.
   */
  updateUser: async (req, res) => {
    const userEmail = req.params.email;
    const userPlatform = req.params.platform;
    const userData = req.body; // Getting the body of the request containing the NewUserBoundary data
    try {
      const reqUserBoundary = new UserBoundary(
        userData.platform,
        userData.email,
        userData.role,
        userData.username,
        userData.userDetails
      );
      const DBResponse = await userService.updateUser(
        userEmail,
        userPlatform,
        reqUserBoundary
      );
      res.status(200).json(DBResponse);
    } catch (error) {
      const errorMessage =
        process.env.NODE_ENV !== "prod"
          ? error.message
          : "An error occurred during user update.";
      res.status(error.status || 500).json({ error: errorMessage });
    }
  },
};

export default entryController;
