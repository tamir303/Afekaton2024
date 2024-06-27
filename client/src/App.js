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
function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/register/:type" element={<SignupPrep />} />
        <Route path="/search-tutor" element={<SearchTutorPage />} />
        <Route path="/tutor/:id" element={<div>Tutor Profile</div>} />
        <Route
          path="/create-post"
          element={
            <CreatePostPage subjects={["Math", "Science"]} role="tutor" />
          }
        />
        <Route path="*" element={<div>404</div>} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
