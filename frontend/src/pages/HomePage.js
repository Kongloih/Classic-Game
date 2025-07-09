import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  const featuredGames = [
    {
      id: 1,
      title: '俄罗斯方块',
      description: '经典的俄罗斯方块游戏，考验你的空间思维能力',
      image: '/images/tetris.jpg',
      players: '1-2人',
    },
    {
      id: 2,
      title: '贪吃蛇',
      description: '控制蛇吃食物成长，但不要撞到自己',
      image: '/images/snake.jpg',
      players: '1人',
    },
    {
      id: 3,
      title: '打砖块',
      description: '用球拍反弹球，击碎所有砖块',
      image: '/images/breakout.jpg',
      players: '1人',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* 英雄区域 */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom fontWeight={700}>
            欢迎来到经典街机游戏平台
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            重温经典游戏，与好友一起竞技，创造新的回忆
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/games')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              开始游戏
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                立即注册
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* 特色游戏 */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom textAlign="center" sx={{ mb: 6 }}>
          特色游戏
        </Typography>
        <Grid container spacing={4}>
          {featuredGames.map((game) => (
            <Grid item xs={12} md={4} key={game.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
                onClick={() => navigate(`/games/${game.id}/hall`)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={game.image}
                  alt={game.title}
                  sx={{ bgcolor: 'grey.200' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {game.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {game.description}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {game.players}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 平台特色 */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom textAlign="center" sx={{ mb: 6 }}>
            平台特色
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary" gutterBottom>
                  🎮
                </Typography>
                <Typography variant="h5" gutterBottom>
                  经典游戏
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  收录多款经典街机游戏，让你重温童年回忆
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary" gutterBottom>
                  👥
                </Typography>
                <Typography variant="h5" gutterBottom>
                  多人竞技
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  与好友一起游戏，实时对战，分享快乐
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary" gutterBottom>
                  🏆
                </Typography>
                <Typography variant="h5" gutterBottom>
                  排行榜
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  查看全球排行榜，挑战最高分，成为游戏大师
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 