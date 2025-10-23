import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Login from './components/Auth/Login';
import { Layout } from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import SalesList from './components/Sales/SalesList';
import SaleForm from './components/Sales/SaleForm';
import UsersList from './components/Users/UsersList';
import UserForm from './components/Users/UserForm';
import { PrivateRoute } from './components/Auth/PrivateRoute';
import { AdminRoute } from './components/Auth/AdminRoute';
import Register from './components/Auth/Register';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="sales" element={<SalesList />} />
            <Route path="sales/new" element={<SaleForm />} />
            <Route path="sales/edit/:id" element={<SaleForm />} />
            <Route path="users" element={<AdminRoute><UsersList /></AdminRoute>} />
            <Route path="users/new" element={<AdminRoute><UserForm /></AdminRoute>} />
            <Route path="users/edit/:id" element={<AdminRoute><UserForm /></AdminRoute>} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;