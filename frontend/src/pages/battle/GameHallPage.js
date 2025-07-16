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
    console.log('=== [GameHallPage] 初始化用户信息 ===');
    console.log('📊 Redux状态:', { reduxUser, isAuthenticated });
    
    if (reduxUser && isAuthenticated) {
      console.log('✅ 使用Redux用户信息:', reduxUser);
      setUser(reduxUser);
    } else {
      console.log('⚠️ Redux状态无效，尝试从localStorage获取');
      // 后备方案：从localStorage获取
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user');
      
      console.log('🔍 localStorage检查:', { 
        hasToken: !!token, 
        tokenLength: token?.length,
        hasUserInfo: !!userInfo 
      });
      
      if (token && userInfo) {
        try {
          const parsedUser = JSON.parse(userInfo);
          console.log('✅ 从localStorage获取用户信息:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('❌ 解析用户信息失败:', error);
        }
      } else {
        console.log('❌ localStorage中没有有效的用户信息');
        console.log('🔍 当前localStorage内容:', {
          token: localStorage.getItem('token'),
          user: localStorage.getItem('user'),
          allKeys: Object.keys(localStorage)
        });
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
      setLoading(true); // 设置加载状态
      
      // 只请求后端API，不再使用模拟数据
      const response = await fetch(`/api/battles/tables/${roomId}`, {
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
        // 转换API返回的数据格式为前端需要的格式
        const tableList = result.data.map(table => {
          // 检查座位占用情况
          const seats = {};
          const seatUsers = {};
          for (let i = 1; i <= 4; i++) {
            const seatUser = table.seats[i];
            if (seatUser) {
              seats[i] = seatUser.id || seatUser;
              seatUsers[i] = seatUser;
            } else {
              seats[i] = null;
              seatUsers[i] = null;
            }
          }
          return {
            id: table.id,
            tableId: table.table_id,
            status: table.status,
            currentPlayers: table.current_players,
            maxPlayers: table.max_players,
            maxSeat: table.max_seat || 4,
            availableSeats: table.available_seats || [1, 2, 3, 4],
            seats,
            seatUsers
          };
        });
        setTables(tableList);
        console.log(`✅ 加载房间 ${roomId} 的桌子数据:`, tableList);
      } else {
        throw new Error(result.message || '获取桌子数据失败');
      }
    } catch (error) {
      console.error('获取桌子数据失败:', error);
      setError('获取桌子数据失败: ' + error.message);
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // 初始化WebSocket连接
  const initWebSocket = useCallback(async () => {
    try {
      console.log('🔧 正在连接WebSocket...');
      console.log('🔧 WebSocket URL:', process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
      await socketService.connect();
      console.log('✅ WebSocket连接成功');
      // 检查连接状态
      const status = socketService.getConnectionStatus();
      console.log('📊 WebSocket状态:', status);
      // 测试socket连接
      socketService.emit('test_connection', { message: '前端连接测试' });
      console.log('✅ 测试消息已发送');
    } catch (error) {
      console.error('❌ WebSocket连接失败:', error);
      // 不抛出错误，因为WebSocket不是必需的
    }
  }, []);

  // 处理房间选择
  const handleRoomSelect = useCallback(async (roomId) => {
    try {
      console.log('=== [handleRoomSelect] 开始处理房间选择 ===');
      console.log('📥 选择房间ID:', roomId);
      console.log('📥 当前游戏ID:', gameId);
      
      // 立即设置选中房间和加载状态
      setSelectedRoom(roomId);
      setLoading(true);
      console.log(`✅ 设置选中房间: ${roomId}`);
      
      // 跳过Socket事件发送（测试模式）
      console.log('🔧 跳过Socket事件发送（测试模式）...');
      
      // 注释掉原来的Socket事件发送代码
      /*
      // 发送进入房间事件
      console.log('🔧 发送进入房间socket事件...');
      const socketData = {
        roomId: parseInt(roomId),
        gameId: parseInt(gameId)
      };
      
      console.log('🔧 socket事件数据:', socketData);
      console.log('🔧 socket连接状态:', socketService.getConnectionStatus());
      
      socketService.emit('enter_room', socketData);
      console.log('✅ 进入房间事件已发送');
      */
      
      // 从API获取该房间的桌子数据
      await loadRoomTables(roomId);
    } catch (error) {
      console.error('❌ 加载房间桌子失败:', error);
      setError('加载房间数据失败');
      setLoading(false);
    }
  }, [gameId, loadRoomTables]);

  // 初始化房间列表
  const initRooms = useCallback(async () => {
    try {
      console.log(`🔄 正在获取游戏ID ${gameId} 的房间列表...`);
      // 检查认证状态
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('用户未登录，请先登录');
      }
      // 调用后端API获取房间列表
      const response = await fetch(`/api/battles/rooms/${gameId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.success) {
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
      setError('获取房间列表失败: ' + error.message);
      setRooms([]);
    }
  }, [gameId, handleRoomSelect]);

  // 监听服务器响应
  useEffect(() => {
    console.log('🔧 开始设置socket事件监听器...');
    
    // 监听加入桌子成功
    socketService.on('join_table_success', (data) => {
      console.log('=== [join_table_success] 收到服务器成功响应 ===');
      console.log('📥 服务器返回数据:', data);
      
      setTables(prevTables => {
        console.log('🔄 开始更新前端状态...');
        console.log('📊 当前前端状态:', prevTables.map(t => ({ id: t.id, seats: t.seats, currentPlayers: t.currentPlayers })));
        
        const newTables = prevTables.map(table => {
          // 处理跨桌子切换：释放原桌子的座位
          if (data.isTableSwitch && data.oldTableInfo && table.id === data.oldTableInfo.tableId) {
            console.log(`🔄 处理跨桌子切换，释放原桌子 ${table.id} 座位 ${data.oldTableInfo.seatNumber}`);
            const updatedTable = {
              ...table,
              seats: {
                ...table.seats,
                [data.oldTableInfo.seatNumber]: null
              },
              currentPlayers: Math.max(0, table.currentPlayers - 1)
            };
            console.log(`✅ 原桌子更新完成:`, {
              原座位: table.seats,
              新座位: updatedTable.seats,
              原玩家数: table.currentPlayers,
              新玩家数: updatedTable.currentPlayers
            });
            return updatedTable;
          }
          
          // 处理当前桌子的更新
          if (table.id === data.tableId) {
            console.log(`🔄 处理当前桌子 ${table.id} 的更新`);
            const newSeats = {
              ...table.seats,
              [data.seatNumber]: data.userId,
              // 如果是座位切换，需要释放原座位
              ...(data.isSeatSwitch && data.oldSeat ? { [data.oldSeat]: null } : {})
            };
            
            const newCurrentPlayers = (data.isSeatSwitch || data.isTableSwitch) ? table.currentPlayers : table.currentPlayers + 1;
            
            const updatedTable = {
              ...table,
              seats: newSeats,
              currentPlayers: newCurrentPlayers
            };
            
            console.log(`✅ 当前桌子更新完成:`, {
              原座位: table.seats,
              新座位: newSeats,
              原玩家数: table.currentPlayers,
              新玩家数: newCurrentPlayers,
              是否座位切换: data.isSeatSwitch,
              是否跨桌子切换: data.isTableSwitch
            });
            
            return updatedTable;
          }
          
          return table;
        });
        
        console.log('✅ 前端状态更新完成');
        return newTables;
      });
    });

    // 监听加入桌子失败
    socketService.on('join_table_failed', (data) => {
      console.log('=== [join_table_failed] 收到服务器失败响应 ===');
      console.log('📥 服务器返回数据:', data);
      console.log('❌ 加入桌子失败:', data.message);
      
      alert(`加入桌子失败: ${data.message}`);
      
      // 回滚本地状态
      console.log('🔄 回滚本地状态...');
      setTables(prevTables => {
        const newTables = prevTables.map(table => {
          if (table.id === data.tableId) {
            console.log(`🔄 回滚桌子 ${table.id} 的状态`);
            const updatedTable = {
              ...table,
              seats: {
                ...table.seats,
                [data.seatNumber]: null
              },
              currentPlayers: Math.max(0, table.currentPlayers - 1)
            };
            console.log(`✅ 回滚完成:`, {
              原座位: table.seats,
              回滚后座位: updatedTable.seats,
              原玩家数: table.currentPlayers,
              回滚后玩家数: updatedTable.currentPlayers
            });
            return updatedTable;
          }
          return table;
        });
        console.log('✅ 本地状态回滚完成');
        return newTables;
      });
    });

    // 监听进入房间成功
    socketService.on('enter_room_success', (data) => {
      console.log('=== [enter_room_success] 收到服务器成功响应 ===');
      console.log('📥 服务器返回数据:', data);
      console.log('✅ 进入房间成功');
      
      // 可以在这里更新房间信息或显示成功消息
      if (data.room) {
        console.log('📊 房间信息更新:', {
          online_users: data.room.online_users,
          status: data.room.status
        });
      }
      
      if (data.previousTableInfo) {
        console.log('📊 用户之前占用的座位信息:', data.previousTableInfo);
      }
    });

    // 监听进入房间失败
    socketService.on('enter_room_failed', (data) => {
      console.log('=== [enter_room_failed] 收到服务器失败响应 ===');
      console.log('📥 服务器返回数据:', data);
      console.log('❌ 进入房间失败:', data.message);
      
      alert(`进入房间失败: ${data.message}`);
    });

    // 监听其他用户进入房间
    socketService.on('user_entered_room', (data) => {
      console.log('=== [user_entered_room] 收到其他用户进入房间事件 ===');
      console.log('📥 事件数据:', data);
      console.log(`👤 用户 ${data.username} 进入了房间 ${data.roomId}`);
    });

    // 监听其他玩家加入桌子
    socketService.on('player_joined_table', (data) => {
      console.log('=== [player_joined_table] 收到其他玩家加入事件 ===');
      console.log('📥 事件数据:', data);
      
      setTables(prevTables => {
        console.log('🔄 更新其他玩家加入状态...');
        const newTables = prevTables.map(table => {
          // 处理跨桌子切换：释放原桌子的座位
          if (data.isTableSwitch && data.oldTableInfo && table.id === data.oldTableInfo.tableId) {
            console.log(`🔄 处理其他玩家跨桌子切换，释放原桌子 ${table.id} 座位 ${data.oldTableInfo.seatNumber}`);
            const updatedTable = {
              ...table,
              seats: {
                ...table.seats,
                [data.oldTableInfo.seatNumber]: null
              },
              currentPlayers: Math.max(0, table.currentPlayers - 1)
            };
            console.log(`✅ 其他玩家原桌子更新完成`);
            return updatedTable;
          }
          
          // 处理当前桌子的更新
          if (table.id === data.tableId) {
            console.log(`🔄 处理其他玩家加入当前桌子 ${table.id}`);
            const newSeats = {
              ...table.seats,
              [data.seatNumber]: data.userId,
              // 如果是座位切换，需要释放原座位
              ...(data.isSeatSwitch && data.oldSeat ? { [data.oldSeat]: null } : {})
            };
            
            const newCurrentPlayers = (data.isSeatSwitch || data.isTableSwitch) ? table.currentPlayers : table.currentPlayers + 1;
            
            const updatedTable = {
              ...table,
              seats: newSeats,
              currentPlayers: newCurrentPlayers
            };
            
            console.log(`✅ 其他玩家当前桌子更新完成:`, {
              新座位: newSeats,
              新玩家数: newCurrentPlayers
            });
            
            return updatedTable;
          }
          
          return table;
        });
        console.log('✅ 其他玩家状态更新完成');
        return newTables;
      });
    });

    // 监听玩家离开桌子
    socketService.on('player_left_table', (data) => {
      console.log('=== [player_left_table] 收到玩家离开事件 ===');
      console.log('📥 事件数据:', data);
      
      setTables(prevTables => {
        console.log('🔄 更新玩家离开状态...');
        const newTables = prevTables.map(table => {
          if (table.id === data.tableId) {
            console.log(`🔄 处理玩家离开桌子 ${table.id} 座位 ${data.seatNumber}`);
            const updatedTable = {
              ...table,
              seats: {
                ...table.seats,
                [data.seatNumber]: null
              },
              currentPlayers: Math.max(0, table.currentPlayers - 1)
            };
            console.log(`✅ 玩家离开更新完成:`, {
              原座位: table.seats,
              新座位: updatedTable.seats,
              原玩家数: table.currentPlayers,
              新玩家数: updatedTable.currentPlayers
            });
            return updatedTable;
          }
          return table;
        });
        console.log('✅ 玩家离开状态更新完成');
        return newTables;
      });
    });

    console.log('✅ socket事件监听器设置完成');

    // 监听测试连接响应
    socketService.on('test_connection_response', (data) => {
      console.log('=== [test_connection_response] 收到后端测试响应 ===');
      console.log('📥 后端响应:', data);
      console.log('✅ 前后端socket通信正常');
    });

    // 清理监听器
    return () => {
      console.log('🧹 清理socket事件监听器...');
      socketService.off('enter_room_success');
      socketService.off('enter_room_failed');
      socketService.off('user_entered_room');
      socketService.off('join_table_success');
      socketService.off('join_table_failed');
      socketService.off('player_joined_table');
      socketService.off('player_left_table');
      socketService.off('test_connection_response');
      console.log('✅ socket事件监听器清理完成');
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
  }, [gameId, initRooms, initWebSocket]); // 只依赖gameId，避免无限循环

  // 处理座位点击
  const handleSeatClick = (tableId, seatNumber) => {
    console.log('=== [handleSeatClick] 开始处理座位点击 ===');
    console.log('📥 点击参数:', { tableId, seatNumber });
    console.log('📥 当前用户信息:', { user: user?.id, isAuthenticated });
    console.log('📥 当前选中房间:', selectedRoom);
    console.log('🔧 socket连接状态:', socketService.getConnectionStatus());
    
    if (!user || !isAuthenticated) {
      console.log('❌ 用户未登录，跳转到登录页面');
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
      console.log('❌ 未选择房间');
      alert('请先选择房间');
      return;
    }

    // 找到对应的房间对象
    const room = rooms.find(r => r.id === selectedRoom);
    if (!room) {
      console.log('❌ 房间不存在:', selectedRoom);
      alert('房间不存在');
      return;
    }

    console.log(`🔍 找到房间:`, { id: room.id, room_id: room.room_id, name: room.name });
    
    // 检查座位是否已被占用
    const currentTable = tables.find(t => t.id === tableId);
    console.log(`🔍 当前桌子信息:`, currentTable);
    
    if (currentTable && currentTable.seats[seatNumber]) {
      console.log(`❌ 座位 ${seatNumber} 已被用户 ${currentTable.seats[seatNumber]} 占用`);
      alert('该座位已被占用');
      return;
    }

    // 检查用户是否已在其他座位（座位切换）
    const existingSeat = currentTable ? Object.entries(currentTable.seats).find(([seat, userId]) => userId === user.id)?.[0] : null;
    const isSeatSwitch = existingSeat && existingSeat !== seatNumber.toString();
    const isTableSwitch = false; // 前端无法直接判断跨桌子切换，由后端返回
    
    console.log(`🔍 座位切换检查:`, { existingSeat, isSeatSwitch, isTableSwitch });

    // 发送加入桌子的请求，包含room_id和game_id
    const socketData = {
      tableId: parseInt(tableId), // 确保tableId是数字
      roomId: room.id, // 使用room.id（数字）
      gameId: parseInt(gameId), // 添加gameId
      seatNumber,
      userId: user.id,
      username: user.username,
    };
    
    console.log('🔧 准备发送socket事件:', socketData);
    console.log('🔧 socket连接状态:', socketService.getConnectionStatus());
    
    socketService.emit('join_table', socketData);
    console.log('✅ socket事件已发送');

    // 立即更新本地状态，提供即时反馈
    console.log('🔄 更新本地状态...');
    setTables(prevTables => {
      const newTables = prevTables.map(table => {
        if (table.id === tableId) {
          const newSeats = {
            ...table.seats,
            [seatNumber]: user.id,
            // 如果是座位切换，释放原座位
            ...(isSeatSwitch && existingSeat ? { [existingSeat]: null } : {})
          };
          
          const newCurrentPlayers = (isSeatSwitch || isTableSwitch) ? table.currentPlayers : table.currentPlayers + 1;
          
          console.log(`🔄 更新桌子 ${tableId}:`, {
            原座位状态: table.seats,
            新座位状态: newSeats,
            原玩家数: table.currentPlayers,
            新玩家数: newCurrentPlayers
          });
          
          return {
            ...table,
            seats: newSeats,
            currentPlayers: newCurrentPlayers
          };
        }
        return table;
      });
      
      console.log('✅ 本地状态更新完成');
      return newTables;
    });

    // 显示成功消息
    console.log(`✅ 本地操作完成，显示成功消息`);
    alert(`成功加入桌子 ${tableId} 座位 ${seatNumber}`);
    console.log('=== [handleSeatClick] 处理完成 ===');
  };

  // 渲染座位按钮
  const renderSeat = (table, seatNumber, position) => {
    const isOccupied = !!table.seats[seatNumber];
    const isTableFull = table.currentPlayers >= table.maxSeat;
    const isTablePlaying = table.status === 'playing';
    const isSeatAvailable = table.availableSeats && table.availableSeats.includes(seatNumber);
    const isDisabled = !isSeatAvailable || isTableFull || isTablePlaying || isOccupied;
    
    // 添加调试信息
    console.log(`🔍 渲染座位 ${seatNumber}:`, {
      tableId: table.id,
      isOccupied,
      isTableFull,
      isTablePlaying,
      isSeatAvailable,
      isDisabled,
      currentPlayers: table.currentPlayers,
      maxSeat: table.maxSeat,
      availableSeats: table.availableSeats
    });
    
    // 座位颜色逻辑：
    // - 蓝色：空座位（可点击）
    // - 绿色：已占用
    // - 橙色：游戏中（所有玩家都准备就绪）
    let seatBgColor = '#1976d2'; // 默认蓝色（空座位）
    let seatTextColor = 'white';
    let seatBorderColor = '#1976d2';
    let seatHoverColor = '#1565c0';
    
    if (isOccupied) {
      seatBgColor = '#2e7d32'; // 绿色（已占用）
      seatTextColor = 'white';
      seatBorderColor = '#2e7d32';
      seatHoverColor = '#1b5e20';
    } else if (isTablePlaying) {
      seatBgColor = '#ed6c02'; // 橙色（游戏中）
      seatTextColor = 'white';
      seatBorderColor = '#ed6c02';
      seatHoverColor = '#e65100';
    } else if (isDisabled) {
      seatBgColor = '#e0e0e0'; // 灰色（禁用）
      seatTextColor = '#757575';
      seatBorderColor = '#e0e0e0';
      seatHoverColor = '#e0e0e0';
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
        variant={isOccupied || isTablePlaying ? 'contained' : 'outlined'}
        sx={{
          position: 'absolute',
          minWidth: 24,
          height: 24,
          fontSize: '0.7rem',
          p: 0,
          ...positionStyles[seatNumber],
          opacity: isDisabled ? 0.5 : 1,
          // 使用自定义颜色
          bgcolor: seatBgColor,
          color: seatTextColor,
          borderColor: seatBorderColor,
          '&:hover': {
            bgcolor: seatHoverColor,
            borderColor: seatHoverColor,
          },
          '&:disabled': {
            bgcolor: seatBgColor,
            color: seatTextColor,
            borderColor: seatBorderColor,
          }
        }}
        onClick={() => {
          console.log(`🔧 座位 ${seatNumber} 被点击，tableId: ${table.id}`);
          handleSeatClick(table.id, seatNumber);
        }}
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
              房间列表 (双击进入)
              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    加载中...
                  </Typography>
                </Box>
              )}
            </Typography>
            
            <List sx={{ p: 0 }}>
              {rooms.map((room, index) => (
                <React.Fragment key={room.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={selectedRoom === room.id}
                      onDoubleClick={() => handleRoomSelect(room.id)}
                      disabled={loading}
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
                        '&:disabled': {
                          opacity: 0.6,
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {room.name}
                            {loading && selectedRoom === room.id && (
                              <CircularProgress size={12} color="inherit" />
                            )}
                          </Box>
                        }
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
                {loading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary">
                      正在加载房间 {selectedRoom} 的桌子数据...
                    </Typography>
                  </Box>
                )}
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
                    bgcolor: '#1976d2',
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
                    bgcolor: '#2e7d32',
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
                    bgcolor: '#ed6c02',
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
                position: 'relative',
                minHeight: '200px'
              }}
            >
              {loading ? (
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary">
                    正在加载桌子数据...
                  </Typography>
                </Box>
              ) : (
                tables.map((table) => renderTable(table))
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* 底部信息 */}
      <Box sx={{ textAlign: 'center', mt: 4, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">
          双击房间进入，点击座位号加入游戏，每个桌子最多支持4名玩家
        </Typography>
      </Box>
    </Box>
  );
};

export default GameHallPage; 