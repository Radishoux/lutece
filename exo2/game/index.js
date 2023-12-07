const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb+srv://rudyquinternet:LVIvgwEwTs7iDQn4@lutece.yp822na.mongodb.net/";
// uri laissée volontairement en clair pour faciliter la correction et permettre a qui veut de jouer avec la DB, a cacher en prod

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  // Connect to our MongoDB database hosted on MongoDB Atlas
  const client = await MongoClient.connect(uri);

  // Specify which database we want to use
  const db = await client.db("Lutece");

  cachedDb = db;
  return db;
}

exports.handler = async (event, context) => {

  const db = await connectToDatabase();

  var response = {
    statusCode: 200,
    body: JSON.stringify(event),
  };

  var game = await db.collection("Bet").find({ mid: parseInt(event.mid) }).toArray();

  var winner = Math.random() > 0.5 ? 1 : 2

  var tw = winner == 1 ? game[0]["t1"] : game[0]["t2"];
  var tl = winner == 2 ? game[0]["t1"] : game[0]["t2"];

  var won = tl.length;
  var woneach = won / tw.length;
  console.log("won", won);

  var uw = {};

  for (var i = 0; i < tw.length; i++) {
    var user = tw[i].split(':')[1];
    if (uw[user]) {
      uw[user] += 1;
    } else {
      uw[user] = 1;
    }
  }

  for (var u in uw) {
    console.log(`u ${u} won ${uw[u]} bets so ${Math.floor(uw[u] * woneach)} coins`);
    await db.collection("User").updateOne({ userName: u }, { $inc: { balance: Math.floor(uw[u] * woneach) } });
  }

  var clearG = await db.collection("Bet").updateOne({ mid: parseInt(event.mid) }, { $set: { t1: [], t2: [] }});

  response.body = clearG;

  return response;
};