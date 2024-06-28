import "./App.css";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import {Routes, Route, Navigate} from "react-router-dom";
import SearchTutorPage from "./pages/SearchTutorPage";
import SearchStudentPage from "./pages/SearchStudentPage";
import {useEffect, useMemo, useState} from "react";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme/theme";
import { useSelector } from "react-redux";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/common/Navbar";
import SignupPrep from "./components/common/SignupPrep";
import LoginPage from "./pages/LoginPage";

function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const [user, setUser] = useState({});

  return (
          <ThemeProvider theme={theme}>
              <CssBaseline />
              <Navbar />
              <Routes>
                  <Route path="/login/:role/:type" element={<LoginPage setUser={setUser}/>} />
                  <Route path="/register/:role/:type" element={<SignupPrep />} />
                  <Route path="/tutors/:subject" element={<SearchTutorPage />} />
                  <Route path="/students/:subject" element={<SearchStudentPage />} />
                  <Route path="profile/:id" element={<ProfilePage user={user}/>} />
                  <Route path="*" element={<Navigate to="/login/student/regular" />} />
              </Routes>
          </ThemeProvider>

  );
}

export default App;
