import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Grid, Typography, TextField, Button, Divider, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const PostPage = () => {
    const [subject, setSubject] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const subjects = ['Physics', 'Math', 'Chemistry', 'Biology', 'Computer Science']; // Example list of subjects
    const myPosts = []; // Example list of posts
    const navigate = useNavigate(); // Initialize useNavigate

    const handleChangeSubject = (event) => {
        setSubject(event.target.value);
    };

    const handleChangeTitle = (event) => {
        setTitle(event.target.value);
    };

    const handleChangeContent = (event) => {
        setContent(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        console.log({ subject, title, content }); // Example action: log form data to console

        //TODO: axios call to post data to server
        myPosts.push({ subject, title, content }); // Example action: add new post to myPosts

        console.log(myPosts);

        navigate('/home/posts'); // Redirect to posts page
    };

    return (
        <form onSubmit={handleSubmit}>
            <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
            >
                <Grid item>
                    <Typography variant="h1">create a Post</Typography>
                    <Divider />
                    <br />
                    <br />
                </Grid>
                <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel id="subject-select-label">Subject</InputLabel>
                    <Select
                        labelId="subject-select-label"
                        id="subject-select"
                        value={subject}
                        label="Subject"
                        onChange={handleChangeSubject}
                    >
                        {subjects.map((subject) => (
                            <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    id="title"
                    label="Title"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    value={title}
                    onChange={handleChangeTitle}
                />
                <TextField
                    id="outlined-multiline-static"
                    label="Post Content"
                    multiline
                    rows={4}
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    value={content}
                    onChange={handleChangeContent}
                />
                <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
                    Submit
                </Button>
            </Grid>
        </form>
    );
};

export default PostPage;