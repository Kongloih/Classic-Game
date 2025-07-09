import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const ProfilePage = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          个人资料
        </Typography>
        <Typography variant="body1" color="text.secondary">
          个人资料功能正在开发中...
        </Typography>
      </Container>
    </Box>
  );
};

export default ProfilePage; 