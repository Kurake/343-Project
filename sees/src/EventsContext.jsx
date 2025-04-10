// src/EventsContext.jsx
import React, { useEffect, createContext, useContext, useState } from 'react';
import axios from "axios";

const EventsContext = createContext();

export const EventsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const transformEvents = (data) => {
    return data.map(event => ({
      id: event.eventid,
      title: event.title,
      startDate: event.startdate.split('T')[0],
      endDate: event.enddate.split('T')[0],
      image: event.image || "",
      organizers: event.organizers || [],
      price: event.price || 0,
      attendeesCount: event.attendeescount || 0,
      revenue: event.revenue || 0,
    }));
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/api/events");
      const transformed = transformEvents(response.data);
      setEvents(transformed);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <EventsContext.Provider value={{ events, setEvents, loading, error, fetchEvents }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => useContext(EventsContext);
