const { Server } = require("socket.io");
const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const server = http.createServer(app);
const redis = require('redis');
const publisher = redis.createClient();
const io = new Server(server);
const port = 3000;

(async () => {
  publisher.on('error', (err) => {console.log('Redis error: ', err)});
  publisher.on('connect', () => {console.log('Redis connected')});

  await publisher.connect();
})();


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front.html'));
});

app.post('/api/bet/processed', (req, res) => {
  console.log("bet processed", req.body);
  res.status(200).send();
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

async function addToRedis(sock, count, mid, cb) {
  console.log("enqueue", count, mid);

  for(let i = 1; i <= count; i++) {
    publisher.lPush('bet', `${sock.id}:${mid}:${i}`);
  }

  return cb('','', `published count ${count} for match ${mid} from socket ${sock.id}`)
}

io.on('connection', (socket) => {
  console.log('socket', socket.id, 'connected');

  socket.on('disconnect', () => {
    console.log('socket', socket.id, 'disconnected');
  });

  socket.on('enqueue', (body, cb) => {
    addToRedis(socket, body.count, body.mid, cb);
  });
});