const yargs = require('yargs');
const io = require('socket.io-client');

function cb(...data) {
  console.log(data);
}

// Parse command line arguments using yargs
const argv = yargs
  .option('messages', {
    describe: 'Number of messages to send',
    type: 'number',
    default: 2,
  })
  .option('sockets', {
    describe: 'Number of sockets to simulate',
    type: 'number',
    default: 2,
  })
  .option('count', {
    describe: 'Number of counts',
    type: 'number',
    default: 2,
  })
  .help()
  .argv;

const messages = argv.messages || 2;
const sockets = argv.sockets || 2;
const counts = argv.count || 2;

console.log(`Number of messages: ${messages}`);
console.log(`Number of sockets: ${sockets}`);
console.log(`Number of counts: ${counts}`);

// Array to hold tester instances
var testers = [];

// Counter for the number of sockets to test
let socketsToTest = sockets;

console.log('Starting test...', testers);

const timeStart = Date.now();

// Function to check if all sockets have completed testing
function over() {
  if (socketsToTest < 1) {
    const timeEnd = Date.now();
    const time = (timeEnd - timeStart) / 1000;
    console.log(`Time taken: ${time}s`);
    process.exit(0);
  }
}

// Class definition for a Tester
class Tester {
  constructor(messages, counts) {
    // Create a socket instance for each tester
    this.socket = io('http://localhost:3000');
    this.messages = messages;
    this.counts = counts;
    this.processed = 0;

    // Event listener for the 'processed' event from the server
    this.socket.on('processed', () => {
      this.processed++;

      // Check if all messages for all counts are processed
      if (this.processed === this.messages * counts) {
        this.socket.disconnect();
        socketsToTest--;
        over();
      }
    });
  }

  // Asynchronous method to simulate sending messages
  async send() {
    for (let i = 1; i <= this.messages; i++) {
      this.socket.emit('enqueue', {
        count: this.counts,
        mid: i,
      }, cb);
    }
  }
}

// Create and initialize tester instances
for (let i = 0; i < sockets; i++) {
  testers.push(new Tester(messages, counts));
}

// Trigger the sending of messages for each tester
for (let i = 0; i < testers.length; i++) {
  testers[i].send();
}

// Log tester information periodically
setInterval(() => {
  console.log(testers);
}, 3000);
