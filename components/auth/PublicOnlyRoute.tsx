import AuthService from "@/services/auth.service";
import { Navigate, Outlet } from "react-router-dom";

export default function PublicOnlyRoute() {
  if (AuthService.isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
