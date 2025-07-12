import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Avatar,
  Badge,
} from '@mui/material';
import {
  People,
  EmojiEvents,
  PlayArrow,
  Room,
  TableRestaurant,
  Person,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { socketService } from '../../services/socketService';

const GameHallPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user } = useSelector(state => state.auth);
  
  const [selectedRoom, setSelectedRoom] = useState('room_1');
  const [rooms, setRooms] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  // 游戏类型映射
  const gameTypeMap = {
    '1': '俄罗斯方块',
    '2': '贪吃蛇',
    '3': '打砖块',
    '4': '拳皇97',
    '5': '街头霸王2',
  };

  const gameName = gameTypeMap[gameId] || '俄罗斯方块';

  // 初始化房间数据
  useEffect(() => {
    const initRooms = () => {
      const roomList = [
        { id: 'room_1', name: '房间1', players: 0, maxPlayers: 500, status: '未满员' },
        { id: 'room_2', name: '房间2', players: 0, maxPlayers: 500, status: '未满员' },
        { id: 'room_3', name: '房间3', players: 0, maxPlayers: 500, status: '未满员' },
      ];
      setRooms(roomList);
    };

    const initTables = () => {
      const tableList = [];
      for (let i = 1; i <= 50; i++) {
        tableList.push({
          id: `table_${i}`,
          tableId: i,
          status: 'empty', // empty, waiting, playing, finished
          currentPlayers: 0,
          maxPlayers: 4,
          seats: {
            1: null, // 用户ID或null
            2: null,
            3: null,
            4: null,
          },
        });
      }
      setTables(tableList);
    };

    initRooms();
    initTables();
    setLoading(false);
  }, []);

  // 处理房间选择
  const handleRoomSelect = (roomId) => {
    setSelectedRoom(roomId);
    // 这里可以加载对应房间的桌子数据
    console.log(`选择房间: ${roomId}`);
  };

  // 处理座位点击
  const handleSeatClick = (tableId, seatNumber) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    console.log(`点击桌子 ${tableId} 座位 ${seatNumber}`);
    
    // 检查座位是否已被占用
    const table = tables.find(t => t.id === tableId);
    if (table && table.seats[seatNumber]) {
      alert('该座位已被占用');
      return;
    }

    // 发送加入桌子的请求
    socketService.emit('join_table', {
      tableId,
      seatNumber,
      userId: user.id,
      username: user.username,
    });

    // 立即更新本地状态，提供即时反馈
    setTables(prevTables => 
      prevTables.map(table => 
        table.id === tableId 
          ? {
              ...table,
              seats: {
                ...table.seats,
                [seatNumber]: user.id
              },
              currentPlayers: table.currentPlayers + 1
            }
          : table
      )
    );

    // 显示成功消息
    alert(`成功加入桌子 ${tableId} 座位 ${seatNumber}`);
  };

  // 监听服务器响应
  useEffect(() => {
    // 监听加入桌子成功
    socketService.on('join_table_success', (data) => {
      console.log('✅ 加入桌子成功:', data);
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === data.tableId 
            ? {
                ...table,
                seats: {
                  ...table.seats,
                  [data.seatNumber]: data.userId
                },
                currentPlayers: table.currentPlayers + 1
              }
            : table
        )
      );
    });

    // 监听加入桌子失败
    socketService.on('join_table_failed', (data) => {
      console.log('❌ 加入桌子失败:', data);
      alert(`加入桌子失败: ${data.message}`);
      
      // 回滚本地状态
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === data.tableId 
            ? {
                ...table,
                seats: {
                  ...table.seats,
                  [data.seatNumber]: null
                },
                currentPlayers: Math.max(0, table.currentPlayers - 1)
              }
            : table
        )
      );
    });

    // 监听其他玩家加入桌子
    socketService.on('player_joined_table', (data) => {
      console.log('👤 其他玩家加入桌子:', data);
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === data.tableId 
            ? {
                ...table,
                seats: {
                  ...table.seats,
                  [data.seatNumber]: data.userId
                },
                currentPlayers: table.currentPlayers + 1
              }
            : table
        )
      );
    });

    // 监听玩家离开桌子
    socketService.on('player_left_table', (data) => {
      console.log('👤 玩家离开桌子:', data);
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === data.tableId 
            ? {
                ...table,
                seats: {
                  ...table.seats,
                  [data.seatNumber]: null
                },
                currentPlayers: Math.max(0, table.currentPlayers - 1)
              }
            : table
        )
      );
    });

    // 清理监听器
    return () => {
      socketService.off('join_table_success');
      socketService.off('join_table_failed');
      socketService.off('player_joined_table');
      socketService.off('player_left_table');
    };
  }, [tables]);

  // 渲染桌子组件
  const renderTable = (table) => {
    const isTableFull = table.currentPlayers >= table.maxPlayers;
    const isTablePlaying = table.status === 'playing';

    return (
      <Card
        key={table.id}
        sx={{
          width: 120,
          height: 120,
          m: 1,
          cursor: isTableFull || isTablePlaying ? 'not-allowed' : 'pointer',
          opacity: isTableFull || isTablePlaying ? 0.6 : 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: isTableFull || isTablePlaying ? 'none' : 'scale(1.05)',
            boxShadow: isTableFull || isTablePlaying ? theme.shadows[1] : theme.shadows[8],
          },
        }}
      >
        <CardContent sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* 桌子标题 */}
          <Typography variant="caption" textAlign="center" sx={{ mb: 1 }}>
            桌子{table.tableId}
          </Typography>

          {/* 桌子主体 - 正方形 */}
          <Box
            sx={{
              flex: 1,
              border: '2px solid',
              borderColor: isTablePlaying ? 'warning.main' : 'primary.main',
              borderRadius: 1,
              position: 'relative',
              bgcolor: isTablePlaying ? 'warning.light' : 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 座位1 - 上 */}
            <Button
              size="small"
              variant={table.seats[1] ? 'contained' : 'outlined'}
              color={table.seats[1] ? 'success' : 'primary'}
              sx={{
                position: 'absolute',
                top: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                minWidth: 24,
                height: 24,
                fontSize: '0.7rem',
                p: 0,
              }}
              onClick={() => handleSeatClick(table.id, 1)}
              disabled={isTableFull || isTablePlaying || !!table.seats[1]}
            >
              1
            </Button>

            {/* 座位2 - 右 */}
            <Button
              size="small"
              variant={table.seats[2] ? 'contained' : 'outlined'}
              color={table.seats[2] ? 'success' : 'primary'}
              sx={{
                position: 'absolute',
                right: -8,
                top: '50%',
                transform: 'translateY(-50%)',
                minWidth: 24,
                height: 24,
                fontSize: '0.7rem',
                p: 0,
              }}
              onClick={() => handleSeatClick(table.id, 2)}
              disabled={isTableFull || isTablePlaying || !!table.seats[2]}
            >
              2
            </Button>

            {/* 座位3 - 下 */}
            <Button
              size="small"
              variant={table.seats[3] ? 'contained' : 'outlined'}
              color={table.seats[3] ? 'success' : 'primary'}
              sx={{
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                minWidth: 24,
                height: 24,
                fontSize: '0.7rem',
                p: 0,
              }}
              onClick={() => handleSeatClick(table.id, 3)}
              disabled={isTableFull || isTablePlaying || !!table.seats[3]}
            >
              3
            </Button>

            {/* 座位4 - 左 */}
            <Button
              size="small"
              variant={table.seats[4] ? 'contained' : 'outlined'}
              color={table.seats[4] ? 'success' : 'primary'}
              sx={{
                position: 'absolute',
                left: -8,
                top: '50%',
                transform: 'translateY(-50%)',
                minWidth: 24,
                height: 24,
                fontSize: '0.7rem',
                p: 0,
              }}
              onClick={() => handleSeatClick(table.id, 4)}
              disabled={isTableFull || isTablePlaying || !!table.seats[4]}
            >
              4
            </Button>

            {/* 桌子状态指示 */}
            {isTablePlaying && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: 'warning.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                }}
              >
                <PlayArrow sx={{ fontSize: 12 }} />
              </Box>
            )}
          </Box>

          {/* 桌子状态 */}
          <Typography variant="caption" textAlign="center" sx={{ mt: 1 }}>
            {table.currentPlayers}/{table.maxPlayers}
          </Typography>
        </CardContent>
      </Card>
    );
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
        {/* 头部 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            {gameName}游戏大厅
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            选择房间和座位，开始对战
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
                bgcolor: 'primary.main',
                color: '#ffffff',
                display: 'inline-block'
              }}
            >
              在线玩家: {rooms.reduce((sum, room) => sum + room.players, 0)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
                bgcolor: 'secondary.main',
                color: '#ffffff',
                display: 'inline-block'
              }}
            >
              可用桌子: {tables.filter(t => t.status === 'empty').length}
            </Typography>
          </Box>
        </Box>

        {/* 主要内容区域 */}
        <Grid container spacing={3}>
          {/* 左侧房间列表 */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Room />
                房间列表
              </Typography>
              
              <List sx={{ p: 0 }}>
                {rooms.map((room, index) => (
                  <React.Fragment key={room.id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        selected={selectedRoom === room.id}
                        onClick={() => handleRoomSelect(room.id)}
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                            },
                          },
                        }}
                      >
                        <ListItemText
                          primary={room.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
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
                                {room.players}/{room.maxPlayers}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  bgcolor: room.status === '未满员' ? 'success.main' : 'warning.main',
                                  color: '#ffffff',
                                  display: 'inline-block'
                                }}
                              >
                                {room.status}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < rooms.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* 右侧桌子区域 */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TableRestaurant />
                  {selectedRoom} - 对战桌面
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      bgcolor: 'primary.main',
                      color: '#ffffff',
                      display: 'inline-block'
                    }}
                  >
                    空座位
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      bgcolor: 'success.main',
                      color: '#ffffff',
                      display: 'inline-block'
                    }}
                  >
                    已占用
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      bgcolor: 'warning.main',
                      color: '#ffffff',
                      display: 'inline-block'
                    }}
                  >
                    游戏中
                  </Typography>
                </Box>
              </Box>

              {/* 桌子网格 */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: 2,
                  maxHeight: '70vh',
                  overflowY: 'auto',
                  p: 1,
                }}
              >
                {tables.map((table) => renderTable(table))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* 底部信息 */}
        <Box sx={{ textAlign: 'center', mt: 4, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            点击座位号加入游戏，每个桌子最多支持4名玩家
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default GameHallPage; 