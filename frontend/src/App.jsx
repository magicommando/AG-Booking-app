import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import { AppStateProvider, useAppState, useAppDispatch } from "./state/AppState";
import { BookingProvider } from "./state/BookingState";

import Loader from "./components/UI/Loader";
import ErrorBanner from "./components/UI/ErrorBanner";

import Login from "./components/Auth/LoginPage";
import Register from "./components/Auth/RegisterPage";
import AdminRoute from "./routes/AdminRoute";

import Navbar from "./components/Layout/Navbar";
import Sidebar from "./components/Layout/Sidebar";

import LandingPage from "./components/LandingPage";
import ClientDashboard from "./components/Dashboard/ClientDashboard";
import AdminDashboard from "./components/Dashboard/AdminDashboard";

import Step1Service from "./components/Booking/step1Service";
import Step2Firearm from "./components/Booking/step2Firearm";
import Step3DateTime from "./components/Booking/step3DateTime";
import Step4Confirm from "./components/Booking/step4Confirm";

import AppointmentDetails from "./components/Appointments/AppointmentDetails";
import ClientAppointmentList from "./components/Appointments/ClientAppointmentList";
import AdminAppointmentList from "./components/Appointments/AdminAppointmentList";

import FirearmManager from "./components/Firearms/FirearmManager";
import AdminFirearmList from "./components/Firearms/AdminFirearmList";

import InventoryManager from "./components/Inventory/InventoryManager";
import InventoryTable from "./components/Inventory/InventoryTable";
import InventoryItemForm from "./Pages/admin/InventoryItemForm";

import MessageCenter from "./components/Messages/MessagingCenter";
import ConversationView from "./components/Messages/ConversationView";

import WorkOrderManager from "./components/WorkOrders/WorkOrderManager";
import WorkOrderDetails from "./components/WorkOrders/WorkOrderDetails";

import AIAnalyzer from "./components/AI/AIAnalyzer";
import AIDiagnostic from "./components/AI/AIDiagnostic";
import AIPhotoUpload from "./components/AI/AIPhotoUpload";
import AIInventoryScan from "./components/AI/AIInventoryScan";
import AIWorkOrderAssist from "./components/AI/AIWorkOrderAssist";

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

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      dispatch({ type: "SET_TOKEN", payload: savedToken });
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<LandingPage />} />
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
        path="/booking/service"
        element={
          <ProtectedRoute>
            <Step1Service />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/firearm"
        element={
          <ProtectedRoute>
            <Step2Firearm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/datetime"
        element={
          <ProtectedRoute>
            <Step3DateTime />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/confirm"
        element={
          <ProtectedRoute>
            <Step4Confirm />
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
            <AdminAppointmentList />
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
        path="/inventory"
        element={
          <AdminRoute>
            <InventoryManager />
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
            <AIDiagnostic />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/photo"
        element={
          <ProtectedRoute>
            <AIPhotoUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/inventory"
        element={
          <ProtectedRoute>
            <AIInventoryScan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai/workorder"
        element={
          <ProtectedRoute>
            <AIWorkOrderAssist />
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
