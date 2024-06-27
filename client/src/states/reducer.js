import { createAction, createReducer } from "@reduxjs/toolkit";
import UserRoles from "../utils/userRoles";
import ReduxActions from "../utils/reduxActions";

const initialState = {
  user: null,
  token: null,
  mode: "light",
  expiry: null,
  userRole: UserRoles.Participant,
  lastEditedItem: null,
  lastAnswer: null,
  currentExperiment: null,
  nextQuestion: null,
  questionsOfCurrentExp: null,
};

// Define actions
const logedIn = createAction(ReduxActions.LOGED_IN);

const logedOut = createAction(ReduxActions.LOGED_OUT);

const answeredItem = createAction(ReduxActions.ANSWERED_ITEM);

const editedItem = createAction(ReduxActions.EDITED_ITEM);

const setCurrentExperiment = createAction(ReduxActions.SET_CURRENT_EXPERIMENT);

const unsetCurrentExperiment = createAction(
  ReduxActions.UNSET_CURRENT_EXPERIMENT
);

const prepareNextQuestion = createAction(ReduxActions.PEREPARE_NEXT_QUESTION);

const loadQuestionsToExp = createAction(ReduxActions.LOAD_QUESTIONS_TO_EXP);

// Type guards
const isArrayOfBooleans = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === "boolean");

const isArrayOfStrings = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(logedIn, (state, action) => {
      const deepCopyUser = { ...action.payload.user };
      deepCopyUser.userDetails = { ...action.payload.user.userDetails };
      state.user = deepCopyUser;
      state.token = action.payload.token;
      state.expiry = action.payload.expiry;
      let role;
      switch (deepCopyUser.role) {
        case UserRoles.Admin:
          role = UserRoles.Admin;
          break;
        case UserRoles.Researcher:
          role = UserRoles.Researcher;
          break;
        case UserRoles.Participant:
          role = UserRoles.Participant;
          break;
        default:
          role = UserRoles.Participant;
          break;
      }
      state.userRole = role;
      return state;
    })
    .addCase(logedOut, (state) => {
      state.user = null;
      state.token = null;
      state.expiry = null;
      return state;
    })
    .addCase(answeredItem, (state, action) => {
      const deepCopyAnswer = { ...action.payload.lastAnswer };
      deepCopyAnswer.objectDetails = {
        ...action.payload.lastAnswer.objectDetails,
      };
      state.lastAnswer = deepCopyAnswer;
      return state;
    })
    .addCase(editedItem, (state, action) => {
      const deepCopyEditedItem = { ...action.payload.lastEditedItem };
      deepCopyEditedItem.objectDetails = {
        ...action.payload.lastEditedItem.objectDetails,
      };
      state.lastEditedItem = action.payload.lastEditedItem;
      return state;
    })
    .addCase(setCurrentExperiment, (state, action) => {
      const deepCopyCurrentExperiment = { ...action.payload.currentExperiment };
      deepCopyCurrentExperiment.objectDetails = {
        ...action.payload.currentExperiment.objectDetails,
      };
      state.currentExperiment = deepCopyCurrentExperiment;
      return state;
    })
    .addCase(unsetCurrentExperiment, (state) => {
      state.currentExperiment = null;
      state.questionsOfCurrentExp = null;
    })
    .addCase(prepareNextQuestion, (state) => {
      if (state.currentExperiment && state.questionsOfCurrentExp) {
        const currentExp = state.currentExperiment;
        const experimentFlow = currentExp.objectDetails.experimentFlow;

        if (isArrayOfBooleans(experimentFlow) && experimentFlow.length > 0) {
          const indicator = experimentFlow.shift(); //Getting the indicator of the question if exists

          // true - the question is fixed and here is a need to disaply it by order
          if (indicator) {
            const fixedQuestions = currentExp.objectDetails.fixedQuestions; // Refrencing the array
            if (isArrayOfStrings(fixedQuestions) && fixedQuestions.length > 0) {
              const quesIternalID = fixedQuestions.shift(); // Retrieving the id of the first order of the fixed quetions
              const nextQuestion = state.questionsOfCurrentExp.find(
                (child) => child.objectId.internalObjectId === quesIternalID
              ); //Getting the child object that has the target id
              state.nextQuestion = nextQuestion || null;
            }
            // false - the question is randomized
          } else {
            const randomizedQuestions =
              currentExp.objectDetails.randomizedQuestions; // Refrencing the array
            if (
              isArrayOfStrings(randomizedQuestions) &&
              randomizedQuestions.length > 0
            ) {
              const randomIndex = Math.floor(
                Math.random() * randomizedQuestions.length
              );
              const quesIternalID = randomizedQuestions.splice(
                randomIndex,
                1
              )[0]; // Choosing a random ID by index and reorganizing the array

              const nextQuestion = state.questionsOfCurrentExp.find(
                (child) => child.objectId.internalObjectId === quesIternalID
              ); // Fetching the actual question object

              state.nextQuestion = nextQuestion || null; // Setting the next question
            }
          }
        } else {
          state.nextQuestion = null;
        }
      }
    })
    .addCase(loadQuestionsToExp, (state, action) => {
      state.questionsOfCurrentExp = [...action.payload.questions];
      return state;
    });
});

export default reducer;

export {
  logedIn,
  logedOut,
  answeredItem,
  editedItem,
  setCurrentExperiment,
  unsetCurrentExperiment,
  prepareNextQuestion,
  loadQuestionsToExp,
};
