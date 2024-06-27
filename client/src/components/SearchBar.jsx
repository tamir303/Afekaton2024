import React from "react";

import { Grid, TextField } from "@mui/material";

const SearchBar = ({ searchString, setSearchString }) => {
    return (
        <Grid container justifyContent="center" alignItems="center">
            <Grid item>
                <TextField
                    type="text"
                    placeholder="Search for a tutor"
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                ></TextField>
            </Grid>
        </Grid>
    );
};

export default SearchBar;