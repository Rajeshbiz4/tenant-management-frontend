import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchOverview = createAsyncThunk(
  'stats/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/stats/overview');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overview');
    }
  }
);

export const fetchMonthlyStats = createAsyncThunk(
  'stats/fetchMonthlyStats',
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const response = await api.get('/stats/monthly', { params: { year, month } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly stats');
    }
  }
);

export const fetchYearlyStats = createAsyncThunk(
  'stats/fetchYearlyStats',
  async ({ year }, { rejectWithValue }) => {
    try {
      const response = await api.get('/stats/yearly', { params: { year } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch yearly stats');
    }
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState: {
    overview: null,
    monthlyStats: null,
    yearlyStats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMonthlyStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMonthlyStats.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyStats = action.payload;
      })
      .addCase(fetchMonthlyStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchYearlyStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchYearlyStats.fulfilled, (state, action) => {
        state.loading = false;
        state.yearlyStats = action.payload;
      })
      .addCase(fetchYearlyStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = statsSlice.actions;
export default statsSlice.reducer;

