import React, { useState, useEffect, useCallback } from 'react';
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
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { socketService } from '../../services/socketService';

const GameHallPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams(); // 获取URL中的游戏ID
  
  // 从Redux获取用户信息
  const { user: reduxUser, isAuthenticated } = useSelector(state => state.auth);
  
  const [rooms, setRooms] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  // 获取游戏名称
  const getGameName = (gameId) => {
    const gameNames = {
      1: '俄罗斯方块',
      2: '贪吃蛇',
      3: '打砖块',
      4: '2048',
      5: '扫雷'
    };
    return gameNames[gameId] || '未知游戏';
  };

  // 初始化用户信息
  useEffect(() => {
    if (reduxUser && isAuthenticated) {
      setUser(reduxUser);
    } else {
      // 后备方案：从localStorage获取
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user');
      if (token && userInfo) {
        try {
          setUser(JSON.parse(userInfo));
        } catch (error) {
          console.error('解析用户信息失败:', error);
        }
      }
    }
  }, [reduxUser, isAuthenticated]);

  // 处理返回按钮
  const handleBack = () => {
    navigate('/games');
  };

  // 加载房间桌子数据
  const loadRoomTables = useCallback(async (roomId) => {
    try {
      console.log(`🔄 正在加载房间 ${roomId} 的桌子数据...`);
      
      // 找到对应的房间对象
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        console.error(`❌ 找不到房间 ${roomId}`);
        throw new Error('房间不存在');
      }
      
      // 调用后端API获取桌子数据，使用room_id而不是id
      const response = await fetch(`/api/battle/tables/${room.id}`, {
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
          maxSeat: table.max_seat || 4, // 从Game表获取的max_seat
          availableSeats: table.available_seats || [1, 2, 3, 4], // 从Game表获取的available_seats
          seats: {
            1: table.seats[1]?.id || table.seats[1] || null,
            2: table.seats[2]?.id || table.seats[2] || null,
            3: table.seats[3]?.id || table.seats[3] || null,
            4: table.seats[4]?.id || table.seats[4] || null,
          },
          seatUsers: {
            1: table.seats[1],
            2: table.seats[2],
            3: table.seats[3],
            4: table.seats[4],
          }
        }));
        
        setTables(tableList);
        console.log(`✅ 加载房间 ${room.room_id} 的桌子数据:`, tableList);
      } else {
        throw new Error(result.message || '获取桌子数据失败');
      }
    } catch (error) {
      console.error('获取桌子数据失败:', error);
      // 如果API失败，使用模拟数据作为后备
      console.log('使用模拟数据作为后备');
      const fallbackTables = [];
      // 根据游戏ID确定可用座位配置
      const gameSeatConfig = {
        1: [2, 4], // 俄罗斯方块：座位2、4可用
        2: [1],    // 贪吃蛇：座位1可用
        3: [1],    // 打砖块：座位1可用
        4: [1],    // 2048：座位1可用
        5: [1]     // 扫雷：座位1可用
      };
      const availableSeats = gameSeatConfig[gameId] || [1, 2, 3, 4];
      
      for (let i = 1; i <= 50; i++) {
        fallbackTables.push({
          id: `table_${i}`,
          tableId: i,
          status: 'empty',
          currentPlayers: 0,
          maxPlayers: 4,
          maxSeat: availableSeats.length, // 根据可用座位数量设置maxSeat
          availableSeats: availableSeats,
          seats: { 1: null, 2: null, 3: null, 4: null },
          seatUsers: { 1: null, 2: null, 3: null, 4: null }
        });
      }
      setTables(fallbackTables);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // 初始化WebSocket连接
  const initWebSocket = useCallback(async () => {
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
  }, []);

  // 处理房间选择
  const handleRoomSelect = useCallback(async (roomId) => {
    try {
      setSelectedRoom(roomId);
      console.log(`选择房间: ${roomId}`);
      
      // 从API获取该房间的桌子数据
      await loadRoomTables(roomId);
    } catch (error) {
      console.error('加载房间桌子失败:', error);
      setError('加载房间数据失败');
    }
  }, []);

  // 初始化房间列表
  const initRooms = useCallback(async () => {
    try {
      console.log(`🔄 正在获取游戏ID ${gameId} 的房间列表...`);
      
      // 调用后端API获取房间列表
      const response = await fetch(`/api/battle/rooms/${gameId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ 获取到 ${result.data.length} 个房间:`, result.data);
        setRooms(result.data);
        
        // 默认选择第一个房间
        if (result.data.length > 0) {
          await handleRoomSelect(result.data[0].id);
        }
      } else {
        throw new Error(result.message || '获取房间数据失败');
      }
    } catch (error) {
      console.error('❌ 获取房间列表失败:', error);
      
      // API失败时使用后备数据
      console.log('🔄 使用后备房间数据...');
      const fallbackRooms = [
        { id: 1, room_id: 'room_1', name: '俄罗斯方块房间1', status: '未满员', online_users: 0, game_id: 1 },
        { id: 2, room_id: 'room_2', name: '俄罗斯方块房间2', status: '未满员', online_users: 0, game_id: 1 },
        { id: 3, room_id: 'room_3', name: '俄罗斯方块房间3', status: '未满员', online_users: 0, game_id: 1 },
      ];
      
      // 根据当前游戏ID过滤房间
      const filteredRooms = fallbackRooms.filter(room => room.game_id === parseInt(gameId));
      console.log(`🎮 游戏ID: ${gameId}, 后备房间:`, filteredRooms);
      
      setRooms(filteredRooms);
      
      // 默认选择第一个房间
      if (filteredRooms.length > 0) {
        await handleRoomSelect(filteredRooms[0].id);
      }
    }
  }, [gameId]);

  // 监听服务器响应
  useEffect(() => {
    // 监听加入桌子成功
    socketService.on('join_table_success', (data) => {
      console.log('✅ 加入桌子成功:', data);
      setTables(prevTables => 
        prevTables.map(table => {
          // 处理跨桌子切换：释放原桌子的座位
          if (data.isTableSwitch && data.oldTableInfo && table.id === data.oldTableInfo.tableId) {
            return {
              ...table,
              seats: {
                ...table.seats,
                [data.oldTableInfo.seatNumber]: null
              },
              currentPlayers: Math.max(0, table.currentPlayers - 1)
            };
          }
          
          // 处理当前桌子的更新
          if (table.id === data.tableId) {
            return {
              ...table,
              seats: {
                ...table.seats,
                [data.seatNumber]: data.userId,
                // 如果是座位切换，需要释放原座位
                ...(data.isSeatSwitch && data.oldSeat ? { [data.oldSeat]: null } : {})
              },
              currentPlayers: (data.isSeatSwitch || data.isTableSwitch) ? table.currentPlayers : table.currentPlayers + 1
            };
          }
          
          return table;
        })
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
        prevTables.map(table => {
          // 处理跨桌子切换：释放原桌子的座位
          if (data.isTableSwitch && data.oldTableInfo && table.id === data.oldTableInfo.tableId) {
            return {
              ...table,
              seats: {
                ...table.seats,
                [data.oldTableInfo.seatNumber]: null
              },
              currentPlayers: Math.max(0, table.currentPlayers - 1)
            };
          }
          
          // 处理当前桌子的更新
          if (table.id === data.tableId) {
            return {
              ...table,
              seats: {
                ...table.seats,
                [data.seatNumber]: data.userId,
                // 如果是座位切换，需要释放原座位
                ...(data.isSeatSwitch && data.oldSeat ? { [data.oldSeat]: null } : {})
              },
              currentPlayers: (data.isSeatSwitch || data.isTableSwitch) ? table.currentPlayers : table.currentPlayers + 1
            };
          }
          
          return table;
        })
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
  }, []);

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
  }, [gameId]); // 只依赖gameId，避免无限循环

  // 处理座位点击
  const handleSeatClick = (tableId, seatNumber) => {
    if (!user || !isAuthenticated) {
      // 保存当前页面信息，登录后返回
      const currentPath = location.pathname;
      const currentSearch = location.search;
      const returnPath = currentSearch ? `${currentPath}${currentSearch}` : currentPath;
      
      // 跳转到登录页面，并传递返回路径
      navigate('/login', { 
        state: { 
          from: { 
            pathname: returnPath 
          } 
        } 
      });
      return;
    }

    if (!selectedRoom) {
      alert('请先选择房间');
      return;
    }

    // 找到对应的房间对象
    const room = rooms.find(r => r.id === selectedRoom);
    if (!room) {
      alert('房间不存在');
      return;
    }

    console.log(`点击桌子 ${tableId} 座位 ${seatNumber}，房间 ${room.room_id}`);
    
    // 检查座位是否已被占用
    const currentTable = tables.find(t => t.id === tableId);
    if (currentTable && currentTable.seats[seatNumber]) {
      alert('该座位已被占用');
      return;
    }

    // 发送加入桌子的请求，包含room_id
    console.log('🔧 前端发送join_table事件:', {
      tableId,
      roomId: room.id, // 使用room.id（数字）
      seatNumber,
      userId: user.id,
      username: user.username,
    });
    
    socketService.emit('join_table', {
      tableId: parseInt(tableId), // 确保tableId是数字
      roomId: room.id, // 使用room.id（数字）
      seatNumber,
      userId: user.id,
      username: user.username,
    });

    // 检查用户是否已在其他座位（座位切换）
    const existingSeat = currentTable ? Object.entries(currentTable.seats).find(([seat, userId]) => userId === user.id)?.[0] : null;
    const isSeatSwitch = existingSeat && existingSeat !== seatNumber.toString();

    // 立即更新本地状态，提供即时反馈
    setTables(prevTables => 
      prevTables.map(table => 
        table.id === tableId 
          ? {
              ...table,
              seats: {
                ...table.seats,
                [seatNumber]: user.id,
                // 如果是座位切换，释放原座位
                ...(isSeatSwitch && existingSeat ? { [existingSeat]: null } : {})
              },
              currentPlayers: isSeatSwitch ? table.currentPlayers : table.currentPlayers + 1
            }
          : table
      )
    );

    // 显示成功消息
    alert(`成功加入桌子 ${tableId} 座位 ${seatNumber}`);
  };

  // 渲染座位按钮
  const renderSeat = (table, seatNumber, position) => {
    const isOccupied = !!table.seats[seatNumber];
    const isTableFull = table.currentPlayers >= table.maxSeat;
    const isTablePlaying = table.status === 'playing';
    const isSeatAvailable = table.availableSeats && table.availableSeats.includes(seatNumber);
    const isDisabled = !isSeatAvailable || isTableFull || isTablePlaying || isOccupied;
    
    // 座位颜色逻辑：绿色为已占用，紫色为空座位，灰色为禁用
    let seatColor = 'primary'; // 默认紫色
    if (isOccupied) {
      seatColor = 'success'; // 绿色
    } else if (isDisabled) {
      seatColor = 'default'; // 灰色 - 使用default而不是disabled
    }

    const positionStyles = {
      1: { // 上
        top: -8,
        left: '50%',
        transform: 'translateX(-50%)',
      },
      2: { // 右
        right: -8,
        top: '50%',
        transform: 'translateY(-50%)',
      },
      3: { // 下
        bottom: -8,
        left: '50%',
        transform: 'translateX(-50%)',
      },
      4: { // 左
        left: -8,
        top: '50%',
        transform: 'translateY(-50%)',
      }
    };

    return (
      <Button
        size="small"
        variant={isOccupied ? 'contained' : 'outlined'}
        sx={{
          position: 'absolute',
          minWidth: 24,
          height: 24,
          fontSize: '0.7rem',
          p: 0,
          ...positionStyles[seatNumber],
          opacity: isDisabled ? 0.5 : 1,
          // 使用sx来设置颜色，避免color属性问题
          bgcolor: isOccupied ? 'success.main' : isDisabled ? 'grey.300' : 'primary.main',
          color: isOccupied ? 'white' : isDisabled ? 'grey.500' : 'white',
          borderColor: isOccupied ? 'success.main' : isDisabled ? 'grey.300' : 'primary.main',
          '&:hover': {
            bgcolor: isOccupied ? 'success.dark' : isDisabled ? 'grey.300' : 'primary.dark',
          }
        }}
        onClick={() => handleSeatClick(table.id, seatNumber)}
        disabled={isDisabled}
      >
        {seatNumber}
      </Button>
    );
  };

  // 渲染桌子组件
  const renderTable = (tableData) => {
    const isTableFull = tableData.currentPlayers >= tableData.maxPlayers;
    const isTablePlaying = tableData.status === 'playing';

    return (
      <Card
        key={tableData.id}
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
            桌子{tableData.tableId}
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
            {/* 渲染所有座位 */}
            {renderSeat(tableData, 1, 'top')}
            {renderSeat(tableData, 2, 'right')}
            {renderSeat(tableData, 3, 'bottom')}
            {renderSeat(tableData, 4, 'left')}

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
            {tableData.currentPlayers}/{tableData.maxSeat}
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
      {/* 页面头部 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            sx={{ minWidth: 'auto' }}
          >
            返回游戏列表
          </Button>
          <Typography variant="h4" component="h1" fontWeight={700}>
            {getGameName(gameId)} 游戏大厅
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          选择房间和座位，开始你的游戏之旅
        </Typography>
      </Box>

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
                          <React.Fragment>
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
                                display: 'inline-block',
                                mr: 1
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
                          </React.Fragment>
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