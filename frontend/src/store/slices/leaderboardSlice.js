import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  global: [],
  weekly: [],
  monthly: [],
  loading: false
};

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setGlobalLeaderboard: (state, action) => {
      state.global = action.payload;
    },
    setWeeklyLeaderboard: (state, action) => {
      state.weekly = action.payload;
    },
    setMonthlyLeaderboard: (state, action) => {
      state.monthly = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const {
  setGlobalLeaderboard,
  setWeeklyLeaderboard,
  setMonthlyLeaderboard,
  setLoading
} = leaderboardSlice.actions;

export default leaderboardSlice.reducer;