import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  games: [],
  currentGame: null,
  gameState: 'idle', // idle, playing, paused, gameOver
  score: 0,
  level: 1,
  loading: false
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGames: (state, action) => {
      state.games = action.payload;
    },
    setCurrentGame: (state, action) => {
      state.currentGame = action.payload;
    },
    setGameState: (state, action) => {
      state.gameState = action.payload;
    },
    setScore: (state, action) => {
      state.score = action.payload;
    },
    setLevel: (state, action) => {
      state.level = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const {
  setGames,
  setCurrentGame,
  setGameState,
  setScore,
  setLevel,
  setLoading
} = gameSlice.actions;

export default gameSlice.reducer;