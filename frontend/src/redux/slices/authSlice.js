// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/**
 * Helper to normalize response shapes.
 * Your api methods return axios.response.data (per apiService).
 * That data can be one of:
 *  - { success: true, data: { token, user } }
 *  - { token, user }
 *  - For captcha: { success: true, data: { captchaId, question } } OR { captchaId, question }
 */
function unwrap(resp) {
  if (!resp) return {};
  if (typeof resp !== "object") return resp;
  if (resp.success && resp.data) return resp.data;
  return resp;
}

// --- Async thunks ---

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      // api.login returns response.data already (per your ApiService)
      const resp = await api.login(credentials);
      const payload = unwrap(resp);

      if (payload.token) {
        localStorage.setItem("token", payload.token);
      }
      if (payload.user) {
        localStorage.setItem("user", JSON.stringify(payload.user));
      }

      return payload;
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Error al iniciar sesión";
      return rejectWithValue(msg);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    // remove client-side
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // attempt backend logout (best-effort)
    try {
      await api.logout();
    } catch (e) {
      // ignore network/back-end logout errors
    }
    return true;
  } catch (err) {
    return rejectWithValue(err?.message || "Error al cerrar sesión");
  }
});

export const getCaptcha = createAsyncThunk(
  "auth/getCaptcha",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await api.getCaptcha();
      const payload = unwrap(resp);
      // payload expected: { captchaId, question }
      if (!payload || (!payload.captchaId && !payload.question)) {
        // If backend returned wrapper but no data, try deeper unwrap
        return rejectWithValue("Respuesta inválida del captcha");
      }
      return payload;
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Error al obtener captcha";
      return rejectWithValue(msg);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const resp = await api.registerUser(userData);
      const payload = unwrap(resp);

      // If backend also returns token on register, store it
      if (payload.token) {
        localStorage.setItem("token", payload.token);
      }
      if (payload.user) {
        localStorage.setItem("user", JSON.stringify(payload.user));
      }

      return payload;
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Error al registrar usuario";
      return rejectWithValue(msg);
    }
  }
);

// --- Slice ---

const initialToken = localStorage.getItem("token") || null;
let initialUser = null;
try {
  const u = localStorage.getItem("user");
  initialUser = u ? JSON.parse(u) : null;
} catch (e) {
  initialUser = null;
}

const slice = createSlice({
  name: "auth",
  initialState: {
    user: initialUser,
    token: initialToken,
    isAuthenticated: Boolean(initialToken),
    loading: false,
    error: null,
    captcha: null
  },
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    // optional: clear captcha (if you want)
    clearCaptcha(state) {
      state.captcha = null;
    }
  },
  extraReducers(builder) {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.user = payload.user || state.user;
        state.token = payload.token || state.token;
        state.isAuthenticated = Boolean(state.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })

      // register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        // still clear client-side on failure
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload || action.error?.message;
      })

      // captcha
      .addCase(getCaptcha.pending, (state) => {
        state.error = null;
      })
      .addCase(getCaptcha.fulfilled, (state, action) => {
        // action.payload expected: { captchaId, question }
        state.captcha = action.payload || null;
      })
      .addCase(getCaptcha.rejected, (state, action) => {
        state.captcha = null;
        state.error = action.payload || action.error?.message;
      });
  }
});

export const { clearAuthError, clearError, clearCaptcha } = slice.actions;
export default slice.reducer;
