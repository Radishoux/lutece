const { Server } = require("socket.io");
const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const server = http.createServer(app);

const port = 3000;

const io = new Server(server);

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

io.on('connection', (socket) => {
  console.log('socket', socket.id, 'connected');

  socket.on('disconnect', () => {
    console.log('socket', socket.id, 'disconnected');
  });

  socket.on('enqueue', (body, cb) => {
    console.log("enqueue", body.count, body.mid);
    cb('','', body.count + ' ' + body.mid)
  });
});