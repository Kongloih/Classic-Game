import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rooms: [],
  currentRoom: null,
  players: [],
  gameState: 'waiting', // waiting, playing, finished
  loading: false
};

const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    setPlayers: (state, action) => {
      state.players = action.payload;
    },
    setGameState: (state, action) => {
      state.gameState = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const {
  setRooms,
  setCurrentRoom,
  setPlayers,
  setGameState,
  setLoading
} = battleSlice.actions;

export default battleSlice.reducer;