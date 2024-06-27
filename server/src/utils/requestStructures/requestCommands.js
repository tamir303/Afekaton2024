/*
 * This module exports example commands for various commands.
 */

// Example object for a command
const commandObj = {
  command: "Testing Service",
  targetObject: {
    objectId: {
      platform: "the platform of the object",
      internalObjectId: "some internal object id",
    },
  },
  invokedBy: {
    userId: {
      platform: "Builder",
      email: "jill@test.org",
    },
  },
  commandAttributes: {
    key1: {
      key1subkey: "can be anything you wish, even a nested json",
    },
  },
};

// Exporting the example command object for use in other modules
export { commandObj };
