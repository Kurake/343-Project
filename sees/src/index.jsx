import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import Layout from './Layout';
import Chatroom from './Chatroom';
import Events from './Events';
import EventDetails from './EventDetails';
import reportWebVitals from './reportWebVitals';
import 'semantic-ui-css/semantic.min.css';
import PaymentPage from './PaymentPage';
import { UserProvider } from './UserContext';
import { EventsProvider } from './EventsContext';
import Analytics from './Analytics';
import PrivateRoute from './PrivateRoute'; // ✅

export default function App() {
  return (
    <UserProvider>
      <EventsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route
                path="chatroom"
                element={
                  <PrivateRoute>
                    <Chatroom />
                  </PrivateRoute>
                }
              />
              <Route
                path="events"
                element={
                  <PrivateRoute>
                    <Events />
                  </PrivateRoute>
                }
              />
              <Route
                path="/event/:id"
                element={
                  <PrivateRoute>
                    <EventDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/event/:eventId/payment"
                element={
                  <PrivateRoute>
                    <PaymentPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="analytics"
                element={
                  <PrivateRoute>
                    <Analytics />
                  </PrivateRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </EventsProvider>
    </UserProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
