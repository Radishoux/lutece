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

app.use(bodyParser.json());

(async () => {
  redisClient.on('error', (err) => { console.log('Redis error: ', err) });
  redisClient.on('connect', () => { console.log('Redis connected') });

  await redisClient.connect();
})();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front.html'));
});

app.post('/api/processed', (req, res) => {
  console.log("bet processed", req.body);
  res.status(200).send();

  io.to(req.body.cid).emit('processed', {
    result: { idx: req.body.idx },
    mid: req.body.mid,
  });
});

async function bet(sock, count, mid, cb) {
  console.log("bet", count, mid);

  for (let i = 1; i <= count; i++) {
    await redisClient.lPush('bet', `${sock.id}:${mid}:${i}`);
  }

  return cb('', '', `pushed count ${count} for match ${mid} from socket ${sock.id}`)

}

io.on('connection', (socket) => {
  console.log('socket', socket.id, 'connected');

  socket.on('disconnect', () => {
    console.log('socket', socket.id, 'disconnected');
  });

  socket.on('enqueue', (body, cb) => {
    bet(socket, body.count, body.mid, cb);
  });
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});