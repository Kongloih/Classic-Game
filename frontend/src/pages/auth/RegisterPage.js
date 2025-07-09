import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';

const RegisterPage = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          注册页面
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary">
          注册功能正在开发中...
        </Typography>
      </Container>
    </Box>
  );
};

export default RegisterPage; 