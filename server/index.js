require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const pool = require('./conn');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const sendMail = require('./Mailer');
const notifier = require('./notifier');

const app = express();
app.use(express.json()); 
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



  socket.on("deleteRoom", (roomId) => {
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

// In index.js - Update the events endpoint to include revenue and attendees count
app.get("/api/events", async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT 
          e.*, 
          COALESCE(array_agg(u.email) FILTER (WHERE u.email IS NOT NULL), '{}') AS organizers
        FROM Event e
        LEFT JOIN eventorganizer eo ON e.eventid = eo.eventid
        LEFT JOIN "user" u ON eo.userid = u.userid
        GROUP BY e.eventid
        ORDER BY e.eventid DESC
      `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/events", async (req, res) => {
  const { title, startDate, endDate, price, funding, image, organizers } = req.body;

  if (!title || !startDate || !endDate || price == null || funding == null || !image || !organizers || !organizers.length) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert the event
    const eventResult = await client.query(
      `INSERT INTO event (title, startdate, enddate, price, image, attendeescount, revenue, funding)
         VALUES ($1, $2, $3, $4, $5, 0, 0, 0) RETURNING *`,
      [title, startDate, endDate, price, image]
    );

    const newEvent = eventResult.rows[0];

    // Get user IDs for the given organizer emails
    const userResult = await client.query(
      `SELECT userid FROM "user" WHERE email = ANY($1::text[])`,
      [organizers]
    );

    const userIds = userResult.rows.map(row => row.userid);

    // Insert into EventOrganizer
    for (const userId of userIds) {
      await client.query(
        `INSERT INTO eventorganizer (userid, eventid) VALUES ($1, $2)`,
        [userId, newEvent.eventid]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({ ...newEvent, organizers });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Create Event Error:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
});

app.put("/api/events/:id", async (req, res) => {
  const { title, startDate, endDate, price, organizers, funding, image } = req.body;
  const eventId = req.params.id;

  if (!title || !startDate || !endDate || price == null || funding == null || !image || !organizers) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Update the Event table
    await pool.query(
      `UPDATE Event SET title=$1, startdate=$2, enddate=$3, price=$4, funding=$5, image=$6 WHERE eventid=$7`,
      [title, startDate, endDate, price, funding, image, eventId]
    );

    // Remove old organizers
    await pool.query(
      `DELETE FROM eventorganizer WHERE eventid=$1`,
      [eventId]
    );

    // Insert new organizers
    for (let organizerEmail of organizers) {
      const { rows } = await pool.query(
        `SELECT userid FROM "user" WHERE email = $1`,
        [organizerEmail]
      );

      const userId = rows[0]?.userid;
      if (userId) {
        await pool.query(
          `INSERT INTO eventorganizer (eventid, userid) VALUES ($1, $2)`,
          [eventId, userId]
        );
      }
    }

    // Send a response indicating success without fetching the updated event
    res.status(200).json({ message: "Event updated successfully" });

  } catch (err) {
    console.error("Update Event Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/users/emails", async (req, res) => {
  console.log("Preparing to get all emails");
  try {
    const result = await pool.query(`SELECT email FROM "user"`);
    res.json(result.rows.map(row => row.email));
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/users/organizer/emails", async (req, res) => {
  try {
    const result = await pool.query(`SELECT email FROM "user" u WHERE u.role = 'organizer'`);
    res.json(result.rows.map(row => row.email));
  } catch (err) {
    console.error("Error fetching organizers:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Get user emails whose eventIDs match 
app.get("/api/users/emails/:eventId", async (req, res) => {
  
  const eventId = req.params.eventId;
  console.log("Preparing to get all emails for eventID " + eventId );

  try {
    const result = await pool.query(
      `SELECT u.email, u.name
       FROM "attendsEvent" ae
       JOIN "user" u ON ae.userid = u.userid
       WHERE ae.eventid = $1`,
      [eventId]
    );
    
    const users = result.rows;
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});


app.post('/api/events/:eventId/sessions', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, date, location, online } = req.body;

    // Insert the new session into the EventSessions table
    const query = `
        INSERT INTO eventsession (eventid, title, description, date, location, online)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;`;

    const values = [eventId, title, description, date, location, online === true || online === 'true'];
    const result = await pool.query(query, values);

    const newSession = result.rows[0]; // The newly added session

    // Respond with the newly added session
    res.status(201).json(newSession);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding session' });
  }
});

// PUT /api/events/:eventId/sessions/:sessionId - Update an existing session
app.put('/api/events/:eventId/sessions/:sessionId', async (req, res) => {
  try {
    const { eventId, sessionId } = req.params;
    const { title, description, date, location, online } = req.body;

    // Update the session in the EventSessions table
    const query = `
        UPDATE EventSession
        SET title = $1, description = $2, date = $3, location = $4, online = $5
        WHERE eventid = $6 AND sessionid = $7
        RETURNING *;
      `;
    const values = [title, description, date, location, online === true || online === 'true', eventId, sessionId];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.status(200).json(result.rows[0]); // Respond with the updated session
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating session' });
  }
});

// GET /api/events/:eventId/sessions
app.get('/api/events/:eventId/sessions', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Fetch sessions for the specific event
    const query = 'SELECT * FROM EventSession WHERE eventid = $1';
    const result = await pool.query(query, [eventId]);

    // Transformer function to reformat the data
    const sessions = result.rows.map(session => ({
      sessionid: session.sessionid,
      title: session.title,
      description: session.description,
      date: new Date(session.date).toISOString().split('T')[0],
      location: session.location,
      online: session.online === true || session.online === 'true',  // We map 'online' to 'online' in the response
      eventId: session.eventid    // Ensure eventId comes last
    }));

    // Respond with the reformatted list of sessions
    res.status(200).json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching sessions' });
  }
});

// DELETE /api/events/:eventId/sessions/:sessionId
app.delete('/api/events/:eventId/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId, eventId } = req.params;

    // Delete the session from the EventSessions table
    const query = 'DELETE FROM EventSession WHERE sessionid = $1 AND eventid = $2 RETURNING *';
    const result = await pool.query(query, [sessionId, eventId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Respond with the deleted session details
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting session' });
  }
});

app.post("/api/events/:id/fund", async (req, res) => {
  const eventId = req.params.id;
  const amount = req.body.amount || 0;

  try {
    await pool.query(
      "UPDATE event SET funding = funding + $1 WHERE eventid = $2",
      [amount, eventId]
    );

    const result = await pool.query("SELECT funding FROM event WHERE eventid = $1", [eventId]);
    res.json({ funding: result.rows[0].funding });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to update funding");
  }
});

// In index.js - Complete implementation of the payment endpoint
app.post('/api/events/:eventId/pay', async (req, res) => {
  const eventIdInt = parseInt(req.params.eventId, 10);
  if (isNaN(eventIdInt)) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }
  
  const { userId, amount, paymentMethod } = req.body; // userId is email here
  
  if (!userId || !amount || !paymentMethod) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // First check if this user has already paid for this event
    const existingPaymentResult = await client.query(
      `SELECT t.status 
       FROM transaction t
       JOIN "user" u ON t.userid = u.userid
       WHERE u.email = $1 AND t.eventid = $2 AND t.status = 'completed'`,
      [userId, eventIdInt]
    );
    
    if (existingPaymentResult.rows.length > 0) {
      return res.status(400).json({ message: 'You have already paid for this event' });
    }
    
    // Get the actual userId from the email
    const userResult = await client.query(
      `SELECT userid, balance FROM "user" WHERE email = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    const actualUserId = userResult.rows[0].userid;
    const userBalance = userResult.rows[0].balance || 0;

    // Check if the user has sufficient balance for balance payments
    if (paymentMethod === 'balance' && userBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Deduct balance if using balance payment method
    if (paymentMethod === 'balance') {
      await client.query(
        `UPDATE "user" SET balance = balance - $1 WHERE userid = $2`,
        [amount, actualUserId]
      );
    }

    // Record the transaction
    const transactionResult = await client.query(
      `INSERT INTO transaction (userid, eventid, fees, paymentmethod, status, type)
       VALUES ($1, $2, $3, $4, 'completed', 'payment') RETURNING *`,
      [actualUserId, eventIdInt, amount, paymentMethod]
    );

    // Update event revenue and attendee count
    await client.query(
      `UPDATE event 
       SET revenue = COALESCE(revenue, 0) + $1, 
           attendeescount = COALESCE(attendeescount, 0) + 1 
       WHERE eventid = $2`,
      [amount, eventIdInt]
    );

    // With event revenue and attendees updated, you can now add to attendsEvent
    await client.query(
      `INSERT INTO attendingEvent (eventid, userid)
       VALUES ($1, $2)`,
      [eventIdInt, actualUserId]
    );

    await client.query('COMMIT');
    res.status(201).json(transactionResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Payment Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Remove the duplicate endpoint and keep just this one fixed version
app.get('/api/events/:eventId/payments/:userId', async (req, res) => {
  try {
    const { eventId, userId } = req.params; // userId is email here
    
    // First get the user ID from the email
    const userResult = await pool.query(
      `SELECT userid FROM "user" WHERE email = $1`,
      [userId] // First parameter is email string
    );
    
    if (userResult.rows.length === 0) {
      return res.status(200).json({ status: 'Not Paid' });
    }
    
    const actualUserId = userResult.rows[0].userid;
    
    // Convert eventId to integer explicitly
    const eventIdInt = parseInt(eventId, 10);
    if (isNaN(eventIdInt)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    
    const result = await pool.query(
      `SELECT status FROM transaction 
       WHERE eventid = $1 AND userid = $2
       ORDER BY transactionid DESC LIMIT 1`,
      [eventIdInt, actualUserId] // Now using integer eventId and integer userId
    );
    
    if (result.rows.length === 0) {
      return res.status(200).json({ status: 'Not Paid' });
    }
    
    res.status(200).json({ status: result.rows[0].status });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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

app.post('/message', async (req, res)=> {
  console.log("Posting prepped")
  try {
    const {email, event} = req.body;
    // Emit the message event with payload
    notifier.emit('message', {email, event});
  
    res.status(200).json({ success: true, msg: 'Message received and being processed.' });
  } catch (err){
    console.error('Error sending email: ', err);
    res.status(500).json({ message: 'Error sending email' }); // Send error response as JSON
  }
});

app.listen(3001, () => {
  console.log('✅ Server running on http://localhost:3001');
});

http.listen(4000, () => {
  console.log("Connected to port 4000");
});