import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Paper, Typography, Button, Box } from '@mui/material';

const StudentProfilePage = () => {
  const navigate = useNavigate();
  const student = {
    name: 'Student Name',
    email: 'student.email@example.com',
    subjects: ['Math', 'Physics', 'Chemistry'],
  };

  const handleSubjectClick = (subject) => {
    navigate(`/tutors/${subject}`);
  };

  return (
    <Container>
      <Paper elevation={3} style={{ padding: '20px', margin: '20px 0' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4">{student.name}</Typography>
            <Typography variant="body1">{student.email}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} style={{ padding: '20px', margin: '20px 0' }}>
        <Typography variant="h5">Subjects I Need Help With</Typography>
        <Box mt={2}>
          <Grid container spacing={2}>
            {student.subjects.map((subject, index) => (
              <Grid item key={index}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ minWidth: '100px', minHeight: '100px' }}
                  onClick={() => handleSubjectClick(subject)}
                >
                  {subject}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default StudentProfilePage;
