// import { MongoClient } from "mongodb";

// const client = new MongoClient(process.env.ATLAS_URI);

// let conn;
// try {
//   conn = await client.connect();
// } catch (e) {
//   console.error(e);
// }

// let db = conn.db("sample_training");

// export default db;

import { mongoose } from "mongoose";
const ATLAS_URI = process.env.ATLAS_URI;

// Connect to MongoDB
const db = mongoose.connect(ATLAS_URI, {"dbname": "sample_training"}).then(() => {
  console.log("Mongoose Connection Successful!");
}).catch(() => {
  console.log("Mongoose Connection Failed!");
});

export default db;