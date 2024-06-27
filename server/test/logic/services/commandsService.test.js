/**
 * Objects Service Tests
 *
 * This file contains a suite of tests for the objects' service.
 * These tests cover object creation, retrieval, updates, deletions binding objects and searching objects by different methods,
 * for different user roles and premissions.
 * Please be noted that only the route of /objects is being tested, in production the Researchers and the Admins will send the request through
 * /auth route, either way the methods are still protected.
 */

// Importing necessary libraries and modules
import chai from "chai";
import chaiHttp from "chai-http";
import app from "../../../src/app.js";
import {
  participant,
  researcher,
  admin1,
} from "../../../src/utils/requestStructures/requestUsers.js";
import { commandObj } from "../../../src/utils/requestStructures/requestCommands.js";
import { researcherObj } from "../../../src/utils/requestStructures/requestObjects.js";
import Roles from "../../../src/utils/UserRole.js";

// Initializing Chai HTTP and setting up assertions
chai.use(chaiHttp);
chai.should();

const baseCommandsURL = "/auth/commands";
const baseEntryRegistrationURL = "/entry/register";
const baseEntryLoginURL = "/entry/login";
const baseResearchersURL = "/auth/researchers";
const baseObjectsURL = "/auth/objects";

// A dictionary to store cookies of JWT tokens mapped by user email
let usersCookies = {};

// An agentfor cookie management
let agent = chai.request.agent(app);

describe("Commands Service Tests", () => {
  /**
   * Defining hooks beforeEach and afterEach
   */

  /**
   * This function runs before each test, it registers and logs in an admin user.
   * @name beforeEach Registering and logging in as admin
   * @function
   */
  beforeEach("Registering and logging in as admin", (done) => {
    const usersArr = [researcher, participant, admin1];

    agent = chai.request.agent(app);

    // Using Promise.all to wait for all requests to complete
    Promise.all(
      usersArr.map((user) => {
        return new Promise((resolve) => {
          chai
            .request(app)
            .post(baseEntryRegistrationURL)
            .send(user)
            .end((err, res) => {
              res.should.have.status(201);
              res.body.should.be.a("object");
              res.body.should.have.a.property("userId");
              res.body.userId.should.have.a.property("email");
              res.body.userId.email.should.be.equal(user.email);
              resolve(); // Resolve the promise after the request is complete
            });
        });
      })
    )
      .then(() => {
        return Promise.all(
          usersArr.map((user) => {
            return new Promise((resolve) => {
              agent
                .post(baseEntryLoginURL)
                .send(user)
                .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.have.a.property("role");
                  if (res.body.role !== Roles.PARTICIPANT) {
                    res.headers.should.have.property("set-cookie");
                    usersCookies[user.email] = res.headers["set-cookie"]; // Update the JWT token within the users cookie dictionary
                  }
                  resolve(); // Resolve the promise after the request is complete
                });
            });
          })
        );
      })
      .then(() => {
        done(); // Call done after all promises have resolved
      });
  });

  /**
   * This function runs after each test to clear the database.
   * @function
   * @name afterEach
   * @param {function} done - Callback function to signal completion.
   */
  afterEach("Clearing the database", (done) => {
    // Delete all users after each test
    chai
      .request(app)
      .delete(
        `${baseCommandsURL}?email=${admin1.email}&platform=${admin1.platform}`
      )
      .set("Cookie", usersCookies[admin1.email])
      .end((res) => {
        chai
          .request(app)
          .delete(
            `${baseObjectsURL}?email=${admin1.email}&platform=${admin1.platform}`
          )
          .set("Cookie", usersCookies[admin1.email])
          .end((err, res) => {
            res.should.have.status(200);
            chai
              .request(app)
              .delete(
                `${baseResearchersURL}/${admin1.email}/${admin1.platform}`
              )
              .set("Cookie", usersCookies[admin1.email])
              .end((err, res) => {
                res.should.have.status(200);
                usersCookies = {};
                agent.jar.setCookies([]);
                agent.close();
                done();
              });
          });
      });
  });

  /**
   * Test case to verify the creation and execution of a new command.
   *
   * This test case ensures that a new command can be created and executed successfully.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should create and execute a new command", (done) => {
    /*
        Scenario: Creating and executing a new command
            Given a user creates a new command with valid parameters
            When the command is executed
            Then the system should successfully create and execute the command
            And the command details should be correctly returned
        */

    // Prepare the command object
    const otherCommandobj = { ...commandObj };
    otherCommandobj.targetObject = { ...commandObj.targetObject };
    otherCommandobj.targetObject.objectId = {
      ...commandObj.targetObject.objectId,
    };
    otherCommandobj.commandAttributes = { ...commandObj.commandAttributes };

    agent
      .post(`${baseObjectsURL}`)
      .send(researcherObj)
      .set("Cookie", `jwt=${usersCookies[researcher.email]}`)
      .then(async (res) => {
        // Assert that the object creation was successful
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("objectId");
        res.body.objectId.should.have.property("platform");
        res.body.objectId.should.have.property("internalObjectId");

        // Update the command object with the object's platform and internal ID
        otherCommandobj.targetObject.objectId.platform =
          res.body.objectId.platform;
        otherCommandobj.targetObject.objectId.internalObjectId =
          res.body.objectId.internalObjectId;

        // Create and execute the command
        await agent
          .post(`${baseCommandsURL}`)
          .set("Cookie", `jwt=${usersCookies[researcher.email]}`)
          .send(otherCommandobj)
          .then((res) => {
            // Assert that the command creation and execution were successful
            res.should.have.status(201);
            res.body.should.be.a("object");
            res.body.should.have.property("commandId");
            res.body.commandId.should.have.property("platform");
            res.body.commandId.should.have.property("internalCommandId");
            res.body.should.have.property("command");
            res.body.command.should.be.equal(otherCommandobj.command);
            res.body.should.have.property("targetObject");
            res.body.targetObject.should.have.property("objectId");
            res.body.targetObject.objectId.should.have.property("platform");
            res.body.targetObject.objectId.platform.should.be.equal(
              otherCommandobj.targetObject.objectId.platform
            );
            res.body.targetObject.objectId.should.have.property(
              "internalObjectId"
            );
            res.body.targetObject.objectId.internalObjectId.should.be.equal(
              otherCommandobj.targetObject.objectId.internalObjectId
            );
            res.body.should.have.property("invocationTimestamp");
            res.body.should.have.property("invokedBy");
            res.body.invokedBy.should.have.property("userId");
            res.body.invokedBy.userId.should.have.property("platform");
            res.body.invokedBy.userId.platform.should.be.equal(
              otherCommandobj.invokedBy.userId.platform
            );
            res.body.invokedBy.userId.should.have.property("email");
            res.body.invokedBy.userId.email.should.be.equal(
              otherCommandobj.invokedBy.userId.email
            );
            res.body.should.have.property("commandAttributes");
          })
          .then(async () => {
            // Retrieve all commands to verify the created command
            await chai
              .request(app)
              .get(
                `${baseCommandsURL}?email=${admin1.email}&platform=${admin1.platform}`
              )
              .set("Cookie", usersCookies[admin1.email])
              .send()
              .then((res) => {
                // Assert that the created command is returned in the list
                res.body.should.be.a("array");
                res.body.should.have.lengthOf(1);
                done();
              });
          });
      })
      .catch((error) => {
        // Handle any errors
        done(error);
      })
      .finally(() => {
        // Close the agent after completing the test
        agent.close();
      });
  });

  /**
   * Test case to verify that creating and executing a new command is denied when the requesting user is a Participant.
   *
   * This test case ensures that a Participant user is not allowed to create and execute a new command.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not create and execute a new command, the requesting user is a Participant", (done) => {
    /*
        Scenario: Attempting to create and execute a new command as a Participant
            Given the user is a Participant
            When a POST request is sent to create and execute a new command
            Then the system should respond with a 403 status code indicating forbidden access
        */

    // Prepare the command object
    const otherCommandobj = { ...commandObj };
    otherCommandobj.targetObject = { ...commandObj.targetObject };
    otherCommandobj.targetObject.objectId = {
      ...commandObj.targetObject.objectId,
    };
    otherCommandobj.commandAttributes = { ...commandObj.commandAttributes };
    otherCommandobj.invokedBy = { ...commandObj.invokedBy };
    otherCommandobj.invokedBy.userId = { ...commandObj.invokedBy.userId };

    // Create an object first to use in the command
    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(researcherObj)
      .then(async (res) => {
        try {
          // Assert that the object creation was successful
          res.should.have.status(201);
          res.body.should.be.a("object");
          res.body.should.have.property("objectId");
          res.body.objectId.should.have.property("platform");
          res.body.objectId.should.have.property("internalObjectId");

          // Update the command object with the object's platform and internal ID
          otherCommandobj.targetObject.objectId.platform =
            res.body.objectId.platform;
          otherCommandobj.targetObject.objectId.internalObjectId =
            res.body.objectId.internalObjectId;
          // Change the invoking user platform and email to Participant type
          otherCommandobj.invokedBy.userId.platform = participant.platform;
          otherCommandobj.invokedBy.userId.email = participant.email;

          // Attempt to create and execute the command as a Participant
          await agent
            .post(`${baseCommandsURL}`)
            .send(otherCommandobj)
            .then((res) => {
              // Assert that access is forbidden
              res.should.have.status(403);
              done(); // Signal test completion
            });
        } catch (error) {
          // Handle any errors
          done(error);
        } finally {
          // Close the agent after completing the test
          agent.close();
        }
      })
      .catch((error) => {
        // Handle any errors
        done(error);
      });
  });

  /**
   * Test case to verify that all commands can be fetched when the requesting user is an admin.
   *
   * This test case ensures that an admin user can successfully fetch all commands from the system.
   */
  it("should fetch all the commands, the requesting user is an admin", async () => {
    /*
        Scenario: Fetching all commands as an admin
            Given the user is an admin
            When a GET request is sent to fetch all commands
            Then the system should respond with a 200 status code and return all commands
        */

    // Define the number of commands to create
    const numCommands = 10; // Could be any number

    // Create an array to store the commands
    const commandsArr = Array.from({ length: numCommands }, () => ({
      ...commandObj,
    }));

    try {
      // Create an object first to associate with the commands
      const objectRes = await chai
        .request(app)
        .post(`${baseObjectsURL}`)
        .set("Cookie", usersCookies[admin1.email])
        .send(researcherObj);

      // Assert that the object creation was successful
      objectRes.should.have.status(201);
      const objectId = objectRes.body.objectId;

      // Create commands asynchronously
      await Promise.all(
        commandsArr.map(async (command) => {
          // Send a POST request to create each command
          const res = await agent
            .post(`${baseCommandsURL}`)
            .set("Cookie", `jwt=${usersCookies[researcher.email]}`)
            .send({ ...command, targetObject: { objectId } });

          // Assert that the command creation was successful
          res.should.have.status(201);
          res.body.should.be.a("object");
          res.body.should.have.property("commandId");
        })
      );

      // Fetch all commands as an admin
      const fetchRes = await agent
        .get(
          `${baseCommandsURL}?email=${admin1.email}&platform=${admin1.platform}`
        )
        .set("Cookie", `jwt=${usersCookies[admin1.email]}`);

      // Assert that the request was successful and all commands are returned
      fetchRes.should.have.status(200);
      fetchRes.body.should.be.an("array");
      fetchRes.body.length.should.be.equal(numCommands);
    } catch (error) {
      // Handle any errors
      throw error;
    } finally {
      // Close the agent after all operations are completed
      agent.close();
    }
  });

  /**
   * Test case to verify that an attempt to fetch all commands is denied when the requesting user is a researcher.
   *
   * This test case ensures that a researcher user cannot fetch all commands from the system.
   */
  it("should not fetch all the commands, the requesting user is a Researcher", async () => {
    /*
        Scenario: Attempting to fetch all commands as a researcher
            Given the user is a researcher
            When a GET request is sent to fetch all commands
            Then the system should respond with a 403 status code indicating forbidden access
        */

    // Define the number of commands to create
    const numCommands = 10; // Could be any number

    // Create an array to store the commands
    const commandsArr = Array.from({ length: numCommands }, () => ({
      ...commandObj,
    }));

    try {
      // Create an object first to associate with the commands
      const objectRes = await chai
        .request(app)
        .post(`${baseObjectsURL}`)
        .set("Cookie", usersCookies[researcher.email])
        .send(researcherObj);

      // Assert that the object creation was successful
      objectRes.should.have.status(201);
      const objectId = objectRes.body.objectId;

      // Create commands asynchronously
      await Promise.all(
        commandsArr.map(async (command) => {
          // Send a POST request to create each command
          const res = await agent
            .post(`${baseCommandsURL}`)
            .set("Cookie", `jwt=${usersCookies[researcher.email]}`)
            .send({ ...command, targetObject: { objectId } });

          // Assert that the command creation was successful
          res.should.have.status(201);
          res.body.should.be.a("object");
          res.body.should.have.property("commandId");
        })
      );

      // Attempt to fetch all commands as a researcher
      const fetchRes = await agent
        .get(
          `${baseCommandsURL}?email=${researcher.email}&platform=${researcher.platform}`
        )
        .set("Cookie", `jwt=${usersCookies[researcher.email]}`);

      // Assert that the request was denied with a 403 status code
      fetchRes.should.have.status(403);
    } catch (error) {
      // Handle any errors
      throw error;
    } finally {
      // Close the agent after all operations are completed
      agent.close();
    }
  });

  /**
   * Test case to verify that all commands can be deleted when the requesting user is an admin.
   *
   * This test case ensures that an admin user can successfully delete all commands from the system.
   */
  it("should delete all the commands, the requesting user is an admin", async () => {
    /*
        Scenario: Deleting all commands as an admin
            Given the user is an admin
            And there are existing commands in the system
            When a DELETE request is sent to delete all commands
            Then the system should respond with a 200 status code indicating successful deletion
            And the response body should contain the count of deleted commands
        */

    // Define the number of commands to create
    const numCommands = 10; // Could be any number

    // Create an array to store the commands
    const commandsArr = Array.from({ length: numCommands }, () => ({
      ...commandObj,
    }));

    try {
      // Create an object first to associate with the commands
      const objectRes = await chai
        .request(app)
        .post(`${baseObjectsURL}`)
        .set("Cookie", usersCookies[researcher.email])
        .send(researcherObj);

      // Assert that the object creation was successful
      objectRes.should.have.status(201);
      const objectId = objectRes.body.objectId;

      // Create commands asynchronously
      await Promise.all(
        commandsArr.map(async (command) => {
          // Send a POST request to create each command
          const res = await agent
            .post(`${baseCommandsURL}`)
            .set("Cookie", `jwt=${usersCookies[researcher.email]}`)
            .send({ ...command, targetObject: { objectId } });

          // Assert that the command creation was successful
          res.should.have.status(201);
          res.body.should.be.a("object");
          res.body.should.have.property("commandId");
        })
      );

      // Delete all commands as an admin
      const fetchRes = await agent
        .delete(
          `${baseCommandsURL}?email=${admin1.email}&platform=${admin1.platform}`
        )
        .set("Cookie", `jwt=${usersCookies[admin1.email]}`);

      // Assert that the request was successful with a 200 status code
      fetchRes.should.have.status(200);
      fetchRes.body.should.not.be.empty;
      fetchRes.body.should.have.property("deletedCount");
      fetchRes.body.deletedCount.should.be.equal(numCommands);
    } catch (error) {
      // Handle any errors
      throw error;
    } finally {
      // Close the agent after all operations are completed
      agent.close();
    }
  });

  /**
   * Test case to verify that an attempt to delete all commands is denied when the requesting user is a Researcher.
   *
   * This test case ensures that a Researcher user cannot delete all commands from the system.
   */
  it("should not delete all the commands, the requesting user is a Researcher", async () => {
    /*
        Scenario: Attempting to delete all commands as a Researcher
            Given the user is a Researcher
            And there are existing commands in the system
            When a DELETE request is sent to delete all commands
            Then the system should respond with a 403 status code indicating forbidden access
        */

    // Define the number of commands to create
    const numCommands = 10; // Could be any number

    // Create an array to store the commands
    const commandsArr = Array.from({ length: numCommands }, () => ({
      ...commandObj,
    }));

    try {
      // Create an object first to associate with the commands
      const objectRes = await chai
        .request(app)
        .post(`${baseObjectsURL}`)
        .set("Cookie", usersCookies[researcher.email])
        .send(researcherObj);

      // Assert that the object creation was successful
      objectRes.should.have.status(201);
      const objectId = objectRes.body.objectId;

      // Create commands asynchronously
      await Promise.all(
        commandsArr.map(async (command) => {
          // Send a POST request to create each command
          const res = await agent
            .post(`${baseCommandsURL}`)
            .set("Cookie", `jwt=${usersCookies[researcher.email]}`)
            .send({ ...command, targetObject: { objectId } });

          // Assert that the command creation was successful
          res.should.have.status(201);
          res.body.should.be.a("object");
          res.body.should.have.property("commandId");
        })
      );

      // Attempt to delete all commands as a Researcher
      const fetchRes = await agent
        .delete(
          `${baseCommandsURL}?email=${researcher.email}&platform=${researcher.platform}`
        )
        .set("Cookie", `jwt=${usersCookies[researcher.email]}`);

      // Assert that the request was denied with a 403 status code
      fetchRes.should.have.status(403);
    } catch (error) {
      // Handle any errors
      throw error;
    } finally {
      // Close the agent after all operations are completed
      agent.close();
    }
  });
});
