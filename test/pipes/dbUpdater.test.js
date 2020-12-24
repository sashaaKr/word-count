const { expect } = require('chai');
const { PassThrough } = require('stream');

const { repositoryFactory } = require('../../repository');
const { init: initDbUpdater } = require('../../pipes/dbUpdater');
const { init: initMongoClient } = require('../../mongoClient');

describe('dbUpdater', () => {
  let repostiory;
  let mongoClient;

  before(async () => {
    mongoClient = await initMongoClient({ uri: 'mongodb://localhost:27017' });
    repostiory = repositoryFactory({ mongoClient });
    await mongoClient.deleteMany({});
  });

  after(() => mongoClient.deleteMany({}));

  it('should save counter in db', () => {
    const throug = new PassThrough();
    const buffer = new Buffer("hey Hi my name iswhat my name iswho my name is Slim Shady hey");
    
    throug.push(buffer);
    throug.push(null);

    const dbUpdater = initDbUpdater(repostiory);

    return new Promise((resolve, reject) => {
      throug
      .pipe(dbUpdater)
      .on('finish', async () => {
        try {
          expect((await mongoClient.findOne({ _id: 'hey' })).count, 'hey should match').to.equal(2);
          expect((await mongoClient.findOne({ _id: 'Hi' })).count, 'hi should match').to.equal(1);
          expect((await mongoClient.findOne({ _id: 'my' })).count, 'my should match').to.equal(3);
          expect((await mongoClient.findOne({ _id: 'name' })).count, 'name should match').to.equal(3);
          expect((await mongoClient.findOne({ _id: 'iswhat' })).count, 'iswhat should match').to.equal(1);
          expect((await mongoClient.findOne({ _id: 'iswho' })).count, 'iswho should match').to.equal(1);
          expect((await mongoClient.findOne({ _id: 'is' })).count, 'is should match').to.equal(1);
          expect((await mongoClient.findOne({ _id: 'Slim' })).count, 'Slim should match').to.equal(1);
          expect((await mongoClient.findOne({ _id: 'Shady' })).count, 'Shady should match').to.equal(1);
          
          resolve();
        } catch (error) {
          reject(error)
        }
    })
    });
  });
})