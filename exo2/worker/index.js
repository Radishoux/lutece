const redis = require('redis');
const client = redis.createClient();
const axios = require('axios');
const { MongoClient, ServerApiVersion } = require('mongodb');

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
const users = db.collection("User");
const bets = db.collection("Bet");

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
    console.log("working on ", b.element);

    var user = b.element.split(':')[1];
    var game = parseInt(b.element.split(':')[2]);
    var team = parseInt(b.element.split(':')[3]);
    var decUser = await users.updateOne({ userName: user }, { $inc: { balance: -1 } });
    var pushbet;

    if (team == 1) {
      pushbet = await bets.updateOne({ mid: game }, { $push: { t1: b.element } });
    } else if (team == 2) {
      pushbet = await bets.updateOne({ mid: game }, { $push: { t2: b.element } });
    }

    console.log("done working on ", b.element);

    axios.post('http://localhost:3000/api/processed', {
      bid: b.element.split(':')[0],
      cid: b.element.split(':')[1],
      mid: b.element.split(':')[2],
      tid: b.element.split(':')[3],
      idx: b.element.split(':')[4]
    });

    this.workingOn = null;
      return this.work();
  }
}

for(let i = 0; i < nbworkers; i++) {
  workers.push(new Worker());
}

setInterval(() => {
  console.log("workers: ", workers);
}, 5000);
