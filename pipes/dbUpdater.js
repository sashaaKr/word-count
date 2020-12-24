const { Writable } = require("stream");

const init = (repository) => new Writable({
  write(chunk, encoding, callback) {    
    const words = chunk.toString().split(' ');
    repository.bulkUpsert(words, callback);
  }
});

module.exports = { init };