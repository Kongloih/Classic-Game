import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, Grid, Paper, Alert, Chip } from '@mui/material';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 8;
const BRICK_ROWS = 8;
const BRICK_COLS = 12;
const BRICK_WIDTH = CANVAS_WIDTH / BRICK_COLS;
const BRICK_HEIGHT = 30;
const BRICK_PADDING = 2;

const BreakoutGame = ({ roomId, onGameOver, onScoreUpdate }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [bricks, setBricks] = useState([]);
  const [keys, setKeys] = useState({});
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // 游戏对象状态
  const [paddle, setPaddle] = useState({
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 8
  });
  
  const [ball, setBall] = useState({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - PADDLE_HEIGHT - 30,
    radius: BALL_RADIUS,
    dx: 4,
    dy: -4,
    speed: 4
  });
  
  // 初始化砖块
  const initializeBricks = useCallback(() => {
    const newBricks = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: col * BRICK_WIDTH + BRICK_PADDING,
          y: row * BRICK_HEIGHT + BRICK_PADDING + 50,
          width: BRICK_WIDTH - BRICK_PADDING * 2,
          height: BRICK_HEIGHT - BRICK_PADDING * 2,
          color: colors[row % colors.length],
          visible: true,
          points: (BRICK_ROWS - row) * 10
        });
      }
    }
    return newBricks;
  }, []);

  // 绘制游戏
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Canvas context not found');
      return;
    }
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 绘制背景
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 绘制砖块
    bricks.forEach(brick => {
      if (brick.visible) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });
    
    // 绘制球拍
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#2E7D32';
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // 绘制球
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D84315';
    ctx.stroke();
    
    // 绘制分数和生命值
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`分数: ${score}`, 10, 30);
    ctx.fillText(`等级: ${level}`, 10, 60);
    ctx.fillText(`生命: ${lives}`, 10, 90);
    
  }, [bricks, paddle, ball, score, level, lives]);

  // 初始绘制
  useEffect(() => {
    console.log('Initial draw triggered');
    setTimeout(() => {
      drawGame();
    }, 100); // 延迟一点确保Canvas已经渲染
  }, [drawGame]);

  // 检查碰撞
  const checkCollision = useCallback((ball, paddle) => {
    return ball.x + ball.radius > paddle.x && 
           ball.x - ball.radius < paddle.x + paddle.width &&
           ball.y + ball.radius > paddle.y && 
           ball.y - ball.radius < paddle.y + paddle.height;
  }, []);

  const checkBrickCollision = useCallback((ball, brick) => {
    return ball.x + ball.radius > brick.x && 
           ball.x - ball.radius < brick.x + brick.width &&
           ball.y + ball.radius > brick.y && 
           ball.y - ball.radius < brick.y + brick.height;
  }, []);

  // 更新游戏状态
  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    setBall(prevBall => {
      let newBall = { ...prevBall };
      
      // 移动球
      newBall.x += newBall.dx;
      newBall.y += newBall.dy;
      
      // 墙壁碰撞检测
      if (newBall.x - newBall.radius <= 0 || newBall.x + newBall.radius >= CANVAS_WIDTH) {
        newBall.dx = -newBall.dx;
      }
      if (newBall.y - newBall.radius <= 0) {
        newBall.dy = -newBall.dy;
      }
      
      // 球掉落检测
      if (newBall.y + newBall.radius >= CANVAS_HEIGHT) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameState('gameOver');
            onGameOver && onGameOver(score);
          } else {
            // 重置球的位置
            newBall.x = CANVAS_WIDTH / 2;
            newBall.y = CANVAS_HEIGHT - PADDLE_HEIGHT - 30;
            newBall.dx = 4;
            newBall.dy = -4;
          }
          return newLives;
        });
      }
      
      return newBall;
    });

    // 更新球拍位置
    setPaddle(prevPaddle => {
      let newPaddle = { ...prevPaddle };
      
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        newPaddle.x = Math.max(0, newPaddle.x - newPaddle.speed);
      }
      if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        newPaddle.x = Math.min(CANVAS_WIDTH - newPaddle.width, newPaddle.x + newPaddle.speed);
      }
      
      return newPaddle;
    });

    // 球拍碰撞检测
    setBall(prevBall => {
      const newBall = { ...prevBall };
      const paddleRect = {
        x: paddle.x,
        y: paddle.y,
        width: paddle.width,
        height: paddle.height
      };
      
      if (checkCollision(newBall, paddleRect)) {
        newBall.dy = -Math.abs(newBall.dy);
        
        // 根据击中球拍的位置调整球的方向
        const hitPos = (newBall.x - paddle.x) / paddle.width;
        newBall.dx = (hitPos - 0.5) * 8;
      }
      
      return newBall;
    });

    // 砖块碰撞检测
    setBricks(prevBricks => {
      const newBricks = [...prevBricks];
      
      newBricks.forEach(brick => {
        if (checkBrickCollision(ball, brick)) {
          brick.visible = false;
          
          // 增加分数
          setScore(prev => {
            const newScore = prev + brick.points * level;
            onScoreUpdate && onScoreUpdate(newScore);
            return newScore;
          });
          
          // 改变球的方向
          setBall(prevBall => ({
            ...prevBall,
            dy: -prevBall.dy
          }));
        }
      });
      
      // 检查是否所有砖块都被击碎
      if (newBricks.every(brick => !brick.visible)) {
        setLevel(prev => prev + 1);
        setBricks(initializeBricks());
        setBall(prevBall => ({
          ...prevBall,
          speed: Math.min(prevBall.speed + 0.5, 8)
        }));
      }
      
      return newBricks;
    });
  }, [gameState, paddle, ball, keys, score, level, checkCollision, checkBrickCollision, initializeBricks, onGameOver, onScoreUpdate]);

  // 游戏循环
  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = () => {
        updateGame();
        drawGame();
        animationRef.current = requestAnimationFrame(gameLoop);
      };
      gameLoop();
    } else if (gameState === 'paused' || gameState === 'waiting') {
      // 在暂停或等待状态下也要绘制游戏
      drawGame();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, updateGame, drawGame]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event) => {
      setKeys(prev => ({ ...prev, [event.key]: true }));
      
      if (event.key === ' ') {
        event.preventDefault();
        if (gameState === 'playing') {
          setGameState('paused');
        } else if (gameState === 'paused') {
          setGameState('playing');
        }
      }
    };

    const handleKeyUp = (event) => {
      setKeys(prev => ({ ...prev, [event.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);



  // 准备游戏
  const toggleReady = () => {
    setIsReady(!isReady);
  };

  // 开始游戏
  const startGame = () => {
    setGameState('playing');
    setGameStarted(true);
    setBricks(initializeBricks());
    
    // 注册全局暂停/继续回调
    window.gamePauseCallback = () => setGameState('paused');
    window.gameResumeCallback = () => setGameState('playing');
  };

  // 重新开始游戏
  const restartGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setBricks(initializeBricks());
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - PADDLE_HEIGHT - 30,
      radius: BALL_RADIUS,
      dx: 4,
      dy: -4,
      speed: 4
    });
    setPaddle({
      x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: 8
    });
    setGameStarted(true);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px' }}>
      <Grid container spacing={3}>
        {/* 游戏信息 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              打砖块
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                用球拍反弹球，击碎所有砖块。考验你的反应速度和策略思维。
              </Typography>
            </Box>

            {/* 游戏状态 */}
            <Box sx={{ mb: 3 }}>
              <Chip
                label={gameState === 'waiting' ? '等待开始' : 
                       gameState === 'playing' ? '游戏中' : 
                       gameState === 'paused' ? '已暂停' : '游戏结束'}
                color={gameState === 'playing' ? 'success' : 
                       gameState === 'gameOver' ? 'error' : 'default'}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  分数: <strong>{score}</strong>
                </Typography>
                <Typography variant="body2">
                  等级: <strong>{level}</strong>
                </Typography>
                <Typography variant="body2">
                  生命: <strong>{lives}</strong>
                </Typography>
              </Box>
            </Box>

            {/* 控制按钮 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!gameStarted ? (
                <>
                  <Button
                    variant={isReady ? 'contained' : 'outlined'}
                    onClick={toggleReady}
                    fullWidth
                  >
                    {isReady ? '已准备' : '准备'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={startGame}
                    disabled={!isReady}
                    fullWidth
                  >
                    开始游戏
                  </Button>
                </>
              ) : (
                <>
                  {gameState === 'gameOver' && (
                    <Button
                      variant="contained"
                      onClick={restartGame}
                      fullWidth
                    >
                      重新开始
                    </Button>
                  )}
                  {gameState === 'paused' && (
                    <Button
                      variant="contained"
                      onClick={() => setGameState('playing')}
                      fullWidth
                    >
                      继续游戏
                    </Button>
                  )}
                </>
              )}
            </Box>

            {/* 操作说明 */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                操作说明
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • A/D 或 左右方向键：移动球拍<br/>
                • 空格键：暂停/继续游戏<br/>
                • 击碎砖块：获得分数<br/>
                • 球掉落：失去生命<br/>
                • 清空砖块：进入下一关
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* 游戏画布 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            {gameState === 'gameOver' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                游戏结束！最终分数: {score}
              </Alert>
            )}
            
            {gameState === 'paused' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                游戏已暂停
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={{
                  border: '2px solid #333',
                  borderRadius: '8px',
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BreakoutGame; 