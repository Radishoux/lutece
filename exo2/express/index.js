const { MongoClient, ServerApiVersion } = require('mongodb');
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

// MongoDB connection URI
const uri = "mongodb+srv://rudyquinternet:LVIvgwEwTs7iDQn4@lutece.yp822na.mongodb.net/";
// Note: The URI is intentionally left in plain text for easy correction and testing; make sure to secure it in production.

// MongoClient setup with server API version and database/collection information
const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database and collection initialization
const db = mongoClient.db("Lutece");
const collection = db.collection("User");

// Middleware setup for parsing JSON requests
app.use(bodyParser.json());

// Redis client event handlers
redisClient.on('error', (err) => { console.log('Redis error: ', err) });
redisClient.on('connect', () => { console.log('Redis connected') });

// Connect to Redis client
(async () => {
  await redisClient.connect();
})();

// Function to update client information
async function updateClient(socket, cb) {
  if (!socket.userName) return cb('', 'not logged in', '');
  try {
    await mongoClient.connect();
    const balance = (await collection.find({ userName: socket.userName }).toArray())[0].balance;
    socket.emit('connected', { userName: socket.userName, balance: balance });
  } catch (e) {
    console.log(e);
  } finally {
    await mongoClient.close();
  }
}

// Route to serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front.html'));
});

// Route to process bets from the client
app.post('/api/processed', (req, res) => {
  console.log("bet processed", req.body);
  res.status(200).send();

  // Emit processed event to specific client based on cid
  io.sockets.sockets.forEach((socket) => {
    if (socket.userName === req.body.cid) {
      socket.emit('processed', {
        result: { idx: req.body.idx },
        mid: req.body.mid,
        body: req.body
      });
    }
  });
});

// Function to handle betting logic
async function bet(sock, count, mid, tid, cb) {
  console.log("bet", count, mid);

  // Validation checks
  if (!sock.userName) return cb('', 'not logged in', '');
  if (isNaN(count) || count < 1) return cb('', 'invalid bet value', '');
  if (mid < 1 || mid > 5) return cb('', 'invalid match id', '');
  if (tid !== 1 && tid !== 2) return cb('', 'invalid team id', '');

  // Generate a random bet ID
  var betid = Math.floor(Math.random() * 10000);

  // Push bet information to Redis
  for (let i = 1; i <= count; i++) {
    await redisClient.lPush('bet', `${betid}:${sock.userName}:${mid}:${tid}:${i}`);
  }

  return cb('', '', `pushed count ${count} on team ${tid} for match ${mid} from socket ${sock.id}`)
}

// Function to create a new user account
async function createAccount(socket, body, cb) {
  try {
    await mongoClient.connect();

    // Check if account already exists
    const accs = (await collection.find({ userName: body.userName }).toArray());
    if (accs.length > 0) return cb('', 'account already exists', '');

    // Insert new account into the collection
    const res = await collection.insertOne({ userName: body.userName, password: body.password, balance: 100 });
    console.log("mongo res", res);

    // Set socket username and emit connected event
    socket.userName = body.userName;
    socket.emit('connected', { userName: socket.userName, balance: 100 });

    return cb('', '', 'account created');
  } catch (e) {
    console.log(e);
    return cb('', 'error creating account', '');
  } finally {
    await mongoClient.close();
  }
}

// Function to handle user login
async function login(socket, body, cb) {
  try {
    await mongoClient.connect();

    // Find user account based on username and password
    const acc = (await collection.find({ userName: body.userName, password: body.password }).toArray())[0];

    if (!acc) return cb('', 'wrong combination', '');

    // Set socket username and emit connected event
    socket.userName = body.userName;
    socket.emit('connected', { userName: socket.userName, balance: acc.balance });

    return cb('', '', 'logged in');
  } catch (e) {
    console.log(e);
    return cb('', 'error logging in', '');
  } finally {
    await mongoClient.close();
  }
}

// Socket.io connection event
io.on('connection', (socket) => {
  console.log('socket', socket.id, 'connected');

  // Socket.io disconnect event
  socket.on('disconnect', () => {
    console.log('socket', socket.id, 'disconnected');
  });

  // Socket.io event to enqueue a bet
  socket.on('enqueue', (body, cb) => {
    bet(socket, body.count, body.mid, body.tid, cb);
  });

  // Socket.io event to create a new account
  socket.on('createAccount', (body, cb) => {
    createAccount(socket, body, cb);
  });

  // Socket.io event to handle user login
  socket.on('login', (body, cb) => {
    login(socket, body, cb);
  });

  // Socket.io event to update client information
  socket.on('update', (body, cb) => {
    updateClient(socket, cb);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
