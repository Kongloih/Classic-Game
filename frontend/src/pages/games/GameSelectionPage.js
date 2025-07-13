import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Star,
  PlayArrow,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const GameSelectionPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const games = [
    {
      id: 1,
      title: '俄罗斯方块',
      description: '经典的俄罗斯方块游戏，考验你的空间思维能力。通过旋转和移动不同形状的方块，填满水平线来消除它们。',
      image: '/images/tetris.jpg',
      players: '1-2人',
      difficulty: '中等',
      category: '益智',
      rating: 4.8,
      playCount: 15420,
      onlinePlayers: 234,
    },
    {
      id: 2,
      title: '贪吃蛇',
      description: '控制蛇吃食物成长，但不要撞到自己或墙壁。随着蛇身变长，游戏难度逐渐增加。',
      image: '/images/snake.jpg',
      players: '1人',
      difficulty: '简单',
      category: '休闲',
      rating: 4.5,
      playCount: 12890,
      onlinePlayers: 156,
    },
    {
      id: 3,
      title: '打砖块',
      description: '用球拍反弹球，击碎所有砖块。考验你的反应速度和策略思维。',
      image: '/images/breakout.jpg',
      players: '1人',
      difficulty: '中等',
      category: '动作',
      rating: 4.6,
      playCount: 9870,
      onlinePlayers: 89,
    },
    {
      id: 4,
      title: '2048',
      description: '通过滑动合并相同数字，目标是获得2048这个数字。简单易上手，但需要策略。',
      image: '/images/2048.jpg',
      players: '1人',
      difficulty: '简单',
      category: '益智',
      rating: 4.7,
      playCount: 11230,
      onlinePlayers: 67,
    },
    {
      id: 5,
      title: '扫雷',
      description: '经典的扫雷游戏，通过逻辑推理找出所有地雷的位置。考验你的分析能力。',
      image: '/images/minesweeper.jpg',
      players: '1人',
      difficulty: '困难',
      category: '益智',
      rating: 4.4,
      playCount: 8760,
      onlinePlayers: 45,
    },
    {
      id: 6,
      title: '五子棋',
      description: '传统的五子棋游戏，在15x15的棋盘上，先连成五子的一方获胜。',
      image: '/images/gomoku.jpg',
      players: '2人',
      difficulty: '中等',
      category: '棋类',
      rating: 4.9,
      playCount: 13450,
      onlinePlayers: 178,
    },
  ];

  return (
    <Box sx={{ py: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* 头部 */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            游戏大厅
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            选择你喜欢的游戏，与好友一起竞技
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`在线玩家: ${games.reduce((sum, game) => sum + game.onlinePlayers, 0)}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`今日游戏: ${games.reduce((sum, game) => sum + game.playCount, 0)}`}
              color="secondary"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* 游戏网格 */}
        <Grid container spacing={4}>
          {games.map((game) => (
            <Grid item xs={12} sm={6} md={4} key={game.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[12],
                  },
                }}
                onClick={() => navigate(`/games/${game.id}/hall`)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={game.image}
                  alt={game.title}
                  sx={{ 
                    bgcolor: 'grey.200',
                    position: 'relative',
                  }}
                />
                
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* 游戏标题和评分 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h5" component="h3" fontWeight={600} sx={{ flex: 1 }}>
                      {game.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star sx={{ color: 'warning.main', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={600}>
                        {game.rating}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 游戏描述 */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {game.description}
                  </Typography>

                  {/* 游戏标签 */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                    <Chip
                      label={game.players}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={game.difficulty}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                    <Chip
                      label={game.category}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  </Box>

                  {/* 统计信息 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      在线: {game.onlinePlayers}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      总游戏: {game.playCount.toLocaleString()}
                    </Typography>
                  </Box>

                  {/* 操作按钮 */}
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<PlayArrow />}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                    }}
                  >
                    进入游戏
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 底部信息 */}
        <Box sx={{ textAlign: 'center', mt: 8, py: 4, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            更多游戏正在开发中，敬请期待...
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default GameSelectionPage; 