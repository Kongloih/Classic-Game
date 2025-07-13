import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';

// 俄罗斯方块形状定义
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00f5ff'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#0000ff'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#ff7f00'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#ffff00'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#00ff00'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#800080'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#ff0000'
  }
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_DROP_TIME = 1000;

const TetrisGame = ({ roomId, onGameOver, onScoreUpdate }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [gameBoard, setGameBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [dropTime, setDropTime] = useState(1000);
  const dropTimeRef = useRef(null);

  // 创建空游戏板
  function createEmptyBoard() {
    return Array.from({ length: BOARD_HEIGHT }, () => 
      Array.from({ length: BOARD_WIDTH }, () => 0)
    );
  }

  // 生成随机方块
  function randomTetromino() {
    const tetrominoes = Object.keys(TETROMINOES);
    const randTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    return TETROMINOES[randTetromino];
  }

  // 检查碰撞
  function checkCollision(piece, board, x = 0, y = 0) {
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] !== 0) {
          const newX = x + col;
          const newY = y + row;
          
          if (
            newX < 0 || 
            newX >= BOARD_WIDTH || 
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // 旋转方块
  function rotatePiece(piece) {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return { ...piece, shape: rotated };
  }

  // 放置方块到游戏板
  function placePiece(piece, board, x, y) {
    const newBoard = board.map(row => [...row]);
    
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] !== 0) {
          const boardY = y + row;
          const boardX = x + col;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    return newBoard;
  }

  // 清除完整的行
  function clearLines(board) {
    const newBoard = board.filter(row => row.some(cell => cell === 0));
    const linesCleared = BOARD_HEIGHT - newBoard.length;
    
    // 在顶部添加新的空行
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array.from({ length: BOARD_WIDTH }, () => 0));
    }
    
    return { board: newBoard, linesCleared };
  }

  // 移动方块
  const movePiece = useCallback((direction) => {
    if (gameState !== 'playing' || !currentPiece) return;

    let newX = currentPiece.x;
    let newY = currentPiece.y;

    switch (direction) {
      case 'left':
        newX -= 1;
        break;
      case 'right':
        newX += 1;
        break;
      case 'down':
        newY += 1;
        break;
      default:
        return;
    }

    if (!checkCollision(currentPiece, gameBoard, newX, newY)) {
      setCurrentPiece({ ...currentPiece, x: newX, y: newY });
    } else if (direction === 'down') {
      // 方块落地，放置到游戏板上
      const newBoard = placePiece(currentPiece, gameBoard, currentPiece.x, currentPiece.y);
      const { board: clearedBoard, linesCleared } = clearLines(newBoard);
      
      setGameBoard(clearedBoard);
      setLines(prev => prev + linesCleared);
      
      // 计算分数
      const linePoints = [0, 100, 300, 500, 800];
      const newScore = score + linePoints[linesCleared] * level;
      setScore(newScore);
      onScoreUpdate && onScoreUpdate(newScore);
      
      // 更新等级
      const newLevel = Math.floor((lines + linesCleared) / 10) + 1;
      if (newLevel !== level) {
        setLevel(newLevel);
        setDropTime(Math.max(100, INITIAL_DROP_TIME - (newLevel - 1) * 100));
      }
      
      // 生成新方块
      const newPiece = nextPiece || randomTetromino();
      const newNextPiece = randomTetromino();
      
      setCurrentPiece({
        ...newPiece,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2),
        y: 0
      });
      setNextPiece(newNextPiece);
      
      // 检查游戏结束
      if (checkCollision(newPiece, clearedBoard, 
        Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2), 0)) {
        setGameState('gameOver');
        onGameOver && onGameOver(newScore);
      }
    }
  }, [currentPiece, gameBoard, gameState, score, level, lines, nextPiece, onGameOver, onScoreUpdate]);

  // 旋转方块
  const rotateCurrentPiece = useCallback(() => {
    if (gameState !== 'playing' || !currentPiece) return;

    const rotated = rotatePiece(currentPiece);
    if (!checkCollision(rotated, gameBoard, currentPiece.x, currentPiece.y)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, gameBoard, gameState]);

  // 快速下落
  const hardDrop = useCallback(() => {
    if (gameState !== 'playing' || !currentPiece) return;

    let dropDistance = 0;
    while (!checkCollision(currentPiece, gameBoard, currentPiece.x, currentPiece.y + dropDistance + 1)) {
      dropDistance++;
    }
    
    if (dropDistance > 0) {
      movePiece('down');
    }
  }, [currentPiece, gameBoard, gameState, movePiece]);

  // 准备/取消准备
  const toggleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
  };

  // 开始游戏
  const startGame = () => {
    const firstPiece = randomTetromino();
    const secondPiece = randomTetromino();
    
    setCurrentPiece({
      ...firstPiece,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(firstPiece.shape[0].length / 2),
      y: 0
    });
    setNextPiece(secondPiece);
    setGameState('playing');
    setGameStarted(true);
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameBoard(createEmptyBoard());
    
    // 注册全局暂停/继续回调
    window.gamePauseCallback = () => setGameState('paused');
    window.gameResumeCallback = () => setGameState('playing');
  };

  // 重新开始游戏
  const restartGame = () => {
    setGameState('waiting');
    setGameStarted(false);
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameBoard(createEmptyBoard());
    setIsReady(false);
  };

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (gameState !== 'playing') return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          movePiece('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          movePiece('right');
          break;
        case 'ArrowDown':
          event.preventDefault();
          movePiece('down');
          break;
        case 'ArrowUp':
          event.preventDefault();
          rotateCurrentPiece();
          break;
        case ' ':
          event.preventDefault();
          hardDrop();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, movePiece, rotateCurrentPiece, hardDrop]);

  // 自动下落
  useEffect(() => {
    if (gameState === 'playing') {
      dropTimeRef.current = setInterval(() => {
        movePiece('down');
      }, dropTime);
    }

    return () => {
      if (dropTimeRef.current) {
        clearInterval(dropTimeRef.current);
      }
    };
  }, [gameState, dropTime, movePiece]);

  // 渲染游戏板
  const renderBoard = (board, currentPiece = null, title = '游戏板') => {
    const displayBoard = board.map(row => [...row]);
    
    // 将当前方块绘制到显示板上
    if (currentPiece && gameState === 'playing') {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col] !== 0) {
            const boardY = currentPiece.y + row;
            const boardX = currentPiece.x + col;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom align="center">
          {title}
        </Typography>
        <Grid container spacing={0} sx={{ 
          border: '2px solid #333', 
          width: 'fit-content',
          mx: 'auto',
          bgcolor: '#f8f8f8'
        }}>
          {displayBoard.map((row, rowIndex) => (
            <Grid container item key={rowIndex} spacing={0}>
              {row.map((cell, colIndex) => (
                <Grid item key={colIndex}>
                  <Box
                    sx={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: cell || '#f0f0f0',
                      border: '1px solid #ddd',
                      boxSizing: 'border-box'
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // 渲染下一个方块
  const renderNextPiece = () => {
    if (!nextPiece) return null;

    return (
      <Box sx={{ p: 2, border: '1px solid #ccc', bgcolor: '#f9f9f9' }}>
        <Typography variant="h6" gutterBottom align="center">下一个</Typography>
        <Grid container spacing={0} sx={{ width: 'fit-content', mx: 'auto' }}>
          {nextPiece.shape.map((row, rowIndex) => (
            <Grid container item key={rowIndex} spacing={0}>
              {row.map((cell, colIndex) => (
                <Grid item key={colIndex}>
                  <Box
                    sx={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: cell ? nextPiece.color : 'transparent',
                      border: '1px solid #ddd',
                      boxSizing: 'border-box'
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* 游戏控制 */}
      {!gameStarted && (
        <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant={isReady ? 'contained' : 'outlined'}
            onClick={toggleReady}
            fullWidth
          >
            {isReady ? '已准备' : '准备'}
          </Button>
          
          {isReady && (
            <Button 
              variant="contained" 
              sx={{
                backgroundColor: 'success.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'success.dark',
                }
              }}
              onClick={startGame}
            >
              开始游戏
            </Button>
          )}
        </Box>
      )}

      {/* 游戏状态显示 */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
        {/* <Chip 
          label={`准备状态: ${isReady ? '已准备' : '未准备'}`} 
          color={isReady ? 'success' : 'default'}
        /> */}
        {/* <Chip 
          label={`游戏状态: ${gameState === 'playing' ? '进行中' : gameState === 'waiting' ? '等待中' : '游戏结束'}`} 
          color={gameState === 'playing' ? 'success' : gameState === 'waiting' ? 'warning' : 'error'}
        /> */}
      </Box>

      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
        {/* 主游戏区域 */}
        <Box sx={{ flex: 1, maxWidth: 300 }}>
          {renderBoard(gameBoard, currentPiece, '俄罗斯方块')}
          
          {/* 游戏信息 */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">分数: {score}</Typography>
            <Typography variant="body2">等级: {level}</Typography>
            <Typography variant="body2">行数: {lines}</Typography>
          </Box>
        </Box>

        {/* 侧边栏 */}
        <Box sx={{ width: 200 }}>
          {/* 下一个方块 */}
          {renderNextPiece()}
          
          {/* 操作说明 */}
          <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', bgcolor: '#f9f9f9' }}>
            <Typography variant="h6" gutterBottom align="center">操作</Typography>
            <Typography variant="body2">← → : 移动</Typography>
            <Typography variant="body2">↓ : 加速下落</Typography>
            <Typography variant="body2">↑ : 旋转</Typography>
            <Typography variant="body2">空格 : 快速下落</Typography>
          </Box>

          {/* 重新开始按钮 */}
          {gameState === 'gameOver' && (
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={restartGame}
              >
                重新开始
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TetrisGame; 