import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme} from '@mui/material';
import {
  People,
  EmojiEvents,
  Star,
  FilterList,
  Sort,
  Refresh,
  PlayArrow,
  Visibility} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const GameHallPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [loading, setLoading] = useState(true);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [gameInfo, setGameInfo] = useState(null);
  const [gameTables, setGameTables] = useState([]);
  const [stats, setStats] = useState({ onlineUsers: 0, activeRooms: 0, maxScore: 0 });
  const [filterType, setFilterType] = useState('all');
  const [sortType, setSortType] = useState('id');
  const [selectedTable, setSelectedTable] = useState(null);

  // 获取游戏大厅数据（只用真实API）
  useEffect(() => {
    const fetchGameHallData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('用户未登录，请先登录');
        // 获取游戏信息
        const gameRes = await fetch(`/api/games/${gameId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!gameRes.ok) throw new Error('获取游戏信息失败');
        const gameData = await gameRes.json();
        setGameInfo(gameData.data);
        // 获取房间桌子数据
        const tablesRes = await fetch(`/api/battle/rooms/${gameId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!tablesRes.ok) throw new Error('获取游戏桌数据失败');
        const tablesData = await tablesRes.json();
        setGameTables(tablesData.data || []);
        // 统计信息（可根据实际API调整）
        setStats({
          onlineUsers: tablesData.data?.reduce((sum, t) => sum + (t.online_users || 0), 0) || 0,
          activeRooms: tablesData.data?.length || 0,
          maxScore: 0 // 如有API可获取最高分可替换
        });
      } catch (error) {
        console.error('获取游戏大厅数据失败:', error);
        setGameTables([]);
        setStats({ onlineUsers: 0, activeRooms: 0, maxScore: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchGameHallData();
  }, [gameId]);

  // 过滤和排序游戏桌
  const filteredAndSortedTables = gameTables
    .filter(table => {
      if (filterType === 'available') return table.status !== 'full';
      if (filterType === 'full') return table.status === 'full';
      return true;
    })
    .sort((a, b) => {
      if (sortType === 'players') return (b.players?.length || 0) - (a.players?.length || 0);
      if (sortType === 'score') return (b.maxScore || 0) - (a.maxScore || 0);
      return a.id - b.id; // 默认按ID排序
    });

  const handleTableClick = (table) => {
    if (table.status === 'full') {
      navigate(`/battle/room/${gameId}/${table.id}`);
    } else {
      setSelectedTable(table);
      setJoinDialogOpen(true);
    }
  };

  const handleJoinGame = () => {
    if (selectedTable) {
      setJoinDialogOpen(false);
      navigate(`/battle/room/${gameId}/${selectedTable.id}`);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>加载中...</Typography>
      </Box>
    );
  }

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
              {gameInfo?.name || '游戏'} 游戏大厅
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography
              variant="body2"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 500
              }}
            >
              <People />
              在线玩家: {stats.onlineUsers}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                fontWeight: 500
              }}
            >
              <EmojiEvents />
              活跃房间: {stats.activeRooms}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: '#2ecc71',
                color: '#ffffff',
                fontWeight: 500
              }}
            >
              <Star />
              最高分: {stats.maxScore}
            </Typography>
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
              onClick={handleRefresh}
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
                    borderColor: 'primary.main'}}}
                onClick={() => handleTableClick(table)}
              >
                <CardContent sx={{ p: 2 }}>
                  {/* 游戏桌头部 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      游戏桌 #{table.id}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        bgcolor: getStatusColor(table.status) === 'success' ? '#2ecc71' :
                                 getStatusColor(table.status) === 'warning' ? '#f39c12' :
                                 getStatusColor(table.status) === 'error' ? '#e74c3c' :
                                 getStatusColor(table.status) === 'info' ? '#3498db' :
                                 getStatusColor(table.status) === 'primary' ? 'primary.main' :
                                 getStatusColor(table.status) === 'secondary' ? 'secondary.main' : 'grey.500',
                        color: '#ffffff'
                      }}
                    >
                      {getStatusText(table.status)}
                    </Typography>
                  </Box>

                  {/* 玩家列表 */}
                  <Box sx={{ mb: 2 }}>
                    {table.players.length > 0 ? (
                      table.players.map((player, index) => (
                        <Box
                          key={player.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <Avatar
                            sx={{ width: 32, height: 32, fontSize: '0.875rem' }}
                            src={player.avatar}
                          >
                            {player.username.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {player.username}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              分数: {player.score}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        暂无玩家
                      </Typography>
                    )}
                  </Box>

                  {/* 游戏桌信息 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      最高分: {table.maxScore}
                    </Typography>
                    <Button
                      variant={table.status === 'full' ? 'outlined' : 'contained'}
                      size="small"
                      startIcon={table.status === 'full' ? <Visibility /> : <PlayArrow />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTableClick(table);
                      }}
                    >
                      {table.status === 'full' ? '观看' : '加入'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 加入游戏对话框 */}
        <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)}>
          <DialogTitle>加入游戏</DialogTitle>
          <DialogContent>
            <Typography>
              确定要加入游戏桌 #{selectedTable?.id} 吗？
            </Typography>
            {selectedTable?.players.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  当前玩家:
                </Typography>
                {selectedTable.players.map((player) => (
                  <Typography key={player.id} variant="body2">
                    • {player.username}
                  </Typography>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setJoinDialogOpen(false)}>取消</Button>
            <Button onClick={handleJoinGame} variant="contained">
              加入
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default GameHallPage; 