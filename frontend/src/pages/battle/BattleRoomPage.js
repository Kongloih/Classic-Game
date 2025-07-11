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
import { socketService } from '../../services/socketService';

const BattleRoomPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { gameId, roomId } = useParams();
  const { user } = useSelector(state => state.auth);
  
  const [roomData, setRoomData] = useState(null);
  const [gameState, setGameState] = useState('waiting'); // waiting, ready, playing, finished
  const [countdown, setCountdown] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  // 游戏类型映射
  const gameTypeMap = {
    '1': '俄罗斯方块',
    '2': '贪吃蛇',
    '3': '打砖块',
    '4': '2048',
    '5': '扫雷',
    '6': '五子棋'
  };

  // 连接WebSocket并加入房间
  useEffect(() => {
    const connectToRoom = async () => {
      try {
        setLoading(true);
        
        // 连接WebSocket
        await socketService.connect();
        
        // 加入游戏房间
        socketService.emit('join_game_room', {
          roomId,
          gameType: gameTypeMap[gameId] || '俄罗斯方块'
        });

        // 监听房间信息
        socketService.on('room_info', (data) => {
          setRoomData({
            id: data.roomId,
            gameType: data.gameType,
            gameId: gameId,
            players: data.players,
            maxPlayers: 2,
            status: data.gameState,
            createdAt: new Date(),
            settings: {
              difficulty: 'normal',
              timeLimit: 300,
              rounds: 3,
            },
          });
          setGameState(data.gameState);
          setLoading(false);
        });

        // 监听玩家加入
        socketService.on('player_joined_game', (data) => {
          setRoomData(prev => {
            if (!prev) return prev;
            const newPlayers = [...prev.players];
            const existingIndex = newPlayers.findIndex(p => p.id === data.playerId);
            
            if (existingIndex >= 0) {
              newPlayers[existingIndex] = {
                ...newPlayers[existingIndex],
                ...data
              };
            } else {
              newPlayers.push({
                id: data.playerId,
                username: data.playerName,
                avatar: data.avatar,
                level: data.level,
                score: 0,
                isReady: false,
                isHost: data.isHost,
              });
            }
            
            return {
              ...prev,
              players: newPlayers,
              status: newPlayers.length === 2 ? 'ready' : 'waiting'
            };
          });
        });

        // 监听玩家准备状态
        socketService.on('player_ready_status', (data) => {
          setRoomData(prev => {
            if (!prev) return prev;
            const newPlayers = prev.players.map(player =>
              player.id === data.playerId
                ? { ...player, isReady: data.isReady }
                : player
            );
            return { ...prev, players: newPlayers };
          });
        });

        // 监听所有玩家准备
        socketService.on('all_players_ready', (data) => {
          setGameState('ready');
          setCountdown(data.countdown);
        });

        // 监听游戏开始
        socketService.on('game_started', (data) => {
          setGameState('playing');
        });

        // 监听游戏结束
        socketService.on('game_finished', (data) => {
          setGameState('finished');
        });

        // 监听玩家离开
        socketService.on('player_left_game', (data) => {
          setRoomData(prev => {
            if (!prev) return prev;
            const newPlayers = prev.players.filter(p => p.id !== data.playerId);
            return {
              ...prev,
              players: newPlayers,
              status: newPlayers.length === 0 ? 'waiting' : 'ready'
            };
          });
        });

      } catch (error) {
        console.error('连接房间失败:', error);
        setLoading(false);
      }
    };

    connectToRoom();

    // 清理函数
    return () => {
      socketService.off('room_info');
      socketService.off('player_joined_game');
      socketService.off('player_ready_status');
      socketService.off('all_players_ready');
      socketService.off('game_started');
      socketService.off('game_finished');
      socketService.off('player_left_game');
    };
  }, [roomId, gameId]);

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
      const currentPlayer = roomData.players.find(p => p.id === user?.id);
      const newReadyState = !currentPlayer?.isReady;
      
      socketService.emit('player_ready', {
        roomId,
        isReady: newReadyState
      });
    }
  };

  const handleStartGame = () => {
    socketService.emit('start_game', { roomId });
  };

  const handleLeaveRoom = () => {
    // 离开房间逻辑
    navigate('/games');
  };

  const handleStartPlaying = () => {
    const targetGameId = roomData?.gameId || '1';
    navigate(`/play/${targetGameId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>连接房间中...</Typography>
      </Box>
    );
  }

  if (!roomData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>房间不存在或连接失败</Typography>
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
                      src={player.avatar}
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
                        等级 {player.level} • 分数 {player.score}
                      </Typography>
                    </Box>
                    <Chip
                      label={player.isReady ? '已准备' : '未准备'}
                      color={player.isReady ? 'success' : 'default'}
                      variant={player.isReady ? 'filled' : 'outlined'}
                    />
                  </Box>

                  {/* 玩家统计 */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        等级
                      </Typography>
                      <Typography variant="h6">
                        {player.level}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        分数
                      </Typography>
                      <Typography variant="h6">
                        {player.score}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        行数
                      </Typography>
                      <Typography variant="h6">
                        {player.lines || 0}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 准备按钮 */}
                  {player.id === user?.id && gameState === 'waiting' && (
                    <Button
                      variant={player.isReady ? 'outlined' : 'contained'}
                      color={player.isReady ? 'success' : 'primary'}
                      fullWidth
                      onClick={handleReady}
                    >
                      {player.isReady ? '取消准备' : '准备'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 游戏控制按钮 */}
        {gameState === 'waiting' && roomData.players.length >= 2 && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={handleStartPlaying}
              disabled={!roomData.players.every(p => p.isReady)}
            >
              开始游戏
            </Button>
          </Box>
        )}

        {/* 设置对话框 */}
        <Dialog open={showSettings} onClose={() => setShowSettings(false)}>
          <DialogTitle>房间设置</DialogTitle>
          <DialogContent>
            <Typography>房间设置功能开发中...</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSettings(false)}>关闭</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default BattleRoomPage; 