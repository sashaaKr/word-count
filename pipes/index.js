const initSplit = require('split');
const { init: initDbUpdater } = require('./dbUpdater');
const { init: initSanitizer } = require('./sanitizer');
const { init: initToLowerCase } = require('./toLowerCase');

function pipeStream({stream, repository, ctx}) {
  const split = initSplit();
  const sanitizer = initSanitizer();
  const dbUpdater = initDbUpdater(repository);
  const toLowerCase = initToLowerCase()

  return stream
    .pipe(sanitizer)
    .pipe(split)
    .pipe(toLowerCase)
    .pipe(dbUpdater)
    .on('finish', () => console.log('stream pipeline finish', ctx));
}


module.exports = {
  pipeStream
}