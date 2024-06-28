import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const ContactUsPage = () => {
  const { palette } = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor={palette.background.default}
    >
      <Box
        width={isNonMobileScreens ? "50%" : "93%"}
        p="2rem"
        borderRadius="1.5rem"
        bgcolor={palette.background.alt}
        boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
        textAlign="center"
      >
        <Typography variant="h2" color="primary" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="h5" color="textSecondary" mb="1.5rem">
          We would love to hear from you!
        </Typography>
        <form>
          <Box display="flex" flexDirection="column" gap="1rem">
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              sx={{ mb: "1rem" }}
            />
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              sx={{ mb: "1rem" }}
            />
            <TextField
              label="Message"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              sx={{ mb: "1rem" }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: palette.primary.main,
                color: palette.background.paper,
                p: "1rem",
                "&:hover": { bgcolor: palette.primary.dark },
              }}
            >
              Send Message
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default ContactUsPage;
