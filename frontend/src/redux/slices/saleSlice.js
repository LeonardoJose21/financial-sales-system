import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Async thunks
export const fetchSales = createAsyncThunk(
  'sales/fetchSales',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getSales(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener ventas');
    }
  }
);

export const createSale = createAsyncThunk(
  'sales/createSale',
  async (saleData, { rejectWithValue }) => {
    try {
      const response = await apiService.createSale(saleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear venta');
    }
  }
);

export const updateSale = createAsyncThunk(
  'sales/updateSale',
  async ({ id, saleData }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateSale(id, saleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar venta');
    }
  }
);

export const deleteSale = createAsyncThunk(
  'sales/deleteSale',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteSale(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar venta');
    }
  }
);

export const updateSaleStatus = createAsyncThunk(
  'sales/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateSaleStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar estado');
    }
  }
);

export const fetchTotalAmount = createAsyncThunk(
  'sales/fetchTotalAmount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getTotalAmount();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener total');
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'sales/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getStatistics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }
);

// Initial state
const initialState = {
  sales: [],
  totalAmount: 0,
  statistics: null,
  pagination: null,
  loading: false,
  error: null,
  success: null
};

// Slice
const saleSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch sales
      .addCase(fetchSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload.sales;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create sale
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state) => {
        state.loading = false;
        state.success = 'Venta creada exitosamente';
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update sale
      .addCase(updateSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSale.fulfilled, (state) => {
        state.loading = false;
        state.success = 'Venta actualizada exitosamente';
      })
      .addCase(updateSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete sale
      .addCase(deleteSale.fulfilled, (state) => {
        state.success = 'Venta eliminada exitosamente';
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update status
      .addCase(updateSaleStatus.fulfilled, (state) => {
        state.success = 'Estado actualizado exitosamente';
      })
      .addCase(updateSaleStatus.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch total amount
      .addCase(fetchTotalAmount.fulfilled, (state, action) => {
        state.totalAmount = action.payload.total;
      })
      // Fetch statistics
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMessages } = saleSlice.actions;
export default saleSlice.reducer;