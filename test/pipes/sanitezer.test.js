const sanitezer = require('../../pipes/sanitizer');
const { PassThrough } = require('stream');
const { expect } = require('chai');

describe('sanitezer', () => {
  it('should remove non human readeable words', done => {
    const throug = new PassThrough();
    const buffer = new Buffer("!Hi! My name is(what?), my name is(who?), my name is Slim Shady");
    
    throug.push(buffer);
    throug.push(null);

    let sanitizedStr;
    throug
      .pipe(sanitezer.init())
      .on('data', (...data) => {
        sanitizedStr = data.toString();
      })
      .on('end', () => {
        expect(sanitizedStr).to.equal('Hi My name is what my name is who my name is Slim Shady')
        done();
    })
  });
})