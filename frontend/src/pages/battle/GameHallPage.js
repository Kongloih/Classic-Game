import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  Alert,
  CircularProgress
} from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { socketService } from '../../services/socketService';
import { useNavigate } from 'react-router-dom';

const GameHallPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState(null);

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        
        // 初始化房间列表
        await initRooms();
        
        // 初始化WebSocket连接
        await initWebSocket();
        
        setLoading(false);
      } catch (error) {
        console.error('初始化失败:', error);
        setError('初始化失败，请刷新页面重试');
        setLoading(false);
      }
    };

    initData();
  }, []);

  // 初始化房间列表
  const initRooms = async () => {
    try {
      // 这里应该从API获取房间列表，暂时使用模拟数据
      const roomList = [
        { id: 1, room_id: 'room_1', name: '俄罗斯方块房间1', status: '未满员', online_users: 0, game_id: 1 },
        { id: 2, room_id: 'room_2', name: '俄罗斯方块房间2', status: '未满员', online_users: 0, game_id: 1 },
        { id: 3, room_id: 'room_3', name: '贪吃蛇房间1', status: '未满员', online_users: 0, game_id: 2 },
        { id: 4, room_id: 'room_4', name: '贪吃蛇房间2', status: '未满员', online_users: 0, game_id: 2 },
        { id: 5, room_id: 'room_5', name: '打砖块房间1', status: '未满员', online_users: 0, game_id: 3 },
        { id: 6, room_id: 'room_6', name: '打砖块房间2', status: '未满员', online_users: 0, game_id: 3 },
        { id: 7, room_id: 'room_7', name: '2048房间1', status: '未满员', online_users: 0, game_id: 4 },
        { id: 8, room_id: 'room_8', name: '2048房间2', status: '未满员', online_users: 0, game_id: 4 },
        { id: 9, room_id: 'room_9', name: '扫雷房间1', status: '未满员', online_users: 0, game_id: 5 },
      ];
      setRooms(roomList);
      
      // 默认选择第一个房间
      if (roomList.length > 0) {
        await handleRoomSelect(roomList[0].id);
      }
    } catch (error) {
      console.error('获取房间列表失败:', error);
      throw error;
    }
  };

  // 初始化WebSocket连接
  const initWebSocket = async () => {
    try {
      console.log('🔧 正在连接WebSocket...');
      await socketService.connect();
      console.log('✅ WebSocket连接成功');
      
      // 检查连接状态
      const status = socketService.getConnectionStatus();
      console.log('📊 WebSocket状态:', status);
      
    } catch (error) {
      console.error('❌ WebSocket连接失败:', error);
      // 不抛出错误，因为WebSocket不是必需的
    }
  };

  // 处理房间选择
  const handleRoomSelect = async (roomId) => {
    try {
      setSelectedRoom(roomId);
      console.log(`选择房间: ${roomId}`);
      
      // 从API获取该房间的桌子数据
      await loadRoomTables(roomId);
    } catch (error) {
      console.error('加载房间桌子失败:', error);
      setError('加载房间数据失败');
    }
  };

  // 从API加载房间桌子数据
  const loadRoomTables = async (roomId) => {
    try {
      setLoading(true);
      
      // 调用后端API获取桌子数据
      const response = await fetch(`/api/battles/tables/${roomId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('获取桌子数据失败');
      }

      const result = await response.json();
      
      if (result.success) {
        // 转换API返回的数据格式为前端需要的格式
        const tableList = result.data.map(table => ({
          id: table.table_id, // 使用table_id作为前端id
          tableId: table.table_id,
          status: table.status,
          currentPlayers: table.current_players,
          maxPlayers: table.max_players,
          seats: {
            1: table.seats[1]?.id || null,
            2: table.seats[2]?.id || null,
            3: table.seats[3]?.id || null,
            4: table.seats[4]?.id || null,
          },
          seatUsers: {
            1: table.seats[1],
            2: table.seats[2],
            3: table.seats[3],
            4: table.seats[4],
          }
        }));
        
        setTables(tableList);
        console.log(`✅ 加载房间 ${roomId} 的桌子数据:`, tableList);
      } else {
        throw new Error(result.message || '获取桌子数据失败');
      }
    } catch (error) {
      console.error('获取桌子数据失败:', error);
      // 如果API失败，使用模拟数据作为后备
      console.log('使用模拟数据作为后备');
      const fallbackTables = [];
      for (let i = 1; i <= 50; i++) {
        fallbackTables.push({
          id: `table_${i}`,
          tableId: i,
          status: 'empty',
          currentPlayers: 0,
          maxPlayers: 4,
          seats: { 1: null, 2: null, 3: null, 4: null },
          seatUsers: { 1: null, 2: null, 3: null, 4: null }
        });
      }
      setTables(fallbackTables);
    } finally {
      setLoading(false);
    }
  };

  // 处理座位点击
  const handleSeatClick = (tableId, seatNumber) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    if (!selectedRoom) {
      alert('请先选择房间');
      return;
    }

    console.log(`点击桌子 ${tableId} 座位 ${seatNumber}，房间 ${selectedRoom}`);
    
    // 检查座位是否已被占用
    const table = tables.find(t => t.id === tableId);
    if (table && table.seats[seatNumber]) {
      alert('该座位已被占用');
      return;
    }

    // 发送加入桌子的请求，包含roomId
    socketService.emit('join_table', {
      tableId,
      roomId: selectedRoom, // 添加roomId
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
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Grid container spacing={3}>
        {/* 左侧房间列表 */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                              {room.online_users}/{room.maxPlayers}
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
          </Card>
        </Grid>

        {/* 右侧桌子区域 */}
        <Grid item xs={12} md={9}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                对战桌面
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
          </Card>
        </Grid>
      </Grid>

      {/* 底部信息 */}
      <Box sx={{ textAlign: 'center', mt: 4, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">
          点击座位号加入游戏，每个桌子最多支持4名玩家
        </Typography>
      </Box>
    </Box>
  );
};

export default GameHallPage; 