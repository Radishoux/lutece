const MongoClient = require("mongodb").MongoClient;

// MongoDB connection URI
const uri = "mongodb+srv://rudyquinternet:LVIvgwEwTs7iDQn4@lutece.yp822na.mongodb.net/";
// Note: The URI is intentionally left in plain text for easy correction and testing; make sure to secure it in production.

// Variable to cache the MongoDB database connection
let cachedDb = null;

// Function to connect to the MongoDB database
async function connectToDatabase() {
  if (cachedDb) {
    // If a database connection is already established, return the cached connection
    return cachedDb;
  }

  // Connect to the MongoDB database hosted on MongoDB Atlas
  const client = await MongoClient.connect(uri);

  // Specify which database we want to use
  const db = await client.db("Lutece");

  // Cache the database connection
  cachedDb = db;
  return db;
}

// Lambda function entry point
exports.handler = async (event, context) => {
  // Connect to the MongoDB database
  const db = await connectToDatabase();

  // Initial response object
  var response = {
    statusCode: 200,
    body: JSON.stringify(event),
  };

  // Retrieve game information based on the provided match ID
  var game = await db.collection("Bet").find({ mid: parseInt(event.mid) }).toArray();

  // Determine the winner randomly (1 or 2)
  var winner = Math.random() > 0.5 ? 1 : 2;

  // Determine winning and losing teams
  var tw = winner == 1 ? game[0]["t1"] : game[0]["t2"];
  var tl = winner == 2 ? game[0]["t1"] : game[0]["t2"];

  // Calculate the number of bets won
  var won = tl.length;
  var woneach = won / tw.length;

  console.log("won", won);

  // Object to track the number of wins for each user
  var uw = {};

  // Count the number of wins for each user
  for (var i = 0; i < tw.length; i++) {
    var user = tw[i].split(':')[1];
    if (uw[user]) {
      uw[user] += 1;
    } else {
      uw[user] = 1;
    }
  }

  // Update user balances based on the number of wins
  for (var u in uw) {
    console.log(`User ${u} won ${uw[u]} bets, earning ${Math.floor((uw[u] * woneach) + uw[u])} coins`);
    await db.collection("User").updateOne({ userName: u }, { $inc: { balance: Math.floor((uw[u] * woneach) + uw[u]) } });
  }

  // Clear the game data after processing
  var clearG = await db.collection("Bet").updateOne({ mid: parseInt(event.mid) }, { $set: { t1: [], t2: [] }});

  response.body = clearG;

  return response;
};
