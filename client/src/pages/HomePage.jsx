import React from 'react';
import { Link } from 'react-router-dom';
import {Button, Grid, Typography} from "@mui/material";

const HomePage = () => {
    return (
        <Grid container direction="column" justifyContent="center" alignItems="center">
            <Typography variant="h1">Welcome to the Home Page</Typography>
            {/* <Button variant="contained" color="primary" component={Link} to="/login">Login</Button> */}
            {/* <Button variant="contained" color="primary" component={Link} to="/register">Register</Button> */}
            <Button variant="contained" color="primary" component={Link} to="/search-tutor">Search for a Tutor</Button>
            <Button variant="contained" color="primary" component={Link} to="/create-post">Create a post</Button>
        </Grid>
    );
};

export default HomePage;