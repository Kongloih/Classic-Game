import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, Grid, Paper, Alert } from '@mui/material';

const GRID_SIZE = 20;

const SnakeGame = ({ roomId, onGameOver, onScoreUpdate }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);

  // 生成随机食物位置
  const generateFood = useCallback(() => {
    const snakePositions = new Set(snake.map(segment => `${segment.x},${segment.y}`));
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snakePositions.has(`${newFood.x},${newFood.y}`));
    return newFood;
  }, [snake]);

  // 检查碰撞
  const checkCollision = useCallback((head) => {
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    
    // 检查自身碰撞
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
  }, [snake]);

  // 移动蛇
  const moveSnake = useCallback(() => {
    if (gameState !== 'playing') return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      // 移动头部
      head.x += direction.x;
      head.y += direction.y;
      
      // 检查碰撞
      if (checkCollision(head)) {
        setGameState('gameOver');
        onGameOver && onGameOver(score);
        return prevSnake;
      }
      
      newSnake.unshift(head);
      
      // 检查是否吃到食物
      if (head.x === food.x && head.y === food.y) {
        // 生成新食物
        setFood(generateFood());
        
        // 增加分数
        const newScore = score + 10 * 1; // Level is hardcoded to 1 for now
        setScore(newScore);
        onScoreUpdate && onScoreUpdate(newScore);
        
        // 每100分增加等级
        // if (newLevel !== level) { // This line was removed from the new_code, so it's removed here.
        //   setLevel(newLevel);
        //   // setSpeed(Math.max(50, INITIAL_SPEED - (newLevel - 1) * 10)); // This line was removed from the new_code, so it's removed here.
        // }
      } else {
        // 没吃到食物，移除尾部
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [gameState, direction, food, score, checkCollision, generateFood, onGameOver, onScoreUpdate]);

  // 改变方向
  const changeDirection = useCallback((newDirection) => {
    if (gameState !== 'playing') return;
    
    // 防止反向移动
    if (
      (direction.x === 1 && newDirection.x === -1) ||
      (direction.x === -1 && newDirection.x === 1) ||
      (direction.y === 1 && newDirection.y === -1) ||
      (direction.y === -1 && newDirection.y === 1)
    ) {
      return;
    }
    
    setDirection(newDirection);
  }, [gameState, direction]);

  // 游戏循环
  useEffect(() => {
    if (gameState === 'playing') {
      // setGameLoop(setInterval(moveSnake, speed)); // This line was removed from the new_code, so it's removed here.
    }
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, moveSnake]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (event) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          changeDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          event.preventDefault();
          changeDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          event.preventDefault();
          changeDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          event.preventDefault();
          changeDirection({ x: 1, y: 0 });
          break;
        case ' ':
          event.preventDefault();
          if (gameState === 'playing') {
            setGameState('paused');
          } else if (gameState === 'paused') {
            setGameState('playing');
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, changeDirection]);

  // 准备游戏
  const toggleReady = () => {
    setIsReady(!isReady);
  };

  // 开始游戏
  const startGame = () => {
    setGameState('playing');
    setGameStarted(true);
    
    // 注册全局暂停/继续回调
    window.gamePauseCallback = () => setGameState('paused');
    window.gameResumeCallback = () => setGameState('playing');
  };

  // 重新开始游戏
  const restartGame = () => {
    setSnake([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    setFood({ x: 15, y: 15 });
    setGameState('playing');
    setScore(0);
    // setLevel(1); // This line was removed from the new_code, so it's removed here.
    // setSpeed(INITIAL_SPEED); // This line was removed from the new_code, so it's removed here.
    setGameStarted(true);
  };

  // 渲染游戏板
  const renderBoard = () => {
    const board = Array.from({ length: GRID_SIZE }, () => 
      Array.from({ length: GRID_SIZE }, () => null)
    );

    // 放置蛇
    snake.forEach((segment, index) => {
      if (segment.y >= 0 && segment.y < GRID_SIZE && segment.x >= 0 && segment.x < GRID_SIZE) {
        board[segment.y][segment.x] = index === 0 ? 'head' : 'body';
      }
    });

    // 放置食物
    if (food.y >= 0 && food.y < GRID_SIZE && food.x >= 0 && food.x < GRID_SIZE) {
      board[food.y][food.x] = 'food';
    }

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gap: 0.5,
          width: '400px',
          height: '400px',
          mx: 'auto',
          bgcolor: 'grey.100',
          p: 1,
          borderRadius: 1,
        }}
      >
        {board.flat().map((cell, index) => (
          <Box
            key={index}
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: cell === 'head' ? 'primary.main' : 
                       cell === 'body' ? 'primary.light' : 
                       cell === 'food' ? 'error.main' : 'grey.200',
              borderRadius: 0.5,
              border: cell ? '2px solid' : 'none',
              borderColor: cell === 'head' ? 'primary.dark' : 
                          cell === 'body' ? 'primary.main' : 
                          cell === 'food' ? 'error.dark' : 'transparent',
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <Box ref={canvasRef} sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* 游戏信息 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              贪吃蛇
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                控制蛇吃食物成长，但不要撞到自己或墙壁
              </Typography>
            </Box>

            {/* 游戏状态 */}
            <Box sx={{ mb: 3 }}>
              {/* Removed Chip component as per new_code */}
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  分数: <strong>{score}</strong>
                </Typography>
                {/* Removed level and speed as per new_code */}
                <Typography variant="body2">
                  长度: <strong>{snake.length}</strong>
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
                • 方向键：控制蛇的移动方向<br/>
                • 空格键：暂停/继续游戏<br/>
                • 吃到食物：增加分数和长度<br/>
                • 撞墙或撞到自己：游戏结束
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
            
            {renderBoard()}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SnakeGame; 