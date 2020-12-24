const { Transform } = require("stream");

const init = () => new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toLowerCase()); // to string redundant?
    callback();
  }
});

module.exports = { init };