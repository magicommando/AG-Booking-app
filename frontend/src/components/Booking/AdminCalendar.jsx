import React, { useState } from "react";
import "./AdminCalendar.css";

export default function AdminCalendar({ onSelectDay }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = getDaysInMonth(month, year);

    const calendar = [];
    let dayCounter = 1;

    for (let week = 0; week < 6; week++) {
      const row = [];

      for (let day = 0; day < 7; day++) {
        if (week === 0 && day < firstDay) {
          row.push(null);
        } else if (dayCounter > daysInMonth) {
          row.push(null);
        } else {
          row.push(new Date(year, month, dayCounter));
          dayCounter++;
        }
      }

      calendar.push(row);
    }

    return calendar;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  return (
    <div className="admin-calendar">
      <div className="calendar-header">
        <button onClick={prevMonth} className="cal-nav-btn">◀</button>
        <h3>
          {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
        </h3>
        <button onClick={nextMonth} className="cal-nav-btn">▶</button>
      </div>

      <div className="calendar-grid">
        {daysOfWeek.map((d) => (
          <div key={d} className="calendar-day-header">{d}</div>
        ))}

        {generateCalendar().map((week, i) => (
          <React.Fragment key={i}>
            {week.map((day, j) => (
              <div
                key={j}
                className={`calendar-cell ${day ? "active-day" : "empty-day"}`}
                onClick={() => day && onSelectDay(day.toISOString().split("T")[0])}
              >
                {day ? day.getDate() : ""}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
