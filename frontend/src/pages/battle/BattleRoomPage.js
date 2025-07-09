import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import {
  People,
  EmojiEvents,
  Star,
  PlayArrow,
  ExitToApp,
  Chat,
  Settings,
  Timer,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const BattleRoomPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useSelector(state => state.auth);
  
  const [roomData, setRoomData] = useState(null);
  const [gameState, setGameState] = useState('waiting'); // waiting, ready, playing, finished
  const [countdown, setCountdown] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // 模拟房间数据
  useEffect(() => {
    const generateRoomData = () => {
      const players = [
        {
          id: 1,
          username: user?.username || '玩家1',
          avatar: null,
          score: 0,
          isReady: true,
          isHost: true,
        },
        {
          id: 2,
          username: `玩家${Math.floor(Math.random() * 1000)}`,
          avatar: null,
          score: 0,
          isReady: Math.random() > 0.3,
          isHost: false,
        },
      ];

      setRoomData({
        id: roomId,
        gameType: '俄罗斯方块',
        players,
        maxPlayers: 2,
        status: players.length === 2 ? 'ready' : 'waiting',
        createdAt: new Date(),
        settings: {
          difficulty: 'normal',
          timeLimit: 300, // 5分钟
          rounds: 3,
        },
      });
    };

    generateRoomData();
  }, [roomId, user]);

  // 倒计时效果
  useEffect(() => {
    if (gameState === 'ready' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown === 1) {
          setGameState('playing');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, gameState]);

  const handleReady = () => {
    if (roomData) {
      const updatedPlayers = roomData.players.map(player =>
        player.id === user?.id ? { ...player, isReady: !player.isReady } : player
      );
      setRoomData({ ...roomData, players: updatedPlayers });
    }
  };

  const handleStartGame = () => {
    setGameState('ready');
    setCountdown(5);
  };

  const handleLeaveRoom = () => {
    navigate('/games');
  };

  const handleStartPlaying = () => {
    // 根据游戏类型跳转到对应的游戏页面
    const gameTypeMap = {
      '俄罗斯方块': '1',
      '贪吃蛇': '2',
      '打砖块': '3'
    };
    const gameId = gameTypeMap[roomData?.gameType] || '1';
    navigate(`/play/${gameId}`);
  };

  if (!roomData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>加载中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* 头部信息 */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleLeaveRoom}
                startIcon={<ExitToApp />}
              >
                离开房间
              </Button>
              <Typography variant="h4" component="h1" fontWeight={700}>
                房间 #{roomData.id}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Chat />}
              >
                聊天
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Settings />}
                onClick={() => setShowSettings(true)}
              >
                设置
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<People />}
              label={`玩家: ${roomData.players.length}/${roomData.maxPlayers}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<EmojiEvents />}
              label={roomData.gameType}
              color="secondary"
              variant="outlined"
            />
            <Chip
              icon={<Star />}
              label={`最高分: ${Math.max(...roomData.players.map(p => p.score))}`}
              color="success"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* 游戏状态显示 */}
        {gameState === 'ready' && countdown > 0 && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h2" color="primary" fontWeight={700}>
              {countdown}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              游戏即将开始...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={((5 - countdown) / 5) * 100} 
              sx={{ mt: 2, height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* 玩家信息 */}
        <Grid container spacing={3}>
          {roomData.players.map((player, index) => (
            <Grid item xs={12} md={6} key={player.id}>
              <Card
                sx={{
                  height: '100%',
                  border: player.isHost ? '2px solid' : '1px solid',
                  borderColor: player.isHost ? 'primary.main' : 'divider',
                  bgcolor: player.isReady ? 'success.50' : 'background.paper',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{ 
                        width: 64, 
                        height: 64,
                        bgcolor: player.isHost ? 'primary.main' : 'secondary.main',
                        fontSize: '1.5rem',
                      }}
                    >
                      {player.username.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {player.username}
                        {player.isHost && (
                          <Chip
                            label="房主"
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        分数: {player.score}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      {player.isReady ? (
                        <Chip
                          label="已准备"
                          color="success"
                          size="small"
                          icon={<PlayArrow />}
                        />
                      ) : (
                        <Chip
                          label="未准备"
                          color="warning"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>

                  {/* 准备状态 */}
                  {player.id === user?.id && (
                    <Button
                      variant={player.isReady ? "outlined" : "contained"}
                      color={player.isReady ? "success" : "primary"}
                      fullWidth
                      onClick={handleReady}
                      disabled={gameState === 'playing'}
                    >
                      {player.isReady ? '取消准备' : '准备'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* 空座位 */}
          {Array.from({ length: roomData.maxPlayers - roomData.players.length }).map((_, index) => (
            <Grid item xs={12} md={6} key={`empty-${index}`}>
              <Card
                sx={{
                  height: '100%',
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  bgcolor: 'grey.50',
                }}
              >
                <CardContent sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                }}>
                  <Avatar
                    sx={{ 
                      width: 64, 
                      height: 64,
                      bgcolor: 'grey.300',
                      color: 'grey.600',
                      mb: 2,
                    }}
                  >
                    ?
                  </Avatar>
                  <Typography variant="h6" color="text.secondary">
                    等待玩家加入
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 游戏控制 */}
        {roomData.players.length === roomData.maxPlayers && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            {gameState === 'waiting' && (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={handleStartGame}
                disabled={!roomData.players.every(p => p.isReady)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                开始游戏
              </Button>
            )}
            
            {gameState === 'playing' && (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={handleStartPlaying}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                进入游戏
              </Button>
            )}
          </Box>
        )}

        {/* 设置对话框 */}
        <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
          <DialogTitle>游戏设置</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              游戏类型: {roomData.gameType}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              难度: {roomData.settings.difficulty}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              时间限制: {roomData.settings.timeLimit}秒
            </Typography>
            <Typography variant="body2" color="text.secondary">
              回合数: {roomData.settings.rounds}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSettings(false)}>
              关闭
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default BattleRoomPage; 