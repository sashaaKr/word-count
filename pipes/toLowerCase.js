const { Transform } = require("stream");

const init = () => new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toLowerCase());
    callback();
  }
});

module.exports = { init };