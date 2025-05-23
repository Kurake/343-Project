import { useEffect, useState } from "react";
import io from 'socket.io-client';

const socket = io("http://localhost:4000", {
  query: {
    sessionId: localStorage.getItem("sessionId") || undefined,
    screenname: "user_screen_name",
  }
});

var flipflop = true;

const useSocket = () => {

    let u, a;
    const [user, setUser] = useState();
    const [users, setUsers] = useState();
    const [rooms, setRooms] = useState();
    const [chat, setChat] = useState({});

    const [userTyping, setUserTyping] = useState();
    const [typingTimer, setTypingTimer] = useState();


    useEffect(() => {
        
        // get session and connect with session as auth
        const sessionId = sessionStorage.getItem("sessionId");
        if (sessionId) {
            socket.auth = { sessionId };
            socket.connect();
            console.log("Trying to reconnect with sessionId");
        }


        socket.on("connect", () => {
            if(flipflop){
                console.log("Connected to server successfully");
            
                if (!sessionId)
                    socket.emit("user", { screenname: u, avatar: a });
    
                socket.emit("setUpUser");
            }
            flipflop = !flipflop
        });


        socket.on("session", ({ sessionId, userId }) => {
            socket.auth = { sessionId };
            sessionStorage.setItem("sessionId", sessionId);
            socket.userId = userId;
        });


        socket.on("user", (sUser) => {
            setUser(sUser);
        });


        socket.on("users", (sUsers) => {
            setUsers(sUsers);
        });


        socket.on("rooms", (sRooms) => {
            setRooms(sRooms);
        });


        socket.on("room", (roomId) => {
            setUser(prevUser =>  ({...prevUser, roomId: roomId}));
        });


        socket.on("chat", (message) => {
            if(flipflop){
                setChat(prevchat => ({
                    ...prevchat, 
                    [message.room]: {
                        messages: [...prevchat[message.room]?.messages || [], message],
                        unread: (prevchat[message.room]?.unread || 0) + (message.type === "message" ? 1 : 0)
                        }
                    })
                );
            }
            flipflop = !flipflop;
        });


        socket.on("typing", (screenname) => {
            setUserTyping(screenname);
        });


        socket.on("stoppedTyping", () => {
            setUserTyping(null);
        });


        return () => {
            console.log("Disconnected from server");
            socket.disconnect();
        }

    }, []);

 

    const logIn = ({ screenname, avatar }) => {
        u = screenname;
        a = avatar;
        socket.auth = { screenname };
        socket.connect();
    }


    const logOut = () => {
        setUser(null);
        sessionStorage.removeItem("sessionId");
        socket.disconnect();
        console.log("User logged out");
    }


    const sendMessage = (message) => {
        console.log("MessageRecieved by sendMessage");
        socket.emit("message", message);
    }


    const createRoom = (roomName) => {
        console.log("emit createRoom");
        socket.emit("createRoom", roomName);
    }


    const updateRoom = (roomId) => {
        
        socket.emit("updateRoom", roomId);

        setChat(prevchat => ({
                ...prevchat, 
                [user.roomId]: {
                    ...prevchat[user.roomId],
                    unread: 0
                },
                [roomId]: {
                    ...prevchat[roomId],
                    unread: 0
                }
            })
        );
    }


    const deleteRoom = (roomId) => {
        socket.emit("deleteRoom", roomId);
    }


    const typing = () => {
        socket.emit("typing");
        clearTimeout(typingTimer);
        setTypingTimer(null);
    }


    const stoppedTyping = () => {
        if (typingTimer == null) {
            setTypingTimer(setTimeout(() => {
                socket.emit("stoppedTyping");
            }, 300));
        }
    }


    const logStates = ({ showUser=false, showUsers=false, showRooms=false, showChat=false }) => {
        if (showUser) console.log(user);
        if (showUsers) console.log(users);
        if (showRooms) console.log(rooms);
        if (showChat) console.log(chat);
    }


    return { 
        socket, 
        user, 
        users, 
        chat,
        setChat,
        rooms, 
        logIn, 
        logOut, 
        sendMessage, 
        createRoom, 
        updateRoom, 
        deleteRoom, 
        typing,
        stoppedTyping,
        userTyping,
        logStates 
    };

}

export default useSocket;