import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const GameDetailPage = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          游戏详情
        </Typography>
        <Typography variant="body1" color="text.secondary">
          游戏详情功能正在开发中...
        </Typography>
      </Container>
    </Box>
  );
};

export default GameDetailPage; 