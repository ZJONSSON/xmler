const xmler = require('../index');
const fs = require('fs');
const path = require('path');
const bufferStream = require('./bufferStream');
const expected = require('./fixtures/reorder.json');

module.exports = t => {
  t.test('domain', async t => {
    const d = await fs.createReadStream(path.join(__dirname,'fixtures','reorder.xml'))
      .pipe(xmler(0,{showAttr:true}))
      .pipe(bufferStream())
      .promise();

    t.same(d[0].value,expected);
  });
};

if (!module.parent) {
  module.exports(require('tap'));
}