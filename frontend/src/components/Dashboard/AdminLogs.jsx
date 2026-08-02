import { useEffect, useMemo, useState } from "react";
import { useAppState } from "../../state/AppState";
import api from "../../services/api";
import "./AdminLogs.css";

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "custom", label: "Custom" }
];

const PAGE_SIZE = 9;

function classifyLog(searchBlob) {
  if (searchBlob.includes("low stock") || searchBlob.includes("reorder") || searchBlob.includes("inventory")) {
    return "inventory";
  }

  if (searchBlob.includes("diagnostics") || searchBlob.includes("recommendations") || searchBlob.includes("labor")) {
    return "diagnostics";
  }

  return "other";
}

function toInputDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatAiResponse(raw) {
  if (!raw) return "";

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return raw;
    }
  }

  try {
    return JSON.stringify(raw, null, 2);
  } catch {
    return String(raw);
  }
}

export default function AdminLogs() {
  const { token } = useAppState();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logType, setLogType] = useState("all");
  const [dateRange, setDateRange] = useState("7d");
  const [keyword, setKeyword] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadLogs() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await api.get("/ai/logs/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = Array.isArray(res.data) ? res.data : [];
        setLogs(data);
      } catch (err) {
        console.error("Error loading AI logs:", err);
        setError(err.response?.data?.message || err.response?.data?.error || "Unable to load logs.");
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, [token]);

  const preparedLogs = useMemo(() => {
    return logs.map((log) => {
      const formattedResponse = formatAiResponse(log.aiResponse);
      const createdAtMs = new Date(log.createdAt).getTime();
      const inputText = typeof log.inputText === "string" ? log.inputText : "";
      const searchBlob = `${inputText} ${formattedResponse}`.toLowerCase();

      return {
        ...log,
        formattedResponse,
        createdAtMs,
        searchBlob,
        logType: classifyLog(searchBlob)
      };
    });
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const now = Date.now();

    return preparedLogs.filter((log) => {
      if (logType !== "all" && log.logType !== logType) {
        return false;
      }

      if (keyword.trim()) {
        const needle = keyword.trim().toLowerCase();
        if (!log.searchBlob.includes(needle)) {
          return false;
        }
      }

      if (dateRange === "24h" && log.createdAtMs < now - (24 * 60 * 60 * 1000)) {
        return false;
      }

      if (dateRange === "7d" && log.createdAtMs < now - (7 * 24 * 60 * 60 * 1000)) {
        return false;
      }

      if (dateRange === "30d" && log.createdAtMs < now - (30 * 24 * 60 * 60 * 1000)) {
        return false;
      }

      if (dateRange === "custom") {
        const fromMs = customFrom ? new Date(`${customFrom}T00:00:00`).getTime() : null;
        const toMs = customTo ? new Date(`${customTo}T23:59:59`).getTime() : null;

        if (fromMs && log.createdAtMs < fromMs) {
          return false;
        }

        if (toMs && log.createdAtMs > toMs) {
          return false;
        }
      }

      return true;
    });
  }, [customFrom, customTo, dateRange, keyword, logType, preparedLogs]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));

  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, page]);

  useEffect(() => {
    setPage(1);
  }, [dateRange, keyword, logType, customFrom, customTo]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (loading) {
    return (
      <div className="adminlogs-container">
        <h2>System Logs</h2>
        <p>Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="adminlogs-container">
      <h2>System Logs</h2>
      <p className="adminlogs-subtitle">AI diagnostics, inventory alerts, and system activity logs.</p>

      <section className="adminlogs-filters">
        <label>
          <span>Log Type</span>
          <select value={logType} onChange={(e) => setLogType(e.target.value)}>
            <option value="all">All</option>
            <option value="inventory">Inventory Alerts</option>
            <option value="diagnostics">Diagnostics</option>
            <option value="other">Other Activity</option>
          </select>
        </label>

        <label>
          <span>Date Range</span>
          <select value={dateRange} onChange={(e) => {
            const value = e.target.value;
            setDateRange(value);
            if (value !== "custom") {
              setCustomFrom("");
              setCustomTo("");
            }
          }}>
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="adminlogs-keyword">
          <span>Keyword</span>
          <input
            type="text"
            value={keyword}
            placeholder="Search logs..."
            onChange={(e) => setKeyword(e.target.value)}
          />
        </label>
      </section>

      {dateRange === "custom" ? (
        <section className="adminlogs-filters adminlogs-filters-custom">
          <label>
            <span>From</span>
            <input
              type="date"
              value={customFrom}
              max={toInputDate(new Date())}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
          </label>
          <label>
            <span>To</span>
            <input
              type="date"
              value={customTo}
              max={toInputDate(new Date())}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </label>
        </section>
      ) : null}

      <p className="adminlogs-count">Showing {paginatedLogs.length} of {filteredLogs.length} log entries</p>

      {error ? <p className="adminlogs-error">{error}</p> : null}

      {!error && filteredLogs.length === 0 ? (
        <p>No logs found.</p>
      ) : null}

      {paginatedLogs.length > 0 ? (
        <section className="adminlogs-section">
          <div className="adminlogs-grid">
            {paginatedLogs.map((log) => (
              <article key={log._id} className="adminlogs-card">
                <div className="adminlogs-card-header">
                  <p className="adminlogs-time">{new Date(log.createdAt).toLocaleString()}</p>
                  <span className={`adminlogs-badge ${log.logType}`}>{log.logType}</span>
                </div>
                {log.inputText ? <p className="adminlogs-input">Input: {log.inputText}</p> : null}
                <pre className="adminlogs-payload">{log.formattedResponse}</pre>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {filteredLogs.length > PAGE_SIZE ? (
        <section className="adminlogs-pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </button>
        </section>
      ) : null}
    </div>
  );
}
