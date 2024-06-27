/*
 * This module exports example objects for researcher and participant instances.
 */

// Example object for a researcher
const researcherObj = {
  type: "dummyType",
  alias: "demo instance",
  active: true,
  location: {
    lat: 35.154,
    lng: 30.81,
  },
  createdBy: {
    userId: {
      platform: "Builder",
      email: "jill@test.org",
    },
  },
  objectDetails: {
    key1: "can be set to any value you wish",
    key2: "you can also name the attributes any name you like",
    key3: 9.99,
    key4: true,
  },
};

// Example object for a participant
const participantObj = {
  type: "dummyType",
  alias: "demo instance",
  active: true,
  location: {
    lat: 35.154,
    lng: 30.81,
  },
  createdBy: {
    userId: {
      platform: "Experiment",
      email: "bob@test.com",
    },
  },
  objectDetails: {
    key1: "can be set to any value you wish",
    key2: "you can also name the attributes any name you like",
    key3: 9.99,
    key4: true,
  },
};

// Exporting the example objects for use in other modules
export { researcherObj, participantObj };
