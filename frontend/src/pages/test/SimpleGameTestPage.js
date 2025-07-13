import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TetrisGame from '../../components/games/TetrisGame';
import SnakeGame from '../../components/games/SnakeGame';
import BreakoutGame from '../../components/games/BreakoutGame';

const SimpleGameTestPage = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(0);
  const [score, setScore] = useState(0);

  const games = [
    { name: '俄罗斯方块', component: TetrisGame, id: '1' },
    { name: '贪吃蛇', component: SnakeGame, id: '2' },
    { name: '打砖块', component: BreakoutGame, id: '3' },
  ];

  const handleGameOver = (finalScore) => {
    console.log('游戏结束，最终分数:', finalScore);
    setScore(finalScore);
  };

  const handleScoreUpdate = (newScore) => {
    setScore(newScore);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedGame(newValue);
    setScore(0);
  };

  const handleDirectPlay = () => {
    const gameId = games[selectedGame].id;
    navigate(`/play/${gameId}`);
  };

  const GameComponent = games[selectedGame].component;

  return (
    <Box sx={{ py: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        <Typography variant="h3" component="h1" gutterBottom textAlign="center" fontWeight={700}>
          简单游戏测试
        </Typography>
        
        <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          直接测试游戏组件，无需Socket连接
        </Typography>

        {/* 快速游戏按钮 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleDirectPlay}
            sx={{ mr: 2 }}
          >
            直接进入 {games[selectedGame].name} 游戏
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/games')}
          >
            返回游戏选择
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* 游戏选择标签 */}
          <Grid item xs={12}>
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={selectedGame}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                {games.map((game, index) => (
                  <Tab key={index} label={game.name} />
                ))}
              </Tabs>
            </Paper>
          </Grid>

          {/* 游戏信息 */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  当前游戏
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {games[selectedGame].name}
                </Typography>
                
                <Typography variant="h6" gutterBottom>
                  当前分数
                </Typography>
                <Typography variant="h3" color="primary" sx={{ mb: 2 }}>
                  {score}
                </Typography>
                
                <Button
                  variant="contained"
                  onClick={() => setScore(0)}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  重置分数
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleDirectPlay}
                  fullWidth
                >
                  进入游戏页面
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* 游戏画布 */}
          <Grid item xs={12} md={9}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {games[selectedGame].name} - 组件测试
                </Typography>
                
                <Box sx={{ 
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'white'
                }}>
                  <GameComponent
                    roomId={`test_room_${selectedGame}`}
                    onGameOver={handleGameOver}
                    onScoreUpdate={handleScoreUpdate}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SimpleGameTestPage; 