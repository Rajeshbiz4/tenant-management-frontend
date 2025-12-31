import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchTenants = createAsyncThunk(
  'tenant/fetchTenants',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get('/tenant', { params: { page, limit } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenants');
    }
  }
);

export const createTenant = createAsyncThunk(
  'tenant/createTenant',
  async ({ propertyId, tenantData }, { rejectWithValue }) => {
    try {
      console.log('Creating tenant with data:', tenantData, propertyId);
      const response = await api.post(`/tenant/properties/${propertyId}/tenant`, tenantData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create tenant');
    }
  }
);

export const updateTenant = createAsyncThunk(
  'tenant/updateTenant',
  async ({ tenantId, tenantData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tenant/${tenantId}`, tenantData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tenant');
    }
  }
);

export const deleteTenant = createAsyncThunk(
  'tenant/deleteTenant',
  async (tenantId, { rejectWithValue }) => {
    try {
      await api.delete(`/tenant/${tenantId}`);
      return tenantId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete tenant');
    }
  }
);

export const updateRentStatus = createAsyncThunk(
  'tenant/updateRentStatus',
  async ({ id, rentStatus }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tenant/${id}/rent-status`, { rentStatus });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update rent status');
    }
  }
);

export const updateMaintenanceStatus = createAsyncThunk(
  'tenant/updateMaintenanceStatus',
  async ({ id, maintenanceStatus }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tenant/${id}/maintenance-status`, { maintenanceStatus });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update maintenance status');
    }
  }
);

export const updateLightBillStatus = createAsyncThunk(
  'tenant/updateLightBillStatus',
  async ({ id, lightBillStatus }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tenant/${id}/lightbill-status`, { lightBillStatus });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update light bill status');
    }
  }
);

const tenantSlice = createSlice({
  name: 'tenant',
  initialState: {
    tenants: [],
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
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTenant.fulfilled, (state, action) => {
        state.tenants = state.tenants.filter(t => t._id !== action.payload);
      });
  },
});

export const { clearError } = tenantSlice.actions;
export default tenantSlice.reducer;

