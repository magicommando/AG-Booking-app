import { createContext, useContext, useState } from "react";

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [service, setService] = useState(null);
  const [firearm, setFirearm] = useState(null);
  const [dateTime, setDateTime] = useState(null);

  return (
    <BookingContext.Provider
      value={{
        service,
        setService,
        firearm,
        setFirearm,
        dateTime,
        setDateTime
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
