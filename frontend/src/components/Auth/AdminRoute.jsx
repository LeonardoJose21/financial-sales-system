import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  return user?.role === "Administrador" ? children : <Navigate to="/dashboard" />;
};
