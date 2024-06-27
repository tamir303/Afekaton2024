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
import {
  researcherObj,
  participantObj,
} from "../../../src/utils/requestStructures/requestObjects.js";
import Roles from "../../../src/utils/UserRole.js";
import ObjectBoundary from "../../../src/boundaries/object/ObjectBoundary.js";

// Initializing Chai HTTP and setting up assertions
chai.use(chaiHttp);
chai.should();

const baseEntryRegistrationURL = "/entry/register";
const baseEntryLoginURL = "/entry/login";
const baseResearchersURL = "/auth/researchers";
const baseObjectsURL = "/auth/objects";
const baseParticipantsURL = "/participants";

// A dictionary to store cookies of JWT tokens mapped by user email
let usersCookies = {};

describe("Objects Service Tests", () => {
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

    const agent = chai.request.agent(app);

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
              chai
                .request(app)
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
        agent.close();
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
      .delete(
        `${baseObjectsURL}?email=${admin1.email}&platform=${admin1.platform}`
      )
      .set("Cookie", usersCookies[admin1.email])
      .end((err, res) => {
        res.should.have.status(200);
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
  });

  /**
   * Test case to verify the creation of a new object by a researcher.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should create new object by Researcher", (done) => {
    /*
        Scenario: Researcher creates a new object
            Given a researcher wants to create a new object
            When the researcher sends a POST request to create the object
            Then the system should respond with a 201 status code
            And the response body should contain the created object details
            And the created object should have all required properties
            And the createdBy field should match the researcher's details
        
        Scenario: Verify the created object
            Given the system has only one object
            When an admin retrieves all objects
            Then the system should respond with a 200 status code
            And the response body should contain an array of objects
            And the array length should be 1
            And the retrieved object should match the created object
        */
    chai.request
      .agent(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(researcherObj)
      .end((err, res) => {
        // Assertion for object creation
        // console.error(err);
        // console.log(res);
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("objectId");
        res.body.objectId.should.have.property("internalObjectId");
        res.body.objectId.should.have.property("platform");
        res.body.should.have.property("alias");
        res.body.should.have.property("active");
        res.body.should.have.property("creationTimestamp");
        res.body.should.have.property("modificationTimestamp");
        res.body.should.have.property("location");
        res.body.should.have.property("createdBy");
        res.body.createdBy.should.have.property("userId");
        res.body.createdBy.userId.should.have.property("email");
        res.body.createdBy.userId.should.have.property("platform");
        res.body.createdBy.userId.email.should.equal(researcher.email);
        const createdObj = res.body;

        // Retrieving all objects to verify the created object
        chai
          .request(app)
          .get(
            `${baseObjectsURL}?email=${admin1.email}&platform=${admin1.platform}`
          )
          .set("Cookie", usersCookies[admin1.email])
          .send()
          .end((err, res) => {
            // Assertion for verifying the created object
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.should.have.lengthOf(1);
            const obj = res.body[0];
            obj.should.have.property("objectId");
            obj.objectId.should.have.property("internalObjectId");
            obj.objectId.internalObjectId.should.be.equal(
              createdObj.objectId.internalObjectId
            );
            done();
          });
      });
  });

  /**
   * Test case to verify that a new object cannot be created by a researcher when the object properties are invalid.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not create new object by Researcher, the object properties are invalid", (done) => {
    /*
        Scenario: Researcher attempts to create a new object with invalid properties
            Given a researcher wants to create a new object
            When the researcher sends a POST request to create the object with invalid properties
            Then the system should respond with a 400 status code
            And the system should not create any new objects
            And when an admin retrieves all objects
            Then the system should respond with a 200 status code
            And the response body should contain an empty array
        */

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send()
      .end((err, res) => {
        // Assertion for invalid object creation
        res.should.have.status(400);
        chai
          .request(app)
          .get(
            `${baseObjectsURL}?email=${admin1.email}&platform=${admin1.platform}`
          )
          .set("Cookie", usersCookies[admin1.email])
          .send()
          .end((err, res) => {
            // Assertion for verifying no new objects are created
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.should.have.lengthOf(0);
            done();
          });
      });
  });

  /**
   * Test case to verify that a new object cannot be created by a Participant when the object is set to inactive.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not create new object by Participant, the object is set to inactive", (done) => {
    /*
        Scenario: Participant attempts to create a new object with inactive status
            Given a participant wants to create a new object
            When the participant sends a POST request to create the object with inactive status
            Then the system should respond with a 403 status code
            And the system should not create any new objects
            And when an admin retrieves all objects
            Then the system should respond with a 200 status code
            And the response body should contain an empty array
        */

    const otherObj = { ...participantObj };
    otherObj.createdBy = { ...participantObj.createdBy };
    otherObj.active = false;

    chai
      .request(app)
      .post(`${baseParticipantsURL}/objects`)
      .send(otherObj)
      .end((err, res) => {
        // Assertion for inactive object creation by participant
        res.should.have.status(403);
        chai
          .request(app)
          .get(
            `${baseObjectsURL}?email=${admin1.email}&platform=${admin1.platform}`
          )
          .set("Cookie", usersCookies[admin1.email])
          .send()
          .end((err, res) => {
            // Assertion for verifying no new objects are created
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.should.have.lengthOf(0);
            done();
          });
      });
  });

  /**
   * Test case to verify that a new object cannot be created when the user specified in the createdBy field does not exist.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not create new object by the user, the user does not exist", (done) => {
    /*
        Scenario: User attempts to create a new object with a non-existent user
            Given a user wants to create a new object
            When the user sends a POST request to create the object with a createdBy field referencing a non-existent user
            Then the system should respond with a 404 status code
            And the system should not create any new objects
            And when an admin retrieves all objects
            Then the system should respond with a 200 status code
            And the response body should contain an empty array
        */

    const otherObj = { ...participantObj };
    otherObj.createdBy = { ...participantObj.createdBy };
    otherObj.createdBy.userId = { ...participantObj.createdBy.userId };
    otherObj.createdBy.userId.email = "someotheremail@test.org";
    otherObj.createdBy.userId.platform = "Builder";

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", "nonexistentjwt")
      .send(otherObj)
      .end((err, res) => {
        // Assertion for creation with non-existent user
        res.should.have.status(403);
        chai
          .request(app)
          .get(
            `${baseObjectsURL}?email=${admin1.email}&platform=${admin1.platform}`
          )
          .set("Cookie", usersCookies[admin1.email])
          .send()
          .end((err, res) => {
            // Assertion for verifying no new objects are created
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.should.have.lengthOf(0);
            done();
          });
      });
  });

  /**
   * Test case to verify that a participant cannot create a new inactive object.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not create new object by the user, the participant is not allowed to create inactive objects", (done) => {
    /*
        Scenario: Participant attempts to create a new inactive object
            Given a participant wants to create a new object
            When the participant sends a POST request to create the object with the active field set to false
            Then the system should respond with a 403 status code
            And the system should not create any new objects
            And when an admin retrieves all objects
            Then the system should respond with a 200 status code
            And the response body should contain an empty array
        */

    const otherObj = { ...participantObj };
    otherObj.active = false;

    chai
      .request(app)
      .post(`${baseParticipantsURL}/objects`)
      .send(otherObj)
      .end((err, res) => {
        // Assertion for creation of inactive object by participant
        res.should.have.status(403);
        chai
          .request(app)
          .get(
            `${baseObjectsURL}?email=${admin1.email}&platform=${admin1.platform}`
          )
          .set("Cookie", usersCookies[admin1.email])
          .send()
          .end((err, res) => {
            // Assertion for verifying no new objects are created
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.should.have.lengthOf(0);
            done();
          });
      });
  });

  /**
   * Test case to verify the updating of an object.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should update an object", (done) => {
    /*
        Scenario: Updating an existing object
            Given a researcher wants to update an existing object
            When the researcher sends a PUT request with updated object details
            Then the system should respond with a 200 status code
            And the system should not return any response body
            And when the researcher retrieves the updated object
            Then the system should respond with a 200 status code
            And the response body should contain the updated object details
        */

    const otherObj = { ...researcherObj };
    otherObj.objectDetails = { ...researcherObj.objectDetails };
    let objID;

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(researcherObj)
      .then((res) => {
        // Assertion for successful creation of the object
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("objectId");
        res.body.objectId.should.have.property("internalObjectId");
        objID = res.body.objectId.internalObjectId;

        // Update object details
        otherObj.type = "newType";
        otherObj.alias = "newAlias";
        otherObj.active = false;
        otherObj.objectDetails.key1 = 0;

        // Send PUT request to update the object
        return chai
          .request(app)
          .put(
            `${baseObjectsURL}/${objID}?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send(otherObj);
      })
      .then((putRes) => {
        // Assertion for successful update of the object
        putRes.should.have.status(200);
        putRes.body.should.be.empty;

        // Retrieve the updated object
        return chai
          .request(app)
          .get(
            `${baseObjectsURL}/${objID}?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[admin1.email]);
      })
      .then((getRes) => {
        // Assertion for retrieving the updated object
        getRes.should.have.status(200);
        getRes.body.should.not.be.empty;
        getRes.body.should.have.a.property("objectId");
        getRes.body.objectId.should.have.property("internalObjectId");
        getRes.body.objectId.internalObjectId.should.be.equal(objID);
        getRes.body.should.have.a.property("type");
        getRes.body.type.should.be.equal(otherObj.type);
        getRes.body.should.have.a.property("alias");
        getRes.body.alias.should.be.equal(otherObj.alias);
        getRes.body.should.have.a.property("active");
        getRes.body.active.should.be.equal(otherObj.active);
        getRes.body.should.have.a.property("objectDetails");
        getRes.body.objectDetails.should.have.a.property("key1");
        getRes.body.objectDetails.key1.should.be.equal(
          otherObj.objectDetails.key1
        );

        // Call done() after all assertions have been made
        done();
      })
      .catch((error) => {
        // Handle any errors
        done(error);
      });
  });

  /**
   * Test case to verify that a participant cannot update an object.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not update an object, the user is participant", (done) => {
    /*
        Scenario: Participant attempting to update an object
            Given a participant wants to update an existing object
            When the participant sends a PUT request with updated object details
            Then the system should respond with a 403 Forbidden status code
            And when the researcher retrieves the object
            Then the system should respond with a 200 status code
            And the retrieved object details should remain unchanged
        */

    const otherObj = { ...researcherObj };
    otherObj.objectDetails = { ...researcherObj.objectDetails };
    let objID;

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(researcherObj)
      .then((res) => {
        // Assertion for successful creation of the object
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("objectId");
        res.body.objectId.should.have.property("internalObjectId");
        objID = res.body.objectId.internalObjectId;

        // Update object details
        otherObj.type = "newType";
        otherObj.alias = "newAlias";
        otherObj.active = false;
        otherObj.objectDetails.key1 = 0;

        // Send PUT request to update the object by participant
        return chai
          .request(app)
          .put(
            `${baseParticipantsURL}/objects/${objID}?email=${participant.email}&platform=${participant.platform}`
          )
          .send(otherObj);
      })
      .then((putRes) => {
        // Assertion for Not Found status code when participant attempts to update, the route is not reachable
        putRes.should.have.status(404);

        // Retrieve the object to verify it remains unchanged
        return chai
          .request(app)
          .get(
            `${baseObjectsURL}/${objID}?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email]);
      })
      .then((getRes) => {
        // Assertion for retrieving the unchanged object
        getRes.should.have.status(200);
        getRes.body.should.not.be.empty;
        getRes.body.should.have.a.property("objectId");
        getRes.body.objectId.should.have.property("internalObjectId");
        getRes.body.objectId.internalObjectId.should.be.equal(objID);
        getRes.body.should.have.a.property("type");
        getRes.body.type.should.be.equal(researcherObj.type);
        getRes.body.should.have.a.property("alias");
        getRes.body.alias.should.be.equal(researcherObj.alias);
        getRes.body.should.have.a.property("active");
        getRes.body.active.should.be.equal(researcherObj.active);
        getRes.body.should.have.a.property("objectDetails");
        getRes.body.objectDetails.should.have.a.property("key1");
        getRes.body.objectDetails.key1.should.be.equal(
          researcherObj.objectDetails.key1
        );

        // Call done() after all assertions have been made
        done();
      })
      .catch((error) => {
        // Handle any errors
        done(error);
      });
  });

  /**
   * Test case to verify that an object cannot be updated if it does not exist.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not update an object, the object does not exist", (done) => {
    /*
        Scenario: Updating a non-existent object
            Given an attempt is made to update a non-existent object
            When a PUT request is sent with updated object details
            Then the system should respond with a 404 Not Found status code
        */

    const otherObj = { ...researcherObj };
    otherObj.objectDetails = { ...researcherObj.objectDetails };
    let objID;

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(researcherObj)
      .then((res) => {
        // Assertion for successful creation of the object
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("objectId");
        res.body.objectId.should.have.property("internalObjectId");
        objID = "123"; // Assigning a non-existent object ID

        // Update object details
        otherObj.type = "newType";
        otherObj.alias = "newAlias";
        otherObj.active = false;
        otherObj.objectDetails.key1 = 0;

        // Send PUT request to update the non-existent object
        return chai
          .request(app)
          .put(
            `${baseObjectsURL}/${objID}?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send(otherObj);
      })
      .then((putRes) => {
        // Assertion for Not Found status code when attempting to update non-existent object
        putRes.should.have.status(404);
        done();
      })
      .catch((error) => {
        // Handle any errors
        done(error);
      });
  });

  /**
   * Test case to verify that an object cannot be updated if the type string is empty.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not update an object, given an empty type string", (done) => {
    /*
        Scenario: Attempting to update an object with an empty type string
            Given an attempt is made to update an object with an empty type string
            When a PUT request is sent with updated object details
            Then the system should respond with a 403 Forbidden status code
        */

    const otherObj = { ...researcherObj };
    otherObj.objectDetails = { ...researcherObj.objectDetails };
    let objID;

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(researcherObj)
      .then((res) => {
        // Assertion for successful creation of the object
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("objectId");
        res.body.objectId.should.have.property("internalObjectId");
        objID = res.body.objectId.internalObjectId;

        // Update object details with empty type string
        otherObj.type = "";
        otherObj.alias = "newAlias";
        otherObj.active = false;
        otherObj.objectDetails.key1 = 0;

        // Send PUT request to update the object with empty type string
        return chai
          .request(app)
          .put(
            `${baseObjectsURL}/${objID}?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send(otherObj);
      })
      .then((putRes) => {
        // Assertion for Forbidden status code when updating object with empty type string
        putRes.should.have.status(403);
        done();
      })
      .catch((error) => {
        // Handle any errors
        done(error);
      });
  });

  /**
   * Test case to verify that an object cannot be updated if the alias string is empty.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not update an object, given an empty alias string", (done) => {
    /*
        Scenario: Attempting to update an object with an empty alias string
            Given an attempt is made to update an object with an empty alias string
            When a PUT request is sent with updated object details
            Then the system should respond with a 403 Forbidden status code
        */

    const otherObj = { ...researcherObj };
    otherObj.objectDetails = { ...researcherObj.objectDetails };
    let objID;

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(researcherObj)
      .then((res) => {
        // Assertion for successful creation of the object
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("objectId");
        res.body.objectId.should.have.property("internalObjectId");
        objID = res.body.objectId.internalObjectId;

        // Update object details with empty alias string
        otherObj.type = "newType";
        otherObj.alias = "";
        otherObj.active = false;
        otherObj.objectDetails.key1 = 0;

        // Send PUT request to update the object with empty alias string
        return chai
          .request(app)
          .put(
            `${baseObjectsURL}/${objID}?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send(otherObj);
      })
      .then((putRes) => {
        // Assertion for Forbidden status code when updating object with empty alias string
        putRes.should.have.status(403);
        done();
      })
      .catch((error) => {
        // Handle any errors
        done(error);
      });
  });

  /**
   * Test case to verify that an object cannot be updated with a new creation timestamp.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not update an object, given a new creation timestamp", (done) => {
    /*
        Scenario: Attempting to update an object with a new creation timestamp
            Given an attempt is made to update an object with a new creation timestamp
            When a PUT request is sent with updated object details
            Then the system should respond with a 403 Forbidden status code
        */

    const otherObj = { ...researcherObj };
    otherObj.objectDetails = { ...researcherObj.objectDetails };
    let objID;

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(researcherObj)
      .then((res) => {
        // Assertion for successful creation of the object
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("objectId");
        res.body.objectId.should.have.property("internalObjectId");
        objID = res.body.objectId.internalObjectId;

        // Update object details with a new creation timestamp
        otherObj.type = "newType";
        otherObj.alias = "newAlias";
        otherObj.active = false;
        otherObj.objectDetails.key1 = 0;
        otherObj.creationTimestamp = new Date();

        // Send PUT request to update the object with a new creation timestamp
        return chai
          .request(app)
          .put(
            `${baseObjectsURL}/${objID}?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send(otherObj);
      })
      .then((putRes) => {
        // Assertion for Forbidden status code when updating object with a new creation timestamp
        putRes.should.have.status(403);
        done();
      })
      .catch((error) => {
        // Handle any errors
        done(error);
      });
  });

  /**
   * Test case to verify that an object can be fetched by a researcher or admin.
   * This should also work for inactive objects.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should fetch an object", (done) => {
    /*
        Scenario: Fetching an object by researcher or admin
            Given an object is created
            When a GET request is sent to fetch the object
            Then the system should respond with the object details
        */

    let objID;

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(researcherObj)
      .then((res) => {
        // Assertion for successful creation of the object
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("objectId");
        res.body.objectId.should.have.property("internalObjectId");
        objID = res.body.objectId.internalObjectId;

        // Send GET request to fetch the object details
        return chai
          .request(app)
          .get(
            `${baseObjectsURL}/${objID}?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email]);
      })
      .then((getRes) => {
        // Assertion for successful retrieval of the object details
        getRes.should.have.status(200);
        getRes.body.should.not.be.empty;
        getRes.body.should.have.a.property("objectId");
        getRes.body.objectId.should.have.property("internalObjectId");
        getRes.body.objectId.internalObjectId.should.be.equal(objID);
        getRes.body.should.have.a.property("type");
        getRes.body.type.should.be.equal(researcherObj.type);
        getRes.body.should.have.a.property("alias");
        getRes.body.alias.should.be.equal(researcherObj.alias);
        getRes.body.should.have.a.property("active");
        getRes.body.active.should.be.equal(researcherObj.active);
        getRes.body.should.have.a.property("objectDetails");
        done();
      })
      .catch((error) => {
        // Handle any errors
        done(error);
      });
  });

  /**
   * Test case to verify that an object cannot be fetched if it does not exist.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not fetch an object, the object does not exist", (done) => {
    /*
        Scenario: Attempting to fetch a non-existent object
            Given an object with a non-existent ID
            When a GET request is sent to fetch the object
            Then the system should respond with a 404 status code
        */

    let objID = "123"; // Non-existent object id

    chai
      .request(app)
      .get(
        `${baseObjectsURL}/${objID}?email=${researcher.email}&platform=${researcher.platform}`
      )
      .set("Cookie", usersCookies[researcher.email])
      .then((res) => {
        // Assertion for 404 status code
        res.should.have.status(404);

        done();
      })
      .catch((error) => {
        // Handle any errors
        done(error);
      });
  });

  /**
   * Test case to verify that an object cannot be fetched if it is inactive and the user is a participant.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not fetch an object, the object is currently inactive and the user is participant", (done) => {
    /*
        Scenario: Attempting to fetch an inactive object as a participant
            Given an inactive object
            And the user is a participant
            When a GET request is sent to fetch the object
            Then the system should respond with a 403 status code
        */

    const otherObj = { ...researcherObj };
    otherObj.objectDetails = { ...researcherObj.objectDetails };
    otherObj.active = false;
    let objID;

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(otherObj)
      .then((res) => {
        // Assertion for successful creation of the object
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("objectId");
        res.body.objectId.should.have.property("internalObjectId");
        objID = res.body.objectId.internalObjectId;

        // Send a GET request to fetch the object
        return chai
          .request(app)
          .get(
            `${baseParticipantsURL}/objects/${objID}?email=${participant.email}&platform=${participant.platform}`
          )
          .send(otherObj);
      })
      .then((getRes) => {
        // Assertion for 403 status code
        getRes.should.have.status(403);
        done();
      })
      .catch((error) => {
        // Handle any errors
        done(error);
      });
  });

  /**
   * Test case to verify that all objects can be fetched when the requesting user is an admin.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should fetch all the objects, the requesting user is an admin", (done) => {
    /*
        Scenario: Fetching all objects as an admin user
            Given there are multiple objects in the system
            And the user is an admin
            When a GET request is sent to fetch all objects
            Then the system should respond with a 200 status code
            And the response should contain all the objects
        */

    const numObjects = 10; // Could be any number

    const objArr = new Array();

    // Create an array of objects
    for (let index = 0; index < numObjects; index++) {
      objArr.push(researcherObj);
    }

    // Create all objects asynchronously
    Promise.all(
      objArr.map((obj) => {
        return new Promise((resolve) => {
          chai
            .request(app)
            .post(`${baseObjectsURL}`)
            .set("Cookie", usersCookies[researcher.email])
            .send(obj)
            .end((err, res) => {
              // Assert that the object creation was successful
              res.body.should.not.be.empty;
              res.body.should.have.a.property("objectId");
              res.body.objectId.should.have.property("internalObjectId");
              resolve(); // Resolve the promise after the request is complete
            });
        });
      })
    ).then(() => {
      // Fetch all objects as an admin
      chai
        .request(app)
        .get(
          `${baseObjectsURL}?email=${admin1.email}&platform=${admin1.platform}`
        )
        .set("Cookie", usersCookies[admin1.email])
        .end((err, res) => {
          // Assert that the request was successful and all objects are returned
          res.should.have.status(200);
          res.body.should.not.be.empty;
          res.body.should.be.a("array");
          res.body.length.should.be.equal(numObjects);
          done();
        });
    });
  });

  /**
   * Test case to verify that all objects cannot be fetched when the requesting user is a researcher.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not fetch all the objects, the requesting user is a researcher", (done) => {
    /*
        Scenario: Attempting to fetch all objects as a researcher user
            Given the user is a researcher
            When a GET request is sent to fetch all objects
            Then the system should respond with a 403 status code
        */

    // Attempt to fetch all objects as a researcher
    chai
      .request(app)
      .get(
        `${baseObjectsURL}?email=${researcher.email}&platform=${researcher.platform}`
      )
      .set("Cookie", usersCookies[researcher.email])
      .end((err, res) => {
        // Assert that the request was forbidden
        res.should.have.status(403);
        done();
      });
  });

  /**
   * Test case to verify that all objects can be deleted when the requesting user is an admin.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should delete all the objects, the requesting user is an admin", (done) => {
    /*
        Scenario: Deleting all objects as an admin user
            Given the user is an admin
            When a DELETE request is sent to delete all objects
            Then the system should respond with a 200 status code
            And the response should contain the count of deleted objects
            And the count of deleted objects should be equal to the total number of objects created
        */

    const numObjects = 10; // Number of objects to create

    // Array to store promises for creating objects
    const objArr = new Array();

    // Create objects
    for (let index = 0; index < numObjects; index++) {
      objArr.push(
        new Promise((resolve) => {
          chai
            .request(app)
            .post(`${baseObjectsURL}`)
            .set("Cookie", usersCookies[researcher.email])
            .send(researcherObj)
            .end((err, res) => {
              // Assert that the object creation was successful
              res.should.have.status(201);
              res.body.should.not.be.empty;
              res.body.should.have.a.property("objectId");
              res.body.objectId.should.have.property("internalObjectId");
              resolve(); // Resolve the promise after the request is complete
            });
        })
      );
    }

    // Wait for all object creation promises to resolve
    Promise.all(objArr).then(() => {
      // Send a DELETE request to delete all objects
      chai
        .request(app)
        .delete(
          `${baseObjectsURL}?email=${admin1.email}&platform=${admin1.platform}`
        )
        .set("Cookie", usersCookies[admin1.email])
        .end((err, res) => {
          // Assert that the deletion was successful
          res.should.have.status(200);
          res.body.should.not.be.empty;
          res.body.should.have.property("deletedCount");
          res.body.deletedCount.should.be.equal(numObjects);
          done();
        });
    });
  });

  /**
   * Test case to verify that an attempt to delete all objects is denied when the requesting user is a researcher.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not delete all the objects, the requesting user is a researcher", (done) => {
    /*
        Scenario: Attempting to delete all objects as a researcher
            Given the user is a researcher
            When a DELETE request is sent to delete all objects
            Then the system should respond with a 403 status code indicating forbidden access
        */

    // Send a DELETE request to delete all objects as a researcher
    chai
      .request(app)
      .delete(
        `${baseObjectsURL}?email=${researcher.email}&platform=${researcher.platform}`
      )
      .set("Cookie", usersCookies[researcher.email])
      .end((err, res) => {
        // Assert that the access is forbidden
        res.should.have.status(403);
        done();
      });
  });

  /**
   * Test case to verify the binding between two objects.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should bind between two objects", (done) => {
    /*
        Scenario: Binding between two objects
            Given a parent object and multiple child objects
            When the child objects are bound to the parent object
            Then the system should correctly establish the binding
            And the parent object should have all the child objects associated with it
        */

    // Initialize variables
    const numObjects = 10;
    const parentObj = { ...researcherObj };
    parentObj.objectDetails = { ...researcherObj.objectDetails };
    let parentObjID;
    const reqObjArr = new Array();
    const childArr = new Array();

    // Create an array of child objects
    for (let index = 0; index < numObjects; index++) {
      reqObjArr.push(researcherObj);
    }

    // Post the parent object
    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(parentObj)
      .then((postRes) => {
        // Assert that the parent object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");
        parentObjID = postRes.body.objectId.internalObjectId;

        // Post child objects
        return Promise.all(
          reqObjArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .post(`${baseObjectsURL}`)
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            // Assert that each child object is successfully created
            res.should.have.status(201);
            res.body.should.not.be.empty;
            res.body.should.have.a.property("objectId");
            res.body.objectId.should.have.property("internalObjectId");
            childArr.push(Object.assign(new ObjectBoundary(), res.body));
          })
        );
      })
      .then(() => {
        // Bind child objects to parent
        return Promise.all(
          childArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .put(
                `${baseObjectsURL}/${parentObjID}/bind?email=${researcher.email}&platform=${researcher.platform}`
              )
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            // Assert that each child object is successfully bound to the parent
            res.should.have.status(200);
            res.body.should.be.empty;
          })
        );
      })
      .then(() => {
        // Get children of parent
        return chai
          .request(app)
          .get(
            `${baseObjectsURL}/${parentObjID}/children?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send();
      })
      .then((res) => {
        // Assert that the correct number of child objects are associated with the parent
        res.should.have.status(200);
        res.body.should.not.be.empty;
        res.body.should.be.a("array");
        res.body.length.should.be.equal(numObjects);
        const resArr = res.body;

        // Extract internal object IDs from the response
        const resInternalObjectIds = resArr.map(
          (obj) => obj.objectId.internalObjectId
        );

        // Filter child objects that match the response internal object IDs
        const matchingObjects = childArr.filter((obj) =>
          resInternalObjectIds.includes(obj.objectId.internalObjectId)
        );

        // Assert that all child objects are correctly associated with the parent
        matchingObjects.should.have.lengthOf(numObjects);
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that binding between two objects is allowed for a participant user.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not bind between two objects, the requesting user is a participant", (done) => {
    /*
        Scenario: Participant user attempting to bind objects
            Given a participant user
            And a parent object and a child object
            When the participant user attempts to bind the child object to the parent object
            Then the system should approve the binding request
        */

    // Initialize variables
    const parentObj = { ...researcherObj };
    parentObj.objectDetails = { ...researcherObj.objectDetails };
    let parentObjID;
    const childObj = { ...researcherObj };
    childObj.objectDetails = { ...researcherObj.objectDetails };

    // Post the parent object
    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(parentObj)
      .then(async (postRes) => {
        // Assert that the parent object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");
        parentObjID = postRes.body.objectId.internalObjectId;

        // Post the child object
        const res = await chai
          .request(app)
          .post(`${baseObjectsURL}`)
          .set("Cookie", usersCookies[researcher.email])
          .send(childObj);
        // Assert that the child object is successfully created
        res.should.have.status(201);
        res.body.should.not.be.empty;
        res.body.should.have.a.property("objectId");
        res.body.objectId.should.have.property("internalObjectId");
        Object.assign(childObj, res.body);
      })
      .then(async () => {
        // Attempt to bind the child object to the parent object
        const res = await chai
          .request(app)
          .put(
            `${baseParticipantsURL}/objects/${parentObjID}/bind?email=${participant.email}&platform=${participant.platform}`
          )
          .send(childObj);
        // Assert that the binding request is accepted
        res.should.have.status(200);
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that binding between two objects is not allowed when the parent object does not exist.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not bind between two objects, the parent object does not exist", (done) => {
    /*
        Scenario: Attempt to bind objects with a non-existent parent object
            Given a non-existent parent object ID
            And a child object
            When attempting to bind the child object to the non-existent parent object
            Then the system should reject the binding request
        */

    // Set the ID of the non-existent parent object
    let parentObjID = "123";

    // Create the child object
    const childObj = { ...researcherObj };
    childObj.objectDetails = { ...researcherObj.objectDetails };

    // Post the child object
    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(childObj)
      .then(async (postRes) => {
        // Assert that the child object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");

        // Attempt to bind the child object to the non-existent parent object
        const res = await chai
          .request(app)
          .put(
            `${baseObjectsURL}/${parentObjID}/bind?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send(childObj);
        // Assert that the binding request is rejected
        res.should.have.status(404);
      })
      .then(() => {
        // Call done() to indicate that the test has completed
        done();
      })
      .catch((error) => {
        // Call done() with the error if any promise rejects
        done(error);
      });
  });

  /**
   * Test case to verify that binding between two objects is not allowed when the child object does not exist.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not bind between two objects, the child object does not exist", (done) => {
    /*
        Scenario: Attempt to bind objects with a non-existent child object
            Given an existing parent object
            And a non-existent child object ID
            When attempting to bind the non-existent child object to the parent object
            Then the system should reject the binding request
        */

    let parentObjID;
    let childObj;

    // Create the parent object
    const parentObj = { ...researcherObj };
    parentObj.objectDetails = { ...researcherObj.objectDetails };

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(parentObj)
      .then(async (postRes) => {
        // Assert that the parent object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");
        parentObjID = postRes.body.objectId.internalObjectId;

        // Create the child object with a non-existent object ID
        childObj = { ...postRes.body };
        childObj.objectDetails = { ...postRes.body.objectDetails };
        childObj.objectId.internalObjectId = "123";

        // Attempt to bind the non-existent child object to the parent object
        const res = await chai
          .request(app)
          .put(
            `${baseObjectsURL}/${parentObjID}/bind?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send(childObj);
        // Assert that the binding request is rejected
        res.should.have.status(404);
      })
      .then(() => {
        // Call done() to indicate that the test has completed
        done();
      })
      .catch((error) => {
        // Call done() with the error if any promise rejects
        done(error);
      });
  });

  /**
   * Test case to verify that unbinding between two objects is successful.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should unbind two objects", (done) => {
    /*
        Scenario: Unbind objects successfully
            Given a parent object and multiple child objects bound to it
            When unbinding each child object from the parent object
            Then all child objects should be successfully unbound
        */

    const numObjects = 10;
    let parentObjID;
    const reqObjArr = new Array();
    const childArr = new Array();

    // Create parent object
    const parentObj = { ...researcherObj };
    parentObj.objectDetails = { ...researcherObj.objectDetails };

    for (let index = 0; index < numObjects; index++) {
      reqObjArr.push(researcherObj);
    }

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(parentObj)
      .then((postRes) => {
        // Assert that the parent object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");
        parentObjID = postRes.body.objectId.internalObjectId;

        // Post child objects
        return Promise.all(
          reqObjArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .post(`${baseObjectsURL}`)
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            // Assert that each child object is successfully created
            res.should.have.status(201);
            res.body.should.not.be.empty;
            res.body.should.have.a.property("objectId");
            res.body.objectId.should.have.property("internalObjectId");
            childArr.push(Object.assign(new ObjectBoundary(), res.body));
          })
        );
      })
      .then(() => {
        // Bind child objects to parent
        return Promise.all(
          childArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .put(
                `${baseObjectsURL}/${parentObjID}/bind?email=${researcher.email}&platform=${researcher.platform}`
              )
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            // Assert that each child object is successfully bound to the parent object
            res.should.have.status(200);
            res.body.should.be.empty;
          })
        );
      })
      .then(() => {
        // Unbind child objects from parent
        return Promise.all(
          childArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .put(
                `${baseObjectsURL}/${parentObjID}/unbind?email=${researcher.email}&platform=${researcher.platform}`
              )
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            // Assert that each child object is successfully unbound from the parent object
            res.should.have.status(200);
            res.body.should.be.empty;
          })
        );
      })
      .then(() => {
        // Get children of parent
        return chai
          .request(app)
          .get(
            `${baseObjectsURL}/${parentObjID}/children?email=${participant.email}&platform=${participant.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send();
      })
      .then((res) => {
        // Assert that there are no children associated with the parent object after unbinding
        res.should.have.status(200);
        res.body.should.be.empty;
        res.body.should.be.a("array");
        res.body.length.should.be.equal(0);
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that unbinding between two objects is not allowed when the requesting user is a participant.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not unbind between two objects, the requesting user is a participant", (done) => {
    /*
        Scenario: Participant tries to unbind objects
            Given a parent object and a child object bound to it
            When a participant attempts to unbind the child object from the parent object
            Then the participant should receive a forbidden status (403)
        */

    // Create parent object
    const parentObj = { ...researcherObj };
    parentObj.objectDetails = { ...researcherObj.objectDetails };

    let parentObjID;
    const childObj = { ...researcherObj };
    childObj.objectDetails = { ...researcherObj.objectDetails };

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(parentObj)
      .then(async (postRes) => {
        // Assert that the parent object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");
        parentObjID = postRes.body.objectId.internalObjectId;

        // Post child object
        const res = await chai
          .request(app)
          .post(`${baseObjectsURL}`)
          .set("Cookie", usersCookies[researcher.email])
          .send(childObj);
        // Assert that the child object is successfully created
        res.should.have.status(201);
        res.body.should.not.be.empty;
        res.body.should.have.a.property("objectId");
        res.body.objectId.should.have.property("internalObjectId");
      })
      .then(async () => {
        // Try to unbind child object from parent object as a participant
        const res = await chai
          .request(app)
          .put(
            `${baseParticipantsURL}/objects/${parentObjID}/unbind?email=${participant.email}&platform=${participant.platform}`
          )
          .send(childObj);
        // Assert that the participant is Not Found from unbinding objects, there is no such accsible route for participant
        res.should.have.status(404);
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that unbinding between two objects is not allowed when the parent object does not exist.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not unbind between two objects, the parent object does not exist", (done) => {
    /*
        Scenario: Attempt to unbind between two objects when the parent object does not exist
            Given a non-existent parent object and a child object
            When attempting to unbind the child object from the non-existent parent object
            Then the system should respond with a not found status (404)
        */

    // Define a non-existent parent object ID
    let parentObjID = "123";

    // Create a child object
    const childObj = { ...researcherObj };
    childObj.objectDetails = { ...researcherObj.objectDetails };

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(childObj)
      .then(async (postRes) => {
        // Assert that the child object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");

        // Attempt to unbind child object from non-existent parent object
        const res = await chai
          .request(app)
          .put(
            `${baseObjectsURL}/${parentObjID}/unbind?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send(childObj);
        // Assert that the system responds with a not found status
        res.should.have.status(404);
      })
      .then(() => {
        // Call done() to indicate that the test has completed
        done();
      })
      .catch((error) => {
        // Call done() with the error if any promise rejects
        done(error);
      });
  });

  /**
   * Test case to verify that unbinding between two objects is not allowed when the child object does not exist.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should not unbind between two objects, the child object does not exist", (done) => {
    /*
        Scenario: Attempt to unbind between two objects when the child object does not exist
            Given an existing parent object and a non-existent child object
            When attempting to unbind the non-existent child object from the parent object
            Then the system should respond with a not found status (404)
        */

    let parentObjID;
    const parentObj = { ...researcherObj };
    parentObj.objectDetails = { ...researcherObj.objectDetails };

    let childObj;

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(parentObj)
      .then(async (postRes) => {
        // Assert that the parent object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");
        parentObjID = postRes.body.objectId.internalObjectId;

        // Create a non-existent child object
        childObj = { ...postRes.body };
        childObj.objectDetails = { ...postRes.body.objectDetails };
        childObj.objectId.internalObjectId = "123";

        // Attempt to unbind non-existent child object from the parent object
        const res = await chai
          .request(app)
          .put(
            `${baseObjectsURL}/${parentObjID}/unbind?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send(childObj);
        // Assert that the system responds with a not found status
        res.should.have.status(404);
      })
      .then(() => {
        // Call done() to indicate that the test has completed
        done();
      })
      .catch((error) => {
        // Call done() with the error if any promise rejects
        done(error);
      });
  });

  /**
   * Test case to verify that a participant can retrieve all the children of an object, considering only the active ones.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should get all the children of an object, the requesting user is participant", (done) => {
    /*
        Scenario: Retrieve all the children of an object when the requesting user is a participant
            Given a parent object and multiple child objects, some of which are inactive
            When a participant requests to get all the children of the parent object
            Then the system should respond with only the active children visible to the participant
        */

    const numObjects = 10;

    const parentObj = { ...researcherObj };
    parentObj.objectDetails = { ...researcherObj.objectDetails };

    let parentObjID;
    const reqObjArr = new Array();
    const childArr = new Array();

    // Generate child objects with some inactive
    for (let index = 0; index < numObjects; index++) {
      let tempObj = { ...researcherObj };
      tempObj.objectDetails = { ...researcherObj.objectDetails };

      if (index % 2 == 0) tempObj.active = false;
      reqObjArr.push(tempObj);
    }

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(parentObj)
      .then((postRes) => {
        // Assert that the parent object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");
        parentObjID = postRes.body.objectId.internalObjectId;

        // Post child objects
        return Promise.all(
          reqObjArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .post(`${baseObjectsURL}`)
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            res.should.have.status(201);
            res.body.should.not.be.empty;
            res.body.should.have.a.property("objectId");
            res.body.objectId.should.have.property("internalObjectId");
            childArr.push(Object.assign(new ObjectBoundary(), res.body));
          })
        );
      })
      .then(() => {
        // Bind child objects to parent
        return Promise.all(
          childArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .put(
                `${baseObjectsURL}/${parentObjID}/bind?email=${researcher.email}&platform=${researcher.platform}`
              )
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            res.should.have.status(200);
            res.body.should.be.empty;
          })
        );
      })
      .then(() => {
        // Get children of parent as a participant
        return chai
          .request(app)
          .get(
            `${baseParticipantsURL}/objects/${parentObjID}/children?email=${participant.email}&platform=${participant.platform}`
          )
          .send();
      })
      .then((res) => {
        // Assert that the system responds with only the active children visible to the participant
        res.should.have.status(200);
        res.body.should.be.not.empty;
        res.body.should.be.a("array");
        res.body.length.should.be.equal(numObjects / 2); // Half of the objects are inactive, so the participant should see only the active ones
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that a researcher can retrieve all the children of an object, including inactive ones.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should get all the children of an object, the requesting user is researcher", (done) => {
    /*
        Scenario: Retrieve all the children of an object when the requesting user is a researcher
            Given a parent object and multiple child objects, some of which are inactive
            When a researcher requests to get all the children of the parent object
            Then the system should respond with all the children, including the inactive ones
        */

    const numObjects = 10;

    const parentObj = { ...researcherObj };
    parentObj.objectDetails = { ...researcherObj.objectDetails };

    let parentObjID;
    const reqObjArr = new Array();
    const childArr = new Array();

    // Generate child objects with some inactive
    for (let index = 0; index < numObjects; index++) {
      let tempObj = { ...researcherObj };
      tempObj.objectDetails = { ...researcherObj.objectDetails };

      if (index % 2 == 0) tempObj.active = false;
      reqObjArr.push(tempObj);
    }

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(parentObj)
      .then((postRes) => {
        // Assert that the parent object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");
        parentObjID = postRes.body.objectId.internalObjectId;

        // Post child objects
        return Promise.all(
          reqObjArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .post(`${baseObjectsURL}`)
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            res.should.have.status(201);
            res.body.should.not.be.empty;
            res.body.should.have.a.property("objectId");
            res.body.objectId.should.have.property("internalObjectId");
            childArr.push(Object.assign(new ObjectBoundary(), res.body));
          })
        );
      })
      .then(() => {
        // Bind child objects to parent
        return Promise.all(
          childArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .put(
                `${baseObjectsURL}/${parentObjID}/bind?email=${researcher.email}&platform=${researcher.platform}`
              )
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            res.should.have.status(200);
            res.body.should.be.empty;
          })
        );
      })
      .then(() => {
        // Get children of parent as a researcher
        return chai
          .request(app)
          .get(
            `${baseObjectsURL}/${parentObjID}/children?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send();
      })
      .then((res) => {
        // Assert that the system responds with all the children, including the inactive ones
        res.should.have.status(200);
        res.body.should.be.not.empty;
        res.body.should.be.a("array");
        res.body.length.should.be.equal(numObjects); // All objects, including the inactive ones, should be visible to the researcher
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that a participant can retrieve only the active parents of an object.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should get some of the parents of an object, the requesting user is participant", (done) => {
    /*
        Scenario: Retrieve all the parents of an object when the requesting user is a participant
            Given a child object and multiple parent objects, some of which are inactive
            When a participant requests to get all the parents of the child object
            Then the system should respond with only the active parents, excluding the inactive ones
        */

    const numObjects = 10;

    const childObj = { ...researcherObj };
    childObj.objectDetails = { ...researcherObj.objectDetails };

    let childObjID;
    const reqObjArr = new Array();
    const parentsArr = new Array();

    // Generate parent objects with some inactive
    for (let index = 0; index < numObjects; index++) {
      let tempObj = { ...researcherObj };
      tempObj.objectDetails = { ...researcherObj.objectDetails };

      if (index % 2 == 0) tempObj.active = false;
      reqObjArr.push(tempObj);
    }

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(childObj)
      .then((postRes) => {
        // Assert that the child object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");
        childObjID = postRes.body.objectId.internalObjectId;
        Object.assign(childObj, postRes.body);

        // Post parent objects
        return Promise.all(
          reqObjArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .post(`${baseObjectsURL}`)
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            res.should.have.status(201);
            res.body.should.not.be.empty;
            res.body.should.have.a.property("objectId");
            res.body.objectId.should.have.property("internalObjectId");
            parentsArr.push(Object.assign(new ObjectBoundary(), res.body));
          })
        );
      })
      .then(() => {
        // Bind child object to parent objects
        return Promise.all(
          parentsArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .put(
                `${baseObjectsURL}/${obj.objectId.internalObjectId}/bind?email=${researcher.email}&platform=${researcher.platform}`
              )
              .set("Cookie", usersCookies[researcher.email])
              .send(childObj);
            res.should.have.status(200);
            res.body.should.be.empty;
          })
        );
      })
      .then(() => {
        // Get parents of child object as a participant
        return chai
          .request(app)
          .get(
            `${baseParticipantsURL}/objects/${childObjID}/parents?email=${participant.email}&platform=${participant.platform}`
          )
          .send();
      })
      .then((res) => {
        // Assert that the system responds with all the parents, excluding the inactive ones
        res.should.have.status(200);
        res.body.should.be.not.empty;
        res.body.should.be.a("array");
        res.body.length.should.be.equal(numObjects / 2); // Only active parent objects should be visible to the participant
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that a researcher can retrieve all the parents of an object, including inactive ones.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should get all the parents of an object, the requesting user is researcher", (done) => {
    /*
        Scenario: Retrieve all the parents of an object when the requesting user is a researcher
            Given a child object and multiple parent objects, some of which are inactive
            When a researcher requests to get all the parents of the child object
            Then the system should respond with all the parents, including the inactive ones
        */

    const numObjects = 10;

    const childObj = { ...researcherObj };
    childObj.objectDetails = { ...researcherObj.objectDetails };

    let childObjID;
    const reqObjArr = new Array();
    const parentsArr = new Array();

    // Generate parent objects with some inactive
    for (let index = 0; index < numObjects; index++) {
      let tempObj = { ...researcherObj };
      tempObj.objectDetails = { ...researcherObj.objectDetails };

      if (index % 2 == 0) tempObj.active = false;
      reqObjArr.push(tempObj);
    }

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(childObj)
      .then((postRes) => {
        // Assert that the child object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");
        childObjID = postRes.body.objectId.internalObjectId;
        Object.assign(childObj, postRes.body);

        // Post parent objects
        return Promise.all(
          reqObjArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .post(`${baseObjectsURL}`)
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            res.should.have.status(201);
            res.body.should.not.be.empty;
            res.body.should.have.a.property("objectId");
            res.body.objectId.should.have.property("internalObjectId");
            parentsArr.push(Object.assign(new ObjectBoundary(), res.body));
          })
        );
      })
      .then(() => {
        // Bind child object to parent objects
        return Promise.all(
          parentsArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .put(
                `${baseObjectsURL}/${obj.objectId.internalObjectId}/bind?email=${researcher.email}&platform=${researcher.platform}`
              )
              .set("Cookie", usersCookies[researcher.email])
              .send(childObj);
            res.should.have.status(200);
            res.body.should.be.empty;
          })
        );
      })
      .then(() => {
        // Get parents of child object as a researcher
        return chai
          .request(app)
          .get(
            `${baseObjectsURL}/${childObjID}/parents?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send();
      })
      .then((res) => {
        // Assert that the system responds with all the parents, including the inactive ones
        res.should.have.status(200);
        res.body.should.be.not.empty;
        res.body.should.be.a("array");
        res.body.length.should.be.equal(numObjects); // All parent objects, including inactive ones, should be visible to the researcher
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that a participant can retrieve all objects of a specific type.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should get all the objects by type, the requesting user is participant", (done) => {
    /*
        Scenario: Retrieve all objects of a specific type when the requesting user is a participant
            Given multiple objects of a specific type, some of which are inactive
            When a participant requests to get all the objects of that type
            Then the system should respond with all the active objects of that type
        */

    const numObjects = 10;
    const targetType = "dummyType";
    const reqObjArr = [];

    // Generate objects with some inactive
    for (let index = 0; index < numObjects; index++) {
      let tempObj = { ...researcherObj };
      tempObj.objectDetails = { ...researcherObj.objectDetails };
      if (index % 2 == 0) tempObj.active = false;
      reqObjArr.push(tempObj);
    }

    Promise.all(
      reqObjArr.map((obj) => {
        // Return the promise here
        return chai
          .request(app)
          .post(`${baseObjectsURL}`)
          .set("Cookie", usersCookies[researcher.email])
          .send(obj);
      })
    )
      .then(() => {
        // Get all objects of the specified type as a participant
        return chai
          .request(app)
          .get(
            `${baseParticipantsURL}/objects/type/${targetType}?email=${participant.email}&platform=${participant.platform}`
          )
          .send();
      })
      .then((res) => {
        // Assert that the system responds with all the active objects of the specified type
        res.should.have.status(200);
        res.body.should.not.be.empty;
        res.body.should.be.a("array");
        res.body.length.should.be.equal(numObjects / 2); // Half of the objects are inactive, so the participant will only see the active ones
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that a researcher can retrieve all objects of a specific type.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should get all the objects by type, the requesting user is a Reasearcher", (done) => {
    /*
        Scenario: Retrieve all objects of a specific type when the requesting user is a researcher
            Given multiple objects of a specific type, some of which are inactive
            When a researcher requests to get all the objects of that type
            Then the system should respond with all the objects of that type, including inactive ones
        */

    const numObjects = 10;
    const targetType = "dummyType";
    const reqObjArr = [];

    // Generate objects with some inactive
    for (let index = 0; index < numObjects; index++) {
      let tempObj = { ...researcherObj };
      tempObj.objectDetails = { ...researcherObj.objectDetails };
      if (index % 2 == 0) tempObj.active = false;
      reqObjArr.push(tempObj);
    }

    Promise.all(
      reqObjArr.map((obj) => {
        // Return the promise here
        return chai
          .request(app)
          .post(`${baseObjectsURL}`)
          .set("Cookie", usersCookies[researcher.email])
          .send(obj);
      })
    )
      .then(() => {
        // Get all objects of the specified type as a researcher
        return chai
          .request(app)
          .get(
            `${baseObjectsURL}/type/${targetType}?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send();
      })
      .then((res) => {
        // Assert that the system responds with all the objects of the specified type, including inactive ones
        res.should.have.status(200);
        res.body.should.not.be.empty;
        res.body.should.be.a("array");
        res.body.length.should.be.equal(numObjects); // Half of the objects are inactive, but the researcher can observe them all
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that a researcher can retrieve specific object type whether is active or not.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should get a specific object by type, the requesting user is participant", (done) => {
    /*
            Scenario: Retrieve a specific object by type when the requesting user is a researcher
                Given an object of a specific type, which is active
                When a researcher requests to get the object of that type
                Then the system should respond with the disticnt object type
            */

    const targetType = "dummyType";
    let tempObj = { ...researcherObj };
    tempObj.objectDetails = { ...researcherObj.objectDetails };
    tempObj.type = targetType;

    let objID;

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(tempObj)
      .then((res) => {
        // Assertion for successful creation of the object
        res.should.have.status(201);
        res.body.should.be.a("object");
        res.body.should.have.property("objectId");
        res.body.objectId.should.have.property("internalObjectId");
        res.body.should.have.a.property("type");
        res.body.type.should.be.equal(targetType);
        objID = res.body.objectId.internalObjectId;

        // Send GET request to fetch the object details
        return chai
          .request(app)
          .get(
            `${baseObjectsURL}/type/distinct/${targetType}?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email]);
      })
      .then((getRes) => {
        // Assertion for successful retrieval of the object details
        getRes.should.have.status(200);
        getRes.body.should.not.be.empty;
        getRes.body.should.have.a.property("objectId");
        getRes.body.objectId.should.have.property("internalObjectId");
        getRes.body.objectId.internalObjectId.should.be.equal(objID);
        getRes.body.should.have.a.property("type");
        getRes.body.type.should.be.equal(targetType);
        done();
      })
      .catch((error) => {
        // Handle any errors
        done(error);
      });
  });

  /**
   * Test case to verify that a researcher can retrieve all objects of a specific type.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should get a specific object by type, the requesting user is Participant", (done) => {
    /*
            Scenario: Retrieve all objects of a specific type when the requesting user is a researcher
                Given multiple objects of a specific type, some of which are inactive
                When a researcher requests to get all the objects of that type
                Then the system should respond with all the objects of that type, including inactive ones
            */

    const numObjects = 2;
    const targetType = "dummyType";
    const reqObjArr = [];

    // Generate objects with some inactive
    for (let index = 0; index < numObjects; index++) {
      let tempObj = { ...researcherObj };
      tempObj.type = targetType + index;
      tempObj.objectDetails = { ...researcherObj.objectDetails };
      if (index % 2 == 0) tempObj.active = false;
      reqObjArr.push(tempObj);
    }

    Promise.all(
      reqObjArr.map((obj) => {
        // Return the promise here
        return chai
          .request(app)
          .post(`${baseObjectsURL}`)
          .set("Cookie", usersCookies[researcher.email])
          .send(obj);
      })
    )
      .then(() => {
        // Get all objects of the specified type as a participant
        for (let index = 0; index < numObjects; index++) {
          chai
            .request(app)
            .get(
              `${baseParticipantsURL}/objects/type/distinct${
                targetType + index
              }?email=${participant.email}&platform=${participant.platform}`
            )
            .send()
            .then((res) => {
              if (index % 2 === 0) {
                res.should.have.status(400);
              } else {
                res.should.have.status(200);
                res.body.should.not.be.empty;
                res.body.should.have.a.property("objectId");
                res.body.objectId.should.have.property("internalObjectId");
                res.body.objectId.internalObjectId.should.be.equal(objID);
                res.body.should.have.a.property("type");
                res.body.type.should.be.equal(targetType);
              }
            });
        }
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that a participant can retrieve all the children of an object by type and alias, considering only the active ones.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should get all the children of an object by type and alias, the requesting user is participant", (done) => {
    /*
      Scenario: Retrieve all the children of an object by type and alias when the requesting user is a participant
          Given a parent object and multiple child objects of various types and aliases, some of which are inactive
          When a participant requests to get all the children of the parent object by type and alias
          Then the system should respond with only the active children of the specified type and alias visible to the participant
      */

    const numObjects = 10;
    const childType = "desiredType";
    const childAlias = "desiredAlias";

    const parentObj = { ...researcherObj };
    parentObj.objectDetails = { ...researcherObj.objectDetails };

    let parentObjID;
    const reqObjArr = new Array();
    const childArr = new Array();

    // Generate child objects with some inactive, some with desired type and alias
    for (let index = 0; index < numObjects; index++) {
      let tempObj = { ...researcherObj };
      tempObj.objectDetails = { ...researcherObj.objectDetails };

      if (index % 2 == 0) tempObj.active = false; // Half are inactive
      if (index % 3 == 0) {
        // Some have the desired type and alias
        tempObj.type = childType;
        tempObj.alias = childAlias;
      }
      reqObjArr.push(tempObj);
    }

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(parentObj)
      .then((postRes) => {
        // Assert that the parent object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");
        parentObjID = postRes.body.objectId.internalObjectId;

        // Post child objects
        return Promise.all(
          reqObjArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .post(`${baseObjectsURL}`)
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            res.should.have.status(201);
            res.body.should.not.be.empty;
            res.body.should.have.a.property("objectId");
            res.body.objectId.should.have.property("internalObjectId");
            childArr.push(Object.assign(new ObjectBoundary(), res.body));
          })
        );
      })
      .then(() => {
        // Bind child objects to parent
        return Promise.all(
          childArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .put(
                `${baseObjectsURL}/${parentObjID}/bind?email=${researcher.email}&platform=${researcher.platform}`
              )
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            res.should.have.status(200);
            res.body.should.be.empty;
          })
        );
      })
      .then(() => {
        // Get children of parent by type and alias as a participant
        return chai
          .request(app)
          .get(
            `${baseParticipantsURL}/objects/${parentObjID}/children/${childType}/${childAlias}?email=${participant.email}&platform=${participant.platform}`
          )
          .send();
      })
      .then((res) => {
        // Assert that the system responds with only the active children of the specified type and alias visible to the participant
        res.should.have.status(200);
        res.body.should.not.be.empty;
        res.body.should.be.a("array");

        // Filter the expected child objects based on type, alias, and active status
        const expectedActiveChildren = childArr.filter(
          (child) =>
            child.active &&
            child.type === childType &&
            child.alias === childAlias
        );

        res.body.length.should.be.equal(expectedActiveChildren.length);

        // Assert that all returned objects have the specified type and alias
        res.body.forEach((child) => {
          child.type.should.be.equal(childType);
          child.alias.should.be.equal(childAlias);
          child.active.should.be.true; // Ensure the child is active
        });

        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that a researcher can retrieve all the children of an object by type and alias, including inactive ones.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should get all the children of an object by type and alias, the requesting user is researcher", (done) => {
    /*
      Scenario: Retrieve all the children of an object by type and alias when the requesting user is a researcher
          Given a parent object and multiple child objects of various types and aliases, some of which are inactive
          When a researcher requests to get all the children of the parent object by type and alias
          Then the system should respond with all the children of the specified type and alias, including the inactive ones
      */

    const numObjects = 10;
    const childType = "desiredType";
    const childAlias = "desiredAlias";

    const parentObj = { ...researcherObj };
    parentObj.objectDetails = { ...researcherObj.objectDetails };

    let parentObjID;
    const reqObjArr = new Array();
    const childArr = new Array();

    // Generate child objects with some inactive, some with desired type and alias
    for (let index = 0; index < numObjects; index++) {
      let tempObj = { ...researcherObj };
      tempObj.objectDetails = { ...researcherObj.objectDetails };

      if (index % 2 == 0) tempObj.active = false; // Half are inactive
      if (index % 3 == 0) {
        // Some have the desired type and alias
        tempObj.type = childType;
        tempObj.alias = childAlias;
      }
      reqObjArr.push(tempObj);
    }

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(parentObj)
      .then((postRes) => {
        // Assert that the parent object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");
        parentObjID = postRes.body.objectId.internalObjectId;

        // Post child objects
        return Promise.all(
          reqObjArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .post(`${baseObjectsURL}`)
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            res.should.have.status(201);
            res.body.should.not.be.empty;
            res.body.should.have.a.property("objectId");
            res.body.objectId.should.have.property("internalObjectId");
            childArr.push(Object.assign(new ObjectBoundary(), res.body));
          })
        );
      })
      .then(() => {
        // Bind child objects to parent
        return Promise.all(
          childArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .put(
                `${baseObjectsURL}/${parentObjID}/bind?email=${researcher.email}&platform=${researcher.platform}`
              )
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            res.should.have.status(200);
            res.body.should.be.empty;
          })
        );
      })
      .then(() => {
        // Get children of parent by type and alias as a researcher
        return chai
          .request(app)
          .get(
            `${baseObjectsURL}/${parentObjID}/children/${childType}/${childAlias}?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send();
      })
      .then((res) => {
        // Assert that the system responds with all the children of the specified type and alias, including the inactive ones
        res.should.have.status(200);
        res.body.should.not.be.empty;
        res.body.should.be.a("array");

        // Filter the expected child objects based on type and alias
        const expectedChildren = childArr.filter(
          (child) => child.type === childType && child.alias === childAlias
        );

        res.body.length.should.be.equal(expectedChildren.length);

        // Assert that all returned objects have the specified type and alias
        res.body.forEach((child) => {
          child.type.should.be.equal(childType);
          child.alias.should.be.equal(childAlias);
        });

        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that a participant can retrieve all the parents of an object by type and alias, considering only the active ones.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should get all the parents of an object by type and alias, the requesting user is participant", (done) => {
    /*
    Scenario: Retrieve all the parents of an object by type and alias when the requesting user is a participant
        Given a child object and multiple parent objects of various types and aliases, some of which are inactive
        When a participant requests to get all the parents of the child object by type and alias
        Then the system should respond with only the active parents of the specified type and alias visible to the participant
    */

    const numObjects = 10;
    const parentType = "desiredType";
    const parentAlias = "desiredAlias";

    const childObj = { ...researcherObj };
    childObj.objectDetails = { ...researcherObj.objectDetails };

    let childObjID;
    const reqObjArr = new Array();
    const parentsArr = new Array();

    // Generate parent objects with some inactive
    for (let index = 0; index < numObjects; index++) {
      let tempObj = { ...researcherObj };
      tempObj.objectDetails = { ...researcherObj.objectDetails };

      if (index % 2 == 0) tempObj.active = false; // Half are inactive
      if (index % 3 == 0) {
        // Some have the desired type and alias
        tempObj.type = parentType;
        tempObj.alias = parentAlias;
      }
      reqObjArr.push(tempObj);
    }

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(childObj)
      .then((postRes) => {
        // Assert that the child object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");
        childObjID = postRes.body.objectId.internalObjectId;
        Object.assign(childObj, postRes.body);

        // Post parent objects
        return Promise.all(
          reqObjArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .post(`${baseObjectsURL}`)
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            res.should.have.status(201);
            res.body.should.not.be.empty;
            res.body.should.have.a.property("objectId");
            res.body.objectId.should.have.property("internalObjectId");
            parentsArr.push(Object.assign(new ObjectBoundary(), res.body));
          })
        );
      })
      .then(() => {
        // Bind child object to parent objects
        return Promise.all(
          parentsArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .put(
                `${baseObjectsURL}/${obj.objectId.internalObjectId}/bind?email=${researcher.email}&platform=${researcher.platform}`
              )
              .set("Cookie", usersCookies[researcher.email])
              .send(childObj);
            res.should.have.status(200);
            res.body.should.be.empty;
          })
        );
      })
      .then(() => {
        // Get parents of child object as a participant
        return chai
          .request(app)
          .get(
            `${baseParticipantsURL}/objects/${childObjID}/parents/${parentType}/${parentAlias}?email=${participant.email}&platform=${participant.platform}`
          )
          .send();
      })
      .then((res) => {
        // Assert that the system responds with all the parents, only the inactive ones
        res.should.have.status(200);
        res.body.should.be.not.empty;
        res.body.should.be.a("array");

        // Filter the expected child objects based on type and alias
        const expectedParents = parentsArr.filter(
          (parent) =>
            parent.type === parentType &&
            parent.alias === parentAlias &&
            parent.active
        );

        res.body.length.should.be.equal(expectedParents.length);

        // Assert that all returned objects have the specified type and alias
        res.body.forEach((parent) => {
          parent.type.should.be.equal(parentType);
          parent.alias.should.be.equal(parentAlias);
        });
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  /**
   * Test case to verify that a researcher can retrieve all the parents of an object by type and alias, including the active ones.
   *
   * @param {function} done - The callback function to signal the end of the test.
   */
  it("should get all the parents of an object by type and alias, the requesting user is researcher", (done) => {
    /*
      Scenario: Retrieve all the parents of an object by type and alias when the requesting user is a researcher
          Given a child object and multiple parent objects of various types and aliases, some of which are inactive
          When a researcher requests to get all the parents of the child object by type and alias
          Then the system should respond with the entire parents of the specified type and alias visible to the researcher
      */

    const numObjects = 10;
    const parentType = "desiredType";
    const parentAlias = "desiredAlias";

    const childObj = { ...researcherObj };
    childObj.objectDetails = { ...researcherObj.objectDetails };

    let childObjID;
    const reqObjArr = new Array();
    const parentsArr = new Array();

    // Generate parent objects with some inactive
    for (let index = 0; index < numObjects; index++) {
      let tempObj = { ...researcherObj };
      tempObj.objectDetails = { ...researcherObj.objectDetails };

      if (index % 2 == 0) tempObj.active = false; // Half are inactive
      if (index % 3 == 0) {
        // Some have the desired type and alias
        tempObj.type = parentType;
        tempObj.alias = parentAlias;
      }
      reqObjArr.push(tempObj);
    }

    chai
      .request(app)
      .post(`${baseObjectsURL}`)
      .set("Cookie", usersCookies[researcher.email])
      .send(childObj)
      .then((postRes) => {
        // Assert that the child object is successfully created
        postRes.should.have.status(201);
        postRes.body.should.not.be.empty;
        postRes.body.should.have.a.property("objectId");
        postRes.body.objectId.should.have.property("internalObjectId");
        childObjID = postRes.body.objectId.internalObjectId;
        Object.assign(childObj, postRes.body);

        // Post parent objects
        return Promise.all(
          reqObjArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .post(`${baseObjectsURL}`)
              .set("Cookie", usersCookies[researcher.email])
              .send(obj);
            res.should.have.status(201);
            res.body.should.not.be.empty;
            res.body.should.have.a.property("objectId");
            res.body.objectId.should.have.property("internalObjectId");
            parentsArr.push(Object.assign(new ObjectBoundary(), res.body));
          })
        );
      })
      .then(() => {
        // Bind child object to parent objects
        return Promise.all(
          parentsArr.map(async (obj) => {
            const res = await chai
              .request(app)
              .put(
                `${baseObjectsURL}/${obj.objectId.internalObjectId}/bind?email=${researcher.email}&platform=${researcher.platform}`
              )
              .set("Cookie", usersCookies[researcher.email])
              .send(childObj);
            res.should.have.status(200);
            res.body.should.be.empty;
          })
        );
      })
      .then(() => {
        // Get parents of child object as a researcher
        return chai
          .request(app)
          .get(
            `${baseObjectsURL}/${childObjID}/parents/${parentType}/${parentAlias}?email=${researcher.email}&platform=${researcher.platform}`
          )
          .set("Cookie", usersCookies[researcher.email])
          .send();
      })
      .then((res) => {
        // Assert that the system responds with all the parents, including the inactive ones
        res.should.have.status(200);
        res.body.should.be.not.empty;
        res.body.should.be.a("array");

        // Filter the expected parents objects based on type and alias
        const expectedParents = parentsArr.filter(
          (parent) => parent.type === parentType && parent.alias === parentAlias
        );

        res.body.length.should.be.equal(expectedParents.length);

        // Assert that all returned objects have the specified type and alias
        res.body.forEach((parent) => {
          parent.type.should.be.equal(parentType);
          parent.alias.should.be.equal(parentAlias);
        });
        done();
      })
      .catch((error) => {
        done(error);
      });
  });
});
