import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { Avatar, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

const ProfilePage = () => {
  const navigate = useNavigate();
  
  const user = {
    username: "Name",
    email: "name.email@example.com",
    profilePicture: null,
    role: "tutor", // Example role, adjust as necessary
    userDetails: {
      subjects: ["Math", "Physics", "Chemistry"],
      typeRole: "",
      reviews: [ // Mock reviews data
        { id: 1, reviewer: "Alice", rating: 5, comment: "Great tutor, very helpful!" },
        { id: 2, reviewer: "Bob", rating: 4, comment: "Explains concepts clearly." },
        { id: 3, reviewer: "Charlie", rating: 5, comment: "Excellent sessions, highly recommend." }
      ]
    },
  };

  const handleSubjectClick = (subject) => {
    navigate(`/tutors/${subject}`, { state: { subject } });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log(file);
  };

  return (
    <Container>
      <Paper elevation={3} style={{ padding: "20px", margin: "20px 0" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} style={{ position: "relative" }}>
            <Typography variant="h4">{user.username}</Typography>
            <Typography variant="body1">{user.email}</Typography>
            {user.role === "student" && (
              <Box style={{ position: "absolute", top: 0, right: 0 }}>
                <IconButton color="primary">
                  <AttachMoneyIcon /> Tokens: 100
                </IconButton>
              </Box>
            )}
          </Grid>
          <Grid item xs={12}>
            <input
              type="file"
              id="file-input"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              color="primary"
              component="span"
              onClick={() => document.getElementById("file-input").click()}
            >
              Files to the decanate
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {user.role === "student" ? (
        <Paper elevation={3} style={{ padding: "20px", margin: "20px 0" }}>
          <Typography variant="h5">Subjects I Need Help With</Typography>
          <Box mt={2}>
            <Grid container spacing={2}>
              {user.userDetails.subjects.map((subject, index) => (
                <Grid item key={index}>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ minWidth: "100px", minHeight: "100px" }}
                    onClick={() => handleSubjectClick(subject)}
                  >
                    {subject}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      ) : (
        <>
          <Paper elevation={3} style={{ padding: "20px", margin: "20px 0" }}>
            <Typography variant="h5">Subjects I Can Teach</Typography>
            <Box mt={2}>
              <Grid container spacing={2}>
                {user.userDetails.subjects.map((subject, index) => (
                  <Grid item key={index}>
                    <Button
                      variant="contained"
                      color="primary"
                      style={{ minWidth: "100px", minHeight: "100px" }}
                      onClick={() => handleSubjectClick(subject)}
                    >
                      {subject}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
          <Paper elevation={3} style={{ padding: "20px", margin: "20px 0" }}>
            <Typography variant="h5">Reviews</Typography>
            <List>
              {user.userDetails.reviews.map((review) => (
                <ListItem key={review.id} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <StarIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${review.reviewer} (${review.rating} stars)`}
                    secondary={review.comment}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default ProfilePage;
