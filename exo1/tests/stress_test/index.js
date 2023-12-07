const yargs = require('yargs');

const io = require('socket.io-client');

function cb(...data) {
  console.log(data);
}

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
const counts = argv.counts || 2;

console.log(`Number of messages: ${messages}`);
console.log(`Number of sockets: ${sockets}`);
console.log(`Number of counts: ${counts}`);

var testers = [];

var socketsToTest = sockets;

console.log('Starting test...', testers);

var timeStart = Date.now();

function over() {
  if (socketsToTest < 1) {
    var timeEnd = Date.now();
    var time = timeEnd - timeStart;
    time /= 1000;
    console.log(`Time taken: ${time}s`);
    process.exit(0);
  }
}

class Tester {
  constructor(messages, counts) {
    this.socket = io('http://localhost:3000'); // Replace with your server URL
    this.messages = messages;
    this.counts = counts;
    this.processed = 0;

    this.socket.on('processed', () => {
      this.processed++;

      if (this.processed === this.messages*counts) {
        this.socket.disconnect();
        socketsToTest--;
        over();
      }
    });
  }

  async send() {
    for (let i = 1; i <= this.messages; i++) {
      this.socket.emit('enqueue', {
          count: this.counts,
          mid: i,
        }, cb);
    }
  }
}

for (let i = 0; i < sockets; i++) {
  testers.push(new Tester(messages, counts));
}

for (let i = 0; i < testers.length; i++) {
  testers[i].send();
}

setInterval(() => {
  console.log(testers);
}, 3000);