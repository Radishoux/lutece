const { MongoClient, ServerApiVersion } = require('mongodb');
const { Server } = require("socket.io");
var bodyParser = require('body-parser');
const express = require('express');
const redis = require('redis');
const path = require('path');
const http = require('http');
const app = express();
const redisClient = redis.createClient();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

const uri = "mongodb+srv://rudyquinternet:LVIvgwEwTs7iDQn4@lutece.yp822na.mongodb.net/";
// uri laissée volontairement en clair pour faciliter la correction et permettre a qui veut de jouer avec la DB, a cacher en prod

const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const db = mongoClient.db("Lutece");
const collection = db.collection("User");
app.use(bodyParser.json());

(async () => {
  redisClient.on('error', (err) => { console.log('Redis error: ', err) });
  redisClient.on('connect', () => { console.log('Redis connected') });

  await redisClient.connect();
})();

async function updateClient(socket, cb) {
  if (!socket.userName) return cb('', 'not logged in', '');
  try {
    await mongoClient.connect()

    const balance = (await collection.find({ userName: socket.userName }).toArray())[0].balance;
    socket.emit('connected', { userName: socket.userName, balance: balance });
  } catch (e) {
    console.log(e);
  } finally {
    await mongoClient.close();
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front.html'));
});

app.post('/api/processed', (req, res) => {
  console.log("bet processed", req.body);
  res.status(200).send();

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

async function bet(sock, count, mid, tid, cb) {
  console.log("bet", count, mid);

  if (!sock.userName) return cb('', 'not logged in', '');
  if (isNaN(count) || count < 1) return cb('', 'invalid bet value', '');
  if (mid < 1 || mid > 5) return cb('', 'invalid match id', '');
  if (tid !== 1 && tid !== 2) return cb('', 'invalid team id', '');

  var betid = Math.floor(Math.random() * 10000);

  for (let i = 1; i <= count; i++) {
    await redisClient.lPush('bet', `${betid}:${sock.userName}:${mid}:${tid}:${i}`);
  }

  return cb('', '', `pushed count ${count} on team ${tid} for match ${mid} from socket ${sock.id}`)
}

async function createAccount(socket, body, cb) {
  try {
    await mongoClient.connect()

    const accs = (await collection.find({ userName: body.userName }).toArray());

    if (accs.length > 0) return cb('', 'account already exists', '');

    const res = await collection.insertOne({ userName: body.userName, password: body.password, balance: 100 });
    console.log("mongo res", res);

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

async function login(socket, body, cb) {
  try {
    await mongoClient.connect()

    const acc = (await collection.find({ userName: body.userName, password: body.password }).toArray())[0];

    if (!acc) return cb('', 'wrong combination', '');

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

io.on('connection', (socket) => {
  console.log('socket', socket.id, 'connected');

  socket.on('disconnect', () => {
    console.log('socket', socket.id, 'disconnected');
  });

  socket.on('enqueue', (body, cb) => {
    bet(socket, body.count, body.mid, body.tid, cb);
  });

  socket.on('createAccount', (body, cb) => {
    createAccount(socket, body, cb);
  });

  socket.on('login', (body, cb) => {
    login(socket, body, cb);
  });

  socket.on('update', (body, cb) => {
    updateClient(socket, cb);
  });
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
