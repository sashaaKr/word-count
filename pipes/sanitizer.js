const { Transform } = require("stream");

function isValidChar(c) {
  return ( c >= 'A' && c <= 'Z' ) || ( c >= 'a' && c <= 'z' );
}

const init = () => new Transform({
  transform(chunk, encoding, callback) {
    const sanitized = chunk.toString().replace(/[!?,.(){}]/g, (matchedChar, index, str) => {
      const prevCharIsValid = isValidChar(str[index-1]);
      const nextCharIsValid = isValidChar(str[index+1]);
      
      return prevCharIsValid && nextCharIsValid ? ' ' : ''
    });
    this.push(sanitized);
    callback();
  }
});

module.exports = { init };