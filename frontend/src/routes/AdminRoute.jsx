import { Navigate } from "react-router-dom";
import { useAppState } from "../state/AppState";

export default function AdminRoute({ children }) {
  const { token, user } = useAppState();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "gunsmith" && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
