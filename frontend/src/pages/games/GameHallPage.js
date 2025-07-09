import React, { useState, useEffect } from 'react';
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
  Avatar,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  People,
  EmojiEvents,
  Star,
  PlayArrow,
  Refresh,
  FilterList,
  Sort,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const GameHallPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user } = useSelector(state => state.auth);
  
  const [selectedTable, setSelectedTable] = useState(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, available, full
  const [sortType, setSortType] = useState('default'); // default, players, score

  // 游戏信息
  const gameInfo = {
    1: { name: '俄罗斯方块', image: '/images/tetris.jpg', maxPlayers: 2 },
    2: { name: '贪吃蛇', image: '/images/snake.jpg', maxPlayers: 2 },
    3: { name: '打砖块', image: '/images/breakout.jpg', maxPlayers: 2 },
  };

  const currentGame = gameInfo[gameId] || gameInfo[1];

  // 生成50个游戏桌数据
  const [gameTables, setGameTables] = useState([]);

  useEffect(() => {
    const generateTables = () => {
      const tables = [];
      for (let i = 1; i <= 50; i++) {
        const isFull = Math.random() > 0.6; // 40%概率满员
        const players = [];
        
        if (isFull) {
          players.push({
            id: `player1_${i}`,
            username: `玩家${Math.floor(Math.random() * 1000)}`,
            avatar: null,
            score: Math.floor(Math.random() * 10000),
            isReady: true,
          });
          players.push({
            id: `player2_${i}`,
            username: `玩家${Math.floor(Math.random() * 1000)}`,
            avatar: null,
            score: Math.floor(Math.random() * 10000),
            isReady: true,
          });
        } else if (Math.random() > 0.5) {
          // 50%概率有一个玩家
          players.push({
            id: `player1_${i}`,
            username: `玩家${Math.floor(Math.random() * 1000)}`,
            avatar: null,
            score: Math.floor(Math.random() * 10000),
            isReady: true,
          });
        }

        tables.push({
          id: i,
          players,
          status: isFull ? 'full' : players.length > 0 ? 'waiting' : 'empty',
          gameType: currentGame.name,
          createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // 随机时间
          maxScore: Math.floor(Math.random() * 50000),
        });
      }
      setGameTables(tables);
    };

    generateTables();
  }, [currentGame.name]);

  // 过滤和排序游戏桌
  const filteredAndSortedTables = gameTables
    .filter(table => {
      if (filterType === 'available') return table.status !== 'full';
      if (filterType === 'full') return table.status === 'full';
      return true;
    })
    .sort((a, b) => {
      if (sortType === 'players') return b.players.length - a.players.length;
      if (sortType === 'score') return b.maxScore - a.maxScore;
      return a.id - b.id; // 默认按ID排序
    });

  const handleTableClick = (table) => {
    if (table.status === 'full') {
      // 观看模式
      navigate(`/battle/room/${table.id}`);
    } else {
      // 加入游戏
      setSelectedTable(table);
      setJoinDialogOpen(true);
    }
  };

  const handleJoinGame = () => {
    if (selectedTable) {
      setJoinDialogOpen(false);
      navigate(`/battle/room/${selectedTable.id}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'empty': return 'success';
      case 'waiting': return 'warning';
      case 'full': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'empty': return '空桌';
      case 'waiting': return '等待中';
      case 'full': return '已满';
      default: return '未知';
    }
  };

  return (
    <Box sx={{ py: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        {/* 头部信息 */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/games')}
              sx={{ minWidth: 'auto' }}
            >
              返回
            </Button>
            <Typography variant="h4" component="h1" fontWeight={700}>
              {currentGame.name} 游戏大厅
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<People />}
              label={`在线玩家: ${Math.floor(Math.random() * 1000) + 100}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<EmojiEvents />}
              label={`活跃房间: ${gameTables.filter(t => t.status !== 'empty').length}`}
              color="secondary"
              variant="outlined"
            />
            <Chip
              icon={<Star />}
              label={`最高分: ${Math.max(...gameTables.map(t => t.maxScore))}`}
              color="success"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* 控制栏 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h6" color="text.secondary">
            共 {filteredAndSortedTables.length} 个游戏桌
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterList />}
              onClick={() => setFilterType(filterType === 'all' ? 'available' : filterType === 'available' ? 'full' : 'all')}
            >
              {filterType === 'all' ? '全部' : filterType === 'available' ? '可加入' : '已满'}
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<Sort />}
              onClick={() => setSortType(sortType === 'default' ? 'players' : sortType === 'players' ? 'score' : 'default')}
            >
              {sortType === 'default' ? '默认' : sortType === 'players' ? '人数' : '分数'}
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
            >
              刷新
            </Button>
          </Box>
        </Box>

        {/* 游戏桌网格 */}
        <Grid container spacing={2}>
          {filteredAndSortedTables.map((table) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={table.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: table.status === 'waiting' ? '2px solid' : '1px solid',
                  borderColor: table.status === 'waiting' ? 'warning.main' : 'divider',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => handleTableClick(table)}
              >
                <CardContent sx={{ p: 2 }}>
                  {/* 桌号 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      桌号 #{table.id}
                    </Typography>
                    <Chip
                      label={getStatusText(table.status)}
                      color={getStatusColor(table.status)}
                      size="small"
                    />
                  </Box>

                  {/* 玩家信息 */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      玩家 ({table.players.length}/{currentGame.maxPlayers})
                    </Typography>
                    
                    <AvatarGroup max={2} sx={{ mb: 1 }}>
                      {table.players.map((player, index) => (
                        <Tooltip key={player.id} title={`${player.username} (${player.score}分)`}>
                          <Avatar
                            sx={{ 
                              width: 32, 
                              height: 32,
                              bgcolor: index === 0 ? 'primary.main' : 'secondary.main'
                            }}
                          >
                            {player.username.charAt(0)}
                          </Avatar>
                        </Tooltip>
                      ))}
                      {Array.from({ length: currentGame.maxPlayers - table.players.length }).map((_, index) => (
                        <Avatar
                          key={`empty-${index}`}
                          sx={{ 
                            width: 32, 
                            height: 32,
                            bgcolor: 'grey.300',
                            color: 'grey.600'
                          }}
                        >
                          ?
                        </Avatar>
                      ))}
                    </AvatarGroup>

                    {table.players.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        最高分: {Math.max(...table.players.map(p => p.score))}
                      </Typography>
                    )}
                  </Box>

                  {/* 操作按钮 */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {table.status === 'full' ? (
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<PlayArrow />}
                        color="info"
                      >
                        观看
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        startIcon={<PlayArrow />}
                        color="primary"
                      >
                        加入
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 加入游戏对话框 */}
        <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            加入游戏桌 #{selectedTable?.id}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                游戏类型: {selectedTable?.gameType}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                当前玩家: {selectedTable?.players.length}/{currentGame.maxPlayers}
              </Typography>
              {selectedTable?.players.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    房间玩家:
                  </Typography>
                  {selectedTable.players.map((player) => (
                    <Chip
                      key={player.id}
                      label={`${player.username} (${player.score}分)`}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setJoinDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleJoinGame} variant="contained" color="primary">
              确认加入
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default GameHallPage; 