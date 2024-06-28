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

const SearchStudentPage = () => {
  const location = useLocation();
  const subject = location.state.subject;
  const [searchString, setSearchString] = useState("");
  const { userTutor, userStudent } = require("../user");
  const [students] = useState([userTutor, userStudent]);

  const filteredStudents = students.filter(
    (student) =>
      student.userDetails.subjects.includes(subject) &&
      student.username.toLowerCase().includes(searchString.toLowerCase())
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
        <Typography variant="h1">{subject} students</Typography>
        <Divider />
        <br />
        <SearchBar
          searchString={searchString}
          setSearchString={setSearchString}
        />
      </Grid>
      <Grid item container justifyContent="center" spacing={3}>
        {filteredStudents.map((student) => (
          <Grid
            item
            key={student.userId}
            xs={12}
            sm={4}
            md={4}
            sx={{ marginLeft: 4, marginBottom: 4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {student.username}
                </Typography>
                <br />
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Role: {student.role}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {student.role === "student" ||
                  student.role === "studentOver80"
                    ? "Cost 1 token"
                    : "Price X $"}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Subjects:
                </Typography>
                <Divider />
                {student.userDetails.subjects.map((subject, index) => (
                  <Button key={index} size="small">
                    {subject}
                  </Button>
                ))}
              </CardContent>
              <CardActions>
                <Link to={'/app/chat'} style={{ textDecoration: "none" }}>
                  <Button size="small">Chat</Button>{" "}
                </Link>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default SearchStudentPage;
