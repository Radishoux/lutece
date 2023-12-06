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
    console.log("working on ", b.element);
    setTimeout(() => {
      console.log("done working on ", b.element);
      this.workingOn = null;
      axios.post('http://localhost:3000/api/processed', {
        idx: b.element.split(':')[2],
        cid: b.element.split(':')[0],
        mid: b.element.split(':')[1]
      });
      return this.work();
    }, between(300, 500));
  }
}

for(let i = 0; i < nbworkers; i++) {
  workers.push(new Worker());
}

setInterval(() => {
  console.log("workers: ", workers);
}, 5000);
