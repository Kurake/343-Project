require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const pool = require('./conn');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const sendMail = require('./Mailer');

const app = express();
const http = require('http').createServer(app);
app.use(cors());
app.use(bodyParser.json());
const io = require('socket.io')(http, {
  cors: {
      origin: ["http://localhost:3000", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:3005"]
  }
});

app.use('/api/auth', authRoutes);

const sessions = new Map();
const globalRoomId = uuidv4();
var users = [];
let rooms = [{ 
    id: globalRoomId,
    name: "Global", 
    userId: 0,
    screenname: "None", 
    avatar: "https://semantic-ui.com/images/avatar2/small/patrick.png",
    members: [],
}];

io.use((socket, next) => {
    
  console.log("io.use() running");

  const sessionId = socket.handshake.auth.sessionId;

  if (sessionId) {

      const session = sessions.get(sessionId);
      
      if (session) {
          
          console.log("Use existing user from session", sessionId);
          socket.sessionId = sessionId;
          socket.userId = session.userId;
          socket.username = session.screenname;
          socket.avatar = session.avatar;
          socket.roomId = session.roomId;

          return next();
      }
  }

  console.log("Create new user");
  socket.sessionId = uuidv4();
  socket.userId = uuidv4();
  socket.username = socket.handshake.auth.screenname;
  socket.roomId = globalRoomId;

  next();
});

io.on('connection', (socket) => {

  console.log("Connected to client successfully");

  // return session data to client once client is connected
  socket.emit("session", {
      sessionId: socket.sessionId,
      userId: socket.userId
  });



  // receive screenname and avatar from client once client is connected
  socket.on("user", ({ screenname, avatar }) => {
      socket.username = screenname
      socket.avatar = avatar;
  });



  // this function is run everytime client connects or reconnects
  // setup the client by adding to users array, joining room and send back user info to client
  socket.on("setUpUser", () => {

      const user = { 
          userId: socket.userId, 
          screenname: socket.username, 
          avatar: socket.avatar, 
          roomId: socket.roomId 
      };

      users.push(user);
      socket.join(socket.roomId);

      sessions.set(socket.sessionId, user);

      socket.emit("user", user);

      rooms.map(room => {
          if (room.id === socket.roomId) {
              room.members.push(socket.username);
          }
          return room;
      });

      const message = {
          type: "info",
          room: socket.roomId,
          content: socket.username + " has joined room",
      }
      
      socket.broadcast.to(globalRoomId).emit("chat", message);

      io.sockets.emit("users", users);
      io.sockets.emit("rooms", rooms);
      
  });




  socket.on("createRoom", (roomName) => {
      console.log("creating room", roomName);
      const room = {
          id: uuidv4(),
          name: roomName,
          screenname: socket.username,
          userId: socket.userId,
          avatar: socket.avatar,
          members: [],
      }
      rooms.push(room);
      socket.join(room.id);
      io.sockets.emit("rooms", rooms);
  });





  socket.on("updateRoom", (roomId) => {
      
      console.log("updating room");

      // if same room then ignore
      if (socket.roomId === roomId) return;

      let msg = {};

      // broadcast "left room" to all other users of previous room of user
      msg = {
          type: "info",
          room: socket.roomId,
          content: socket.username + " has left room",
      }

      socket.broadcast.to(socket.roomId).emit("chat", msg);


      // remove screenname of disconnected user from all rooms member list
      rooms.map(room => {
          if (room.members.includes(socket.username)) {
              let index = room.members.indexOf(socket.username);
              if (index !== -1) room.members.splice(index, 1);
          }
          return room;
      });

      // // remove rooms created by diconnected user from rooms list if all members left room
      rooms = rooms.filter(room => {
          let u = users.find(user => user.userId === room.userId);
          if (room.members.length > 0 || u || room.id === globalRoomId) {
              return room;
          }
      });

      // send new room to client to update local state
      socket.emit("room", roomId);
      

      if (socket.rooms.has(roomId)) {
          
          // Already member of room. just changing active room
          socket.roomId = roomId;

          msg = {
              type: "info",
              room: socket.roomId,
              content: socket.username + " has entered room",
          }

          socket.broadcast.to(socket.roomId).emit("chat", msg);


          // store screenname in new room members list
          rooms.map(room => {
              if (room.id === socket.roomId) {
                  room.members.push(socket.username);
              }
              return room;
          });

          io.sockets.emit("rooms", rooms);


          let user = { 
              userId: socket.userId, 
              screenname: socket.username, 
              avatar: socket.avatar, 
              roomId: socket.roomId 
          };
  
          sessions.set(socket.sessionId, user);

          return;
      }



      if (rooms.some(room => room.id === roomId)) {
          socket.roomId = roomId;
          socket.join(roomId);
      }
      else {
          socket.roomId = globalRoomId;
          socket.join(globalRoomId);
      }

      // check if there is no duplicate entry of users in same room
      rooms.map(room => {
          if (room.id === socket.roomId) {
              room.members.push(socket.username);
          }
          return room;
      });
      
      msg = {
          type: "info",
          room: socket.roomId,
          content: socket.username + " has joined room",
      }

      socket.broadcast.to(socket.roomId).emit("chat", msg);

      io.sockets.emit("rooms", rooms);


      user = { 
          userId: socket.userId, 
          screenname: socket.username, 
          avatar: socket.avatar, 
          roomId: socket.roomId 
      };

      sessions.set(socket.sessionId, user);

  });



  socket.on("deleteRoom", (roomId)=> {
      console.log("roomid", roomId);
      rooms = rooms.filter(room => room.id !== roomId);
      io.sockets.emit("rooms", rooms);
  });



  socket.on("message", (message) => {

      const msg = {
          type: "message",
          room: socket.roomId,
          userId: socket.userId,
          screenname: socket.username,
          avatar: socket.avatar,
          content: message,
          date: new Date(),
      }

      io.sockets.to(socket.roomId).emit("chat", msg);

  });
  


  socket.on("typing", () => {
      io.sockets.to(socket.roomId).emit("typing", socket.username);
  });




  socket.on("stoppedTyping", () => {
      io.sockets.to(socket.roomId).emit("stoppedTyping");
  });



  socket.on("disconnect", () => {
      
      console.log("disconnect: user disconnected");

      // remove disconnected user from users list
      users = users.filter(user => user.userId !== socket.userId);


      // remove screenname of disconnected user from all rooms member list
      rooms.map(room => {
          if (room.members.includes(socket.username)) {
              let index = room.members.indexOf(socket.username);
              if (index !== -1) room.members.splice(index, 1);
          }
          return room;
      });

      const message = {
          type: "info",
          content: socket.username + " went offline",
      }

      socket.broadcast.to(socket.roomId).emit("chat", message);

      io.sockets.emit("users", users);
      io.sockets.emit("rooms", rooms);
  });

});

app.get("/api/events", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Event");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// // POST: Create a new event
// app.post("/api/events", async (req, res) => {
// console.log("Body: ", req.body);
//   const { title, startDate, endDate, price, organizers } = req.body;

//   if (!title || !startDate || !endDate || !price || !organizers?.length) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

//   try {
//     const eventResult = await db.query(
//       `INSERT INTO Event (Title, StartDate, EndDate, Price, AttendeesCount, Revenue)
//        VALUES ($1, $2, $3, $4, 0, 0) RETURNING *`,
//       [title, startDate, endDate, price]
//     );
//     const newEvent = eventResult.rows[0];

//     const userResult = await db.query(
//       `SELECT UserID FROM "User" WHERE Email = ANY($1::text[])`,
//       [organizers]
//     );

//     const userIDs = userResult.rows.map(row => row.userid);
//     if (userIDs.length !== organizers.length) {
//       return res.status(400).json({ message: "Some organizer emails not found" });
//     }

//     for (const userId of userIDs) {
//       await db.query(`INSERT INTO EventOrganizer (UserID, EventID) VALUES ($1, $2)`, [userId, newEvent.eventid]);
//     }

//     res.status(201).json(newEvent);
//   } catch (err) {
//     console.error("Create Event Error:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // PUT: Update an event
// app.put("/api/events/:id", async (req, res) => {
//   const { title, startDate, endDate, price, organizers } = req.body;
//   const eventId = req.params.id;

//   if (!title || !startDate || !endDate || !price || !organizers?.length) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

//   try {
//     await db.query(
//       `UPDATE Event SET Title=$1, StartDate=$2, EndDate=$3, Price=$4 WHERE EventID=$5`,
//       [title, startDate, endDate, price, eventId]
//     );

//     const userResult = await db.query(
//       `SELECT UserID FROM "User" WHERE Email = ANY($1::text[])`,
//       [organizers]
//     );
//     const userIDs = userResult.rows.map(row => row.userid);
//     if (userIDs.length !== organizers.length) {
//       return res.status(400).json({ message: "Some organizer emails not found" });
//     }

//     await db.query(`DELETE FROM EventOrganizer WHERE EventID = $1`, [eventId]);
//     for (const userId of userIDs) {
//       await db.query(`INSERT INTO EventOrganizer (UserID, EventID) VALUES ($1, $2)`, [userId, eventId]);
//     }

//     const updatedEvent = await db.query(`SELECT * FROM Event WHERE EventID = $1`, [eventId]);
//     res.json(updatedEvent.rows[0]);
//   } catch (err) {
//     console.error("Update Event Error:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

app.post('/send-email', async(req, res) => {
    const {email, event, name} = req.body;

    try {
        console.log('email:', email);
        console.log('event:', event);
        console.log('name:', name);
        await sendMail({email, event, name});
    } catch (err){
        console.error(err);
    }
});

app.listen(3001, () => {
  console.log('✅ Server running on http://localhost:3001');
});

http.listen(4000, () => {
  console.log("Connected to port 4000");
});