const { MongoClient } = require("mongodb");

async function init({ uri }) {
  const client = new MongoClient(uri);
  await client.connect();

  const database = client.db('statistics');
  const collection = database.collection('counts');
  
  return collection;
}

module.exports = {
  init,
}