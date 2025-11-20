import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchMonthlyStats, fetchYearlyStats } from '../../store/slices/statsSlice';

function Statistics() {
  const dispatch = useDispatch();
  const { monthlyStats, yearlyStats, loading } = useSelector((state) => state.stats);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  useEffect(() => {
    dispatch(fetchMonthlyStats({ year, month }));
    dispatch(fetchYearlyStats({ year }));
  }, [dispatch, year, month]);

  const monthlyChartData = monthlyStats
    ? [
        {
          name: 'Rent',
          Collected: monthlyStats.rent.collected,
          Pending: monthlyStats.rent.pending,
        },
        {
          name: 'Maintenance',
          Collected: monthlyStats.maintenance.collected,
          Pending: monthlyStats.maintenance.pending,
        },
        {
          name: 'Light Bill',
          Collected: monthlyStats.lightBill.collected,
          Pending: monthlyStats.lightBill.pending,
        },
      ]
    : [];

  const yearlyChartData = yearlyStats
    ? Object.keys(yearlyStats.monthlyBreakdown).map((m) => ({
        name: `M${m}`,
        Rent: yearlyStats.monthlyBreakdown[m].rent,
        Maintenance: yearlyStats.monthlyBreakdown[m].maintenance,
        LightBill: yearlyStats.monthlyBreakdown[m].lightBill,
      }))
    : [];

  if (loading && !monthlyStats && !yearlyStats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Statistics
      </Typography>

      {/* Filters */}
      <Box
        display="flex"
        gap={2}
        mb={3}
        flexWrap="wrap"
      >
        <TextField
          select
          label="Year"
          size="small"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ minWidth: 150 }}
        >
          {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Month"
          size="small"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          sx={{ minWidth: 150 }}
        >
          {Array.from({ length: 12 }).map((_, idx) => (
            <MenuItem key={idx + 1} value={idx + 1}>
              {idx + 1}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* 50%-50% Section */}
      <Grid container spacing={3}>
        
        {/* Monthly Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Collection vs Pending
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Collected" fill="#1976d2" />
                  <Bar dataKey="Pending" fill="#d32f2f" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Yearly Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Yearly Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Rent" fill="#1976d2" />
                  <Bar dataKey="Maintenance" fill="#388e3c" />
                  <Bar dataKey="LightBill" fill="#fbc02d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}

export default Statistics;
