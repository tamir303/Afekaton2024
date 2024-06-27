import React from "react";
import { Link } from "react-router-dom";
import { Button, Grid, Typography } from "@mui/material";
import CreatePostPage from "./CreatePostPage";
import { useEffect } from "react";

const HomePage = () => {
  const myPosts = [];

  useEffect(() => {
    fetch("http://localhost:3001/posts")
      .then((response) => response.json())
      .then((data) => {
        // myPosts = data;
      });
  }, []);
  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      <Grid item>
        <CreatePostPage myPosts={myPosts} subjects={["Math", "Physics", "Chemistry"]} />
      </Grid>
      <Grid item>
        <Typography variant="h1">My posts</Typography>
        {myPosts.map((post) => (
          <Grid item key={post.id}>
            <Typography variant="h2">{post.title}</Typography>
            <Typography>{post.description}</Typography>
            <Typography>{post.subject}</Typography>
            <Typography>{post.location}</Typography>
            <Typography>{post.price}</Typography>
            <Typography>{post.date}</Typography>
            <Link
              to={`/profile/student/${post.id}`}
              style={{ textDecoration: "none" }}
            >
              <Button>View post</Button>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default HomePage;
