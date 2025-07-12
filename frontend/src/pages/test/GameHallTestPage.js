import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const GameHallTestPage = () => {
  const navigate = useNavigate();

  const games = [
    { id: 1, name: '俄罗斯方块' },
    { id: 2, name: '贪吃蛇' },
    { id: 3, name: '打砖块' },
    { id: 4, name: '拳皇97' },
    { id: 5, name: '街头霸王2' },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        游戏大厅测试页面
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4 }}>
        点击下面的按钮进入不同游戏的游戏大厅：
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {games.map((game) => (
          <Button
            key={game.id}
            variant="contained"
            size="large"
            onClick={() => navigate(`/battle/hall/${game.id}`)}
            sx={{ justifyContent: 'flex-start', p: 2 }}
          >
            进入 {game.name} 游戏大厅
          </Button>
        ))}
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          功能说明：
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>左侧显示房间列表（room_1, room_2, room_3）</li>
            <li>右侧显示对战桌面的图标</li>
            <li>每个桌子是一个正方形，四个座位编号为1、2、3、4</li>
            <li>鼠标点击座位号可以加入游戏</li>
            <li>空座位显示为蓝色边框</li>
            <li>已占用座位显示为绿色填充</li>
            <li>游戏中桌子显示为橙色</li>
          </ul>
        </Typography>
      </Box>
    </Container>
  );
};

export default GameHallTestPage; 