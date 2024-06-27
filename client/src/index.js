import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store, { persistor } from "./states/store.js";
import { PersistGate } from "redux-persist/integration/react";
import { AlertProvider } from "./components/common/AlertProvider.jsx"; // Ensure correct casing

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AlertProvider>
          <App />
        </AlertProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
