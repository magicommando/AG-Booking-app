import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";

import { AppStateProvider, useAppState, useAppDispatch } from "./state/AppState";
import { BookingProvider } from "./state/BookingState";

import Login from "./components/Auth/LoginPage";
import Register from "./components/Auth/RegisterPage";
import AdminRoute from "./routes/AdminRoute";

import Navbar from "./components/Layout/Navbar";
import Sidebar from "./components/Layout/Sidebar";

import LandingPage from "./components/LandingPage";
import ClientDashboard from "./components/Dashboard/ClientDashboard";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import AdminLogs from "./components/Dashboard/AdminLogs";

import ServicePage from "./Pages/booking/ServicePage";
import FirearmPage from "./Pages/booking/FirearmPage";
import DateAndTimePage from "./Pages/booking/DateAndTimePage";
import ConfirmPage from "./Pages/booking/ConfirmPage";
import SuccessPage from "./Pages/booking/SuccessPage";

import AppointmentDetails from "./components/Appointments/AppointmentDetails";
import ClientAppointmentList from "./components/Appointments/ClientAppointmentList";
import AdminBookingList from "./components/Booking/AdminBookingList";
import AdminBookingDetails from "./components/Booking/AdminBookingDetails";
import AdminSchedule from "./components/Booking/AdminSchedule";

import FirearmManager from "./components/Firearms/FirearmManager";
import AdminFirearmList from "./components/Firearms/AdminFirearmList";
import FirearmDetails from "./components/Firearms/FirearmDetails";

import InventoryManager from "./components/Inventory/InventoryManager";
import InventoryTable from "./components/Inventory/InventoryTable";
import InventoryItemForm from "./components/Inventory/InventoryItemForm";

import MessageCenter from "./components/Messages/MessagingCenter";
import ConversationView from "./components/Messages/ConversationView";

import WorkOrderManager from "./components/WorkOrders/WorkOrderManager";
import WorkOrderDetails from "./components/WorkOrders/WorkOrderDetails";

import AIAnalyzer from "./components/AI/AIAnalyzer";

import SettingsPage from "./components/Settings/SettingsPage";

function ProtectedRoute({ children }) {
  const { token } = useAppState();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRouter() {
  const dispatch = useAppDispatch();
  const { role } = useAppState();
  const location = useLocation();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      dispatch({ type: "SET_TOKEN", payload: savedToken });
    }
  }, [dispatch]);

  useEffect(() => {
    const surface = role === "gunsmith"
      ? "surface-admin"
      : role === "client"
        ? "surface-client"
        : "surface-public";

    document.body.classList.remove("surface-admin", "surface-client", "surface-public");
    document.body.classList.add(surface);
    document.body.dataset.surfacePath = location.pathname;

    return () => {
      document.body.classList.remove(surface);
      delete document.body.dataset.surfacePath;
    };
  }, [location.pathname, role]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/booking" element={<Navigate to="/booking/service" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/firearms"
        element={
          <AdminRoute>
            <AdminFirearmList />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/firearms/:id"
        element={
          <AdminRoute>
            <FirearmDetails />
          </AdminRoute>
        }
      />
      <Route
        path="/booking/service"
        element={
          <ProtectedRoute>
            <ServicePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/firearm"
        element={
          <ProtectedRoute>
            <FirearmPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/datetime"
        element={
          <ProtectedRoute>
            <DateAndTimePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/confirm"
        element={
          <ProtectedRoute>
            <ConfirmPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/success"
        element={
          <ProtectedRoute>
            <SuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/:id"
        element={
          <ProtectedRoute>
            <AppointmentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments/:id"
        element={
          <AdminRoute>
            <AdminBookingDetails />
          </AdminRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <ClientAppointmentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <AdminRoute>
            <AdminBookingList />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/schedule"
        element={
          <AdminRoute>
            <AdminSchedule />
          </AdminRoute>
        }
      />
      <Route
        path="/firearms"
        element={
          <ProtectedRoute>
            <FirearmManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/firearms/:id"
        element={
          <ProtectedRoute>
            <FirearmDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <AdminRoute>
            <InventoryManager />
          </AdminRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <AdminRoute>
            <Navigate to="/admin/inventory" replace />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/inventory/table"
        element={
          <AdminRoute>
            <InventoryTable />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/inventory/new"
        element={
          <AdminRoute>
            <InventoryItemForm />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/inventory/edit/:id"
        element={
          <AdminRoute>
            <InventoryItemForm />
          </AdminRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MessageCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages/:conversationId"
        element={
          <ProtectedRoute>
            <ConversationView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/workorders"
        element={
          <AdminRoute>
            <WorkOrderManager />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/workorders/:id"
        element={
          <AdminRoute>
            <WorkOrderDetails />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <AdminRoute>
            <AdminLogs />
          </AdminRoute>
        }
      />
      <Route
        path="/ai/analyze"
        element={
          <ProtectedRoute>
            <AIAnalyzer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/diagnostic"
        element={
          <ProtectedRoute>
            <Navigate to="/ai/analyze" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/photo"
        element={
          <ProtectedRoute>
            <Navigate to="/ai/analyze" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/inventory"
        element={
          <ProtectedRoute>
            <Navigate to="/ai/analyze" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/workorder"
        element={
          <ProtectedRoute>
            <Navigate to="/ai/analyze" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BookingProvider>
      <AppStateProvider>
        <BrowserRouter>
          <Navbar />
          <div className="app-layout">
            <Sidebar />
            <div className="app-content">
              <AppRouter />
            </div>
          </div>
        </BrowserRouter>
      </AppStateProvider>
    </BookingProvider>
  );
}
