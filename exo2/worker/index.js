const redis = require('redis');
const client = redis.createClient();
const axios = require('axios');
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://rudyquinternet:LVIvgwEwTs7iDQn4@lutece.yp822na.mongodb.net/";
// The URI is intentionally left visible for ease of correction; remember to hide it in production

const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const db = mongoClient.db("Lutece");
const users = db.collection("User");
const bets = db.collection("Bet");

// The number of worker instances is based on the command-line argument or defaults to 1
var nbworkers = process.argv[2] || 1;
var workers = [];

// Connect to the Redis server
client.connect();

// Worker class for processing bets
class Worker {
  constructor() {
    this.workingOn = null;
    this.work();
  }

  async work() {
    // Retrieve a bet from the Redis list
    var b = await client.brPop("bet", 0);
    this.workingOn = b.element;
    console.log("working on ", b.element);

    // Extract information from the bet element
    var user = b.element.split(':')[1];
    var game = parseInt(b.element.split(':')[2]);
    var team = parseInt(b.element.split(':')[3]);

    // Update user balance and push the bet to the appropriate team in MongoDB
    var decUser = await users.updateOne({ userName: user }, { $inc: { balance: -1 } });
    var pushbet;

    if (team == 1) {
      pushbet = await bets.updateOne({ mid: game }, { $push: { t1: b.element } });
    } else if (team == 2) {
      pushbet = await bets.updateOne({ mid: game }, { $push: { t2: b.element } });
    }

    console.log("done working on ", b.element);

    // Notify the main server about the processed bet
    axios.post('http://localhost:3000/api/processed', {
      bid: b.element.split(':')[0],
      cid: b.element.split(':')[1],
      mid: b.element.split(':')[2],
      tid: b.element.split(':')[3],
      idx: b.element.split(':')[4]
    });

    // Reset workingOn and continue processing bets
    this.workingOn = null;
    return this.work();
  }
}

// Create worker instances based on the specified count
for (let i = 0; i < nbworkers; i++) {
  workers.push(new Worker());
}

// Periodically log the status of workers
setInterval(() => {
  console.log("workers: ", workers);
}, 3000);
