import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  friends: [],
  guilds: [],
  messages: [],
  loading: false
};

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    setFriends: (state, action) => {
      state.friends = action.payload;
    },
    setGuilds: (state, action) => {
      state.guilds = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const {
  setFriends,
  setGuilds,
  setMessages,
  addMessage,
  setLoading
} = socialSlice.actions;

export default socialSlice.reducer;