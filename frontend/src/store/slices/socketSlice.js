import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: false,
  connecting: false,
  error: null,
  users: [],
  rooms: []
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    initializeSocket: (state) => {
      state.connecting = true;
      state.error = null;
    },
    socketConnected: (state) => {
      state.connected = true;
      state.connecting = false;
      state.error = null;
    },
    socketDisconnected: (state) => {
      state.connected = false;
      state.connecting = false;
    },
    socketError: (state, action) => {
      state.error = action.payload;
      state.connecting = false;
    },
    disconnectSocket: (state) => {
      state.connected = false;
      state.connecting = false;
      state.users = [];
      state.rooms = [];
    },
    updateUserList: (state, action) => {
      state.users = action.payload;
    },
    updateRooms: (state, action) => {
      state.rooms = action.payload;
    }
  }
});

export const {
  initializeSocket,
  socketConnected,
  socketDisconnected,
  socketError,
  disconnectSocket,
  updateUserList,
  updateRooms
} = socketSlice.actions;

export default socketSlice.reducer;