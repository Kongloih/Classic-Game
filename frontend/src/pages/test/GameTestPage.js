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
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TetrisGame from '../../components/games/TetrisGame';
import SnakeGame from '../../components/games/SnakeGame';
import BreakoutGame from '../../components/games/BreakoutGame';

const GameTestPage = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(0);
  const [score, setScore] = useState(0);
  const [showDirectPlay, setShowDirectPlay] = useState(false);

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

  const handleBattleMode = () => {
    const gameId = games[selectedGame].id;
    navigate(`/battle/room/${gameId}/test-room-${Date.now()}`);
  };

  const GameComponent = games[selectedGame].component;

  return (
    <Box sx={{ py: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        <Typography variant="h3" component="h1" gutterBottom textAlign="center" fontWeight={700}>
          游戏测试页面
        </Typography>
        
        <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          测试所有游戏组件的功能
        </Typography>

        {/* 快速游戏按钮 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(`/play/${games[selectedGame].id}`)}
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

        {/* 测试模式说明 */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>测试模式说明：</strong>
            <br />
            • <strong>直接游戏：</strong>直接进入单人游戏模式，无需Socket连接
            <br />
            • <strong>对战模式：</strong>尝试进入对战房间（需要后端Socket服务）
            <br />
            • <strong>组件测试：</strong>在页面中直接测试游戏组件
          </Typography>
        </Alert>

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

          {/* 游戏信息和控制 */}
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
                  sx={{ mb: 2 }}
                >
                  直接游戏
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleBattleMode}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  对战模式
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => setShowDirectPlay(!showDirectPlay)}
                  fullWidth
                >
                  {showDirectPlay ? '隐藏组件测试' : '显示组件测试'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* 游戏画布 */}
          <Grid item xs={12} md={9}>
            {showDirectPlay ? (
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
            ) : (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    游戏模式选择
                  </Typography>
                  
                  <Box sx={{ 
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'grey.50'
                  }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      选择游戏模式开始测试
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        onClick={handleDirectPlay}
                        size="large"
                      >
                        直接游戏模式
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={handleBattleMode}
                        size="large"
                      >
                        对战房间模式
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={() => setShowDirectPlay(true)}
                        size="large"
                      >
                        组件测试模式
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default GameTestPage; 