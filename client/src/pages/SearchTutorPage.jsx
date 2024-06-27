import React, { useState } from "react";
import { Grid, Typography, Button, Card, CardContent, CardActions, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";

const SearchTutorPage = ({ subject }) => {
    const [searchString, setSearchString] = useState("");
    const [tutors] = useState([
        { userId: "1", role: "tutor", userDetails: { subjects: ["Science", "Math"] }, username: "matan" },
        { userId: "2", role: "tutor", userDetails: { subjects: ["Science"] }, username: "shoval" },
        { userId: "3", role: "tutor", userDetails: { subjects: ["Math"] }, username: "yotam" },
        { userId: "4", role: "tutor", userDetails: { subjects: ["Science", "Math"] }, username: "daniel" },
        { userId: "5", role: "tutor", userDetails: { subjects: ["Science"] }, username: "shir" },
        { userId: "6", role: "tutor", userDetails: { subjects: ["Math"] }, username: "david" },
        { userId: "7", role: "tutor", userDetails: { subjects: ["Science", "Math"] }, username: "shirley" },
        { userId: "8", role: "tutor", userDetails: { subjects: ["Science"] }, username: "shirley" },
        // Add more tutors as needed to fill the 3x3 grid
    ]);
    const filteredTutors = tutors.filter((tutor) =>
        tutor.username.toLowerCase().includes(searchString.toLowerCase())
    );

    return (
        <Grid container direction="column" justifyContent="center" alignItems="center" spacing={4}>
            <Grid item>
                <Typography variant="h1">{subject} tutors</Typography>
                <Divider /><br /><br />
                <SearchBar searchString={searchString} setSearchString={setSearchString} />
            </Grid>
            <Grid item container justifyContent="center" spacing={3}>
                {filteredTutors.map((tutor) => (
                    <Grid item key={tutor.userId} xs={12} sm={4} md={4} sx={{ marginLeft: 4, marginBottom: 4 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="div">
                                    {tutor.username}
                                </Typography>
                                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                    Subjects:
                                </Typography>
                                {tutor.userDetails.subjects.map((subject, index) => (
                                    <Button key={index} size="small">{subject}</Button>
                                ))}
                            </CardContent>
                            <CardActions>
                                <Link to={`/tutor/${tutor.userId}`} style={{ textDecoration: 'none' }}>
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