// src/EventsContext.jsx
import React, { useEffect, createContext, useContext, useState } from 'react';
import axios from "axios";

const EventsContext = createContext();

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Conference",
      startDate: "2025-04-15",
      endDate: "2025-04-17",
      image: "/images/logo192.png",
      organizers: ["organizer1@example.com"],
      price: 9.99,
      attendeesCount: 120,
      revenue: 1198.80,
    },
    {
      id: 2,
      title: "Workshop",
      startDate: "2025-05-10",
      endDate: "2025-05-12",
      image: "/images/logo512.png",
      organizers: ["organizer2@example.com"],
      price: 2.99,
      attendeesCount: 80,
      revenue: 239.20,
    },
    {
      id: 3,
      title: "Seminar",
      startDate: "2025-06-20",
      endDate: "2025-06-21",
      image: "",
      organizers: ["organizer3@example.com"],
      price: 4.99,
      attendeesCount: 60,
      revenue: 299.40,
    },
  ]);

  const [loading, setLoading] = useState(true);     // Make sure this is declared
  const [error, setError] = useState(null); 

  const transformEvents = (data) => {
    return data.map(event => ({
      id: event.EventID,
      title: event.Title,
      startDate: event.StartDate.split('T')[0], // remove time
      endDate: event.EndDate.split('T')[0],     // remove time
      image: "", // You can replace this later
      organizers: [], // Fill this in if you fetch organizer emails separately
      price: event.Price,
      attendeesCount: event.AttendeesCount,
      revenue: event.Revenue,
    }));
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/events"); // update URL to match your backend
        const transformed = transformEvents(response.data);
        console.log(transformed);
        setEvents(transformed);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <EventsContext.Provider value={{ events, setEvents }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => useContext(EventsContext);
