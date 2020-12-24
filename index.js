const { initApp } = require('./app');
const { serviceFactory } = require('./service');
const { repositoryFactory } = require('./repository');
const { init: initMongoClient } = require('./mongoClient');

const {
  NODE_ENV,
  MONGO_PORT,
  MONGO_HOSTNAME,
} = process.env;

const uri = NODE_ENV === 'test' ? 'mongodb://localhost:27017' : `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}`;

async function init() {
  const mongoClient = await initMongoClient({ uri })
  const repository = repositoryFactory({ mongoClient });
  const service = serviceFactory({ repository });
  const app = initApp({ service });
  
  return app;
}

module.exports = init;