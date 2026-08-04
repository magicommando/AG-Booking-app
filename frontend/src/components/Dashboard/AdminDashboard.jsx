import { useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "../../state/AppState";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { fetchInventoryItems } from "../../services/inventoryService";
import AnalyzerAvatar from "../../Pages/analyzer/AnalyzerAvatar";
import BillingDashboardCard from "../Billing/BillingDashboardCard";
import "./AdminDashboard.css";

const BOOKING_WINDOW_OPTIONS = [12, 24, 48, 168];

function formatBookingWindowLabel(hours) {
  if (hours === 168) return "7d";
  return `${hours}h`;
}

function createAlertTone(frequency, startAt, duration, audioContext) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(0.035, startAt + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

function playDashboardAlert() {
  if (typeof window === "undefined") return;

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return;

  const audioContext = new AudioContextCtor();
  const now = audioContext.currentTime;

  createAlertTone(660, now, 0.08, audioContext);
  createAlertTone(880, now + 0.11, 0.11, audioContext);

  window.setTimeout(() => {
    audioContext.close().catch(() => {});
  }, 500);
}

const DASHBOARD_CARDS = [
  {
    title: "Appointments",
    description: "View today’s appointments, check-ins, and upcoming work.",
    to: "/admin/appointments",
    cta: "View Appointments"
  },
  {
    title: "Work Orders",
    description: "Manage active repairs, update progress, and finalize jobs.",
    to: "/admin/workorders",
    cta: "Manage Work Orders"
  },
  {
    title: "Firearms",
    description: "View client firearms, details, and repair history.",
    to: "/admin/firearms",
    cta: "View Firearms"
  },
  {
    title: "Inventory",
    description: "Track parts, tools, supplies, and low-stock alerts.",
    to: "/admin/inventory",
    cta: "Manage Inventory"
  },
  {
    title: "AI Diagnostics",
    description: "Run AI analysis on client issues or uploaded photos.",
    to: "/ai/analyze",
    cta: "Run Diagnostic"
  },
  {
    title: "AI Inventory Scan",
    description: "Use AI to analyze inventory and detect missing parts.",
    to: "/ai/analyze",
    cta: "Open Analyzer"
  },
  {
    title: "Messages",
    description: "Communicate with clients and send repair updates.",
    to: "/messages",
    cta: "Open Messages"
  },
  {
    title: "System Logs",
    description: "View AI logs, error logs, and backend activity.",
    to: "/admin/logs",
    cta: "View Logs"
  }
];

export default function AdminDashboard() {
  const { user, token } = useAppState();
  const [loadingSignals, setLoadingSignals] = useState(true);
  const [signalError, setSignalError] = useState("");
  const [lowStockItems, setLowStockItems] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [newBookings, setNewBookings] = useState([]);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [bookingWindowHours, setBookingWindowHours] = useState(24);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(false);
  const previousCountsRef = useRef({ lowStock: 0, newBookings: 0, initialized: false });

  const userId = user?.id || user?._id;

  useEffect(() => {
    async function loadSignals() {
      if (!token || !userId) {
        setLowStockItems([]);
        setUpcomingDeadlines([]);
        setNewBookings([]);
        setLoadingSignals(false);
        return;
      }

      try {
        setLoadingSignals(true);
        setSignalError("");

        const [inventory, appointmentsRes] = await Promise.all([
          fetchInventoryItems(token),
          api.get(`/appointments/gunsmith/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
        const now = Date.now();
        const bookingWindowStart = now - (bookingWindowHours * 60 * 60 * 1000);

        const lowStock = (Array.isArray(inventory) ? inventory : []).filter((item) => item?.lowStockAlert);

        const scheduled = appointments
          .filter((appt) => {
            if (!appt?.date) return false;
            if (["denied", "cancelled", "completed"].includes(appt.status)) return false;
            return new Date(appt.date).getTime() >= now;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const createdRecently = appointments
          .filter((appt) => {
            if (!appt?.createdAt) return false;
            const createdAt = new Date(appt.createdAt).getTime();
            return createdAt >= bookingWindowStart;
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setLowStockItems(lowStock);
        setUpcomingDeadlines(scheduled.slice(0, 5));
        setNewBookings(createdRecently.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard AI signals:", err);
        setSignalError("Unable to load live alert feed.");
      } finally {
        setLoadingSignals(false);
      }
    }

    loadSignals();
    const intervalId = setInterval(loadSignals, 60000);
    return () => clearInterval(intervalId);
  }, [bookingWindowHours, token, userId]);

  useEffect(() => {
    const previous = previousCountsRef.current;
    const nextLowStock = lowStockItems.length;
    const nextNewBookings = newBookings.length;

    if (!previous.initialized) {
      previousCountsRef.current = {
        lowStock: nextLowStock,
        newBookings: nextNewBookings,
        initialized: true
      };
      return;
    }

    const hasNewLowStock = nextLowStock > previous.lowStock;
    const hasNewBookings = nextNewBookings > previous.newBookings;

    if (audioAlertsEnabled && (hasNewLowStock || hasNewBookings)) {
      playDashboardAlert();
    }

    previousCountsRef.current = {
      lowStock: nextLowStock,
      newBookings: nextNewBookings,
      initialized: true
    };
  }, [audioAlertsEnabled, lowStockItems.length, newBookings.length]);

  const dialogueLines = useMemo(() => {
    if (loadingSignals) {
      return [{ severity: "info", text: "Booting tactical feed... scanning stock, bookings, and deadlines." }];
    }

    if (signalError) {
      return [{ severity: "critical", text: "Comms disruption detected. Unable to sync dashboard alerts." }];
    }

    const lines = [];

    if (lowStockItems.length > 0) {
      const names = lowStockItems.slice(0, 3).map((item) => item.name || item.productName || "Part");
      lines.push({
        severity: lowStockItems.length >= 3 ? "critical" : "warning",
        text: `Low stock warning: ${names.join(", ")}${lowStockItems.length > 3 ? ", and more." : "."}`
      });
    } else {
      lines.push({ severity: "info", text: "Inventory check complete. No critical low-stock items." });
    }

    if (upcomingDeadlines.length > 0) {
      const next = upcomingDeadlines[0];
      const client = next?.clientId ? `${next.clientId.firstName || ""} ${next.clientId.lastName || ""}`.trim() : "Client";
      const hoursUntil = Math.round((new Date(next.date).getTime() - Date.now()) / (60 * 60 * 1000));
      lines.push({
        severity: hoursUntil <= 24 ? "warning" : "info",
        text: `Upcoming booked deadline: ${new Date(next.date).toLocaleString()} with ${client || "client"}.`
      });
    } else {
      lines.push({ severity: "info", text: "No upcoming booked deadlines in the active queue." });
    }

    if (newBookings.length > 0) {
      lines.push({
        severity: newBookings.length >= 3 ? "warning" : "info",
        text: `New booking activity detected: ${newBookings.length} in the last ${formatBookingWindowLabel(bookingWindowHours)}.`
      });
    } else {
      lines.push({ severity: "info", text: `No new bookings in the last ${formatBookingWindowLabel(bookingWindowHours)}.` });
    }

    return lines;
  }, [bookingWindowHours, loadingSignals, lowStockItems, newBookings, signalError, upcomingDeadlines]);

  const activeDialogue = dialogueLines[activeLineIndex] || { severity: "info", text: "Alert feed standing by." };

  useEffect(() => {
    setActiveLineIndex(0);
  }, [dialogueLines]);

  useEffect(() => {
    if (dialogueLines.length <= 1) return undefined;

    const intervalId = setInterval(() => {
      setActiveLineIndex((prev) => (prev + 1) % dialogueLines.length);
    }, 5500);

    return () => clearInterval(intervalId);
  }, [dialogueLines]);

  return (
    <div className="admindash-container">

      <header className="admindash-header">
        <h2>Gunsmith Dashboard</h2>
        <p className="admindash-subtitle">
          Welcome back, {user?.name || user?.firstName || "Gunsmith"}. Manage repairs, inventory, and AI diagnostics.
        </p>
      </header>

      <section className="admindash-layout">
        <div className="admindash-cards-panel">
          {DASHBOARD_CARDS.map((card) => (
            <div key={card.title} className="admindash-card">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <Link to={card.to} className="admindash-btn">{card.cta}</Link>
            </div>
          ))}
          <div className="admindash-card">
            <BillingDashboardCard />
          </div>
        </div>

        <section className="admindash-ai-panel">
          <div className="admindash-ai-avatar-wrap">
            <AnalyzerAvatar statusText="GUNSMITH OPS AI // ALERT FEED" />
          </div>

          <div className="admindash-ai-controls">
            <label className="admindash-control-group" htmlFor="booking-window-select">
              <span>New Booking Window</span>
              <select
                id="booking-window-select"
                className="admindash-control-input"
                value={bookingWindowHours}
                onChange={(e) => setBookingWindowHours(Number(e.target.value))}
              >
                {BOOKING_WINDOW_OPTIONS.map((hours) => (
                  <option key={hours} value={hours}>
                    {formatBookingWindowLabel(hours)}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className={`admindash-audio-toggle ${audioAlertsEnabled ? "enabled" : "disabled"}`}
              onClick={() => setAudioAlertsEnabled((prev) => !prev)}
            >
              Audio Alerts: {audioAlertsEnabled ? "On" : "Off"}
            </button>
          </div>

          <div className={`admindash-rpg-box severity-${activeDialogue.severity}`} role="status" aria-live="polite">
            <p className="admindash-rpg-speaker">ANALYZER AVATAR</p>
            <p className={`admindash-rpg-line severity-${activeDialogue.severity}`}>{activeDialogue.text}</p>
            <p className="admindash-rpg-prompt">▶ press on</p>
          </div>

          <div className="admindash-ai-metrics">
            <div className={`admindash-ai-chip ${lowStockItems.length > 0 ? "severity-warning" : "severity-info"}`}>
              <span>Low Stock</span>
              <strong>{lowStockItems.length}</strong>
            </div>
            <div className={`admindash-ai-chip ${upcomingDeadlines.length > 0 ? "severity-warning" : "severity-info"}`}>
              <span>Upcoming Deadlines</span>
              <strong>{upcomingDeadlines.length}</strong>
            </div>
            <div className="admindash-ai-chip severity-info">
              <span>New Bookings ({formatBookingWindowLabel(bookingWindowHours)})</span>
              <strong>{newBookings.length}</strong>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
