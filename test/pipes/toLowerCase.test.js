const toLowerCase = require('../../pipes/toLowerCase');
const { PassThrough } = require('stream');
const { expect } = require('chai');

describe('toLowerCase', () => {
  it('should to lower case input stream', done => {
    const throug = new PassThrough();
    const buffer = new Buffer("Hi My name iswhat my name iswho my name is Slim Shady");
    
    throug.push(buffer);
    throug.push(null);

    let lowerStr;
    throug
      .pipe(toLowerCase.init())
      .on('data', (...data) => {
        lowerStr = data.toString();
      })
      .on('end', () => {
        expect(lowerStr).to.equal('hi my name iswhat my name iswho my name is slim shady')
        done();
    })
  });
})