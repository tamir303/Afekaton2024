import React, { useState, useEffect } from "react";
import { Grid, Typography, Card, CardContent, CardMedia, Box } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import SubjectIcon from '@mui/icons-material/Subject';
import PostPage from "./PostPage";
import user from "../user";

const HomePage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Determine the URL based on the user role
    const url = user.role === "tutor" ? "http://localhost:3001/posts" : `http://localhost:3001/posts?userId=${user.id}`;
    
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setPosts(data); // Set the fetched posts
      });
  }, []);

  return (
    <Grid
      container
      spacing={2}
      direction="row"
      justifyContent="center"
      alignItems="flex-start"
    >
      { user.role === "student" && (
        <Grid item xs={12}>
          <PostPage />
        </Grid>
      
      )}
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom textAlign="center">
          {user.role === "tutor" ? "Global Posts" : "My Posts"}
        </Typography>
        <Grid container spacing={2}>
          {posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={post.imageUrl || "https://via.placeholder.com/140"}
                  alt={post.title}
                />
                <CardContent>
                  <Box textAlign="center">
                    <Typography gutterBottom variant="h5" component="div">
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.description}
                    </Typography>
                    <Box display="flex" justifyContent="center" alignItems="center" gap={1} marginY={1}>
                      <SubjectIcon color="action" />
                      <Typography variant="body2">
                        Subject: {post.subject}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="center" alignItems="center" gap={1} marginY={1}>
                      <LocationOnIcon color="action" />
                      <Typography variant="body2">
                        Location: {post.location}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="center" alignItems="center" gap={1} marginY={1}>
                      <AttachMoneyIcon color="action" />
                      <Typography variant="body2">
                        Price: {post.price}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="center" alignItems="center" gap={1} marginY={1}>
                      <EventIcon color="action" />
                      <Typography variant="body2">
                        Date: {post.date}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default HomePage;