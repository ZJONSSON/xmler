const xmler = require('../index');
const fs = require('fs');
const path = require('path');
const bufferStream = require('./bufferStream');
const expected = require('./fixtures/array-notation.json');

module.exports = t => {
  t.test('array-notation', async t => {
    const d = await fs.createReadStream(path.join(__dirname,'fixtures','array-notation.xml'))
      .pipe(xmler('abcd',{arrayNotation:true}))
      .pipe(bufferStream())
      .promise();
    
    t.same(d[0].value,expected.abcd[0]);
  });
};

if (!module.parent) {
  module.exports(require('tap'));
}