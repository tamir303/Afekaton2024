import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

const AboutPage = () => {
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
          About Us
        </Typography>
        <Typography variant="h5" sx={{ mb: "2rem" }}>
          We are dedicated to bridging the gap between tutors and learners!
        </Typography>
        <Typography variant="body1">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
          convallis libero et turpis accumsan, quis ullamcorper neque maximus.
          Vestibulum feugiat mauris a ante gravida tincidunt.
        </Typography>
      </Box>
    </Box>
  );
};

export default AboutPage;
