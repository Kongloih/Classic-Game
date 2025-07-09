import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TetrisGame from '../../components/games/TetrisGame';

const TetrisTestPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          俄罗斯方块测试页面
        </Typography>
        
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          返回首页
        </Button>

        <Box sx={{ mt: 4 }}>
          <TetrisGame 
            roomId="test-room-1"
            onGameOver={(score) => console.log('游戏结束，分数:', score)}
            onScoreUpdate={(score) => console.log('分数更新:', score)}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default TetrisTestPage; 