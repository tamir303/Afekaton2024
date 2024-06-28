const axios = require('axios');
const log4js = require('log4js');

// Configuration for ChatEngine API
const CHAT_ENGINE_PROJECT_ID = "865c90f5-ea90-42b9-a1d9-1b42eccf9205";
const CHAT_ENGINE_PRIVATE_KEY = "591fbf66-713a-47d1-b178-9bfcef1a8b10 ";
let shouldChatEngine = false;

// Initialize logger
const logger = log4js.getLogger("ChatService");
logger.level = 'debug';

class ChatService {
    /**
     * ChatService class for interacting with the ChatEngine API.
     */
    constructor() { }

    /**
     * Performs a login request to the ChatEngine API.
     *
     * @param {string} userSuperApp - The user's super app.
     * @param {string} userEmail - The user's email address.
     * @throws {Error} If the user doesn't exist in ChatEngine.
     */
    async chatEngineLogIn(userSuperApp, userEmail) {
        logger.trace(`${userEmail} under ${userSuperApp} super app, log in into Chat mini app with`);
        try {
            const response = await axios.get('https://api.chatengine.io/users/me', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Project-ID': CHAT_ENGINE_PROJECT_ID,
                    'User-Name': userEmail,
                    'User-Secret': userEmail
                }
            });
            logger.debug(`user ${userEmail} with ${userSuperApp} super app, finished to log in`);
            return response.data;
        } catch (error) {
            logger.error(`User {${userSuperApp}, ${userEmail}} Doesn't Exist IN CHAT ENGINE`);
            throw new Error(`User {${userSuperApp}, ${userEmail}} Doesn't Exist IN CHAT ENGINE`);
        }
    }

    /**
     * Performs a signup request to the ChatEngine API.
     *
     * @param {string} email - The user's email address.
     * @param {string} firstName - The user's first name.
     * @param {string} lastName - The user's last name.
     * @throws {Error} If the signup fails.
     */
    async chatEngineSignUp(email, firstName, lastName) {
        try {
            logger.trace(`User with email ${email}, first name ${firstName} and last name ${lastName}, sign up to Chat mini app`);
            const response = await axios.post('https://api.chatengine.io/users', {
                username: email,
                secret: email,
                email: email,
                first_name: firstName,
                last_name: lastName
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Private-Key': CHAT_ENGINE_PRIVATE_KEY
                }
            });
            logger.debug(`User with email ${email}, first name ${firstName} and last name ${lastName}, finished to sign up to Chat mini app`);
            return response.data;
        } catch (error) {
            logger.error(`CHAT ENGINE FAILED TO SIGNUP ${email}`);
            throw new Error(`CHAT ENGINE FAILED TO SIGNUP ${email}`);
        }
    }

    /**
     * Executes a command based on the command option.
     *
     * @param {Object} command - The command object containing the command option and command attributes.
     * @throws {Error} If the command is undefined.
     */
    async runCommand(command) {
        try {
            logger.trace(`Run command ${command.getCommand()} in Chat mini app service`);
            const commandOpt = command.getCommand();
            if (commandOpt === "activateChatSignUp") {
                const commandAttributes1 = command.getCommandAttributes();
                const firstName = commandAttributes1.get("firstName").toString();
                const lastName = commandAttributes1.get("lastName").toString();
                const email = command.getInvokedBy().getUserId().getEmail();
                await this.chatEngineSignUp(email, firstName, lastName);
            } else if (commandOpt === "activateChatLogin") {
                const superApp = command.getInvokedBy().getUserId().getSuperapp();
                const email = command.getInvokedBy().getUserId().getEmail();
                await this.chatEngineLogIn(superApp, email);
            }
            shouldChatEngine = true;
            logger.debug(`Finished to execute command ${command.getCommand()} in Chat mini app service`);
            return null;
        } catch (error) {
            logger.error("Undefined Command");
            throw new Error("Undefined Command");
        }
    }
}

module.exports = ChatService;
