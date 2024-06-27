import "./App.css";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import HomePage from "./pages/HomePage";
import { Routes, Route } from "react-router-dom";
import SearchTutorPage from "./pages/SearchTutorPage";
import CreatePostPage from "./pages/CreatePostPage";
import { useMemo } from "react";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme/theme";
import { useSelector } from "react-redux";
import SignupPrep from "./components/common/SignupPrep";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/common/Navbar";
import LoginPage from "./pages/LoginPage";

function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/:role/:type" element={<SignupPrep />} />
        <Route path="/tutors/:subject" element={<SearchTutorPage />} />
        <Route path="profile/:id" element={<ProfilePage/>} />
        {/* <Route
          path="/create-post"
          element={
            <CreatePostPage subjects={["Math", "Science"]} role="tutor" />
          }
        /> */}
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
