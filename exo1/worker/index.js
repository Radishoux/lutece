const redis = require('redis');
const client = redis.createClient();
const axios = require('axios');

var nbworkers = process.argv[2] || 1;
var workers = [];

client.connect();

function between(min, max) {
  return Math.floor(
    Math.random() * (max - min) + min
  )
};

class Worker {
  constructor() {
    this.workingOn = null;
    this.work();
  }

  async work() {
    var b = await client.brPop("bet", 0);
    this.workingOn = b.element;

    var cid = b.element.split(':')[0];
    var mid = b.element.split(':')[1];
    var idx = b.element.split(':')[2];

    var tim = between(300, 500);

    console.log("working on ", b.element, "for", tim, "ms");

    setTimeout(() => {

      axios.post('http://localhost:3000/api/processed', {
        idx: idx,
        cid: cid,
        mid: mid
      });

      this.workingOn = null;
      return this.work();
    }, tim);
  }
}

for (let i = 0; i < nbworkers; i++) {
  workers.push(new Worker());
}

setInterval(() => {
  console.log("workers: ", workers);
}, 3000);