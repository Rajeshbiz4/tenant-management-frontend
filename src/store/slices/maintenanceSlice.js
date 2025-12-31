import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchMaintenance = createAsyncThunk(
  'maintenance/fetchMaintenance',
  async ({ page = 1, limit = 10, property, maintainer, status }, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (property) params.property = property;
      if (maintainer) params.maintainer = maintainer;
      if (status) params.status = status;
      const response = await api.get('/maintenance', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance records');
    }
  }
);

export const fetchMaintenanceStats = createAsyncThunk(
  'maintenance/fetchMaintenanceStats',
  async ({ property, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = {};
      if (property) params.property = property;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await api.get('/maintenance/stats', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch maintenance statistics');
    }
  }
);

export const createMaintenance = createAsyncThunk(
  'maintenance/createMaintenance',
  async (maintenanceData, { rejectWithValue }) => {
    try {
      const response = await api.post('/maintenance', maintenanceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create maintenance record');
    }
  }
);

export const updateMaintenance = createAsyncThunk(
  'maintenance/updateMaintenance',
  async ({ id, ...maintenanceData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/maintenance/${id}`, maintenanceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update maintenance record');
    }
  }
);

export const deleteMaintenance = createAsyncThunk(
  'maintenance/deleteMaintenance',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/maintenance/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete maintenance record');
    }
  }
);

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState: {
    maintenanceRecords: [],
    stats: null,
    pagination: {},
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
      .addCase(fetchMaintenance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaintenance.fulfilled, (state, action) => {
        state.loading = false;
        state.maintenanceRecords = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMaintenance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMaintenanceStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      })
      .addCase(createMaintenance.fulfilled, (state) => {
        // Will refresh list
      })
      .addCase(updateMaintenance.fulfilled, (state) => {
        // Will refresh list
      })
      .addCase(deleteMaintenance.fulfilled, (state, action) => {
        state.maintenanceRecords = state.maintenanceRecords.filter(m => m._id !== action.payload);
      });
  },
});

export const { clearError } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;

