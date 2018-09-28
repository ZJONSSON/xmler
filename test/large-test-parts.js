const xmler = require('../index');
const fs = require('fs');
const util = require('util');
const Stream = require('stream');
const path = require('path');
const bufferStream = require('./bufferStream');
const expected = require('./fixtures/large.json');
const readFileAsync = util.promisify(fs.readFile);

module.exports = t => {
  t.test('large file', async t => {

    const p = Stream.PassThrough();
    let xml = await readFileAsync(path.join(__dirname,'fixtures','large.xml'));
    const numParts = 100
    const partLength = Math.round(xml.length / numParts);
    for (let i = 0; i <= numParts; i++)  {
      p.push(xml.slice(i*partLength, (i+1)*(partLength)).toString());
    }
    p.end();
   // xml.toString().split('').forEach(d => p.write(d));
   // p.end();
    
    const d = await p
      .pipe(xmler(0,{showAttr:true}))
      .pipe(bufferStream())
      .promise();
    
    t.deepEqual(d[0].value,expected);
  });
};

if (!module.parent) {
  module.exports(require('tap'));
}