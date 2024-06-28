import React, { useState } from "react";
import {
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { useLocation } from "react-router-dom";
import PostPage from "./PostPage";  

const SearchTutorPage = () => {
  const location = useLocation();
  const subject = location.state.subject;
  const [searchString, setSearchString] = useState("");
  const [tutors] = useState([
    {
      userId: "1",
      role: "smartupStudent",
      userDetails: { subjects: ["Physics", "Math"] },
      username: "matan",
    },
    {
      userId: "2",
      role: "external",
      userDetails: { subjects: ["Physics"] },
      username: "shoval",
    },
    {
      userId: "3",
      role: "studentOver80",
      userDetails: { subjects: ["Math"] },
      username: "yotam",
    },
    {
      userId: "4",
      role: "gradStudent",
      userDetails: { subjects: ["Chemistry", "Math"] },
      username: "daniel",
    },
    {
      userId: "5",
      role: "external",
      userDetails: { subjects: ["Chemistry"] },
      username: "shir",
    },
    {
      userId: "6",
      role: "tutor",
      userDetails: { subjects: ["Math"] },
      username: "david",
    },
    {
      userId: "7",
      role: "tutor",
      userDetails: { subjects: ["Physics", "Math"] },
      username: "shirley",
    },
    {
      userId: "8",
      role: "tutor",
      userDetails: { subjects: ["Chemistry"] },
      username: "shirley",
    },
    // Add more tutors as needed to fill the 3x3 grid
  ]);

  const filteredTutors = tutors.filter(
    (tutor) =>
      tutor.userDetails.subjects.includes(subject) &&
      tutor.username.toLowerCase().includes(searchString.toLowerCase())
  );

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={4}
    >
      <Grid item>
        <Typography variant="h1">{subject} tutors</Typography>
        <Divider />
        <br />
        <br />
        <Link to="/profile/1">
          <Button>Back to profile</Button>
        </Link>
        {filteredTutors.length > 0 && (
          <SearchBar
            searchString={searchString}
            setSearchString={setSearchString}
          />
        )}
        {filteredTutors.length === 0 && (
          <>
            <Typography variant="h5">No tutors found</Typography>
            <PostPage />
          </>
        )}
      </Grid>
      <Grid item container justifyContent="center" spacing={3}>
        {filteredTutors.map((tutor) => (
          <Grid
            item
            key={tutor.userId}
            xs={12}
            sm={4}
            md={4}
            sx={{ marginLeft: 4, marginBottom: 4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {tutor.username}
                </Typography>
                <br />
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Role: {tutor.role}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {tutor.role === "student" || tutor.role === "studentOver80"
                    ? "Cost 1 token"
                    : "Price X $"}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Subjects:
                </Typography>
                <Divider />
                {tutor.userDetails.subjects.map((subject, index) => (
                  <Button key={index} size="small">
                    {subject}
                  </Button>
                ))}
              </CardContent>
              <CardActions>
                <Link
                  to={`/tutor/${tutor.userId}`}
                  style={{ textDecoration: "none" }}
                >
                  <Button size="small">Chat</Button>
                </Link>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default SearchTutorPage;
