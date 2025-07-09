import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const SettingsPage = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          设置
        </Typography>
        <Typography variant="body1" color="text.secondary">
          设置功能正在开发中...
        </Typography>
      </Container>
    </Box>
  );
};

export default SettingsPage; 