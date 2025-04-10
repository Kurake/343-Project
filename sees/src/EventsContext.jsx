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
      funding: 250,
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
      funding: 200,
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
      funding: 0,
    },
  ]);

  const [loading, setLoading] = useState(true);     // Make sure this is declared
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
      funding: event.funding || 0,
      isVIP: event.isvip || false,
      isCertification: event.iscertification || false,
      isDiscounted: event.isdiscounted || false,
    }));
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/api/events");
      console.log(response.data);
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
