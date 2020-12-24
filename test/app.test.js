const { expect } = require('chai');
const request = require('supertest');
const http = require('http');
const fs = require('fs');
const PromiseBb = require('bluebird');

const initApp = require('../index');
const { repositoryFactory } = require('../repository');

const { init: initMongoClient } = require('../mongoClient');

describe('app', () => {
  let repository;
  let mongoClient;

  before(async () => {
    mongoClient = await initMongoClient({ uri: 'mongodb://localhost:27017' });
    repository = repositoryFactory({ mongoClient });
    await mongoClient.deleteMany({});
  });

  afterEach(async () => {
    await mongoClient.deleteMany({});
  });

  describe('/health-check', () => {
    it('should respond to health check api', async () => {
      const app = await initApp();
      return request(app)
        .get('/health-check')
        .expect(200)
        .then(({ body }) => expect(body).to.deep.equal({ healthStatus: 'ok' }))
    });
  });

  describe('/word/counter', () => {
    it('should return word counter', async () => {
      const app = await initApp();
      await request(app)
        .get('/word/counter?term=sasha')
        .expect(200)
        .then(({ body }) => expect(body).to.deep.equal({ counter: 0 }));

      await mongoClient.insertOne({_id: 'sasha', count: 3 });

      return request(app)
        .get('/word/counter?term=sasha')
        .expect(200)
        .then(({ body }) => expect(body).to.deep.equal({ counter: 3 }));
    });

    it('should handle term as lowercase', async () => {
      const app = await initApp();
      await request(app)
        .get('/word/counter?term=sasha')
        .expect(200)
        .then(({ body }) => expect(body).to.deep.equal({ counter: 0 }));

      await mongoClient.insertOne({_id: 'sasha', count: 3 });

      return request(app)
        .get('/word/counter?term=Sasha')
        .expect(200)
        .then(({ body }) => expect(body).to.deep.equal({ counter: 3 }));
    });
  });

  describe('/word', () => {
    it('should return error if type of source is not provide', async() => {
      const app = await initApp();
  
        await request(app)
          .post('/word')
          .set('Content-type', 'application/json')
          .expect({ code: 'UNSUPPORTED', message: 'Provide filePath, url or plain text' })
          .expect(400);
    });

    describe('string', () => {
      it('should count words from incoming request', async () => {
        const app = await initApp();
        await request(app)
          .post('/word')
          .set('Content-type', 'text/plain')
          .send('Hello world')
          .expect(202, 'ok');
        
        await PromiseBb.delay(200);
        const helloCount = await repository.getWordCount('hello');
        expect(helloCount, 'hello count match').to.equal(1);
  
        const worldCount = await repository.getWordCount('world');
        expect(worldCount, 'world count match').to.equal(1);
      });

      it('should handle empty string', async () => {
        const app = await initApp();
        await request(app)
          .post('/word')
          .set('Content-type', 'text/plain')
          .send('')
          .expect(202, 'ok');
      });
    });

    describe('file', () => {
      it('should count words from file', async () => {
        const app = await initApp();
  
        await request(app)
          .post('/word')
          .set('Content-type', 'application/json')
          .send({ filePath: 'simpleText.txt' })
          .expect(202, 'ok');
        
        await PromiseBb.delay(200);
        const loremCount = await repository.getWordCount('lorem');
        expect(loremCount, 'lorem count match').to.equal(1);
  
        const myCount = await repository.getWordCount('my');
        expect(myCount, 'my count match').to.equal(3);
      });

      it('should return error if file does not exists', async () => {
        const app = await initApp();
  
        await request(app)
          .post('/word')
          .set('Content-type', 'application/json')
          .send({ filePath: 'fileNotExists.txt' })
          .expect({ code: 'ENOENT', message: 'File not exist' })
          .expect(400);
      });
    });

    describe('url', () => {
      let mockServer;

      before(() => {
        mockServer = http.createServer(function(req, res) {
          const readStream = fs.createReadStream(`./fileSystem${req.url}`, { encoding: 'utf8' });
          readStream
          .on('open', function () {
            readStream.pipe(res);
          });
        });
        mockServer.listen(3003);
      });

      after(done => {
        mockServer.close(done);
      })

      it('should count words from url', async () => {
        const app = await initApp();
  
        await request(app)
          .post('/word')
          .set('Content-type', 'application/json')
          .send({ url: 'http://localhost:3003/simpleText.txt' })
          .expect(202, 'ok');
        
        await PromiseBb.delay(200);
        const excepteurCount = await repository.getWordCount('excepteur');
        expect(excepteurCount, 'excepteur count match').to.equal(1);
  
        const myCount = await repository.getWordCount('my');
        expect(myCount, 'my count match').to.equal(3);
      });

      it('should return error if url is not reacheable', async () => {
        const app = await initApp();
  
        await request(app)
          .post('/word')
          .set('Content-type', 'application/json')
          .send({ url: 'http://localhost:3004/simpleTexts.txt' })
          .expect({ code: 'ECONNREFUSED', message: 'Error from remote service' })
          .expect(400);
      });
    });
  });
});
