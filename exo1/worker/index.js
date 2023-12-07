const redis = require('redis');
const client = redis.createClient();
const axios = require('axios');

// Get the number of workers from command line arguments or default to 1
const nbworkers = process.argv[2] || 1;
var workers = [];

// Connect to Redis
client.connect();

// Function to generate a random number between min and max
function between(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// Class definition for a Worker
class Worker {
  constructor() {
    this.workingOn = null;
    this.work();
  }

  // Asynchronous method to simulate work
  async work() {
    // Blocking pop operation on the "bet" list in Redis
    const b = await client.brPop("bet", 0);
    this.workingOn = b.element;

    // Extracting information from the popped element
    const cid = b.element.split(':')[0];
    const mid = b.element.split(':')[1];
    const idx = b.element.split(':')[2];

    // Simulating processing time
    const tim = between(300, 500);

    console.log("Working on", b.element, "for", tim, "ms");

    // Simulated delay using setTimeout
    setTimeout(() => {
      // Send a processed event to the server
      axios.post('http://localhost:3000/api/processed', {
        idx: idx,
        cid: cid,
        mid: mid
      });

      // Reset workingOn status and continue to work
      this.workingOn = null;
      return this.work();
    }, tim);
  }
}

// Create and initialize the specified number of workers
for (let i = 0; i < nbworkers; i++) {
  workers.push(new Worker());
}

// Log worker information periodically
setInterval(() => {
  console.log("Workers: ", workers);
}, 3000);
