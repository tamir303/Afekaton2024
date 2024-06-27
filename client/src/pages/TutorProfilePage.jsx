import React from 'react';
import { Container, Grid, Paper, Typography, Avatar, List, ListItem, ListItemText, ListItemAvatar } from '@mui/material';
import Rating from '@mui/material/Rating';

const TutorProfilePage = () => {

    // Hardcoded tutor data
    const tutor = {
        username: 'John Doe',
        email: 'john.doe@example.com',
        bio: '4th year student in computer science',
        profilePicture: null,
        subjects: ['Math', 'Physics', 'Chemistry'],
        averageRating: 90,
        reviews: [
            {
                reviewerName: 'Jane Smith',
                reviewerProfilePicture: null,
                rating: 5,
                comment: 'Great tutor! Helped me a lot with calculus.',
            },
            {
                reviewerName: 'Bob Johnson',
                reviewerProfilePicture: null,
                rating: 4,
                comment: 'Very knowledgeable and patient.',
            },
        ],
    };

    return (
        <Container>
            <Paper elevation={3} style={{ padding: '20px', margin: '20px 0' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4} md={3}>
                        <Avatar alt={tutor.name} src={tutor.profilePicture} style={{ width: '100%', height: 'auto' }}>
                            {tutor.name.charAt(0)}
                        </Avatar>
                    </Grid>
                    <Grid item xs={12} sm={8} md={9}>
                        <Typography variant="h4">{tutor.name}</Typography>
                        <Typography variant="body1">{tutor.email}</Typography>
                        <Typography variant="body1">{tutor.bio}</Typography>
                        <Typography variant="body1">Subjects: {tutor.subjects.join(', ')}</Typography>
                        <Typography variant="body1">Average Rating: {tutor.averageRating}</Typography>
                        <Rating value={tutor.averageRating / 20} readOnly />
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={3} style={{ padding: '20px', margin: '20px 0' }}>
                <Typography variant="h5">Reviews</Typography>
                <List>
                    {tutor.reviews.map((review, index) => (
                        <ListItem key={index}>
                            <ListItemAvatar>
                                <Avatar alt={review.reviewerName} src={review.reviewerProfilePicture}>
                                    {review.reviewerName.charAt(0)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={review.reviewerName}
                                secondary={
                                    <>
                                        <Rating value={review.rating} readOnly />
                                        <Typography>{review.comment}</Typography>
                                    </>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Container>
    );
};

export default TutorProfilePage;