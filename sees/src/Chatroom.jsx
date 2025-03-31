import React, { useState } from 'react';
import './stylesheet.css';
import useSocket from './hooks/useSocket';
import ChatApp from './components/ChatApp';
import Login from './components/Login';
import socket from './hooks/useSocket';

function Chatroom() {
  const client = useSocket();
  // Even though there are two connections, const client isn't the source of the issues
  return (
      <div className="app">
          { client.user ? <ChatApp client={client} /> : <Login logIn={client.logIn} />}
      </div>
  );
} 

export default Chatroom;
