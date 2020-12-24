const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;
const request = require('request');

const { pipeStream } = require('../pipes');

class Service {
  constructor(repository) {
    this.repository = repository;
  }

  async handleFileCounting({ fileName, ctx }) {
    console.log('Start process of file', ctx);
    const filePath = path.resolve('fileSystem', fileName);
  
    try {
      await fsPromises.access(filePath)
    } catch (error) {
      console.log('Error reading file', { ctx, code: error.code, filePath });
      throw error;
    }
  
    const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    return new Promise((resolve, reject) => {
      readStream
      .on('open', () => {
        pipeStream({ stream: readStream, ctx, repository: this.repository })
        resolve();
      })
      .on('error', reject);
    });
  }
  
  handleUrlCounting({ url, ctx }) {
    console.log('Start process of url', ctx);
    const readStream = request(url);
    
    return new Promise((resolve, reject) => {
      readStream
      .on('response', () => {
        pipeStream({stream: readStream, ctx, repository: this.repository });
        resolve();
      })
      .on('error', reject)
    });
  }
  
  async handleStreamCounting({ stream, ctx }) {
    console.log('Start stream process', ctx);
    return pipeStream({ stream, ctx, repository: this.repository });
  }

   getWordCount(word) {
    return this.repository.getWordCount(word);
  }
}

function serviceFactory({ repository }) {
  return new Service(repository);
}

module.exports = { serviceFactory };