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
import user from "../user"; // Ensure this path matches the location of your user object

const ProfilePage = () => {
  const navigate = useNavigate();
  const globPosts = [
    {
      subject: "Math",
      description: "Need help with calculus",
      location: "Tel Aviv, Israel",
    },
  ];

  const handleSubjectClick = (subject) => {
    if (user.role === "student") {
      navigate(`/tutors/${subject}`, { state: { subject } });
    } else {
      navigate(`/students/${subject}`, { state: { subject } });
    }
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
              Upload Document
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
            <Typography variant="h5">Requests</Typography>
            <List>
              {user.userDetails.requests.map((req, index) => (
                <ListItem key={index} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <StarIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={req.subject}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {req.description}
                        </Typography>
                        <br />
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {req.location}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
          <Paper elevation={3} style={{ padding: "20px", margin: "20px 0" }}>
            <Typography variant="h5">Global Posts</Typography>
            <List>
              {globPosts.map((post, index) => (
                <ListItem key={index} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <StarIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={post.subject}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {post.description}
                        </Typography>
                        <br />
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {post.location}
                        </Typography>
                      </>
                    }
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