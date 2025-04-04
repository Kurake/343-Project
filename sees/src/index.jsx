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
import Analytics from './Analytics'; // Import Analytics

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="chatroom" element={<Chatroom />} />
            <Route path="events" element={<Events />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/event/:eventId/payment" element={<PaymentPage />} />
            <Route path="analytics" element={<Analytics />} /> {/* ✅ New Route */}
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional performance monitoring
reportWebVitals();
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);