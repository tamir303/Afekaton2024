import React, { useState } from "react";
import { Grid, Typography, TextField, Button, Divider, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const CreatePostPage = ({ subjects }) => {
    const [subject, setSubject] = useState('');

    const handleChange = (event) => {
        setSubject(event.target.value);
    };

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
        >
            <Grid item>
                <Typography variant="h1">Create a Post</Typography>
                <Divider />
                <br />
                <br />
            </Grid>
            <FormControl fullWidth>
                <InputLabel id="subject-select-label">Subject</InputLabel>
                <Select
                    labelId="subject-select-label"
                    id="subject-select"
                    value={subject}
                    label="Subject"
                    onChange={handleChange}
                >
                    {subjects.map((subject) => (
                        <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                id="outlined-multiline-static"
                label="Post Content"
                multiline
                rows={4}
                defaultValue=""
                variant="outlined"
                margin="normal"
                fullWidth
            />
            <Button variant="contained" color="primary" style={{ marginTop: '20px' }}>
                Submit
            </Button>
        </Grid>
    );
};

export default CreatePostPage;