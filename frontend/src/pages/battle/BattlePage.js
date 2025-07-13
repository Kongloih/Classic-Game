import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
} from '@mui/material';
import {
  EmojiEvents,
  People,
  TrendingUp,
  PlayArrow,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const BattlePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const battleModes = [
    {
      id: 'quick',
      title: '快速对战',
      description: '立即开始游戏，与在线玩家随机匹配',
      icon: <PlayArrow />,
      players: '1v1',
      timeLimit: '5分钟',
      difficulty: '中等',
      color: 'primary',
    },
    {
      id: 'ranked',
      title: '排位赛',
      description: '参与排位赛，提升你的段位和排名',
      icon: <EmojiEvents />,
      players: '1v1',
      timeLimit: '10分钟',
      difficulty: '困难',
      color: 'secondary',
    },
    {
      id: 'friendly',
      title: '好友对战',
      description: '邀请好友一起游戏，创建私人房间',
      icon: <People />,
      players: '1v1/2v2',
      timeLimit: '自定义',
      difficulty: '简单',
      color: 'success',
    },
    {
      id: 'tournament',
      title: '锦标赛',
      description: '参与大型锦标赛，争夺丰厚奖励',
      icon: <TrendingUp />,
      players: '多人',
      timeLimit: '30分钟',
      difficulty: '困难',
      color: 'warning',
    },
  ];

  const handleModeSelect = (modeId) => {
    switch (modeId) {
      case 'quick':
        navigate('/battle/hall/1'); // 进入俄罗斯方块游戏大厅
        break;
      case 'ranked':
        navigate('/battle/hall/1'); // 进入俄罗斯方块游戏大厅
        break;
      case 'friendly':
        navigate('/battle/hall/1'); // 进入俄罗斯方块游戏大厅
        break;
      case 'tournament':
        navigate('/battle/hall/1'); // 进入俄罗斯方块游戏大厅
        break;
      default:
        navigate('/battle/hall/1'); // 默认进入俄罗斯方块游戏大厅
    }
  };

  return (
    <Box sx={{ py: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* 头部 */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            对战中心
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            选择对战模式，与玩家一较高下
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography
            variant="body2"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
              bgcolor: 'grey.500',
              color: '#ffffff',
              display: 'inline-block'
            }}
          >
            
          </Typography>}
              label="在线玩家: 1,234"
              color="primary"
              variant="outlined"
            />
            <Typography
            variant="body2"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
              bgcolor: 'grey.500',
              color: '#ffffff',
              display: 'inline-block'
            }}
          >
            
          </Typography>}
              label="今日对战: 5,678"
              color="secondary"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* 对战模式网格 */}
        <Grid container spacing={4}>
          {battleModes.map((mode) => (
            <Grid item xs={12} sm={6} md={3} key={mode.id}>
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
                onClick={() => handleModeSelect(mode.id)}
              >
                <CardContent sx={{ flexGrow: 1, p: 3, textAlign: 'center' }}>
                  {/* 图标 */}
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: `${mode.color}.main`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        color: 'white',
                        fontSize: 24,
                      }}
                    >
                      {mode.icon}
                    </Box>
                  </Box>

                  {/* 标题和描述 */}
                  <Typography variant="h5" component="h3" fontWeight={600} gutterBottom>
                    {mode.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {mode.description}
                  </Typography>

                  {/* 模式信息 */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                    <Typography
            variant="caption"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 500,
              bgcolor: 'primary.main',
              color: '#ffffff',
              display: 'inline-block'
            }}
          >
            
          </Typography>
                    <Typography
            variant="caption"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 500,
              bgcolor: 'secondary.main',
              color: '#ffffff',
              display: 'inline-block'
            }}
          >
            
          </Typography>
                    <Typography
            variant="caption"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 500,
              bgcolor: 'grey.500',
              color: '#ffffff',
              display: 'inline-block'
            }}
          >
            
          </Typography>
                  </Box>

                  {/* 开始按钮 */}
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    color={mode.color}
                    startIcon={<PlayArrow />}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette[mode.color].main} 0%, ${theme.palette[mode.color].dark} 100%)`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette[mode.color].dark} 0%, ${theme.palette[mode.color].main} 100%)`,
                      },
                    }}
                  >
                    开始对战
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 底部信息 */}
        <Box sx={{ textAlign: 'center', mt: 8, py: 4, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            更多对战模式正在开发中，敬请期待...
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default BattlePage; 