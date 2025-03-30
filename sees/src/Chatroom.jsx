import React, { useState } from 'react';
import './stylesheet.css';
import useSocket from './hooks/useSocket';
import ChatApp from './components/ChatApp';
import Login from './components/Login';

function Chatroom() {
  const client = useSocket();

    return (
        <div className="app">
            { client.user ? <ChatApp client={client} /> : <Login logIn={client.logIn} />}
        </div>
    );
} 

export default Chatroom;
