import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Settings,
  Fullscreen,
  ExitToApp,
  EmojiEvents,
  Timer,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TetrisGame from '../../components/games/TetrisGame';

const GamePlayPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user } = useSelector(state => state.auth);
  
  const [gameState, setGameState] = useState('playing'); // playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [time, setTime] = useState(0);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const canvasRef = useRef(null);
  
  // 生成一个临时的房间ID（实际应用中应该从URL参数或状态获取）
  const roomId = `room_${gameId}_${Date.now()}`;

  // 游戏信息
  const gameInfo = {
    1: { name: '俄罗斯方块', maxLevel: 10 },
    2: { name: '贪吃蛇', maxLevel: 20 },
    3: { name: '打砖块', maxLevel: 15 },
  };

  const currentGame = gameInfo[gameId] || gameInfo[1];

  // 游戏计时器
  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
        // 每30秒增加分数
        if (time % 30 === 0 && time > 0) {
          setScore(prev => prev + 100);
        }
        // 每60秒增加等级
        if (time % 60 === 0 && time > 0) {
          setLevel(prev => Math.min(prev + 1, currentGame.maxLevel));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, time, currentGame.maxLevel]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        handlePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handlePause = () => {
    setGameState('paused');
    setShowPauseDialog(true);
  };

  const handleResume = () => {
    setGameState('playing');
    setShowPauseDialog(false);
  };

  const handleGameOver = (score) => {
    setGameState('gameOver');
    setFinalScore(score);
    setShowGameOverDialog(true);
  };

  const handleRestart = () => {
    setScore(0);
    setLevel(1);
    setTime(0);
    setGameState('playing');
    setShowGameOverDialog(false);
  };

  const handleExit = () => {
    navigate('/games');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      position: 'relative',
    }}>
      {/* 游戏头部信息 */}
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        bgcolor: 'rgba(0,0,0,0.8)',
        color: 'white',
        py: 1,
      }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                {currentGame.name}
              </Typography>
              <Chip
                label={`等级 ${level}`}
                color="primary"
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEvents sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  {score.toLocaleString()}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timer sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  {formatTime(time)}
                </Typography>
              </Box>
              
              <IconButton
                color="inherit"
                onClick={handlePause}
                size="small"
              >
                <Pause />
              </IconButton>
              
              <IconButton
                color="inherit"
                onClick={handleExit}
                size="small"
              >
                <ExitToApp />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 游戏画布区域 */}
      <Box sx={{ 
        pt: 8, // 为固定头部留出空间
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)',
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* 游戏画布 */}
            <Grid item xs={12} md={8}>
              <Card
                sx={{
                  bgcolor: 'white',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  ref={canvasRef}
                  sx={{
                    width: '100%',
                    minHeight: '600px',
                    bgcolor: '#fff',
                    position: 'relative',
                  }}
                >
                  {/* 俄罗斯方块游戏 */}
                  {gameId === '1' && (
                    <TetrisGame
                      roomId={roomId}
                      onGameOver={handleGameOver}
                      onScoreUpdate={(newScore) => setScore(newScore)}
                    />
                  )}
                  
                  {/* 其他游戏 */}
                  {gameId !== '1' && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '600px',
                      textAlign: 'center'
                    }}>
                      <Box>
                        <Typography variant="h4" gutterBottom>
                          {currentGame.name}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                          游戏画布区域
                        </Typography>
                        <Typography variant="body2" color="grey.400">
                          这里将显示实际的游戏内容
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* 游戏信息侧边栏 */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* 当前状态 */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      游戏状态
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">状态:</Typography>
                        <Chip
                          label={gameState === 'playing' ? '进行中' : gameState === 'paused' ? '暂停' : '结束'}
                          color={gameState === 'playing' ? 'success' : gameState === 'paused' ? 'warning' : 'error'}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">分数:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {score.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">等级:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {level} / {currentGame.maxLevel}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">时间:</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatTime(time)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* 控制按钮 */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      游戏控制
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant={gameState === 'playing' ? 'outlined' : 'contained'}
                        startIcon={gameState === 'playing' ? <Pause /> : <PlayArrow />}
                        onClick={gameState === 'playing' ? handlePause : handleResume}
                        fullWidth
                      >
                        {gameState === 'playing' ? '暂停' : '继续'}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<Stop />}
                        onClick={handleGameOver}
                        fullWidth
                      >
                        结束游戏
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<Settings />}
                        fullWidth
                      >
                        设置
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                {/* 操作说明 */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      操作说明
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        • 方向键: 移动控制
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • 空格键: 特殊操作
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • ESC: 暂停游戏
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • 鼠标: 点击操作
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 暂停对话框 */}
      <Dialog open={showPauseDialog} onClose={handleResume} maxWidth="sm" fullWidth>
        <DialogTitle>游戏暂停</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            游戏已暂停，点击继续按钮恢复游戏。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExit}>
            退出游戏
          </Button>
          <Button onClick={handleResume} variant="contained">
            继续游戏
          </Button>
        </DialogActions>
      </Dialog>

      {/* 游戏结束对话框 */}
      <Dialog open={showGameOverDialog} onClose={() => {}} maxWidth="sm" fullWidth>
        <DialogTitle>游戏结束</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" color="primary" gutterBottom>
              最终得分: {finalScore.toLocaleString()}
            </Typography>
            <Typography variant="body1" gutterBottom>
              游戏时间: {formatTime(time)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              达到等级: {level}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExit}>
            返回大厅
          </Button>
          <Button onClick={handleRestart} variant="contained">
            重新开始
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GamePlayPage; 