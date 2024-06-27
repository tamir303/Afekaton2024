import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import reducer from "./reducer";
import dayjs from "dayjs";
import reduxActions from "../utils/reduxActions";

// Configuration for Redux Persist
const persistConfig = {
  key: "root",
  storage,
};

// Persisted Reducer
const persistedReducer = persistReducer(persistConfig, reducer);

// Middleware to check expiration
const expirationMiddleware =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (storeAPI) => (next) => (action) => {
    const state = storeAPI.getState();
    const expiry = state.expiry;

    if (
      expiry &&
      dayjs().isAfter(dayjs(expiry)) &&
      action.type !== reduxActions.LOGED_OUT
    ) {
      storeAPI.dispatch({ type: reduxActions.LOGED_OUT });
    }

    return next(action);
  };

// Configure Store with Middleware adjustments and logger
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(expirationMiddleware),
});

export const persistor = persistStore(store);

export default store;
