import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { palette } = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const validEmails = ["dor@gmail.com", "matan@gmail.com", "omer@gmail.com"];
    const validPassword = "1234";

    if (validEmails.includes(email) && password === validPassword) {
      console.log(`The user ${email} has logged in successfully!`);
      navigate(`/profile/${email}`);
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Box
        width={isNonMobileScreens ? "50%" : "93%"}
        p="2rem"
        borderRadius="1.5rem"
        bgcolor="#f0f0f0"
        boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
        textAlign="center"
      >
        <Box>
          <Box gridColumn="span 4">
            <Typography fontWeight="bold" fontSize="32px" color="primary">
              Afektive
            </Typography>
          </Box>
          <Box gridColumn="span 4" mb="1.5rem">
            <Typography fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }}>
              Welcome to Afektive! Please login to continue.
            </Typography>
          </Box>
          <form onSubmit={handleLogin}>
            <Box justifyContent="flex" alignItems="stretch" gridColumn="span 4">
              <TextField
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                sx={{ mb: "1rem" }}
              />
              <TextField
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                sx={{ mb: "1rem" }}
              />
            </Box>
            {error && (
              <Typography color="error" sx={{ mb: "1rem" }}>
                {error}
              </Typography>
            )}
            <Box gridColumn="span 4">
              <Button
                fullWidth
                type="submit"
                sx={{
                  m: "2rem 0",
                  p: "1rem",
                  bgcolor: palette.primary.main,
                  color: palette.background.paper,
                  "&:hover": { color: palette.primary.main },
                }}
              >
                LOGIN
              </Button>
              <Box display="flex" justifyContent="space-between">
                <Typography
                  textAlign="left"
                  onClick={() => navigate("/register/tutor/external")}
                  sx={{
                    textDecoration: "underline",
                    color: palette.primary.main,
                    "&:hover": {
                      cursor: "pointer",
                      color: palette.primary.light,
                    },
                  }}
                >
                  {"Don't have an account? Sign up as tutor!"}
                </Typography>
                <Typography
                  textAlign="right"
                  onClick={() => navigate("/register/student/regular")}
                  sx={{
                    textDecoration: "underline",
                    color: palette.primary.main,
                    "&:hover": {
                      cursor: "pointer",
                      color: palette.primary.light,
                    },
                  }}
                >
                  {"Don't have an account? Sign up as student!"}
                </Typography>
              </Box>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
