const { expect } = require('chai');
const { PassThrough } = require('stream');

const pipes = require('../../pipes');
const { init: initMongoClient } = require('../../mongoClient');
const { repositoryFactory } = require('../../repository');

describe('index pipes', () => {
  let repository;
  let mongoClient;

  before(async () => {
    mongoClient = await initMongoClient({ uri: 'mongodb://localhost:27017' });
    repository = repositoryFactory({ mongoClient });
    await mongoClient.deleteMany({});
  });

  after(() => mongoClient.deleteMany({}));

  it('should orchestrate all pipes together', async () => {
    const throug = new PassThrough();
    const buffer = new Buffer("Hi my name iswhat my name iswho my name is Slim Shady");

    throug.push(buffer);
    throug.push(null);

    return new Promise((resolve, reject) => {
      pipes.pipeStream({ repository, stream: throug })
      .on('finish', async () => {
        try {
          expect((await mongoClient.findOne({ _id: 'Hi' })), 'Hi should not exist').to.equal(null);
          expect((await mongoClient.findOne({ _id: 'hi' })).count, 'hi should saved in lowercase').to.equal(1);
          resolve();
        } catch (error) {
         reject(error);
        }
      });
    });
  });
});