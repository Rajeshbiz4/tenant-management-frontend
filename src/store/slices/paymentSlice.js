import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


import api from '../../utils/api';

// Make a payment
export const makePayment = createAsyncThunk(
  'payment/makePayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/make', paymentData);
      if (response.data.payment) {
        return response.data.payment;
      }
      return rejectWithValue(response.data.message || 'Failed to make payment');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to make payment');
    }
  }
);

// Get payments with optional filters
export const getPayments = createAsyncThunk(
  'payment/getPayments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments', { params: filters });
      console.log('Get Payments Response:', response.data);
      if (response.data.data) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch payments');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

// Fetch report (monthly/yearly/shop-wise)
export const fetchReport = createAsyncThunk(
  'payment/fetchReport',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments/report', { params: filters });
      if (response.data.report) {
        return response.data.report;
      }
      return rejectWithValue(response.data.message || 'Failed to fetch report');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch report');
    }
  }
);






const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    payments: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPayments: (state) => {
      state.payments = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Make Payment
    builder.addCase(makePayment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(makePayment.fulfilled, (state, action) => {
      state.loading = false;
      state.payments.unshift(action.payload); // add latest payment at top
    });
    builder.addCase(makePayment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to make payment';
    });

    // Get Payments
    builder.addCase(getPayments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getPayments.fulfilled, (state, action) => {
      console.log('Fetched payments:', action.payload);
      state.loading = false;
      state.payments = action.payload;
    });
    builder.addCase(getPayments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch payments';
    });
  },
});

export const { clearPayments } = paymentSlice.actions;

export default paymentSlice.reducer;
