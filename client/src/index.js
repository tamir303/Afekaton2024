import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store, { persistor } from "./states/store";
import { PersistGate } from "redux-persist/integration/react";
import { AlertProvider } from "./components/common/AlertProvider.jsx"; // Ensure correct casing

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AlertProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AlertProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
