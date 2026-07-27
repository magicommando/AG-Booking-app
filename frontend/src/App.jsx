import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

// Global State
import { AppStateProvider, useAppState, useAppDispatch } from "./state/AppState";

// Auth
import Login from "./components/Auth/LoginPage";
import Register from "./components/Auth/RegisterPage";

// Navbar
import Navbar from "./components/Layout/Navbar";

// Dashboard
import ClientDashboard from "./components/Dashboard/ClientDashboard";

// landing page
import LandingPage from "./components/LandingPage";

// Booking Steps
import Step1Service from "./components/Booking/step1Service";
import Step2Firearm from "./components/Booking/step2Firearm";
import Step3DateTime from "./components/Booking/step3DateTime";
import Step4Confirm from "./components/Booking/step4Confirm";

// Appointment Details
import AppointmentDetails from "./components/Appointments/AppointmentDetails";

// Firearm Management
import FirearmManager from "./components/Firearms/FirearmManager";

// Message Center
import MessageCenter from "./components/Messages/MessagingCenter";
import ConversationView from "./components/Messages/ConversationView";

// AI Tools
import AIAnalyzer from "./components/AI/AIAnalyzer";
import AIDiagnostic from "./components/AI/AIDiagnostic";
import AIPhotoUpload from "./components/AI/AIPhotoUpload";
import AIInventoryScan from "./components/AI/AIInventoryScan";
import AIWorkOrderAssist from "./components/AI/AIWorkOrderAssist";


// -----------------------------
// Protected Route Wrapper
// -----------------------------
// login route wrapper
function ProtectedRoute({ children }) {
  const { token } = useAppState();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

//  admin route/gunsmith wrapper
function AdminRoute({ children }) {
  const { token, role } = useAppState();
  if (!token || role !== "gunsmith") return <Navigate to="/dashboard" replace />;
  return children;
}


// -----------------------------
// Main App Router
// -----------------------------
function AppRouter() {
  const { token } = useAppState();
  const dispatch = useAppDispatch();

  // Load token from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      dispatch({ type: "SET_TOKEN", payload: savedToken });
    }
  }, [dispatch]);

  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

    

      {/* ClientDashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Booking Steps */}
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

        {/* Appointment Details */}
        <Route
          path="/appointments/:id"
          element={
            <ProtectedRoute>
              <AppointmentDetails />
            </ProtectedRoute>
          }
      />

        {/* Firearm Management */}
        <Route
          path="/firearms"
          element={
            <ProtectedRoute>
              <FirearmManager />
            </ProtectedRoute>
          }
      />

          {/* Inventory Management */}
          <Route
            path="/inventory"
            element={
              <AdminRoute>
                <InventoryManager />
              </AdminRoute>
            }
      />


        {/* Message Center */}
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

        {/* Work Order Manager */}
        <Route
          path="/admin/workorders"
          element={
            <AdminRoute>
              <WorkOrderManager />
            </AdminRoute>
          }
        />

        {/* Work Order Details */}
        <Route
          path="/admin/workorders/:id"
          element={
            <AdminRoute>
              <WorkOrderDetails />
            </AdminRoute>
          }
        />

        {/* AI Analyzer */}
        <Route
          path="/ai/analyze"
          element={
            <ProtectedRoute>
              <AIAnalyzer />
            </ProtectedRoute>
          }
        />

        {/* AI Diagnostic */}
        <Route
          path="/ai/diagnostic"
          element={
            <ProtectedRoute>
              <AIDiagnostic />
            </ProtectedRoute>
          }
        />

      {/* AI Photo Upload */}
      <Route
        path="/ai/photo"
        element={
          <ProtectedRoute>
            <AIPhotoUpload />
          </ProtectedRoute>
        }
      />

      {/* AI Inventory Scan */}
      <Route
        path="/ai/inventory"
        element={
          <ProtectedRoute>
            <AIInventoryScan />
          </ProtectedRoute>
        }
      />

      {/* AI WorkOrder Auto‑Assist */}
      <Route
        path="/ai/workorder"
        element={
          <ProtectedRoute>
            <AIWorkOrderAssist />
          </ProtectedRoute>
        }
      />

      {/* Settings */}
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


// -----------------------------
// App Wrapper with Global State
// -----------------------------
export default function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Navbar />
        <AppRouter />
      </BrowserRouter>
    </AppStateProvider>
  );
}
