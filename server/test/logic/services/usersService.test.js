/**
 * User Service Tests
 *
 * This file contains a suite of tests for the users' service.
 * These tests cover user registration, login, information retrieval, updates,
 * and deletions for different user roles.
 */

// Importing necessary libraries and modules
import chai from "chai";
import chaiHttp from "chai-http";
import app from "../../../src/app.js";
import {
  participant,
  researcher,
  admin1,
  admin2,
} from "../../../src/utils/requestStructures/requestUsers.js";
import bcrypt from "bcrypt";

// Initializing Chai HTTP and setting up assertions
chai.use(chaiHttp);
chai.should();

const baseEntryRegistrationURL = "/entry/register";
const baseUpdateUserURL = "/entry";
const baseEntryLoginURL = "/entry/login";
const baseResearchersURL = "/auth/researchers";

// A dictionary to store cookies of JWT tokens mapped by user email
let usersCookies = {};

describe("User Service Tests", () => {
  /**
   * Defining hooks beforeEach and afterEach
   */

  /**
   * This function runs before each test, it registers and logs in an admin user.
   * @name beforeEach Registering and logining in ad admin
   * @function
   */
  beforeEach("Registering and logining in an admin", (done) => {
    // Register and login admin before each test
    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send(admin1)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.a("object");

        // Login in the admin
        chai
          .request(app)
          .post(`${baseEntryLoginURL}`)
          .send(admin1)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.headers.should.have.property("set-cookie");
            usersCookies[admin1.email] = res.headers["set-cookie"]; // Update the JWT token within the users cookie dictionary
            done();
          });
      });
  });

  /**
   * This function runs after each test to clear the database.
   * @function
   * @name afterEach
   * @param {function} done - Callback function to signal completion.
   */
  afterEach("Clearing the database", (done) => {
    const agent = chai.request.agent(app); // Create an agent to manage cookies

    // Delete all users after each test
    chai
      .request(app)
      .delete(`${baseResearchersURL}/${admin1.email}/${admin1.platform}`)
      .set("Cookie", usersCookies[admin1.email])
      .end((err, res) => {
        res.should.have.status(200);
        usersCookies = {};
        agent.jar.setCookies([]);
        agent.close();
        done();
      });
  });

  /**
   * Test case to register a new researcher and verify if the registration was successful.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should register a new Researcher", (done) => {
    /*
        Scenario: Register a new researcher and verify successful registration
            Given a new researcher to be registered
            When the registration request is made
            Then the system should respond with a success status code (201)
            And the response should contain the registered user's ID
            And the registered user's email should match the provided email
        */

    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send(researcher)
      .end((err, res) => {
        // Assert that the system responds with a success status code (201)
        res.should.have.status(201);
        // Assert that the response body is an object
        res.body.should.be.a("object");
        // Assert that the response body contains the registered user's ID
        res.body.should.have.property("userId");
        // Assert that the registered user's email matches the provided email
        res.body.userId.email.should.equal(researcher.email);
        done();
      });
  });

  /**
   * Test case to attempt registering a new researcher with undefined body and verify that no creation occurs.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not register a new Researcher (the body is undefined)", (done) => {
    /*
        Scenario: Attempt to register a new researcher with undefined body
            Given a request to register a new researcher with undefined body
            When the registration request is made
            Then the system should respond with a bad request status code (400)
        */

    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send() // Sending undefined body
      .end((err, res) => {
        // Assert that the system responds with a bad request status code (400)
        res.should.have.status(400);
        done();
      });
  });

  /**
   * Test case to attempt registering a researcher without a password and verify that the app returns a 400 error.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should prevent registration of a Researcher because of missing password property in userDetails", (done) => {
    /*
        Scenario: Attempt to register a researcher without a password
            Given a request to register a researcher without a password property in userDetails
            When the registration request is made
            Then the system should respond with a bad request status code (400)
    
        Additional Verification:
            - The user list for an admin should remain unchanged.
        */

    // Create a new researcher object with userDetails missing password property
    const newResearcher = { ...researcher };
    newResearcher.userDetails = { ...researcher.userDetails };
    delete newResearcher.userDetails.password;

    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send(newResearcher)
      .end((err, res) => {
        // Assert that the system responds with a bad request status code (400)
        res.should.have.status(400);

        // Additional verification: Ensure the user list for an admin remains unchanged
        chai
          .request(app)
          .get(`${baseResearchersURL}/${admin1.email}/${admin1.platform}`)
          .set("Cookie", usersCookies[admin1.email])
          .send()
          .end((err, res) => {
            // Assert that the response contains an array of users with length 1 (remains unchanged)
            res.body.should.be.a("array");
            const userArr = res.body;
            userArr.should.have.lengthOf(1);
            done();
          });
      });
  });

  /**
   * Test case to register a researcher twice and verify that the second registration assigns a JWT token without recreating the user.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should register a Researcher, and in the second registration it should assign a JWT token to it and not recreate it", (done) => {
    /*
        Scenario: Register a researcher twice and verify the second registration assigns a JWT token without recreating the user
            Given a request to register a researcher
            When the first registration request is made
            Then the system should respond with a successful status code (201)
            And it should return a JWT token in the response headers
            And the user list for an admin should have a length of 1
    
            When the second registration request is made for the same researcher
            Then the system should respond with a successful status code (201)
            And it should return a JWT token in the response headers
            And the user list for an admin should have a length of 2
    
        */

    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send(researcher)
      .then((res) => {
        // Assert that the system responds with a successful status code (201) for the first registration
        res.should.have.status(201);

        // Make a second registration request for the same researcher
        return chai
          .request(app)
          .post(`${baseEntryRegistrationURL}`)
          .send(researcher);
      })
      .then((res) => {
        // Assert that the system responds with a successful status code (201) for the second registration
        res.should.have.status(201);
        // Assert that the response contains a JWT token in the headers
        res.headers.should.have.property("set-cookie");

        // Retrieve the user list for an admin
        return chai
          .request(app)
          .get(`${baseResearchersURL}/${admin1.email}/${admin1.platform}`)
          .set("Cookie", usersCookies[admin1.email])
          .send();
      })
      .then((res) => {
        // Assert that the response contains an array of users with length 2 after the second registration
        res.should.have.status(200);
        res.body.should.be.a("array");
        const userArr = res.body;
        userArr.should.have.lengthOf(2);
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to register a new participant and verify the registration was successful.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should register a new Participant", (done) => {
    /*
        Scenario: Register a new participant and verify the registration was successful
            Given a request to register a participant
            When the registration request is made
            Then the system should respond with a successful status code (201)
            And it should return a response body containing the participant's details
            And the participant's email in the response body should match the provided email
    
        */

    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send(participant)
      .end((err, res) => {
        // Assert that the system responds with a successful status code (201)
        res.should.have.status(201);
        // Assert that the response contains a participant object
        res.body.should.be.a("object");
        // Assert that the participant object contains a userId property
        res.body.should.have.property("userId");
        // Assert that the email in the userId property matches the provided email
        res.body.userId.email.should.equal(participant.email);
        done();
      });
  });

  /**
   * Test case to attempt registering a participant twice and verify that the app returns an existing participant.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not recreate a new Participant, should return an existing Participant", (done) => {
    /*
        Scenario: Attempt to register a participant twice and verify that the app returns an existing participant
            Given a participant is registered
            When an attempt is made to register the same participant again
            Then the system should return an existing participant
            And it should not create a new participant
            And the number of participants in the system should remain the same
    
        */

    // Register a participant
    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send(participant)
      .then((res) => {
        // Assert that the system responds with a successful status code (201)
        res.should.have.status(201);
        // Assert that the response contains a participant object
        res.body.should.be.a("object");
        // Assert that the participant object contains a userId property
        res.body.should.have.property("userId");
        // Assert that the email in the userId property matches the provided email
        res.body.userId.email.should.equal(participant.email);
        return res;
      })
      .then((res) => {
        // Attempt to register the same participant again
        return chai
          .request(app)
          .post(`${baseEntryRegistrationURL}`)
          .send(participant)
          .then((anotherRes) => {
            // Assert that the system responds with a successful status code (201)
            anotherRes.should.have.status(201);
            // Assert that the response contains a participant object
            anotherRes.body.should.be.a("object");
            // Assert that the participant object contains a userId property
            anotherRes.body.should.have.property("userId");
            // Assert that the email in the userId property matches the email of the previously registered participant
            anotherRes.body.userId.email.should.equal(res.body.userId.email);
          });
      })
      .then(() => {
        // Check the number of participants in the system
        chai
          .request(app)
          .get(`${baseResearchersURL}/${admin1.email}/${admin1.platform}`)
          .set("Cookie", usersCookies[admin1.email])
          .send()
          .end((err, res) => {
            // Assert that the system responds with a successful status code (200)
            res.should.have.status(200);
            // Assert that the response body is an array
            res.body.should.be.a("array");
            // Assert that the number of participants in the system is 2 (existing participant + admin)
            const userArr = res.body;
            userArr.should.have.lengthOf(2);
            done();
          });
      });
  });

  /**
   * Test case to attempt registering a user with missing email and platform and verify that the app returns a 400 error.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not register a user, missing name of platform and email or some of them", (done) => {
    /*
        Scenario: Attempt to register a user with missing email and platform
            Given a user object with missing email and platform
            When an attempt is made to register the user
            Then the system should return a 400 error
    
        */

    // Create a new user object with missing email and platform
    const newUser = { ...researcher };
    newUser.email = "";
    newUser.platform = "";

    // Attempt to register the user
    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send(newUser)
      .end((err, res) => {
        // Assert that the system responds with a 400 error
        res.should.have.status(400);
        // Call done() to indicate that the test has completed
        done();
      });
  });

  /**
   * Test case to register a researcher and then attempt to log in, verifying that the password is encrypted.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should successful login a Researcher after registration", (done) => {
    /*
        Scenario: Register a researcher and successfully log in
            Given a researcher is registered
            When an attempt is made to log in
            Then the system should successfully log in the researcher
            And the password should be encrypted
    
        */

    // Register the researcher
    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send(researcher)
      .end((err, res) => {
        // Assert that the registration is successful
        res.should.have.status(201);
        res.body.should.be.a("object");
        // Attempt to log in
        chai
          .request(app)
          .post(`${baseEntryLoginURL}`)
          .send(researcher)
          .end((err, res) => {
            // Assert that the login is successful
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.a.property("userDetails");
            res.body.userDetails.should.have.a.property("password");
            // Assert that the password is encrypted
            res.body.userDetails.password.should.not.be.equal(
              researcher.userDetails.password
            );
            // Call done() to indicate that the test has completed
            done();
          });
      });
  });

  /**
   * Test case to register a researcher and then attempt to log in twice, verifying that the JWT token remains the same.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not change JWT token when Researcher logs in twice", (done) => {
    /*
        Scenario: Researcher logs in twice and JWT token remains the same
            Given a researcher is registered
            When the researcher logs in twice
            Then the JWT token should remain the same
    
        */

    // Register the researcher and log in for the first time
    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send(researcher)
      .then((res) => {
        // Assert that the registration is successful
        res.should.have.status(201);
        res.body.should.be.a("object");
        return new Promise((resolve) => {
          chai
            .request(app)
            .post(`${baseEntryLoginURL}`)
            .send(researcher)
            .end((err, res) => {
              // Assert that the first login is successful
              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.should.have.a.property("userDetails");
              res.body.userDetails.should.have.a.property("password");
              res.body.userDetails.password.should.not.be.equal(
                researcher.userDetails.password
              );
              res.headers.should.have.property("set-cookie");
              usersCookies[researcher.email] = res.headers["set-cookie"]; // Update the JWT token within the users cookie dictionary
              resolve(res); // Resolve with the response to access the headers in the next then block
            });
        });
      })
      .then(() => {
        // Log in for the second time
        chai
          .request(app)
          .post(`${baseEntryLoginURL}`)
          .send(researcher)
          .end((err, res) => {
            // Assert that the second login is successful
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.a.property("userId");
            res.body.userId.should.have.a.property("email");
            res.body.userId.email.should.be.equal(researcher.email);
            res.headers.should.have.property("set-cookie");
            const responseCookieArr = res.headers["set-cookie"];
            responseCookieArr.should.have.lengthOf(1);

            const expectedToken = usersCookies[researcher.email][0];
            const actualToken = responseCookieArr[0];

            // Compare the entire JWT tokens
            expectedToken.should.equal(actualToken);

            // Call done() to indicate that the test has completed
            done();
          });
      });
  });

  /**
   * Test case to verify that a researcher cannot successfully log in after registration due to a missing password.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not make successful login to a Researcher after registration (missing password)", (done) => {
    /*
        Scenario: Researcher cannot successfully log in after registration due to missing password
            Given a researcher is registered
            When the researcher attempts to log in without providing a password
            Then the login attempt should fail with a 400 Bad Request error
    
        */

    // Register the researcher
    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send(researcher)
      .end((err, res) => {
        // Assert that the registration is successful
        res.should.have.status(201);
        res.body.should.be.a("object");
        const newReseacher = { ...researcher };
        newReseacher.userDetails = { ...researcher.userDetails };
        delete newReseacher.userDetails.password;
        // Attempt to log in without providing a password
        chai
          .request(app)
          .post(`${baseEntryLoginURL}`)
          .send(newReseacher)
          .end((err, res) => {
            // Assert that the login attempt fails with a 400 Bad Request error
            res.should.have.status(400);
            // Call done() to indicate that the test has completed
            done();
          });
      });
  });

  /**
   * Test case to verify that a researcher cannot successfully log in after registration due to an incorrect password.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not make successful login to a Researcher after registration (incorrect password)", (done) => {
    /*
        Scenario: Researcher cannot successfully log in after registration due to an incorrect password
            Given a researcher is registered
            When the researcher attempts to log in with an incorrect password
            Then the login attempt should fail with a 400 Bad Request error
    
        */

    // Register the researcher
    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send(researcher)
      .end((err, res) => {
        // Assert that the registration is successful
        res.should.have.status(201);
        res.body.should.be.a("object");
        const newReseacher = { ...researcher };
        newReseacher.userDetails = { ...researcher.userDetails };
        // Set an incorrect password for the login attempt
        newReseacher.userDetails.password = "sS654321";
        // Attempt to log in with the incorrect password
        chai
          .request(app)
          .post(`${baseEntryLoginURL}`)
          .send(newReseacher)
          .end((err, res) => {
            // Assert that the login attempt fails with a 400 Bad Request error
            res.should.have.status(400);
            // Call done() to indicate that the test has completed
            done();
          });
      });
  });

  /**
   * Test case to verify that a user cannot successfully log in after registration because the user does not exist.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not make successful login to a user after registration (user does not exist)", (done) => {
    /*
        Scenario: User cannot successfully log in after registration because the user does not exist
            Given a user attempts to log in after registration
            When the user does not exist in the system
            Then the login attempt should fail with a 404 Not Found error
    
        */

    // Create a new user object similar to the registered user but with a different email
    const newUser = { ...researcher };
    newUser.userDetails = { ...researcher.userDetails };
    newUser.email = "someotheremail@test.org";

    // Attempt to log in with the new user object
    chai
      .request(app)
      .post(`${baseEntryLoginURL}`)
      .send(newUser)
      .end((err, res) => {
        // Assert that the login attempt fails with a 404 Not Found error
        res.should.have.status(404);
        // Call done() to indicate that the test has completed
        done();
      });
  });

  /**
   * Test case to verify that a user cannot successfully log in after registration because of incorrect credentials.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not make successful login to a user after registration (user credentials are wrong)", (done) => {
    /*
        Scenario: User cannot successfully log in after registration because of incorrect credentials
            Given a user attempts to log in after registration
            When the user provides incorrect credentials
            Then the login attempt should fail with a 400 Bad Request error
    
        */

    // Create a new user object similar to the registered user
    const newUser = { ...researcher };
    newUser.userDetails = { ...researcher.userDetails };
    // Set the email and password properties to empty strings to simulate incorrect credentials
    newUser.email = "";
    newUser.userDetails.password = "";

    // Attempt to log in with the new user object
    chai
      .request(app)
      .post(`${baseEntryLoginURL}`)
      .send(newUser)
      .end((err, res) => {
        // Assert that the login attempt fails with a 400 Bad Request error
        res.should.have.status(400);
        // Call done() to indicate that the test has completed
        done();
      });
  });

  /**
   * Test case to verify that a user cannot successfully log in after missing credentials.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not make successful login, there is no body attached to the request ", (done) => {
    /*
        Scenario: User cannot successfully log in after missing credentials
            Given a user attempts to log in without providing any credentials
            When the login request is sent without a body attached
            Then the login attempt should fail with a 400 Bad Request error
    
        */

    // Send a login request without any body attached
    chai
      .request(app)
      .post(`${baseEntryLoginURL}`)
      .send()
      .end((err, res) => {
        // Assert that the login attempt fails with a 400 Bad Request error
        res.should.have.status(400);
        // Call done() to indicate that the test has completed
        done();
      });
  });

  /**
   * Test case to verify that a participant is prevented from using the auth route.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should prevent Participant to use auth route", (done) => {
    /*
        Scenario: Participant is prevented from using the auth route
            Given a participant registers successfully
            When the participant attempts to access the auth route
            Then the participant should receive a 403 Forbidden error
    
        */

    // Register the participant
    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send(participant)
      .end((err, res) => {
        // Assert that the participant registration is successful
        res.should.have.status(201);
        res.body.should.be.a("object");

        // Attempt to access the auth route with participant credentials
        chai
          .request(app)
          .get(
            `${baseResearchersURL}/${participant.email}/${participant.platform}`
          )
          .set("Cookie", "someInvalidToken")
          .send()
          .end((err, res) => {
            // Assert that the participant is prevented from accessing the auth route
            res.should.have.status(403);
            // Call done() to indicate that the test has completed
            done();
          });
      });
  });

  /**
   * Test case to verify that a user (including all roles) can update their username and user details, but not email, platform, or roles.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should update user information", (done) => {
    /*
        Scenario: User updates their username and user details
            Given a user (including all roles) registers successfully
            When the user attempts to update their username and user details
            Then the user's username and user details should be updated
            And the user should be able to log in with the updated credentials
    
        */
    // Define updated user data
    const updatedUserData = {
      username: "newUsername",
      userDetails: {
        password: "newpassword",
        additionalKey: 9.9,
      },
    };

    // Construct updated researcher data
    const updatedResearcher = {
      ...researcher,
      ...updatedUserData,
    };
    updatedResearcher.userDetails = {
      ...researcher.userDetails,
      ...updatedUserData.userDetails,
    };

    // Register the user (researcher) successfully
    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send(researcher)
      .then((res) => {
        // Assert that the user registration is successful
        res.should.have.status(201);
        res.body.should.be.a("object");

        // Log in the user
        return chai.request(app).post(`${baseEntryLoginURL}`).send(researcher);
      })
      .then((res) => {
        // Assert that the user login is successful
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.headers.should.have.property("set-cookie");
        usersCookies[researcher.email] = res.headers["set-cookie"];

        // Update user information (username and user details)
        return chai
          .request(app)
          .put(
            `${baseUpdateUserURL}/${updatedResearcher.email}/${updatedResearcher.platform}`
          )
          .set("Cookie", usersCookies[updatedResearcher.email])
          .send(updatedResearcher);
      })
      .then((res) => {
        // Assert that the user information is successfully updated
        res.should.have.status(200);

        // Log in with the updated credentials
        return chai
          .request(app)
          .post(`${baseEntryLoginURL}`)
          .send(updatedResearcher);
      })
      .then(async (res) => {
        // Assert that the user can log in with the updated credentials
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.userId.email.should.be.equal(researcher.email);
        res.body.userId.platform.should.be.equal(researcher.platform);
        const isMatch = await bcrypt.compare(
          updatedResearcher.userDetails.password,
          res.body.userDetails.password
        ); // Decrypting the password for comparison
        isMatch.should.be.equal(true);
        res.body.username.should.be.equal(updatedResearcher.username);

        // Call done() to indicate that the test has completed
        done();
      })
      .catch((error) => {
        // Handle any errors that occur during the test
        done(error);
      });
  });

  /**
   * Test case to verify that user information cannot be updated if the user is not found.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not update user information (user not found)", (done) => {
    /*
        Scenario: User information cannot be updated if the user is not found
            Given a user (including all roles) attempts to update their information
            When the user is not found in the system
            Then the user information should not be updated
        */

    // Define updated researcher data with non-existent email and platform
    const updatedResearcher = {
      ...researcher,
      email: "otheremail@test.org",
      platform: "Experiment",
    };

    // Attempt to update user information with non-existent email and platform
    chai
      .request(app)
      .put(
        `${baseUpdateUserURL}/${updatedResearcher.email}/${updatedResearcher.platform}`
      )
      .send(updatedResearcher)
      .end((err, res) => {
        // Assert that the user is not found and the update fails with a status code of 403, The made up user does not have a JWT token
        res.should.have.status(404);
        // Call done() to indicate that the test has completed
        done();
      });
  });

  /**
   * Test case to verify that only admins are allowed to retrieve information for all users.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should get all users information (only admin)", (done) => {
    /*
        Scenario: Only admins are allowed to retrieve information for all users
            Given users (including all roles) are registered in the system
            When an admin attempts to retrieve information for all users
            Then the request should be successful and return information for all users
            And the response should contain information for all registered users
        */

    // Define an array of users to register
    const usersArray = [researcher, participant, admin2];

    // Register all users in the system
    Promise.all(
      usersArray.map((user) => {
        return new Promise((resolve) => {
          chai
            .request(app)
            .post(`${baseEntryRegistrationURL}`)
            .send(user)
            .end((err, res) => {
              // Assert that the registration is successful
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
        // After all users are registered, attempt to retrieve information for all users as admin1
        chai
          .request(app)
          .get(`${baseResearchersURL}/${admin1.email}/${admin1.platform}`)
          .set("Cookie", usersCookies[admin1.email])
          .end((err, res) => {
            // Assert that the request is successful and returns information for all users
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.should.have.lengthOf(usersArray.length + 1); // Including admin1
            done();
          });
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that non-admin users (including participants) cannot retrieve information for all users.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should fail to get all users information due to user role (non-admin)", (done) => {
    /*
        Scenario: Non-admin users cannot retrieve information for all users
            Given users (including all roles) are registered in the system
            When a non-admin user (including participants) attempts to retrieve information for all users
            Then the request should fail with a 403 Forbidden error
        */

    // Define an array of users to register
    const usersArray = [researcher, participant, admin2];

    // Register all users in the system
    Promise.all(
      usersArray.map((user) => {
        return new Promise((resolve) => {
          chai
            .request(app)
            .post(`${baseEntryRegistrationURL}`)
            .send(user)
            .end((err, res) => {
              // Assert that the registration is successful
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
        // After all users are registered, log in the researcher user
        return chai.request(app).post(`${baseEntryLoginURL}`).send(researcher);
      })
      .then((res) => {
        // Assert that the user login is successful
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.headers.should.have.property("set-cookie");
        usersCookies[researcher.email] = res.headers["set-cookie"];

        // Attempt to retrieve information for all users as a non-admin user (researcher)
        return chai
          .request(app)
          .get(
            `${baseResearchersURL}/${researcher.email}/${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email]);
      })
      .then((res) => {
        // Assert that the request fails with a 403 Forbidden error
        res.should.have.status(403);
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that an admin can delete all users.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should delete all users", (done) => {
    /*
        Scenario: Admin deletes all users
            Given multiple users are registered in the system
            When an admin requests to delete all users
            Then the system should delete all users successfully
        */

    // Define an array of users to register
    const usersArr = [researcher, participant, admin2];

    // Register all users in the system
    Promise.all(
      usersArr.map((user) => {
        return new Promise((resolve) => {
          chai
            .request(app)
            .post(`${baseEntryRegistrationURL}`)
            .send(user)
            .end((err, res) => {
              // Assert that the registration is successful
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
        return chai.request(app).post(`${baseEntryLoginURL}`).send(admin2);
      })
      .then((loginRes) => {
        loginRes.should.have.status(200);
        loginRes.body.should.be.a("object");
        loginRes.headers.should.have.property("set-cookie");
        usersCookies[admin2.email] = loginRes.headers["set-cookie"];
        // After all users are registered, delete all users as an admin
        const res = chai
          .request(app)
          .delete(`${baseResearchersURL}/${admin2.email}/${admin2.platform}`)
          .set("Cookie", usersCookies[admin2.email]);
        // Assert that the deletion is successful
        res.should.have.status(200);
        res.should.have.property("text");
        res.text.should.have.property("deletedCount");
        res.text.deletedCount.should.be.equal(usersArr.length + 1);
        usersCookies = {}; // Deleting cookies in case there are some
      });

    // Register and login admin before each test
    chai
      .request(app)
      .post(`${baseEntryRegistrationURL}`)
      .send(admin1)
      .end((err, res) => {
        // Assert that the admin registration is successful
        res.should.have.status(201);
        res.body.should.be.a("object");

        // Login in the admin
        chai
          .request(app)
          .post(`${baseEntryLoginURL}`)
          .send(admin1)
          .end((err, res) => {
            // Assert that the admin login is successful
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.headers.should.have.property("set-cookie");
            usersCookies[admin1.email] = res.headers["set-cookie"]; // Update the JWT token
            done();
          });
      });
  });

  /**
   * Test case to verify that non-admin users (including participants) cannot delete all users.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not delete all users (user role is not Admin)", (done) => {
    /*
        Scenario: Non-admin users cannot delete all users
            Given multiple users are registered in the system
            When a non-admin user (including participants) attempts to delete all users
            Then the request should fail with a 403 Forbidden error
        */

    // Define an array of users to register
    const usersArr = [researcher, participant, admin2];

    // Register all users in the system
    Promise.all(
      usersArr.map((user) => {
        return new Promise((resolve) => {
          chai
            .request(app)
            .post(`${baseEntryRegistrationURL}`)
            .send(user)
            .end((err, res) => {
              // Assert that the registration is successful
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
        return chai.request(app).post(`${baseEntryLoginURL}`).send(researcher);
      })
      .then((loginRes) => {
        loginRes.should.have.status(200);
        loginRes.body.should.be.a("object");
        loginRes.headers.should.have.property("set-cookie");
        usersCookies[researcher.email] = loginRes.headers["set-cookie"];
        // After all users are registered, attempt to delete all users as a non-admin user (researcher)
        chai
          .request(app)
          .delete(
            `${baseResearchersURL}/${researcher.email}/${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .end((err, res) => {
            // Assert that the request fails with a 403 Forbidden error
            res.should.have.status(403);
            done();
          });
      })
      .catch((error) => {
        done(error);
      });
  });
});
