import React, { useState } from "react";
import { Grid, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from "@mui/material";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";


const SearchTutorPage = () => {
    const [searchString, setSearchString] = useState("");
    const [tutors] = useState([
        { userId: "1", role: "tutor", userDetails: {subjects: ["Science", "Math"]}, username: "matan",  },
        { userId: "2", role: "tutor", userDetails: {subjects: ["Science"]}, username: "shoval",  },
    ]);
    const filteredTutors = tutors.filter((tutor) =>
        tutor.username.toLowerCase().includes(searchString.toLowerCase())
    );

    return (
        <Grid container direction="column" justifyContent="center" alignItems="center">
            <Grid item>
                <Typography variant="h1">Search for a Tutor</Typography>
                <Divider /><br/><br/>
                <SearchBar searchString={searchString} setSearchString={setSearchString} />
            </Grid>
            <Grid item>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Username</TableCell>
                                <TableCell align="right">Profile</TableCell>
                                <TableCell align="right">subjects</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTutors.map((tutor) => (
                                <TableRow key={tutor.userId}>
                                    <TableCell component="th" scope="row">
                                        {tutor.username}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Link to={`/tutor/${tutor.userId}`}>
                                            <Button>View Profile</Button>
                                        </Link>
                                    </TableCell>
                                    <TableCell align="right">
                                        {tutor.userDetails.subjects.map((tag, index) => (
                                            <Button key={index}>{tag}</Button>
                                        ))}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
};

export default SearchTutorPage;