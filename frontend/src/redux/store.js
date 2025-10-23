import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import saleReducer from "./slices/saleSlice";
import userReducer from "./slices/userSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    sales: saleReducer,
    users: userReducer,
  },
});

export default store;
