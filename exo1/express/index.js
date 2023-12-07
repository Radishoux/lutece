const { Server } = require("socket.io");
const bodyParser = require('body-parser');
const express = require('express');
const redis = require('redis');
const path = require('path');
const http = require('http');

const app = express();
const redisClient = redis.createClient();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Set up connection to Redis
redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

redisClient.on('connect', () => {
  console.log('Redis connected');
});

// Connect to Redis client
(async () => {
  await redisClient.connect();
})();

// Serve the front-end HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front.html'));
});

// API endpoint for processed bets
app.post('/api/processed', (req, res) => {
  console.log("Bet processed", req.body);
  res.status(200).send();

  // Emit processed event to the specific client
  io.to(req.body.cid).emit('processed', {
    result: { idx: req.body.idx },
    mid: req.body.mid,
  });
});

// Function to process bets
async function bet(sock, count, mid, cb) {
  console.log("Bet", count, mid);

  // Push bet details to Redis list
  for (let i = 1; i <= count; i++) {
    await redisClient.lPush('bet', `${sock.id}:${mid}:${i}`);
  }

  return cb('', '', `Pushed count ${count} for match ${mid} from socket ${sock.id}`);
}

// Handle socket connections
io.on('connection', (socket) => {
  console.log('Socket', socket.id, 'connected');

  // Handle socket disconnections
  socket.on('disconnect', () => {
    console.log('Socket', socket.id, 'disconnected');
  });

  // Handle enqueue event
  socket.on('enqueue', (body, cb) => {
    bet(socket, body.count, body.mid, cb);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
