import { Navigate } from "react-router-dom";
import { useAppState } from "../state/AppState";

export default function AdminRoute({ children }) {
  const { user } = useAppState();

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  return children;
}
