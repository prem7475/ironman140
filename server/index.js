const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./config/db');

// Initialize app & HTTP server for WebSockets
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

const PORT = process.env.PORT || 5000;

// Attach Socket.IO instance to app for controllers
app.set('io', io);

// WebSocket event listeners
io.on('connection', (socket) => {
  console.log('Real-Time WebSocket Client Connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Real-Time WebSocket Client Disconnected:', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/events', require('./routes/events'));
app.use('/api/races', require('./routes/events')); // Alias for events
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/admin', require('./routes/admin'));

// Basic Health Check
app.get('/', (req, res) => {
  res.send('PACEFORGE API & WebSockets — Operational');
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`PACEFORGE Server & WebSockets running on port ${PORT}`);
    });
  } catch (err) {
    console.error('PACEFORGE Server stopped because MongoDB is unavailable.');
    process.exitCode = 1;
  }
};

startServer();
