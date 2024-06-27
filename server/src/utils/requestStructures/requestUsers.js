/*
 * This module exports different user objects used in requests.
 */

// participant object representing user details for a participant
const participant = {
  platform: "Experiment",
  email: "bob@test.com",
  role: "Participant",
  username: "Bob Mcflury",
  userDetails: {},
};

// researcher object representing user details for a researcher
const researcher = {
  platform: "Builder",
  email: "jill@test.org",
  role: "Researcher",
  username: "Jill Smith",
  userDetails: {
    password: "Ss123456",
  },
};

// admin1 object representing user details for an admin (1)
const admin1 = {
  platform: "Builder",
  email: "admin1@test.org",
  role: "Admin",
  username: "admin1",
  userDetails: {
    password: "MyAdmin123",
  },
};

// admin2 object representing user details for an admin (2)
const admin2 = {
  platform: "Builder",
  email: "admin2@test.org",
  role: "Admin",
  username: "admin2",
  userDetails: {
    password: "MyAdmin123",
  },
};

// Exporting the user objects for use in other modules
export { participant, researcher, admin1, admin2 };
